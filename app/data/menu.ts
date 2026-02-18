import { MenuItem } from "../types";

export const MENU_ITEMS: MenuItem[] = [
  // Tacos
  {
    id: "crunchy-taco",
    name: "Crunchy Taco",
    description: "Seasoned beef, lettuce, cheese in a crunchy shell",
    price: 1.79,
    category: "tacos",
    popular: true,
    calories: 170
  },
  {
    id: "soft-taco",
    name: "Soft Taco",
    description: "Seasoned beef, lettuce, cheese in a soft tortilla",
    price: 1.79,
    category: "tacos",
    calories: 180
  },
  {
    id: "doritos-locos",
    name: "Doritos Locos Taco",
    description: "Nacho cheese Doritos shell with seasoned beef",
    price: 2.19,
    category: "tacos",
    popular: true,
    calories: 190
  },
  {
    id: "chicken-soft",
    name: "Chicken Soft Taco",
    description: "Grilled chicken, lettuce, cheese, avocado ranch",
    price: 2.49,
    category: "tacos",
    calories: 190
  },

  // Burritos
  {
    id: "bean-burrito",
    name: "Bean Burrito",
    description: "Beans, red sauce, onions, cheese",
    price: 1.79,
    category: "burritos",
    calories: 350
  },
  {
    id: "beefy-5-layer",
    name: "Beefy 5-Layer Burrito",
    description: "Beef, beans, sour cream, cheese, nacho cheese",
    price: 3.69,
    category: "burritos",
    popular: true,
    calories: 500
  },
  {
    id: "quesarito",
    name: "Quesarito",
    description: "Beef, rice, chipotle sauce, sour cream, cheese wrapped in quesadilla",
    price: 4.19,
    category: "burritos",
    popular: true,
    calories: 650
  },
  {
    id: "burrito-supreme",
    name: "Burrito Supreme",
    description: "Beef, beans, sour cream, tomatoes, lettuce, cheese, red sauce",
    price: 4.19,
    category: "burritos",
    calories: 390
  },

  // Specialties
  {
    id: "nachos-bellgrande",
    name: "Nachos BellGrande",
    description: "Chips, beans, beef, nacho cheese, sour cream, tomatoes",
    price: 4.99,
    category: "specialties",
    popular: true,
    calories: 740
  },
  {
    id: "mexican-pizza",
    name: "Mexican Pizza",
    description: "Two crispy shells, beans, beef, pizza sauce, cheese, tomatoes",
    price: 4.99,
    category: "specialties",
    popular: true,
    calories: 540
  },
  {
    id: "chalupa-supreme",
    name: "Chalupa Supreme",
    description: "Fried chalupa shell, beef, sour cream, tomatoes, lettuce, cheese",
    price: 3.89,
    category: "specialties",
    calories: 350
  },
  {
    id: "gordita-crunch",
    name: "Cheesy Gordita Crunch",
    description: "Crunchy taco wrapped in gordita with cheese, spicy ranch",
    price: 3.89,
    category: "specialties",
    popular: true,
    calories: 500
  },

  // Sides
  {
    id: "cinnamon-twists",
    name: "Cinnamon Twists",
    description: "Crispy puffed twists dusted with cinnamon sugar",
    price: 1.29,
    category: "sides",
    calories: 170
  },
  {
    id: "cheesy-roll-up",
    name: "Cheesy Roll Up",
    description: "Three cheese blend rolled in flour tortilla",
    price: 1.29,
    category: "sides",
    calories: 180
  },
  {
    id: "chips-cheese",
    name: "Chips and Nacho Cheese",
    description: "Tortilla chips with warm nacho cheese sauce",
    price: 1.99,
    category: "sides",
    calories: 220
  },
  {
    id: "pintos-cheese",
    name: "Pintos N Cheese",
    description: "Refried beans with red sauce and cheese",
    price: 2.19,
    category: "sides",
    calories: 190
  },

  // Drinks
  {
    id: "baja-blast",
    name: "Baja Blast",
    description: "Tropical lime Mountain Dew exclusive to Taco Bell",
    price: 2.49,
    category: "drinks",
    popular: true,
    calories: 280
  },
  {
    id: "mtn-dew",
    name: "Mountain Dew",
    description: "Classic citrus Mountain Dew",
    price: 2.29,
    category: "drinks",
    calories: 290
  },
  {
    id: "pepsi",
    name: "Pepsi",
    description: "Classic Pepsi cola",
    price: 2.29,
    category: "drinks",
    calories: 250
  },
  {
    id: "lemonade",
    name: "Lemonade",
    description: "Refreshing lemonade",
    price: 2.29,
    category: "drinks",
    calories: 140
  }
];

export const CATEGORY_ORDER = ["tacos", "burritos", "specialties", "sides", "drinks"];

export const CATEGORY_LABELS: Record<string, string> = {
  tacos: "🌮 Tacos",
  burritos: "🌯 Burritos",
  specialties: "⭐ Specialties",
  sides: "🍟 Sides",
  drinks: "🥤 Drinks"
};
