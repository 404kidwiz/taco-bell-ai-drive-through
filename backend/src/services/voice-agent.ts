/**
 * Voice Agent Service - Twilio + Groq Integration
 */

import { redis } from '../lib/redis.js';
import { db } from '../db/index.js';
import { callSessions } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { extractOrderFromText, generateConversationResponse } from './llm-service.js';
import { getRestaurant } from './order-service.js';
import type { RestaurantConfig, OrderItem, CustomerInfo, VoiceWebhookPayload } from '../types/index.js';

/**
 * Generate TwiML for speech gathering
 */
export function generateTwiMLGather(
  spokenText: string,
  _callSid: string,
  hints: string = ''
): string {
  const safeText = escapeXml(spokenText);
  const safeHints = escapeXml(hints);

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather
    input="speech dtmf"
    action="/api/voice/process-speech"
    method="POST"
    speechTimeout="1"
    enhanced="true"
    speechModel="phone_call"
    hints="${safeHints}"
  >
    <Say voice="Polly.Joanna">${safeText}</Say>
  </Gather>
  <Redirect method="POST">/api/voice/process-speech?timeout=true</Redirect>
</Response>`;
}

/**
 * Generate TwiML for simple speech (no gathering)
 */
export function generateTwiMLSay(spokenText: string, redirectUrl?: string): string {
  const safeText = escapeXml(spokenText);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${safeText}</Say>`;

  if (redirectUrl) {
    xml += `\n  <Redirect method="POST">${redirectUrl}</Redirect>`;
  }

  xml += '\n</Response>';
  return xml;
}

/**
 * Generate TwiML for hangup
 */
export function generateTwiMLHangup(spokenText: string = 'Goodbye.'): string {
  const safeText = escapeXml(spokenText);

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${safeText}</Say>
  <Hangup />
</Response>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Handle incoming voice call
 */
export async function handleIncomingCall(payload: VoiceWebhookPayload): Promise<string> {
  const { CallSid, From } = payload;

  // Look up restaurant by phone number (or use default)
  const restaurantId = await lookupRestaurantByPhone(From) || 'sample';
  const restaurant = await getRestaurant(restaurantId);

  if (!restaurant) {
    return generateTwiMLSay('Sorry, we are experiencing technical difficulties. Please try again later.');
  }

  // Initialize call state
  const state: {
    callSid: string;
    callerPhone: string;
    restaurantId: string;
    state: string;
    orderItems: OrderItem[];
    customerInfo: CustomerInfo;
    conversationHistory: { role: string; content: string; timestamp: string }[];
    callStatus: string;
  } = {
    callSid: CallSid,
    callerPhone: From,
    restaurantId,
    state: 'greeting',
    orderItems: [],
    customerInfo: {},
    conversationHistory: [],
    callStatus: payload.CallStatus || 'in-progress',
  };

  // Store state in Redis
  await redis.setex(`call:${CallSid}`, 3600, JSON.stringify(state));

  // Also persist to database
  await db.insert(callSessions).values({
    callSid: CallSid,
    callerPhone: From,
    restaurantId,
    state: 'greeting',
    orderItems: [],
    customerInfo: {},
    conversationHistory: [],
    callStatus: payload.CallStatus || 'in-progress',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Generate greeting
  const greeting = generateGreeting(restaurant.config);
  return generateTwiMLGather(greeting, CallSid);
}

/**
 * Process speech input
 */
export async function processSpeech(
  payload: VoiceWebhookPayload,
  text: string
): Promise<string> {
  const { CallSid, CallStatus } = payload;
  const timeout = (payload as any).timeout === 'true';

  // Get call state
  const stateJson = await redis.get(`call:${CallSid}`);
  if (!stateJson) {
    return generateTwiMLHangup();
  }

  const state = JSON.parse(stateJson);

  // Check if call ended
  if (CallStatus === 'completed' || CallStatus === 'failed' || CallStatus === 'busy' || CallStatus === 'no-answer') {
    await cleanupCallSession(CallSid);
    return generateTwiMLHangup();
  }

  // Handle timeout (no speech detected)
  if (timeout || !text) {
    return handleTimeout(state);
  }

  // Get restaurant config
  const restaurant = await getRestaurant(state.restaurantId);
  if (!restaurant) {
    return generateTwiMLHangup('Sorry, we are experiencing technical difficulties.');
  }

  // Process based on current state
  let response: string;
  switch (state.state) {
    case 'greeting':
      response = await handleGreetingState(state, text, restaurant.config);
      break;
    case 'order':
      response = await handleOrderState(state, text, restaurant.config);
      break;
    case 'confirmation':
      response = await handleConfirmationState(state, text, restaurant.config);
      break;
    case 'complete':
      response = await handleCompleteState(state, restaurant.config);
      break;
    default:
      response = await handleGreetingState(state, text, restaurant.config);
  }

  // Update state in Redis
  state.updatedAt = new Date().toISOString();
  await redis.setex(`call:${CallSid}`, 3600, JSON.stringify(state));

  // Update database
  await db
    .update(callSessions)
    .set({
      state: state.state,
      orderItems: state.orderItems,
      customerInfo: state.customerInfo,
      conversationHistory: state.conversationHistory,
      updatedAt: new Date(),
    })
    .where(eq(callSessions.callSid, CallSid));

  return response;
}

/**
 * Handle gather response (DTMF)
 */
export async function handleGatherResponse(payload: VoiceWebhookPayload): Promise<string> {
  const { Digits, CallSid } = payload;

  if (!Digits) {
    return processSpeech(payload, '');
  }

  // Handle DTMF input (e.g., confirm order with "1", cancel with "2")
  const stateJson = await redis.get(`call:${CallSid}`);
  if (!stateJson) {
    return generateTwiMLHangup();
  }

  const state = JSON.parse(stateJson);

  if (state.state === 'confirmation') {
    if (Digits === '1') {
      // Confirm order
      state.state = 'complete';
      return processSpeech(payload, 'yes');
    } else if (Digits === '2') {
      // Cancel/correct
      state.state = 'order';
      return processSpeech(payload, 'I need to change my order');
    }
  }

  return processSpeech(payload, '');
}

/**
 * Handle call status callback
 */
export async function handleCallStatus(payload: VoiceWebhookPayload): Promise<void> {
  const { CallSid, CallStatus } = payload;

  // Update database
  await db
    .update(callSessions)
    .set({
      callStatus: CallStatus,
      updatedAt: new Date(),
    })
    .where(eq(callSessions.callSid, CallSid));

  // Clean up if call is complete
  if (['completed', 'failed', 'busy', 'no-answer', 'canceled'].includes(CallStatus)) {
    await cleanupCallSession(CallSid);
  }
}

/**
 * Handle call hangup
 */
export async function handleHangup(payload: VoiceWebhookPayload): Promise<void> {
  await cleanupCallSession(payload.CallSid);
}

/**
 * State handlers
 */
async function handleGreetingState(
  state: any,
  text: string,
  config: RestaurantConfig
): Promise<string> {
  state.conversationHistory.push({ role: 'user', content: text, timestamp: new Date().toISOString() });

  const response = await generateConversationResponse(text, config, 'greeting', state.conversationHistory);

  state.conversationHistory.push({ role: 'assistant', content: response.message, timestamp: new Date().toISOString() });

  if (response.orderUpdate?.items) {
    state.orderItems = response.orderUpdate.items;
  }

  if (response.shouldComplete) {
    state.state = 'confirmation';
  } else {
    state.state = 'order';
  }

  return generateTwiMLGather(response.message, state.callSid);
}

async function handleOrderState(
  state: any,
  text: string,
  config: RestaurantConfig
): Promise<string> {
  state.conversationHistory.push({ role: 'user', content: text, timestamp: new Date().toISOString() });

  const extraction = await extractOrderFromText(text, config, state.conversationHistory);

  if (extraction.items.length > 0) {
    state.orderItems = [...state.orderItems, ...extraction.items];
  }

  if (extraction.customerInfo) {
    state.customerInfo = { ...state.customerInfo, ...extraction.customerInfo };
  }

  state.conversationHistory.push({ role: 'assistant', content: extraction.clarificationQuestion || 'Got it.', timestamp: new Date().toISOString() });

  if (extraction.needsClarification && extraction.clarificationQuestion) {
    return generateTwiMLGather(extraction.clarificationQuestion, state.callSid);
  }

  state.state = 'confirmation';
  return generateTwiMLGather(generateOrderConfirmation(state.orderItems, config), state.callSid);
}

async function handleConfirmationState(
  state: any,
  text: string,
  config: RestaurantConfig
): Promise<string> {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('yes') || lowerText.includes('correct') || lowerText.includes('that\'s right')) {
    state.state = 'complete';
    return await handleCompleteState(state, config);
  } else if (lowerText.includes('no') || lowerText.includes('wrong') || lowerText.includes('change')) {
    state.state = 'order';
    return generateTwiMLGather('What would you like to change?', state.callSid);
  } else {
    return generateTwiMLGather('Please say yes to confirm, or no to make changes.', state.callSid);
  }
}

async function handleCompleteState(state: any, _config: RestaurantConfig): Promise<string> {
  const message = `Thank you for your order! Your order will be ready for ${state.customerInfo.address ? 'delivery' : 'pickup'} in approximately 30 minutes. Goodbye!`;
  return generateTwiMLHangup(message);
}

function handleTimeout(state: any): string {
  const timeoutMessages = {
    greeting: 'I didn\'t catch that. How can I help you today?',
    order: 'I didn\'t catch that. What would you like to order?',
    confirmation: 'I didn\'t catch that. Is your order correct? Please say yes or no.',
    complete: 'Thank you for calling. Goodbye!',
  };

  const message = timeoutMessages[state.state as keyof typeof timeoutMessages] || timeoutMessages.order;
  return generateTwiMLGather(message, state.callSid);
}

/**
 * Helper functions
 */
async function lookupRestaurantByPhone(_phone: string): Promise<string | null> {
  // In a multi-tenant setup, look up restaurant by phone number
  // For now, return null (use default)
  return null;
}

function generateGreeting(config: RestaurantConfig): string {
  return `Thanks for calling ${config.name}. I'm here to take your order. What would you like today?`;
}

function generateOrderConfirmation(items: OrderItem[], _config: RestaurantConfig): string {
  if (items.length === 0) {
    return 'Your cart is empty. What would you like to order?';
  }

  const itemSummary = items.map(item => `${item.quantity} ${item.name}`).join(', ');
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return `Great! I have your order: ${itemSummary}. The total is $${(total / 100).toFixed(2)}. Is that correct? Please say yes or no.`;
}

async function cleanupCallSession(callSid: string): Promise<void> {
  // Remove from Redis
  await redis.del(`call:${callSid}`);

  // Note: Keep database record for analytics
}
