"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ToastData {
  message: string;
  id: number;
}

export function ToastRenderer({ toast }: { toast: ToastData | null }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-28 right-4 z-[100] bg-surface-container-highest text-white rounded-full px-4 py-2 flex items-center gap-2 shadow-lg"
        >
          <span className="material-symbols-outlined text-sm text-green-400">check_circle</span>
          <span className="text-sm font-label font-medium">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
