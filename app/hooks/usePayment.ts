"use client";

import { useState, useCallback } from "react";

interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  zipCode: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPayment, setLastPayment] = useState<PaymentResult | null>(null);

  const validateCard = useCallback((details: PaymentDetails): boolean => {
    // Basic validation
    if (details.cardNumber.replace(/\s/g, "").length < 13) return false;
    if (details.expiryDate.length < 5) return false;
    if (details.cvv.length < 3) return false;
    if (!details.cardholderName.trim()) return false;
    if (details.zipCode.length < 5) return false;
    return true;
  }, []);

  const processPayment = useCallback(async (
    amount: number,
    details: PaymentDetails
  ): Promise<PaymentResult> => {
    setIsProcessing(true);

    try {
      // Validate card details
      if (!validateCard(details)) {
        return {
          success: false,
          error: "Invalid card details",
        };
      }

      // Mock payment processing - in production, this would call Stripe/PayPal
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 90% success rate for demo
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        const result: PaymentResult = {
          success: true,
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        setLastPayment(result);
        return result;
      } else {
        const result: PaymentResult = {
          success: false,
          error: "Payment declined. Please try a different card.",
        };
        setLastPayment(result);
        return result;
      }
    } catch (error: any) {
      const result: PaymentResult = {
        success: false,
        error: error.message || "Payment processing failed",
      };
      setLastPayment(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [validateCard]);

  const formatCardNumber = useCallback((value: string): string => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  }, []);

  const formatExpiryDate = useCallback((value: string): string => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  }, []);

  return {
    isProcessing,
    lastPayment,
    processPayment,
    formatCardNumber,
    formatExpiryDate,
    validateCard,
  };
}
