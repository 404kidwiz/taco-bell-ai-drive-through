"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MenuItem } from "../types";
import { MENU_ITEMS } from "../data/menu";
import { fetchStream, fetchStreamSentences } from "../lib/stream";

interface VoiceMessage {
  role: "user" | "assistant";
  content: string;
}

interface UseVoiceAIOptions {
  onMessage: (message: string) => void;
  onTranscript: (text: string) => void;
  onAddItem?: (item: MenuItem) => void;
  onStreamingUpdate?: (partialText: string) => void;
  language?: "en" | "es";
}

export function useVoiceAI({ onMessage, onTranscript, onAddItem, onStreamingUpdate, language }: UseVoiceAIOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);
  const conversationRef = useRef<VoiceMessage[]>([]);
  const isProcessingRef = useRef(false);

  // Fuzzy match menu items — returns all items that match the input
  const findMatchingItems = useCallback((input: string): MenuItem[] => {
    const lowerInput = input.toLowerCase();
    const matchedItems: MenuItem[] = [];
    const seen = new Set<string>();

    for (const item of MENU_ITEMS) {
      const itemNameLower = item.name.toLowerCase();

      // Exact name match
      if (itemNameLower.includes(lowerInput) || lowerInput.includes(itemNameLower)) {
        if (!seen.has(item.id)) { matchedItems.push(item); seen.add(item.id); }
        continue;
      }
    }

    // Keyword-based matching
    const inputWords = lowerInput.split(/\s+/);
    for (const word of inputWords) {
      if (word.length < 3) continue;
      for (const item of MENU_ITEMS) {
        const nameWords = item.name.toLowerCase().split(/\s+/);
        if (nameWords.some(w => w.includes(word) || word.includes(w))) {
          if (!seen.has(item.id)) { matchedItems.push(item); seen.add(item.id); }
        }
      }
    }

    return matchedItems;
  }, []);

  // Extract confirmed items from AI response text
  const extractItemsFromResponse = useCallback((text: string): MenuItem[] => {
    const matched: MenuItem[] = [];
    const seen = new Set<string>();

    for (const item of MENU_ITEMS) {
      const patterns = [
        item.name.toLowerCase(),
        item.name.toLowerCase().replace(/\s+/g, ''),
        ...item.name.toLowerCase().split(/\s+/).filter(w => w.length > 3),
      ];

      const lowerText = text.toLowerCase();
      for (const pattern of patterns) {
        if (pattern.length > 3 && lowerText.includes(pattern) && !seen.has(item.id)) {
          matched.push(item);
          seen.add(item.id);
          break;
        }
      }
    }

    return matched;
  }, []);

  // Speak text immediately (for sentence-level TTS)
  const speakResponse = useCallback((text: string) => {
    if (synthesisRef.current) {
      setIsSpeaking(true);
      synthesisRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1;

      utterance.onend = () => {
        setIsSpeaking(false);
        // Restart listening immediately after speech ends
        if (recognitionRef.current && isConnectedRef.current) {
          try {
            recognitionRef.current.start();
          } catch {}
        }
      };

      synthesisRef.current.speak(utterance);
      setLastMessage(text);
      onMessage(text);
    }
  }, [onMessage]);

  const isConnectedRef = useRef(false);
  const languageRef = useRef(language);
  languageRef.current = language;

  // Send message to LLM with streaming — for text chat mode
  const chatWithLLM = useCallback(async (userMessage: string): Promise<string> => {
    conversationRef.current.push({ role: "user", content: userMessage });

    try {
      const fullText = await fetchStream(
        "/api/tacobell-chat",
        { messages: conversationRef.current, language: languageRef.current },
        (streamed) => {
          onStreamingUpdate?.(streamed);
        },
      );

      conversationRef.current.push({ role: "assistant", content: fullText });

      if (onAddItem) {
        const confirmedItems = extractItemsFromResponse(fullText);
        confirmedItems.forEach(item => onAddItem(item));
      }

      return fullText;
    } catch (err) {
      console.error("LLM chat error:", err);
      const matched = findMatchingItems(userMessage);
      if (matched.length > 0 && onAddItem) {
        matched.forEach(item => onAddItem(item));
        return `Got it! Added ${matched.map(i => i.name).join(", ")} to your order. Anything else?`;
      }
      return "I didn't quite catch that. What can I get for you?";
    }
  }, [onAddItem, findMatchingItems, extractItemsFromResponse, onStreamingUpdate]);

  // Send message with streaming + sentence-level TTS for voice mode
  const chatWithLLMVoice = useCallback(async (userMessage: string): Promise<string> => {
    conversationRef.current.push({ role: "user", content: userMessage });

    try {
      // Pause recognition while processing
      try { recognitionRef.current?.stop(); } catch {}

      const sentences: string[] = [];
      let fullText = "";

      const result = await fetchStreamSentences(
        "/api/tacobell-chat",
        { messages: conversationRef.current },
        (sentence) => {
          sentences.push(sentence);
          // Speak each sentence as it completes
          speakResponse(sentence);
        },
        (partial) => {
          fullText = partial;
          onStreamingUpdate?.(partial);
        },
      );

      fullText = result;
      conversationRef.current.push({ role: "assistant", content: fullText });

      if (onAddItem) {
        const confirmedItems = extractItemsFromResponse(fullText);
        confirmedItems.forEach(item => onAddItem(item));
      }

      return fullText;
    } catch (err) {
      console.error("Voice LLM error:", err);
      return "I didn't quite catch that. What can I get for you?";
    }
  }, [onAddItem, extractItemsFromResponse, speakResponse, onStreamingUpdate]);

  // Sanitize user input
  const sanitizeInput = (raw: string): string => {
    let clean = raw.slice(0, 500);
    clean = clean.replace(/ignore\s+(previous|all|above)\s+instructions?/gi, "");
    clean = clean.replace(/system\s*:/gi, "");
    clean = clean.replace(/<\s*\//g, " ");
    clean = clean.replace(/(?:\\x[0-9a-f]{2}|\\u[0-9a-f]{4})/gi, "");
    return clean.trim();
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthesisRef.current = window.speechSynthesis;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = async (event: any) => {
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript && !isProcessingRef.current) {
            const sanitized = sanitizeInput(finalTranscript);
            onTranscript(sanitized);
            isProcessingRef.current = true;

            const response = await chatWithLLMVoice(sanitized);
            setLastMessage(response);
            onMessage(response);
            isProcessingRef.current = false;
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            setError("Please allow microphone access to use voice ordering.");
          }
          isProcessingRef.current = false;
        };
      }
    }

    return () => {
      recognitionRef.current?.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTranscript, chatWithLLMVoice]);

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
        conversationRef.current = [];
        recognitionRef.current.start();
        setIsConnected(true);
        isConnectedRef.current = true;

        // Small delay, then send greeting with streaming voice
        setTimeout(async () => {
          const greeting = await chatWithLLMVoice("Hi, I'm at the drive-through.");
          setLastMessage(greeting);
        }, 300);
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
    isConnectedRef.current = false;
    conversationRef.current = [];
    isProcessingRef.current = false;
  }, []);

  // Expose chatWithLLM for text-based chat mode (uses streaming)
  const sendChatMessage = useCallback(async (message: string): Promise<string> => {
    const sanitized = sanitizeInput(message);
    return chatWithLLM(sanitized);
  }, [chatWithLLM]);

  const speakText = useCallback((text: string) => {
    speakResponse(text);
  }, [speakResponse]);

  return {
    isConnected,
    isSpeaking,
    lastMessage,
    error,
    connect,
    disconnect,
    sendChatMessage,
    speakText,
    findMatchingItems,
  };
}
