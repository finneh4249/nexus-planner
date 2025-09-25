"use client";

import * as React from "react";
import { toast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { getRandomMessage } from "@/lib/animations";

export const showSuccessToast = (category: 'budgetCreated' | 'spendingTracked' | 'goalAchieved' | 'encouragement') => {
  const message = getRandomMessage(category);
  
  toast({
    title: "Great teamwork! 🎉",
    description: message,
    duration: 4000,
    className: "border-chart-1 bg-chart-1/10",
  });
};

export const showEncouragementToast = () => {
  const message = getRandomMessage('encouragement');
  
  toast({
    title: "Keep going! 💪",
    description: message,
    duration: 3000,
    className: "border-accent bg-accent/10",
  });
};

export const showMilestoneToast = (milestone: string) => {
  toast({
    title: "🏆 Milestone Achieved!",
    description: `We just ${milestone}! Every step counts toward our financial future.`,
    duration: 5000,
    className: "border-primary bg-primary/10",
  });
};
