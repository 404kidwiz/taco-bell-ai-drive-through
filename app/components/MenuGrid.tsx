"use client";

import { motion } from "framer-motion";
import { Plus, Flame } from "lucide-react";
import { MenuItem, CartItem } from "../types";
import { CATEGORY_ORDER, CATEGORY_LABELS } from "../data/menu";

interface MenuGridProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  cart: CartItem[];
}

export function MenuGrid({ items, onAddToCart, cart }: MenuGridProps) {
  const groupedItems = CATEGORY_ORDER.map(category => ({
    category,
    label: CATEGORY_LABELS[category],
    items: items.filter(item => item.category === category)
  }));

  const getCartQuantity = (itemId: string) => {
    const cartItem = cart.find(c => c.id === itemId);
    return cartItem?.quantity || 0;
  };

  return (
    <div className="space-y-8">
      {groupedItems.map(({ category, label, items }) => (
        <section key={category}>
          <h3 className="text-xl font-bold text-white mb-4">{label}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item, index) => {
              const qty = getCartQuantity(item.id);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-2xl p-4 hover:bg-white/10 transition-colors group cursor-pointer"
                  onClick={() => onAddToCart(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2">
                        {item.name}
                        {item.popular && (
                          <Flame className="w-4 h-4 text-[#F58220]" />
                        )}
                      </h4>
                      <p className="text-sm text-white/70 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    
                    {qty > 0 && (
                      <span className="bg-[#FFC600] text-[#451551] text-sm font-bold px-2 py-1 rounded-full">
                        {qty}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-lg font-bold text-[#FFC600]">
                        ${item.price.toFixed(2)}
                      </span>
                      {item.calories && (
                        <span className="text-xs text-white/50 ml-2">
                          {item.calories} cal
                        </span>
                      )}
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 rounded-full bg-[#FFC600] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(item);
                      }}
                    >
                      <Plus className="w-5 h-5 text-[#451551]" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
