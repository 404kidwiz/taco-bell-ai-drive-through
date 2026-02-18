export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "tacos" | "burritos" | "specialties" | "sides" | "drinks";
  image?: string;
  popular?: boolean;
  calories?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderState = 
  | "idle" 
  | "greeting" 
  | "ordering" 
  | "confirming" 
  | "completed";

export interface VoiceMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}
