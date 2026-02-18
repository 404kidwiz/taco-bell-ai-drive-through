"use client";

import { useState, useCallback } from "react";

export interface Customization {
  id: string;
  name: string;
  price: number;
  type: "add" | "remove" | "substitute";
}

export interface CustomizedItem {
  itemId: string;
  basePrice: number;
  customizations: Customization[];
  finalPrice: number;
}

const CUSTOMIZATION_OPTIONS: Record<string, Customization[]> = {
  "crunchy-taco": [
    { id: "extra-cheese", name: "Extra Cheese", price: 0.50, type: "add" },
    { id: "extra-beef", name: "Extra Beef", price: 1.00, type: "add" },
    { id: "no-lettuce", name: "No Lettuce", price: 0, type: "remove" },
    { id: "no-cheese", name: "No Cheese", price: 0, type: "remove" },
  ],
  "soft-taco": [
    { id: "extra-cheese", name: "Extra Cheese", price: 0.50, type: "add" },
    { id: "extra-beef", name: "Extra Beef", price: 1.00, type: "add" },
    { id: "no-lettuce", name: "No Lettuce", price: 0, type: "remove" },
  ],
  "bean-burrito": [
    { id: "extra-beans", name: "Extra Beans", price: 0.50, type: "add" },
    { id: "add-rice", name: "Add Rice", price: 0.50, type: "add" },
    { id: "add-sour-cream", name: "Add Sour Cream", price: 0.50, type: "add" },
  ],
  "beefy-5-layer": [
    { id: "extra-beef", name: "Extra Beef", price: 1.00, type: "add" },
    { id: "extra-cheese", name: "Extra Cheese", price: 0.50, type: "add" },
    { id: "guacamole", name: "Add Guacamole", price: 0.75, type: "add" },
  ],
  "nachos-bellgrande": [
    { id: "extra-beef", name: "Extra Beef", price: 1.00, type: "add" },
    { id: "extra-cheese", name: "Extra Cheese Sauce", price: 0.50, type: "add" },
    { id: "jalapenos", name: "Add Jalapeños", price: 0.50, type: "add" },
  ],
};

export function useCustomization() {
  const [activeCustomization, setActiveCustomization] = useState<string | null>(null);
  const [customizedItems, setCustomizedItems] = useState<Record<string, CustomizedItem>>({});

  const getCustomizations = useCallback((itemId: string): Customization[] => {
    return CUSTOMIZATION_OPTIONS[itemId] || [];
  }, []);

  const toggleCustomization = useCallback((itemId: string, customization: Customization) => {
    setCustomizedItems(prev => {
      const current = prev[itemId] || {
        itemId,
        basePrice: 0,
        customizations: [],
        finalPrice: 0,
      };

      const exists = current.customizations.find(c => c.id === customization.id);
      let newCustomizations: Customization[];

      if (exists) {
        newCustomizations = current.customizations.filter(c => c.id !== customization.id);
      } else {
        newCustomizations = [...current.customizations, customization];
      }

      const customizationPrice = newCustomizations.reduce((sum, c) => sum + c.price, 0);
      
      return {
        ...prev,
        [itemId]: {
          ...current,
          customizations: newCustomizations,
          finalPrice: current.basePrice + customizationPrice,
        },
      };
    });
  }, []);

  const setBasePrice = useCallback((itemId: string, basePrice: number) => {
    setCustomizedItems(prev => {
      const current = prev[itemId] || {
        itemId,
        basePrice,
        customizations: [],
        finalPrice: basePrice,
      };

      const customizationPrice = current.customizations.reduce((sum, c) => sum + c.price, 0);

      return {
        ...prev,
        [itemId]: {
          ...current,
          basePrice,
          finalPrice: basePrice + customizationPrice,
        },
      };
    });
  }, []);

  const getItemPrice = useCallback((itemId: string, basePrice: number): number => {
    const customized = customizedItems[itemId];
    if (!customized) return basePrice;
    return customized.finalPrice;
  }, [customizedItems]);

  const getItemCustomizations = useCallback((itemId: string): Customization[] => {
    return customizedItems[itemId]?.customizations || [];
  }, [customizedItems]);

  const openCustomization = useCallback((itemId: string, basePrice: number) => {
    setBasePrice(itemId, basePrice);
    setActiveCustomization(itemId);
  }, [setBasePrice]);

  const closeCustomization = useCallback(() => {
    setActiveCustomization(null);
  }, []);

  return {
    activeCustomization,
    customizedItems,
    getCustomizations,
    toggleCustomization,
    getItemPrice,
    getItemCustomizations,
    openCustomization,
    closeCustomization,
    CUSTOMIZATION_OPTIONS,
  };
}
