import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: integer("order_number").notNull(),
  items: text("items").notNull(), // JSON stringified array
  total: real("total").notNull(),
  specialInstructions: text("special_instructions"),
  customerPhone: text("customer_phone"),
  status: text("status", { enum: ["pending", "in-progress", "completed"] })
    .notNull()
    .default("pending"),
  createdAt: integer("created_at").notNull(), // unix ms
  updatedAt: integer("updated_at").notNull(),
});

export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;
