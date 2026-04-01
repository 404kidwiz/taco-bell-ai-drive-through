"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, Suspense } from "react";
import dynamic from "next/dynamic";

// Lazy-load the framer-motion toast — only loaded when a toast is shown
const ToastRenderer = dynamic(
  () => import("./components/Toast").then((m) => m.ToastRenderer),
  { ssr: false }
);

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function Providers({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);
  const [toastId, setToastId] = useState(0);

  const showToast = useCallback((message: string) => {
    setToastId((prev) => {
      const nextId = prev + 1;
      setToast({ message, id: nextId });
      return nextId;
    });
  }, []);

  // Auto-dismiss toast after 2 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Suspense fallback={null}>
        <ToastRenderer toast={toast} />
      </Suspense>
    </ToastContext.Provider>
  );
}
