"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MenuItem } from "../types";
import { MENU_ITEMS } from "../data/menu";

interface UseVoiceAIOptions {
  onMessage: (message: string) => void;
  onTranscript: (text: string) => void;
  onAddItem?: (item: MenuItem) => void;
}

export function useVoiceAI({ onMessage, onTranscript, onAddItem }: UseVoiceAIOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);

  // Fuzzy match menu items — returns all items that match the input
  const findMatchingItems = (input: string): MenuItem[] => {
    const lowerInput = input.toLowerCase();
    const matchedItems: MenuItem[] = [];

    for (const item of MENU_ITEMS) {
      const itemNameLower = item.name.toLowerCase();
      const itemWords = itemNameLower.split(" ");
      const inputWords = lowerInput.split(/\s+/);

      // Exact name match
      if (itemNameLower.includes(lowerInput) || lowerInput.includes(itemNameLower)) {
        matchedItems.push(item);
        continue;
      }

      // Partial word match — check if key words from input match item
      const keyWords = ["crunchy", "soft", "taco", "burrito", "nacho", "baja", "blast",
        "mexican", "pizza", "chalupa", "gordita", "bean", "beefy", "quesarito", "supreme",
        "cinnamon", "twist", "cheesy", "roll", "pinto", "lemonade", "mountain", "pepsi",
        "chicken", "locos", "doritos", "gordita", "chalupa", "nacho"];

      for (const word of inputWords) {
        if (keyWords.some(kw => word.includes(kw) || kw.includes(word))) {
          // Check if this word matches any item name or category
          for (const mi of MENU_ITEMS) {
            const miName = mi.name.toLowerCase();
            if (miName.includes(word) || word.includes(miName) ||
                miName.split(" ").some(w => w.startsWith(word.slice(0, 3)) && word.length > 2)) {
              if (!matchedItems.includes(mi)) {
                matchedItems.push(mi);
              }
            }
          }
        }
      }

      // Check plural/singular forms
      if (lowerInput.includes("tacos") || lowerInput.includes("taco")) {
        for (const mi of MENU_ITEMS) {
          if (mi.category === "tacos" && !matchedItems.includes(mi)) {
            matchedItems.push(mi);
          }
        }
      }
      if (lowerInput.includes("burritos") || lowerInput.includes("burrito")) {
        for (const mi of MENU_ITEMS) {
          if (mi.category === "burritos" && !matchedItems.includes(mi)) {
            matchedItems.push(mi);
          }
        }
      }
    }

    // Remove duplicates
    return [...new Set(matchedItems)];
  };

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthesisRef.current = window.speechSynthesis;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }

          if (finalTranscript) {
            onTranscript(finalTranscript);
            processUserInput(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setError("Microphone access error. Please check permissions.");
        };
      }
    }

    return () => {
      recognitionRef.current?.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTranscript]);

  // Sanitize user input — strip injection patterns and limit length
  const sanitizeInput = (raw: string): string => {
    let clean = raw.slice(0, 500); // max 500 chars
    // Strip common prompt injection patterns
    clean = clean.replace(/ignore\s+(previous|all|above)\s+instructions?/gi, "");
    clean = clean.replace(/system\s*:/gi, "");
    clean = clean.replace(/<\s*\//g, " "); // strip closing tags
    clean = clean.replace(/(?:\\x[0-9a-f]{2}|\\u[0-9a-f]{4})/gi, ""); // strip escape sequences
    clean = clean.trim();
    return clean;
  };

  const processUserInput = (rawInput: string) => {
    const input = sanitizeInput(rawInput);
    const lowerInput = input.toLowerCase();
    let response = "";
    const matchedItems = findMatchingItems(lowerInput);

    if (matchedItems.length > 0 && onAddItem) {
      matchedItems.forEach(item => onAddItem(item));
    }

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      response = "Hello! Welcome to Taco Bell! What can I get for you today?";
    } else if (lowerInput.includes("taco") || matchedItems.some(i => i.category === "tacos")) {
      response = matchedItems.length > 0
        ? `Great choice! I've added ${matchedItems.map(i => i.name).join(", ")} to your order. What else can I get for you?`
        : "Great choice! We have Crunchy Tacos, Soft Tacos, and Doritos Locos Tacos. Which would you like?";
    } else if (lowerInput.includes("burrito") || matchedItems.some(i => i.category === "burritos")) {
      response = matchedItems.length > 0
        ? `Excellent! I've added ${matchedItems.map(i => i.name).join(", ")} to your order. Anything else?`
        : "Excellent! Try our Beefy 5-Layer Burrito or the Quesarito. Both are customer favorites!";
    } else if (lowerInput.includes("nacho")) {
      response = matchedItems.length > 0
        ? `Nachos BellGrande coming right up! Added to your order. Would you like anything else with that?`
        : "Nachos BellGrande coming right up! Would you like anything else with that?";
    } else if (lowerInput.includes("baja blast") || lowerInput.includes("baja")) {
      response = "Ah, the legendary Baja Blast! Great choice to go with your meal.";
    } else if (lowerInput.includes("that's all") || lowerInput.includes("done") || lowerInput.includes("checkout")) {
      response = "Perfect! I've got your order. Please review your cart and confirm when you're ready.";
    } else if (lowerInput.includes("thank")) {
      response = "You're welcome! ¡Yo quiero Taco Bell!";
    } else if (matchedItems.length > 0) {
      response = `I've added ${matchedItems.map(i => i.name).join(", ")} to your order. Anything else you'd like?`;
    } else {
      response = "I heard you! I've added that to your order. Anything else you'd like?";
    }

    speakResponse(response);
  };

  const speakResponse = (text: string) => {
    if (synthesisRef.current) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      synthesisRef.current.speak(utterance);
      setLastMessage(text);
      onMessage(text);
    }
  };

  const connect = useCallback(async () => {
    try {
      setError(null);
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError("Voice ordering requires Chrome or Edge. Please switch browsers.");
        return;
      }
      
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsConnected(true);
        
        setTimeout(() => {
          speakResponse("Hello! Welcome to Taco Bell! I'm your AI drive-through assistant. What can I get for you today?");
        }, 500);
      } else {
        setError("Speech recognition not supported. Try Chrome or Edge.");
      }
    } catch (err: any) {
      console.error("Failed to connect:", err);
      setError("Please allow microphone access to use voice ordering.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = useCallback(() => {
    recognitionRef.current?.stop();
    synthesisRef.current?.cancel();
    setIsConnected(false);
    setIsSpeaking(false);
  }, []);

  return {
    isConnected,
    isSpeaking,
    lastMessage,
    error,
    connect,
    disconnect,
  };
}
