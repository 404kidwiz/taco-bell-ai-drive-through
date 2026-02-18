"use client";

import { useState, useCallback, useEffect } from "react";

interface RewardTier {
  name: string;
  minPoints: number;
  discount: number; // percentage
  perks: string[];
}

const REWARD_TIERS: RewardTier[] = [
  {
    name: "Hot Sauce",
    minPoints: 0,
    discount: 0,
    perks: ["Earn 1 point per $1 spent"],
  },
  {
    name: "Fire Sauce",
    minPoints: 100,
    discount: 5,
    perks: ["Earn 1.5 points per $1 spent", "Free birthday item"],
  },
  {
    name: "Diablo",
    minPoints: 500,
    discount: 10,
    perks: ["Earn 2 points per $1 spent", "Free birthday item", "Early access to new items"],
  },
];

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  icon: string;
}

const AVAILABLE_REWARDS: Reward[] = [
  { id: "free-taco", name: "Free Crunchy Taco", description: "Any day, any time", pointsCost: 50, icon: "🌮" },
  { id: "free-drink", name: "Free Baja Blast", description: "Regular size", pointsCost: 75, icon: "🥤" },
  { id: "free-burrito", name: "Free Bean Burrito", description: "Classic favorite", pointsCost: 100, icon: "🌯" },
  { id: "free-nachos", name: "Free Chips & Cheese", description: "Perfect side", pointsCost: 120, icon: "🧀" },
  { id: "20-off", name: "20% Off Order", description: "One-time use", pointsCost: 200, icon: "💰" },
];

export function useRewards() {
  const [points, setPoints] = useState(0);
  const [lifetimePoints, setLifetimePoints] = useState(0);
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tacoRewards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPoints(parsed.points || 0);
        setLifetimePoints(parsed.lifetimePoints || 0);
        setRedeemedRewards(parsed.redeemedRewards || []);
      } catch (e) {
        console.error("Failed to load rewards:", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("tacoRewards", JSON.stringify({
      points,
      lifetimePoints,
      redeemedRewards,
    }));
  }, [points, lifetimePoints, redeemedRewards]);

  const addPoints = useCallback((amount: number) => {
    setPoints(prev => prev + amount);
    setLifetimePoints(prev => prev + amount);
  }, []);

  const getTier = useCallback((): RewardTier => {
    for (let i = REWARD_TIERS.length - 1; i >= 0; i--) {
      if (lifetimePoints >= REWARD_TIERS[i].minPoints) {
        return REWARD_TIERS[i];
      }
    }
    return REWARD_TIERS[0];
  }, [lifetimePoints]);

  const getNextTier = useCallback((): RewardTier | null => {
    const currentTier = getTier();
    const currentIndex = REWARD_TIERS.findIndex(t => t.name === currentTier.name);
    return REWARD_TIERS[currentIndex + 1] || null;
  }, [getTier]);

  const getPointsToNextTier = useCallback((): number => {
    const nextTier = getNextTier();
    if (!nextTier) return 0;
    return nextTier.minPoints - lifetimePoints;
  }, [getNextTier, lifetimePoints]);

  const canRedeem = useCallback((rewardId: string): boolean => {
    const reward = AVAILABLE_REWARDS.find(r => r.id === rewardId);
    if (!reward) return false;
    return points >= reward.pointsCost && !redeemedRewards.includes(rewardId);
  }, [points, redeemedRewards]);

  const redeemReward = useCallback((rewardId: string): boolean => {
    const reward = AVAILABLE_REWARDS.find(r => r.id === rewardId);
    if (!reward || !canRedeem(rewardId)) return false;

    setPoints(prev => prev - reward.pointsCost);
    setRedeemedRewards(prev => [...prev, rewardId]);
    return true;
  }, [canRedeem]);

  const calculatePointsForOrder = useCallback((total: number): number => {
    const tier = getTier();
    const multiplier = tier.name === "Diablo" ? 2 : tier.name === "Fire Sauce" ? 1.5 : 1;
    return Math.floor(total * multiplier);
  }, [getTier]);

  return {
    points,
    lifetimePoints,
    tier: getTier(),
    nextTier: getNextTier(),
    pointsToNextTier: getPointsToNextTier(),
    availableRewards: AVAILABLE_REWARDS,
    redeemedRewards,
    addPoints,
    canRedeem,
    redeemReward,
    calculatePointsForOrder,
    REWARD_TIERS,
  };
}
