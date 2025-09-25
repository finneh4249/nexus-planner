"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface GameificationProps {
  currentXP?: number;
  maxXP?: number;
  level?: number;
  badges?: string[];
  recentAchievements?: string[];
  className?: string;
}

const availableBadges = {
  'compass-complete': {
    name: 'Compass Calibrated',
    description: 'Completed the Nexus Compass quiz together',
    icon: '🧭',
    color: 'bg-primary'
  },
  'first-budget': {
    name: 'First Steps Together',
    description: 'Created your first budget as a team',
    icon: '🌱',
    color: 'bg-chart-1'
  },
  'consistent-tracker': {
    name: 'Consistency Champions',
    description: 'Tracked spending for 7 days straight',
    icon: '⭐',
    color: 'bg-chart-2'
  },
  'emergency-builder': {
    name: 'Emergency Shield Builders',
    description: 'Built your first $1000 emergency fund',
    icon: '🛡️',
    color: 'bg-primary'
  },
  'teamwork-triumph': {
    name: 'Teamwork Triumph',
    description: 'Stayed within budget for a full month',
    icon: '🤝',
    color: 'bg-accent'
  },
  'goal-crusher': {
    name: 'Goal Crushers',
    description: 'Completed your first shared financial goal',
    icon: '🎯',
    color: 'bg-chart-1'
  },
  'debt-destroyer': {
    name: 'Debt Destroyers',
    description: 'Paid off your first debt together',
    icon: '💪',
    color: 'bg-destructive'
  }
};

export default function Gamification({ 
  currentXP = 0, 
  maxXP = 100, 
  level = 1, 
  badges = [], 
  recentAchievements = [],
  className 
}: GameificationProps) {
  const [showCelebration, setShowCelebration] = React.useState(false);
  
  const xpPercentage = maxXP > 0 ? (currentXP / maxXP) * 100 : 0;

  React.useEffect(() => {
    if (recentAchievements.length > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [recentAchievements]);

  const getLevelTitle = (level: number) => {
    if (level === 1) return "Financial Seedlings";
    if (level <= 3) return "Budget Buddies";
    if (level <= 5) return "Money Managers";
    if (level <= 10) return "Wealth Warriors";
    return "Financial Freedom Fighters";
  };

  return (
    <Card className={cn("relative", className)}>
      {showCelebration && (
        <div className="absolute -top-2 -right-2 z-10 animate-bounce">
          <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            🎉 New Achievement!
          </div>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Our Progress Together</span>
          <Badge variant="secondary" className="text-sm">
            Level {level} • {getLevelTitle(level)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Shared XP Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Team XP</span>
            <span>{currentXP} / {maxXP}</span>
          </div>
          <Progress value={xpPercentage} className="h-3">
            <div className="h-full bg-gradient-to-r from-accent to-chart-2 rounded-full transition-all duration-500" />
          </Progress>
          <p className="text-xs text-muted-foreground text-center">
            {maxXP - currentXP} XP until next level
          </p>
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-accent">🎉 Recent Wins</h4>
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-accent/10 border border-accent/20 rounded-lg animate-pulse">
                <span className="text-lg text-accent">✨</span>
                <span className="text-sm font-medium text-foreground">{achievement}</span>
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Our Badges</h4>
            <div className="grid grid-cols-2 gap-2">
              {badges.map((badgeKey) => {
                const badge = availableBadges[badgeKey as keyof typeof availableBadges];
                if (!badge) return null;
                
                return (
                  <div
                    key={badgeKey}
                    className={cn(
                      "p-3 rounded-lg text-center space-y-1 transition-all hover:scale-105",
                      badge.color,
                      "text-white"
                    )}
                  >
                    <div className="text-2xl">{badge.icon}</div>
                    <div className="text-xs font-medium">{badge.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Motivation */}
        <div className="p-3 bg-secondary/30 rounded-lg text-center">
          <p className="text-sm font-medium text-secondary-foreground">
            "Every small action we take together builds our financial future. Keep going!"
          </p>
        </div>

        {/* Next Milestone Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Next Milestone</h4>
          <div className="flex items-center gap-3 p-2 border rounded-lg">
            <div className="text-2xl">🎯</div>
            <div className="flex-1">
              <p className="text-sm font-medium">Stay on budget for 30 days</p>
              <p className="text-xs text-muted-foreground">Unlock "Consistency Masters" badge</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
