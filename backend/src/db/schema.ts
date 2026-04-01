import { pgTable, timestamp, jsonb, integer, varchar, boolean, real } from 'drizzle-orm/pg-core';
import type { OrderItem, CustomerInfo, RestaurantConfig } from '../types/index.js';

export const orders = pgTable('orders', {
  id: varchar('id').primaryKey(),
  restaurantId: varchar('restaurant_id').notNull(),
  items: jsonb('items').$type<OrderItem[]>().default([]).notNull(),
  subtotal: integer('subtotal').notNull(),
  tax: integer('tax').notNull(),
  total: integer('total').notNull(),
  customer: jsonb('customer').$type<CustomerInfo>().default({}).notNull(),
  orderType: varchar('order_type').default('pickup').notNull(),
  status: varchar('status').default('received').notNull(),
  stripeSessionId: varchar('stripe_session_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const restaurants = pgTable('restaurants', {
  id: varchar('id').primaryKey(),
  slug: varchar('slug').unique(),
  name: varchar('name').notNull(),
  config: jsonb('config').$type<RestaurantConfig>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
  restaurantId: varchar('restaurant_id').notNull(),
  state: varchar('state').default('greeting').notNull(),
  orderItems: jsonb('order_items').$type<OrderItem[]>().default([]).notNull(),
  customerInfo: jsonb('customer_info').$type<CustomerInfo>().default({}).notNull(),
  conversationHistory: jsonb('conversation_history').default([]).notNull(),
  callStatus: varchar('call_status').notNull(),
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
