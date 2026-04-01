import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

// Migration functions for future schema updates
const migrations: Record<number, (state: any) => any> = {
  0: (state) => {
    // v0 → v1: Add options field to CartItem if missing
    if (state?.items) {
      return {
        ...state,
        items: state.items.map((item: CartItem) => ({
          ...item,
          options: item.options ?? [],
        })),
      };
    }
    return state;
  },
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id && JSON.stringify(i.options) === JSON.stringify(item.options));
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && JSON.stringify(i.options) === JSON.stringify(item.options)
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        })),
      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === itemId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'taco-bell-cart',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: any, version: number): any => {
        let state = persistedState;
        // Run all migrations from current version to latest
        for (let v = version; v < 1; v++) {
          if (migrations[v]) {
            state = migrations[v](state);
          }
        }
        return state;
      },
    }
  )
);
