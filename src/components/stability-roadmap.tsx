"use client";

import * as React from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useNexusStorage } from "@/lib/storage";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const milestones = [
  { id: 'starter', name: "Starter Emergency Fund", amount: 1000, description: "Your first buffer for small surprises." },
  { id: 'one-month', name: "One-Month Essentials", amount: 2200, description: "Cover one full month of your core bills." },
  { id: 'three-month', name: "Three-Month Cushion", amount: 5000, description: "A solid safety net for bigger emergencies." },
  { id: 'fully-funded', name: "Fully Funded EF", amount: 10000, description: "Six months of living expenses, secured." },
];

export default function StabilityRoadmap() {
  const storage = useNexusStorage();
  const [currentSavings, setCurrentSavings] = React.useState(storage.data.emergencyFund.currentAmount.toString());
  const [stabilityAllocation, setStabilityAllocation] = React.useState("");

  const handleSavingsChange = (value: string) => {
    setCurrentSavings(value);
    const amount = parseFloat(value) || 0;
    storage.updateEmergencyFund({ currentAmount: amount });
  };

  const { parsedSavings, parsedAllocation, nextMilestone, progressPercentage, timeToNextMilestone } = React.useMemo(() => {
    const pSavings = parseFloat(currentSavings) || 0;
    const pAllocation = parseFloat(stabilityAllocation) || 0;

    let nextM = null;
    for (const milestone of milestones) {
      if (pSavings < milestone.amount) {
        nextM = milestone;
        break;
      }
    }

    let progress = 0;
    let timeToNext = null;
    
    if (nextM) {
      const prevMilestoneAmount = milestones[milestones.indexOf(nextM) - 1]?.amount || 0;
      const totalForMilestone = nextM.amount - prevMilestoneAmount;
      const savedForMilestone = pSavings - prevMilestoneAmount;
      progress = (savedForMilestone / totalForMilestone) * 100;
      
      if (pAllocation > 0) {
        const amountNeeded = nextM.amount - pSavings;
        const monthsNeeded = Math.ceil(amountNeeded / pAllocation);
        
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + monthsNeeded);
        timeToNext = futureDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      }
    } else if (pSavings >= milestones[milestones.length-1].amount) {
      // If all milestones are completed
      progress = 100;
      nextM = milestones[milestones.length - 1];
    }


    return {
      parsedSavings: pSavings,
      parsedAllocation: pAllocation,
      nextMilestone: nextM,
      progressPercentage: progress,
      timeToNextMilestone: timeToNext
    };
  }, [currentSavings, stabilityAllocation]);

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl border-none">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight text-center">Stability Roadmap</CardTitle>
        <CardDescription className="text-center">
          Building our financial shield. Milestone by milestone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg bg-card space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-center">Our Progress</h2>
            <div className="space-y-2">
              <Label htmlFor="current-savings" className="text-base">Current Stability Savings</Label>
              <Input
                id="current-savings"
                type="number"
                placeholder="e.g., 500"
                value={currentSavings}
                onChange={(e) => handleSavingsChange(e.target.value)}
                className="text-lg"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="stability-alloc" className="text-base">Monthly Stability Allocation</Label>
              <Input
                id="stability-alloc"
                type="number"
                placeholder="From Bucket Splitter"
                value={stabilityAllocation}
                onChange={e => setStabilityAllocation(e.target.value)}
                className="text-lg"
              />
            </div>
          </div>

          <div className="p-6 border rounded-lg bg-card flex flex-col items-center justify-center text-center">
            {nextMilestone && parsedSavings < nextMilestone.amount ? (
                 <>
                    <h2 className="text-xl font-semibold tracking-tight">Next Milestone: <span className="text-primary">{nextMilestone.name}</span></h2>
                    <p className="text-4xl font-bold text-primary my-2">{formatCurrency(nextMilestone.amount)}</p>
                    <p className="text-muted-foreground">{nextMilestone.description}</p>
                    {timeToNextMilestone && (
                        <p className="font-semibold text-chart-1 mt-4">Projected to reach by: {timeToNextMilestone}</p>
                    )}
                 </>
            ) : (
                <div className="text-center">
                    <Icons.Stability className="w-16 h-16 text-chart-1 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-primary">Shield is Fully Charged!</h2>
                    <p className="text-muted-foreground mt-2">You've completed the Stability Roadmap. Incredible work!</p>
                </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
            <h2 className="text-xl font-semibold tracking-tight text-center">Our Roadmap</h2>
            <div>
              <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Progress to Next Milestone</span>
                  <span className="text-sm font-bold text-primary">{progressPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {milestones.map((milestone, index) => {
                    const isCompleted = parsedSavings >= milestone.amount;
                    const isNext = nextMilestone?.id === milestone.id;

                    return (
                        <Card key={milestone.id} className={cn(
                            "p-4 flex flex-col items-center justify-center transition-all",
                            isCompleted && "bg-chart-1/20 border-chart-1",
                            isNext && "ring-2 ring-primary"
                        )}>
                            <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2",
                                isCompleted ? "bg-chart-1 border-chart-1 text-white" : "border-border"
                            )}>
                                {isCompleted ? <Check className="w-6 h-6" /> : <Icons.Landmark className="w-5 h-5 text-muted-foreground" />}
                            </div>
                            <p className="font-semibold">{milestone.name}</p>
                            <p className="text-sm text-muted-foreground">{formatCurrency(milestone.amount)}</p>
                        </Card>
                    )
                })}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
