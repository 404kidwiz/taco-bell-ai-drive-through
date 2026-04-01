/**
 * Voice Routes - Twilio Webhooks
 */

import { Hono } from 'hono';
import {
  handleIncomingCall,
  processSpeech,
  handleGatherResponse,
  handleCallStatus,
  handleHangup,
} from '../services/voice-agent.js';
import type { VoiceWebhookPayload } from '../types/index.js';

const voiceRouter = new Hono();

// Helper to parse Twilio form data
async function parseTwilioFormData(request: Request): Promise<VoiceWebhookPayload> {
  const formData = await request.formData();
  const data: any = {};

  formData.forEach((value, key) => {
    data[key] = value.toString();
  });

  return data as VoiceWebhookPayload;
}

// POST /api/voice/incoming - Twilio voice webhook (incoming call)
voiceRouter.post('/voice/incoming', async (c) => {
  const payload = await parseTwilioFormData(c.req.raw);
  const twiml = await handleIncomingCall(payload);

  return c.text(twiml, 200, {
    'Content-Type': 'application/xml',
  });
});

// POST /api/voice/process-speech - Process speech input
voiceRouter.post('/voice/process-speech', async (c) => {
  const payload = await parseTwilioFormData(c.req.raw);
  const text = payload.SpeechResult || '';

  const twiml = await processSpeech(payload, text);

  return c.text(twiml, 200, {
    'Content-Type': 'application/xml',
  });
});

// POST /api/voice/gather-response - Gather DTMF/speech response
voiceRouter.post('/voice/gather-response', async (c) => {
  const payload = await parseTwilioFormData(c.req.raw);
  const twiml = await handleGatherResponse(payload);

  return c.text(twiml, 200, {
    'Content-Type': 'application/xml',
  });
});

// POST /api/voice/status - Call status callback
voiceRouter.post('/voice/status', async (c) => {
  const payload = await parseTwilioFormData(c.req.raw);
  await handleCallStatus(payload);

  return c.text('', 200);
});

// POST /api/voice/hangup - Call hangup handler
voiceRouter.post('/voice/hangup', async (c) => {
  const payload = await parseTwilioFormData(c.req.raw);
  await handleHangup(payload);

  return c.text('', 200);
});

export default voiceRouter;
