"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export type Stage = 'crawl' | 'walk' | 'run' | 'fly';

interface StageProgressionProps {
  currentStage?: Stage;
  onStageComplete?: (stage: Stage) => void;
  hasBasicBudget?: boolean;
  hasTrackedSpending?: boolean;
  hasEmergencyFund?: boolean;
  hasSharedGoals?: boolean;
  className?: string;
}

const stages = {
  crawl: {
    title: "Crawl: Getting Started",
    description: "Track essentials + income baseline",
    icon: "🌱",
    color: "bg-chart-2",
    tasks: [
      { id: 'budget', label: 'Set up basic budget', key: 'hasBasicBudget' },
      { id: 'track', label: 'Track spending for 3 days', key: 'hasTrackedSpending' }
    ]
  },
  walk: {
    title: "Walk: Building Habits",
    description: "Buckets unlocked + SpendableHero live",
    icon: "🚶‍♂️",
    color: "bg-chart-3",
    tasks: [
      { id: 'consistent', label: 'Track spending consistently for 1 week' },
      { id: 'buckets', label: 'Use all three buckets successfully' }
    ]
  },
  run: {
    title: "Run: Shared Goals",
    description: "Shared goals + automation layered in",
    icon: "🏃‍♀️",
    color: "bg-accent",
    tasks: [
      { id: 'emergency', label: 'Build $1000 emergency fund', key: 'hasEmergencyFund' },
      { id: 'goals', label: 'Set shared financial goals', key: 'hasSharedGoals' }
    ]
  },
  fly: {
    title: "Fly: Advanced Tools",
    description: "Pledge Protocol, Accords Hub, investments",
    icon: "🚀",
    color: "bg-accent",
    tasks: [
      { id: 'automation', label: 'Set up automated savings' },
      { id: 'investing', label: 'Start investment strategy' }
    ]
  }
};

export default function StageProgression({ 
  currentStage = 'crawl', 
  onStageComplete,
  hasBasicBudget = false,
  hasTrackedSpending = false,
  hasEmergencyFund = false,
  hasSharedGoals = false,
  className 
}: StageProgressionProps) {
  const stageOrder: Stage[] = ['crawl', 'walk', 'run', 'fly'];
  const currentIndex = stageOrder.indexOf(currentStage);
  
  const getTaskCompletion = (stage: Stage, task: any) => {
    const props = { hasBasicBudget, hasTrackedSpending, hasEmergencyFund, hasSharedGoals };
    if (task.key && task.key in props) {
      return props[task.key as keyof typeof props];
    }
    return false; // Default for tasks we haven't implemented tracking for yet
  };

  const getStageCompletion = (stage: Stage) => {
    const stageData = stages[stage];
    const completedTasks = stageData.tasks.filter(task => getTaskCompletion(stage, task));
    return stageData.tasks.length > 0 ? (completedTasks.length / stageData.tasks.length) * 100 : 0;
  };

  const canUnlockNextStage = (stage: Stage) => {
    return getStageCompletion(stage) >= 80; // Need 80% completion to unlock next stage
  };

  const handleStageClick = (stage: Stage) => {
    const stageIndex = stageOrder.indexOf(stage);
    if (stageIndex <= currentIndex + 1) {
      // Allow clicking current stage or next stage if current is mostly complete
      if (stage === currentStage || canUnlockNextStage(currentStage)) {
        onStageComplete?.(stage);
      }
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Our Journey Together</span>
          <Badge variant="secondary">
            Stage {currentIndex + 1} of {stageOrder.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span>Overall Progress</span>
            <span>{currentIndex + 1} / {stageOrder.length} stages</span>
          </div>
          <Progress value={((currentIndex + 1) / stageOrder.length) * 100} className="h-2" />
        </div>

        {/* Current Stage Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white text-xl", stages[currentStage].color)}>
              {stages[currentStage].icon}
            </div>
            <div>
              <h3 className="font-semibold">{stages[currentStage].title}</h3>
              <p className="text-sm text-muted-foreground">{stages[currentStage].description}</p>
            </div>
          </div>

          {/* Current Stage Tasks */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Tasks:</h4>
            {stages[currentStage].tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-2 border rounded-lg">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                  getTaskCompletion(currentStage, task) 
                    ? "bg-accent text-accent-foreground" 
                    : "border-2 border-muted"
                )}>
                  {getTaskCompletion(currentStage, task) && "✓"}
                </div>
                <span className={cn(
                  "text-sm",
                  getTaskCompletion(currentStage, task) 
                    ? "line-through text-muted-foreground" 
                    : ""
                )}>
                  {task.label}
                </span>
              </div>
            ))}
          </div>

          {/* Stage Completion Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Stage Progress</span>
              <span>{Math.round(getStageCompletion(currentStage))}% complete</span>
            </div>
            <Progress value={getStageCompletion(currentStage)} className="h-2" />
          </div>
        </div>

        {/* Stage Navigation */}
        <div className="grid grid-cols-4 gap-2">
          {stageOrder.map((stage, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = stage === currentStage;
            const isLocked = index > currentIndex + 1 || (index === currentIndex + 1 && !canUnlockNextStage(currentStage));
            
            return (
              <Button
                key={stage}
                variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                size="sm"
                disabled={isLocked}
                onClick={() => handleStageClick(stage)}
                className={cn(
                  "flex flex-col items-center p-2 h-auto",
                  isLocked && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="text-lg mb-1">{stages[stage].icon}</div>
                <div className="text-xs capitalize">{stage}</div>
                {isCompleted && <div className="text-xs text-chart-1">✓</div>}
              </Button>
            );
          })}
        </div>

        {/* Next Steps */}
        {canUnlockNextStage(currentStage) && currentIndex < stageOrder.length - 1 && (
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
            <p className="text-sm font-medium text-accent mb-2">🎉 Ready for the next stage!</p>
            <p className="text-xs text-foreground/80">
              You've mastered the {currentStage} stage. Click on "{stages[stageOrder[currentIndex + 1]].title}" to continue your journey!
            </p>
          </div>
        )}

        {/* Motivational Message */}
        <div className="text-center p-3 bg-secondary/20 rounded-lg">
          <p className="text-sm font-medium">
            "Every step forward is progress. We're building our financial future together, one stage at a time."
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
