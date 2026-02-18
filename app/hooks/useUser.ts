"use client";

import { useState, useCallback } from "react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  favorites: string[];
  orderHistory: Order[];
  rewardsPoints: number;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: number;
  status: "pending" | "preparing" | "ready" | "completed";
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: string[];
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    // Mock login - in production, this would call an API
    const mockUser: UserProfile = {
      name: "Taco Lover",
      email,
      phone: "",
      favorites: ["crunchy-taco", "baja-blast"],
      orderHistory: [],
      rewardsPoints: 150,
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    
    // Store in localStorage for persistence
    localStorage.setItem("tacoUser", JSON.stringify(mockUser));
    
    return { success: true, user: mockUser };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("tacoUser");
  }, []);

  const addToFavorites = useCallback((itemId: string) => {
    setUser(prev => {
      if (!prev) return null;
      const newFavorites = [...prev.favorites, itemId];
      const updated = { ...prev, favorites: newFavorites };
      localStorage.setItem("tacoUser", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromFavorites = useCallback((itemId: string) => {
    setUser(prev => {
      if (!prev) return null;
      const newFavorites = prev.favorites.filter(id => id !== itemId);
      const updated = { ...prev, favorites: newFavorites };
      localStorage.setItem("tacoUser", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addOrder = useCallback((order: Order) => {
    setUser(prev => {
      if (!prev) return null;
      const newPoints = prev.rewardsPoints + Math.floor(order.total);
      const updated = {
        ...prev,
        orderHistory: [order, ...prev.orderHistory],
        rewardsPoints: newPoints,
      };
      localStorage.setItem("tacoUser", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const loadUser = useCallback(() => {
    const stored = localStorage.getItem("tacoUser");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to load user:", e);
      }
    }
  }, []);

  return {
    user,
    isAuthenticated,
    login,
    logout,
    addToFavorites,
    removeFromFavorites,
    addOrder,
    loadUser,
  };
}
