/**
 * OrderFlow AI - Drizzle ORM Schema
 */

import { pgTable, timestamp, jsonb, integer, varchar } from 'drizzle-orm/pg-core';
import type { OrderItem, CustomerInfo, RestaurantConfig } from '../types/index.js';

export const orders = pgTable('orders', {
  id: varchar('id').primaryKey(),
  restaurantId: varchar('restaurant_id').notNull(),
  items: jsonb('items').$type<OrderItem[]>().default([]).notNull(),
  subtotal: integer('subtotal').notNull(), // stored in cents
  tax: integer('tax').notNull(),
  total: integer('total').notNull(),
  customer: jsonb('customer').$type<CustomerInfo>().default({}).notNull(),
  orderType: varchar('order_type').default('pickup').notNull(),
  status: varchar('status').default('received').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const restaurants = pgTable('restaurants', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  config: jsonb('config').$type<RestaurantConfig>().notNull(),
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
  date: varchar('date').notNull(), // ISO date string YYYY-MM-DD
  totalOrders: integer('total_orders').default(0).notNull(),
  totalRevenue: integer('total_revenue').default(0).notNull(), // in cents
  ordersByType: jsonb('orders_by_type').default({}).notNull(),
  ordersByStatus: jsonb('orders_by_status').default({}).notNull(),
  popularItems: jsonb('popular_items').default([]).notNull(),
  peakHours: jsonb('peak_hours').default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
