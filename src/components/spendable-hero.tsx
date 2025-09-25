"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface SpendableHeroProps {
  weeklyBudget: number;
  currentSpending?: number;
  onSpendingUpdate?: (amount: number, description?: string) => void;
  className?: string;
}

export default function SpendableHero({ 
  weeklyBudget, 
  currentSpending = 0, 
  onSpendingUpdate,
  className 
}: SpendableHeroProps) {
  const [newSpending, setNewSpending] = React.useState("");
  const [showSpendingInput, setShowSpendingInput] = React.useState(false);
  const [celebrateAnimation, setCelebrateAnimation] = React.useState(false);

  const remaining = weeklyBudget - currentSpending;
  const spentPercentage = weeklyBudget > 0 ? (currentSpending / weeklyBudget) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusMessage = () => {
    if (remaining < 0) {
      return "We've gone a bit over this week - that's okay! Next week is a fresh start.";
    }
    if (remaining === 0) {
      return "Perfect! We've used exactly our weekly budget. Great teamwork!";
    }
    if (spentPercentage > 80) {
      return `We have ${formatCurrency(remaining)} left to enjoy together this week.`;
    }
    if (spentPercentage > 50) {
      return `We've got ${formatCurrency(remaining)} free to play with this week.`;
    }
    return `We have ${formatCurrency(remaining)} ready for whatever we want this week!`;
  };

  const getStatusColor = () => {
    if (remaining < 0) return "text-destructive";
    if (spentPercentage > 80) return "text-chart-3"; // Blueprint Sky for caution
    return "text-chart-2"; // Volt Green for success
  };

  const handleAddSpending = () => {
    const amount = parseFloat(newSpending);
    if (!isNaN(amount) && amount > 0 && onSpendingUpdate) {
      onSpendingUpdate(currentSpending + amount, `Spending: ${formatCurrency(amount)}`);
      setNewSpending("");
      setShowSpendingInput(false);
      
      // Trigger celebration animation for positive actions
      setCelebrateAnimation(true);
      setTimeout(() => setCelebrateAnimation(false), 1000);
    }
  };

  const daysUntilReset = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    return daysUntilSunday;
  };

  return (
    <Card className={cn("relative overflow-hidden border-primary/20", className)}>
      {celebrateAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-8xl animate-bounce">🎉</div>
        </div>
      )}
      
      {/* Enhanced background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-chart-2 rounded-full blur-2xl"></div>
      </div>
      
      <CardContent className="relative p-8 text-center space-y-6">
        {/* Enhanced Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-sm">
              💰
            </div>
            <span className="body-base font-medium text-foreground">Weekly Spendable</span>
          </div>
          
          <div className="relative">
            <div className="text-7xl font-bold font-mono bg-gradient-to-br from-accent via-accent to-chart-2 bg-clip-text text-transparent tracking-tight drop-shadow-2xl">
              {formatCurrency(Math.max(0, remaining))}
            </div>
            {remaining <= 0 && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-destructive rounded-full animate-pulse"></div>
            )}
          </div>
          
          <div className="max-w-md mx-auto">
            <p className={cn("text-lg font-medium leading-relaxed", getStatusColor())}>
              {getStatusMessage()}
            </p>
          </div>
        </div>

        {/* Enhanced Progress Visualization */}
        {weeklyBudget > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Spent This Week</p>
                <p className="data-lg font-bold text-foreground">{formatCurrency(currentSpending)}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Weekly Budget</p>
                <p className="data-lg font-bold text-foreground">{formatCurrency(weeklyBudget)}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">Progress</span>
                <span className={cn(
                  "font-mono",
                  spentPercentage <= 80 ? "text-chart-2" : 
                  spentPercentage <= 100 ? "text-chart-4" : "text-destructive"
                )}>
                  {Math.round(spentPercentage)}%
                </span>
              </div>
              <div className="relative w-full bg-muted/50 rounded-full h-4 overflow-hidden">
                <div 
                  className={cn(
                    "h-4 rounded-full transition-all duration-700 relative overflow-hidden",
                    spentPercentage <= 80 ? "bg-gradient-to-r from-chart-2 to-accent" : 
                    spentPercentage <= 100 ? "bg-gradient-to-r from-chart-4 to-destructive/50" : "bg-gradient-to-r from-destructive to-destructive/70"
                  )}
                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
                {spentPercentage > 100 && (
                  <div className="absolute top-0 right-0 h-4 bg-destructive rounded-r-full animate-pulse" style={{ width: `${Math.min(spentPercentage - 100, 20)}%` }}></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Spending Actions */}
        <div className="space-y-4">
          {!showSpendingInput ? (
            <Button 
              onClick={() => setShowSpendingInput(true)}
              variant="outline"
              size="lg"
              className="w-full max-w-xs"
            >
              <Icons.Rewards className="mr-2 h-4 w-4" />
              Track a Purchase
            </Button>
          ) : (
            <div className="space-y-3 max-w-xs mx-auto">
              <Label htmlFor="spending-input" className="text-base">
                How much did we spend?
              </Label>
              <div className="flex gap-2">
                <Input
                  id="spending-input"
                  type="number"
                  placeholder="0"
                  value={newSpending}
                  onChange={(e) => setNewSpending(e.target.value)}
                  className="text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSpending()}
                />
                <Button onClick={handleAddSpending} disabled={!newSpending}>
                  Add
                </Button>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowSpendingInput(false);
                  setNewSpending("");
                }}
                className="w-full text-sm"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Reset Timer */}
        <div className="pt-4 border-t">
          <Badge variant="secondary" className="text-sm">
            Resets in {daysUntilReset()} {daysUntilReset() === 1 ? 'day' : 'days'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
