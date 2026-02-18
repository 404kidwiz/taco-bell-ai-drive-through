"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseVoiceAIOptions {
  onMessage: (message: string) => void;
  onTranscript: (text: string) => void;
}

export function useVoiceAI({ onMessage, onTranscript }: UseVoiceAIOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);

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
  }, [onTranscript]);

  const processUserInput = (input: string) => {
    const lowerInput = input.toLowerCase();
    let response = "";
    
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      response = "Hello! Welcome to Taco Bell! What can I get for you today?";
    } else if (lowerInput.includes("taco")) {
      response = "Great choice! We have Crunchy Tacos, Soft Tacos, and Doritos Locos Tacos. Which would you like?";
    } else if (lowerInput.includes("burrito")) {
      response = "Excellent! Try our Beefy 5-Layer Burrito or the Quesarito. Both are customer favorites!";
    } else if (lowerInput.includes("nachos")) {
      response = "Nachos BellGrande coming right up! Would you like anything else with that?";
    } else if (lowerInput.includes("baja blast")) {
      response = "Ah, the legendary Baja Blast! Great choice to go with your meal.";
    } else if (lowerInput.includes("that's all") || lowerInput.includes("done") || lowerInput.includes("checkout")) {
      response = "Perfect! I've got your order. Please review your cart and confirm when you're ready.";
    } else if (lowerInput.includes("thank")) {
      response = "You're welcome! ¡Yo quiero Taco Bell!";
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
