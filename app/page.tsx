"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  ShoppingBag, 
  X,
  ChevronRight,
  Volume2,
  Flame,
  Plus,
  Minus,
  Clock,
  Star,
  ArrowRight
} from "lucide-react";
import { MenuItem, CartItem, OrderState } from "./types";
import { MENU_ITEMS } from "./data/menu";
import { useVoiceAI } from "./hooks/useVoiceAI";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function DriveThrough() {
  const [orderState, setOrderState] = useState<OrderState>("idle");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState("Welcome to Taco Bell! I'm your AI drive-through assistant. Tap the microphone and tell me what you'd like to order.");
  const [transcript, setTranscript] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const {
    isConnected,
    isSpeaking,
    connect,
    disconnect,
    error
  } = useVoiceAI({
    onMessage: (message) => {
      setAiMessage(message);
      processOrderIntent(message);
    },
    onTranscript: (text) => {
      setTranscript(text);
    }
  });

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const processOrderIntent = (message: string) => {
    const lowerMsg = message.toLowerCase();
    MENU_ITEMS.forEach(item => {
      if (lowerMsg.includes(item.name.toLowerCase())) {
        addToCart(item);
      }
    });
    if (lowerMsg.includes("that's all") || lowerMsg.includes("done") || lowerMsg.includes("checkout")) {
      setOrderState("confirming");
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setOrderState("ordering");
    setTimeout(() => setOrderState("idle"), 800);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = ["all", ...Array.from(new Set(MENU_ITEMS.map(i => i.category)))];
  const filteredItems = selectedCategory && selectedCategory !== "all" 
    ? MENU_ITEMS.filter(i => i.category === selectedCategory)
    : MENU_ITEMS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0514] via-[#1A0D24] to-[#0F0514]">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D71A64] rounded-full opacity-10 blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFC600] rounded-full opacity-10 blur-[128px]" />
      </div>

      {/* Header */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-[#0F0514]/95 backdrop-blur-xl border-b border-[#9D1F60]/20" : ""
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFC600] to-[#F58220] flex items-center justify-center shadow-lg">
                <Flame className="w-7 h-7 text-[#451551]" />
              </div>
              <motion.div 
                className="absolute inset-0 rounded-xl bg-[#FFC600]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="font-['Oswald'] text-2xl font-bold tracking-wider text-white">
                TACO BELL
              </h1>
              <p className="text-xs text-[#9D1F60] font-medium tracking-widest uppercase">
                AI Drive-Through
              </p>
            </div>
          </div>

          {/* Cart Button */}
          <motion.button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 bg-[#1A0D24] border border-[#9D1F60]/30 rounded-xl hover:border-[#FFC600]/50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingBag className="w-5 h-5 text-[#FFC600]" />
            <span className="font-['Oswald'] text-white font-semibold">
              ${cartTotal.toFixed(2)}
            </span>
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#FFC600] to-[#F58220] rounded-full flex items-center justify-center text-sm font-bold text-[#451551]"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </motion.header>

      <main className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero / AI Assistant Section */}
        <section className="mb-12">
          <motion.div 
            className="dt-card p-6 sm:p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FFC600]/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative flex flex-col lg:flex-row items-center gap-8">
              {/* AI Avatar */}
              <div className="relative flex-shrink-0">
                <motion.div 
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center relative overflow-hidden ${
                    isSpeaking ? "bg-gradient-to-br from-[#FFC600] to-[#F58220]" : 
                    isConnected ? "bg-gradient-to-br from-[#D71A64] to-[#9D1F60]" : 
                    "bg-gradient-to-br from-[#451551] to-[#6B2C7A]"
                  }`}
                  animate={isSpeaking || isConnected ? {
                    boxShadow: [
                      "0 0 0 0 rgba(255, 198, 0, 0.4)",
                      "0 0 0 20px rgba(255, 198, 0, 0)",
                    ]
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {isSpeaking ? (
                    <Volume2 className="w-12 h-12 sm:w-14 sm:h-14 text-[#451551]" />
                  ) : isConnected ? (
                    <Mic className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                  ) : (
                    <Flame className="w-12 h-12 sm:w-14 sm:h-14 text-[#FFC600]" />
                  )}
                  
                  {/* Voice Wave Animation */}
                  {isConnected && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-white/30 rounded-full"
                          animate={{ height: ["20%", "80%", "20%"] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
                
                {/* Status Badge */}
                <motion.div 
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#0F0514] border border-[#9D1F60]/50 rounded-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className={`text-xs font-semibold uppercase tracking-wider ${
                    isConnected ? "text-[#FFC600]" : "text-[#9D1F60]"
                  }`}>
                    {isConnected ? "Listening" : "Tap to Order"}
                  </span>
                </motion.div>
              </div>

              {/* AI Message */}
              <div className="flex-1 text-center lg:text-left">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={aiMessage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xl sm:text-2xl lg:text-3xl font-['Oswald'] font-bold text-white leading-tight"
                  >
                    {aiMessage}
                  </motion.p>
                </AnimatePresence>
                
                {transcript && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 text-[#9D1F60] font-medium"
                  >
                    &ldquo;{transcript}&rdquo;
                  </motion.p>
                )}

                {error && (
                  <p className="mt-3 text-red-400 text-sm">{error}</p>
                )}
              </div>

              {/* Voice Control */}
              <div className="flex-shrink-0">
                <motion.button
                  onClick={isConnected ? disconnect : connect}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center transition-all ${
                    isConnected 
                      ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30" 
                      : "bg-gradient-to-br from-[#FFC600] to-[#F58220] hover:shadow-xl hover:shadow-[#FFC600]/30"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isConnected ? (
                    <MicOff className="w-10 h-10 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-[#451551]" />
                  )}
                </motion.button>
                <p className="mt-2 text-center text-xs text-white/50 uppercase tracking-wider">
                  {isConnected ? "End" : "Start"}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Category Filter */}
        <section className="mb-8">
          <motion.div 
            className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                variants={itemVariants}
                className={`flex-shrink-0 px-6 py-3 rounded-xl font-['Oswald'] font-semibold text-sm uppercase tracking-wider transition-all ${
                  selectedCategory === category || (category === "all" && !selectedCategory)
                    ? "bg-gradient-to-r from-[#FFC600] to-[#F58220] text-[#451551]"
                    : "bg-[#1A0D24] text-white/70 border border-[#9D1F60]/30 hover:border-[#FFC600]/50"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {category === "all" ? "All Items" : category}
              </motion.button>
            ))}
          </motion.div>
        </section>

        {/* Menu Grid */}
        <section>
          <motion.h2 
            className="font-['Oswald'] text-3xl sm:text-4xl font-bold text-white mb-8 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-gradient">Menu</span>
            <span className="text-white/30">|</span>
            <span className="text-lg font-normal text-white/50">
              {filteredItems.length} items
            </span>
          </motion.h2>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredItems.map((item, index) => {
              const qty = cart.find(c => c.id === item.id)?.quantity || 0;
              
              return (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="menu-item-card group cursor-pointer"
                  onClick={() => addToCart(item)}
                  whileHover={{ y: -4 }}
                >
                  <div className="p-5 relative z-10">
                    {/* Popular Badge */}
                    {item.popular && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#D71A64] to-[#9D1F60] rounded-full">
                        <Flame className="w-3 h-3 text-white" />
                        <span className="text-xs font-bold text-white uppercase">Hot</span>
                      </div>
                    )}

                    {/* Item Info */}
                    <div className="mb-4">
                      <h3 className="font-['Oswald'] text-xl font-bold text-white mb-2 group-hover:text-[#FFC600] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-white/60 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Price & Calories */}
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <span className="font-['Oswald'] text-3xl font-bold text-gradient">
                          ${item.price.toFixed(2)}
                        </span>
                        {item.calories && (
                          <p className="text-xs text-white/40 mt-1">
                            {item.calories} cal
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Add Button / Quantity */}
                    <div className="flex items-center justify-between">
                      {qty > 0 ? (
                        <div className="flex items-center gap-3 bg-[#1A0D24] rounded-xl p-1">
                          <motion.button
                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}
                            className="w-10 h-10 flex items-center justify-center bg-[#451551] rounded-lg text-white hover:bg-[#6B2C7A] transition-colors"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>
                          <span className="w-8 text-center font-['Oswald'] font-bold text-white text-lg">
                            {qty}
                          </span>
                          <motion.button
                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}
                            className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#FFC600] to-[#F58220] rounded-lg text-[#451551] hover:shadow-lg hover:shadow-[#FFC600]/30 transition-all"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFC600] to-[#F58220] rounded-xl font-['Oswald'] font-bold text-[#451551] uppercase tracking-wider text-sm hover:shadow-lg hover:shadow-[#FFC600]/30 transition-all"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </motion.button>
                      )}
                      
                      {/* Total for this item */}
                      {qty > 0 && (
                        <span className="font-['Oswald'] text-xl font-bold text-[#FFC600]">
                          ${(item.price * qty).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md cart-drawer z-50 overflow-hidden flex flex-col"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#9D1F60]/20">
                <div>
                  <h2 className="font-['Oswald'] text-2xl font-bold text-white">Your Order</h2>
                  <p className="text-sm text-white/50">{cartCount} items</p>
                </div>
                <motion.button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-[#9D1F60]/50 mx-auto mb-4" />
                    <p className="text-xl font-['Oswald'] text-white/70">Your cart is empty</p>
                    <p className="text-sm text-white/40 mt-2">Add some delicious items!</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="dt-card p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-['Oswald'] text-lg font-bold text-white">{item.name}</h4>
                          <p className="text-sm text-white/50">${item.price.toFixed(2)} each</p>
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, -item.quantity)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-[#1A0D24] rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center bg-[#451551] rounded-md text-white hover:bg-[#6B2C7A] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-['Oswald'] font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FFC600] to-[#F58220] rounded-md text-[#451551]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <span className="font-['Oswald'] text-xl font-bold text-[#FFC600]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-[#9D1F60]/20 bg-gradient-to-t from-[#0F0514] to-transparent">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-white/70">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Tax</span>
                      <span>${(cartTotal * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-['Oswald'] font-bold text-white pt-2 border-t border-[#9D1F60]/20">
                      <span>Total</span>
                      <span className="text-gradient">${(cartTotal * 1.08).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => setOrderState("confirming")}
                    className="w-full py-4 bg-gradient-to-r from-[#FFC600] to-[#F58220] rounded-xl font-['Oswald'] font-bold text-[#451551] uppercase tracking-wider text-lg hover:shadow-xl hover:shadow-[#FFC600]/30 transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Checkout
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {orderState === "confirming" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="dt-card p-8 max-w-md w-full"
            >
              <h3 className="font-['Oswald'] text-3xl font-bold text-white mb-6">Confirm Order</h3>
              
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-white">
                    <span className="text-white/70">{item.quantity}x {item.name}</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-[#9D1F60]/20 pt-4 mb-6">
                <div className="flex justify-between text-2xl font-['Oswald'] font-bold text-white">
                  <span>Total</span>
                  <span className="text-gradient">${(cartTotal * 1.08).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setOrderState("idle")}
                  className="flex-1 py-4 rounded-xl border border-[#9D1F60]/50 text-white font-['Oswald'] font-semibold uppercase tracking-wider hover:bg-white/5 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  Add More
                </motion.button>
                <motion.button
                  onClick={() => {
                    setOrderState("completed");
                    setTimeout(() => {
                      setCart([]);
                      setOrderState("idle");
                      setIsCartOpen(false);
                      setAiMessage("Thank you for your order! Your food will be ready soon.");
                    }, 3000);
                  }}
                  className="flex-1 py-4 bg-gradient-to-r from-[#FFC600] to-[#F58220] rounded-xl font-['Oswald'] font-bold text-[#451551] uppercase tracking-wider hover:shadow-xl hover:shadow-[#FFC600]/30 transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  Place Order
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Complete */}
      <AnimatePresence>
        {orderState === "completed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#FFC600] to-[#F58220]"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1 }}
                className="w-32 h-32 mx-auto mb-8 rounded-full bg-[#451551] flex items-center justify-center shadow-2xl"
              >
                <Flame className="w-16 h-16 text-[#FFC600]" />
              </motion.div>
              <h2 className="font-['Oswald'] text-5xl font-bold text-[#451551] mb-4">Order Placed!</h2>
              <p className="text-2xl text-[#451551]/80 font-semibold">Your order number is</p>
              <p className="font-['Oswald'] text-7xl font-bold text-[#451551] mt-4">#42</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
