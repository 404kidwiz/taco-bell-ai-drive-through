/**
 * OrderFlow AI - Core TypeScript Types
 */

// ============================================================================
// Order Types
// ============================================================================

export interface OrderItem {
  name: string;
  quantity: number;
  price: number; // in cents
  category?: string;
  modifiers?: string[];
}

export interface CustomerInfo {
  name?: string;
  phone?: string;
  address?: string;
  email?: string;
  notes?: string;
}

export type OrderStatus =
  | "received"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type OrderType = "pickup" | "delivery" | "dine-in";

export interface Order {
  id: string;
  restaurantId: string;
  items: OrderItem[];
  subtotal: number; // in cents
  tax: number; // in cents
  total: number; // in cents
  customer: CustomerInfo;
  orderType: OrderType;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  restaurantId: string;
  items: OrderItem[];
  customer?: CustomerInfo;
  orderType?: OrderType;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// ============================================================================
// Restaurant Types
// ============================================================================

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  category: string;
  available: boolean;
  modifiers?: MenuModifier[];
}

export interface MenuModifier {
  name: string;
  options: ModifierOption[];
  required: boolean;
  maxSelections: number;
}

export interface ModifierOption {
  name: string;
  price: number; // in cents
}

export interface RestaurantConfig {
  id: string;
  name: string;
  tagline: string;
  address: string;
  phone: string;
  hours: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  menu: MenuCategory[];
  paymentMethods: string[];
  deliveryZones?: string[];
  taxRate: number; // decimal, e.g., 0.0875 for 8.75%
}

export interface Restaurant {
  id: string;
  name: string;
  config: RestaurantConfig;
  createdAt: Date;
}

// ============================================================================
// Voice/Webhook Types
// ============================================================================

export interface VoiceWebhookPayload {
  CallSid: string;
  From: string;
  To: string;
  CallStatus: string;
  Direction: string;
  CallerName?: string;
  SpeechResult?: string;
  Digits?: string;
  RecordingUrl?: string;
  RecordingDuration?: string;
}

export interface CallState {
  callSid: string;
  callerPhone: string;
  restaurantId: string;
  state: "greeting" | "order" | "confirmation" | "payment" | "complete";
  orderItems: OrderItem[];
  customerInfo: CustomerInfo;
  conversationHistory: {
    role: "system" | "assistant" | "user";
    content: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TwiMLResponse {
  twiml: string;
  instructions?: {
    speak?: string;
    gather?: boolean;
    hangup?: boolean;
  };
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  restaurantId?: string;
  metrics?: string[];
}

export interface AnalyticsMetrics {
  totalOrders: number;
  totalRevenue: number; // in cents
  averageOrderValue: number; // in cents
  ordersByType: {
    pickup: number;
    delivery: number;
    dineIn: number;
  };
  ordersByStatus: {
    [key in OrderStatus]: number;
  };
  popularItems: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  peakHours: {
    hour: number;
    orders: number;
  }[];
}

// ============================================================================
// KDS Webhook Types
// ============================================================================

export interface KDSWebhookPayload {
  orderId: string;
  restaurantId: string;
  status: OrderStatus;
  items: OrderItem[];
  timestamp: string;
}

// ============================================================================
// Error Types
// ============================================================================

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super("Rate limit exceeded", 429, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
    if (retryAfter) {
      this.headers = { "Retry-After": retryAfter.toString() };
    }
  }

  headers?: Record<string, string>;
}
