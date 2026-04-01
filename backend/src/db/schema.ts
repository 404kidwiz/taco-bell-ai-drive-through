import { pgTable, timestamp, jsonb, integer, varchar, text, boolean, real, pgEnum } from 'drizzle-orm/pg-core';
import type { OrderItem, CustomerInfo, RestaurantConfig } from '../types/index.js';

// Auth enums
export const userRoleEnum = pgEnum('user_role', ['OWNER', 'ADMIN']);
export const aiPersonalityEnum = pgEnum('ai_personality', ['friendly', 'efficient', 'upsell', 'custom']);
export const orderStatusEnum = pgEnum('order_status', ['received', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);
export const orderTypeEnum = pgEnum('order_type', ['pickup', 'delivery', 'dine-in']);
export const callStatusEnum = pgEnum('call_status', ['initiated', 'in_progress', 'completed', 'abandoned']);
export const callStateEnum = pgEnum('call_state', ['greeting', 'order', 'confirmation', 'payment', 'complete']);
export const conversationOutcomeEnum = pgEnum('conversation_outcome', ['completed', 'abandoned', 'flagged']);
export const conversationSentimentEnum = pgEnum('conversation_sentiment', ['positive', 'neutral', 'negative']);

// Auth Tables
export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  email: varchar('email').notNull().unique(),
  name: varchar('name'),
  password: varchar('password'), // hashed, nullable for OAuth-only users
  role: userRoleEnum('role').default('OWNER').notNull(),
  restaurantId: varchar('restaurant_id'), // links to the restaurant they own/manage
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider').notNull(), // 'google', 'credentials'
  providerAccountId: varchar('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier').notNull(),
  token: varchar('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const orders = pgTable('orders', {
  id: varchar('id').primaryKey(),
  restaurantId: varchar('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  items: jsonb('items').$type<OrderItem[]>().default([]).notNull(),
  subtotal: integer('subtotal').notNull(),
  tax: integer('tax').notNull(),
  total: integer('total').notNull(),
  customer: jsonb('customer').$type<CustomerInfo>().default({}).notNull(),
  orderType: orderTypeEnum('order_type').default('pickup'),
  status: orderStatusEnum('status').default('received'),
  stripeSessionId: varchar('stripe_session_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const restaurants = pgTable('restaurants', {
  id: varchar('id').primaryKey(),
  slug: varchar('slug').unique(),
  name: varchar('name').notNull(),
  phone: varchar('phone'),
  address: varchar('address'),
  timezone: varchar('timezone').default('America/New_York'),
  // AI Personality
  aiPersonality: aiPersonalityEnum('ai_personality').default('friendly'),
  customSystemPrompt: text('custom_system_prompt'),
  maxTokens: integer('max_tokens').default(150),
  languages: jsonb('languages').$type<string[]>(),
  // Menu data
  menuData: jsonb('menu_data'),
  // Business hours
  hours: jsonb('hours').$type<Record<string, { open: string; close: string; closed?: boolean }>>(),
  // Integrations
  stripeCustomerId: varchar('stripe_customer_id'),
  twilioPhoneNumber: varchar('twilio_phone_number'),
  // Upsell rules
  upsellRules: jsonb('upsell_rules').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const leads = pgTable('leads', {
  id: varchar('id').primaryKey(),
  email: varchar('email').notNull(),
  restaurantName: varchar('restaurant_name'),
  source: varchar('source').notNull(),
  twilioSubaccountSid: varchar('twilio_subaccount_sid'),
  twilioPhoneNumber: varchar('twilio_phone_number'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const callSessions = pgTable('call_sessions', {
  callSid: varchar('call_sid').primaryKey(),
  callerPhone: varchar('caller_phone').notNull(),
  restaurantId: varchar('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  state: callStateEnum('state').default('greeting'),
  orderItems: jsonb('order_items').$type<OrderItem[]>().default([]),
  customerInfo: jsonb('customer_info').$type<CustomerInfo>().default({}),
  conversationHistory: jsonb('conversation_history').default([]),
  callStatus: callStatusEnum('call_status').notNull(),
  duration: integer('duration').default(0), // seconds
  outcome: conversationOutcomeEnum('outcome').default('completed'),
  sentiment: conversationSentimentEnum('sentiment').default('neutral'),
  language: varchar('language').default('en'),
  flagged: boolean('flagged').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const analytics = pgTable('analytics', {
  id: varchar('id').primaryKey(),
  restaurantId: varchar('restaurant_id').notNull(),
  date: varchar('date').notNull(),
  totalOrders: integer('total_orders').default(0).notNull(),
  totalRevenue: integer('total_revenue').default(0).notNull(),
  ordersByType: jsonb('orders_by_type').default({}).notNull(),
  ordersByStatus: jsonb('orders_by_status').default({}).notNull(),
  popularItems: jsonb('popular_items').default([]).notNull(),
  peakHours: jsonb('peak_hours').default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// AI Conversation Analytics table
export const conversationAnalytics = pgTable('conversation_analytics', {
  id: varchar('id').primaryKey(),
  restaurantId: varchar('restaurant_id').notNull(),
  conversationId: varchar('conversation_id').notNull(),
  duration: integer('duration').notNull(), // seconds
  completed: boolean('completed').default(false).notNull(),
  itemCount: integer('item_count').default(0).notNull(),
  totalValue: real('total_value').default(0).notNull(),
  misunderstandingCount: integer('misunderstanding_count').default(0).notNull(),
  upsellAttempted: boolean('upsell_attempted').default(false).notNull(),
  upsellAccepted: boolean('upsell_accepted').default(false).notNull(),
  avgResponseMs: real('avg_response_ms').default(0).notNull(),
  sentiment: varchar('sentiment').default('neutral').notNull(), // positive | neutral | negative
  language: varchar('language').default('en').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Menu Categories table
export const menuCategories = pgTable('menu_categories', {
  id: varchar('id').primaryKey(),
  restaurantId: varchar('restaurant_id').notNull(),
  name: varchar('name').notNull(),
  nameEs: varchar('name_es'),
  sortOrder: integer('sort_order').default(0).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Menu Items table
export const menuItems = pgTable('menu_items', {
  id: varchar('id').primaryKey(),
  restaurantId: varchar('restaurant_id').notNull(),
  name: varchar('name').notNull(),
  description: varchar('description').notNull(),
  descriptionEs: varchar('description_es'),
  price: real('price').notNull(),
  category: varchar('category').notNull(),
  image: varchar('image'),
  popular: boolean('popular').default(false).notNull(),
  calories: integer('calories'),
  enabled: boolean('enabled').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
