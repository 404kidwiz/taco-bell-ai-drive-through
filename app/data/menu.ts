import { MenuItem } from "../types";

export const MENU_ITEMS: MenuItem[] = [
  // Tacos
  {
    id: "crunchy-taco",
    name: "Crunchy Taco",
    description: "Seasoned beef, lettuce, cheese in a crunchy shell",
    descriptionEs: "Res Carne sazonada, lechuga, queso en concha crujiente",
    price: 1.79,
    category: "tacos",
    popular: true,
    calories: 170
  },
  {
    id: "soft-taco",
    name: "Soft Taco",
    description: "Seasoned beef, lettuce, cheese in a soft tortilla",
    descriptionEs: "Res carne sazonada, lechuga, queso en tortilla suave",
    price: 1.79,
    category: "tacos",
    calories: 180
  },
  {
    id: "doritos-locos",
    name: "Doritos Locos Taco",
    description: "Nacho cheese Doritos shell with seasoned beef",
    descriptionEs: "Concha de Doritos Nacho Cheese con res sazonada",
    price: 2.19,
    category: "tacos",
    popular: true,
    calories: 190
  },
  {
    id: "chicken-soft",
    name: "Chicken Soft Taco",
    description: "Grilled chicken, lettuce, cheese, avocado ranch",
    descriptionEs: "Pollo asado, lechuga, queso, aderezo de aguacate",
    price: 2.49,
    category: "tacos",
    calories: 190
  },

  // Burritos
  {
    id: "bean-burrito",
    name: "Bean Burrito",
    description: "Beans, red sauce, onions, cheese",
    descriptionEs: "Frijoles, salsa roja, cebolla, queso",
    price: 1.79,
    category: "burritos",
    calories: 350
  },
  {
    id: "beefy-5-layer",
    name: "Beefy 5-Layer Burrito",
    description: "Beef, beans, sour cream, cheese, nacho cheese",
    descriptionEs: "Res, frijoles, crema agria, queso, queso nacho",
    price: 3.69,
    category: "burritos",
    popular: true,
    calories: 500
  },
  {
    id: "quesarito",
    name: "Quesarito",
    description: "Beef, rice, chipotle sauce, sour cream, cheese wrapped in quesadilla",
    descriptionEs: "Res, arroz, salsa chipotle, crema agria, queso envuelto en quesadilla",
    price: 4.19,
    category: "burritos",
    popular: true,
    calories: 650
  },
  {
    id: "burrito-supreme",
    name: "Burrito Supreme",
    description: "Beef, beans, sour cream, tomatoes, lettuce, cheese, red sauce",
    descriptionEs: "Res, frijoles, crema agria, tomates, lechuga, queso, salsa roja",
    price: 4.19,
    category: "burritos",
    calories: 390
  },

  // Specialties
  {
    id: "nachos-bellgrande",
    name: "Nachos BellGrande",
    description: "Chips, beans, beef, nacho cheese, sour cream, tomatoes",
    descriptionEs: "Totopos, frijoles, res, queso nacho, crema agria, tomates",
    price: 4.99,
    category: "specialties",
    popular: true,
    calories: 740
  },
  {
    id: "mexican-pizza",
    name: "Mexican Pizza",
    description: "Two crispy shells, beans, beef, pizza sauce, cheese, tomatoes",
    descriptionEs: "Dos conchas crujientes, frijoles, res, salsa pizza, queso, tomates",
    price: 4.99,
    category: "specialties",
    popular: true,
    calories: 540
  },
  {
    id: "chalupa-supreme",
    name: "Chalupa Supreme",
    description: "Fried chalupa shell, beef, sour cream, tomatoes, lettuce, cheese",
    descriptionEs: "Chalupa frita, res, crema agria, tomates, lechuga, queso",
    price: 3.89,
    category: "specialties",
    calories: 350
  },
  {
    id: "gordita-crunch",
    name: "Cheesy Gordita Crunch",
    description: "Crunchy taco wrapped in gordita with cheese, spicy ranch",
    descriptionEs: "Taco crujiente envuelto en gordita con queso, rancho spicy",
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
    descriptionEs: "Enredos crujientes espolvoreados con canela y azúcar",
    price: 1.29,
    category: "sides",
    calories: 170
  },
  {
    id: "cheesy-roll-up",
    name: "Cheesy Roll Up",
    description: "Three cheese blend rolled in flour tortilla",
    descriptionEs: "Mezcla de tres quesos enrollada en tortilla de harina",
    price: 1.29,
    category: "sides",
    calories: 180
  },
  {
    id: "chips-cheese",
    name: "Chips and Nacho Cheese",
    description: "Tortilla chips with warm nacho cheese sauce",
    descriptionEs: "Totopos con salsa tibia de queso nacho",
    price: 1.99,
    category: "sides",
    calories: 220
  },
  {
    id: "pintos-cheese",
    name: "Pintos N Cheese",
    description: "Refried beans with red sauce and cheese",
    descriptionEs: "Frijoles refritos con salsa roja y queso",
    price: 2.19,
    category: "sides",
    calories: 190
  },

  // Drinks
  {
    id: "baja-blast",
    name: "Baja Blast",
    description: "Tropical lime Mountain Dew exclusive to Taco Bell",
    descriptionEs: "Mountain Dew de lima tropical, exclusivo de Taco Bell",
    price: 2.49,
    category: "drinks",
    popular: true,
    calories: 280
  },
  {
    id: "mtn-dew",
    name: "Mountain Dew",
    description: "Classic citrus Mountain Dew",
    descriptionEs: "Mountain Dew clásico de citrus",
    price: 2.29,
    category: "drinks",
    calories: 290
  },
  {
    id: "pepsi",
    name: "Pepsi",
    description: "Classic Pepsi cola",
    descriptionEs: "Pepsi Cola clásica",
    price: 2.29,
    category: "drinks",
    calories: 250
  },
  {
    id: "lemonade",
    name: "Lemonade",
    description: "Refreshing lemonade",
    descriptionEs: "Limonada refrescante",
    price: 2.29,
    category: "drinks",
    calories: 140
  }
];

export const CATEGORY_ORDER = ["tacos", "burritos", "specialties", "sides", "drinks"];

export const CATEGORY_LABELS: Record<string, string> = {
  tacos: "Tacos",
  burritos: "Burritos",
  specialties: "Specialties",
  sides: "Sides",
  drinks: "Drinks"
};
