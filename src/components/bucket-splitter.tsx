"use client";

import * as React from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Icons } from "@/components/icons";

const bucketInfo = {
  growth: "Your engine for freedom. This fuels investments, high-interest debt payments, and other wealth-building activities.",
  stability: "Your financial firewall. This builds your emergency fund and covers essential insurance.",
  rewards: "Your guilt-free spending. Enjoy this money without worry. If you don't spend it, it rolls over.",
};

export default function BucketSplitter() {
  const [income, setIncome] = React.useState("");
  const [essentials, setEssentials] = React.useState("");
  
  // Default allocation based on the "Crawl Stage" philosophy
  const [allocation, setAllocation] = React.useState({
    growth: 52,
    stability: 31,
    rewards: 17,
  });

  const {
    parsedIncome,
    parsedEssentials,
    surplusAmount,
    essentialsPercentage,
    surplusPercentage,
    isValid,
    isOverspent,
    totalAllocationPercentage,
    finalBlueprint
  } = React.useMemo(() => {
    const pIncome = parseFloat(income);
    const pEssentials = parseFloat(essentials);

    const isValid = pIncome > 0 && pEssentials > 0 && pIncome >= pEssentials;
    const isOverspent = pIncome > 0 && pEssentials > pIncome;

    if (!isValid && !isOverspent) {
      return { 
        parsedIncome: pIncome || 0,
        parsedEssentials: pEssentials || 0,
        surplusAmount: 0, 
        essentialsPercentage: 0, 
        surplusPercentage: 0, 
        isValid: false,
        isOverspent,
        totalAllocationPercentage: 0,
        finalBlueprint: null
      };
    }
    
    const pIncomeGuaranteed = pIncome || 0;
    const pEssentialsGuaranteed = pEssentials || 0;

    const surplus = pIncomeGuaranteed - pEssentialsGuaranteed;
    const essPct = pIncomeGuaranteed > 0 ? (pEssentialsGuaranteed / pIncomeGuaranteed) * 100 : 0;
    const surPct = 100 - essPct;

    const totalAlloc = allocation.growth + allocation.stability + allocation.rewards;
    
    const blueprint = totalAlloc === 100 && isValid ? {
        essentials: {
            amount: pEssentialsGuaranteed,
            percentage: essPct
        },
        growth: {
            amount: surplus * (allocation.growth / 100),
            percentage: surPct * (allocation.growth / 100)
        },
        stability: {
            amount: surplus * (allocation.stability / 100),
            percentage: surPct * (allocation.stability / 100)
        },
        rewards: {
            amount: surplus * (allocation.rewards / 100),
            percentage: surPct * (allocation.rewards / 100)
        }
    } : null;

    return {
      parsedIncome: pIncomeGuaranteed,
      parsedEssentials: pEssentialsGuaranteed,
      surplusAmount: surplus,
      essentialsPercentage: essPct,
      surplusPercentage: surPct,
      isValid,
      isOverspent,
      totalAllocationPercentage: totalAlloc,
      finalBlueprint: blueprint
    };
  }, [income, essentials, allocation]);

  const handleAllocationChange = (bucket: 'growth' | 'stability' | 'rewards', value: string) => {
    const numValue = parseInt(value, 10);
    setAllocation(prev => ({
      ...prev,
      [bucket]: isNaN(numValue) ? 0 : numValue,
    }));
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  const realityCheckMessage = () => {
    if(isOverspent) {
        return "Your essentials cost more than your income. Let's adjust the numbers to find a starting point.";
    }
    if (essentialsPercentage > 75) {
        return "This is a tight spot, but we'll navigate it together. Every dollar of surplus is a win.";
    }
    if (essentialsPercentage > 50) {
        return "This is your starting point. The goal is to strategically manage your surplus, together.";
    }
    return "You're in a great position. Let's put your surplus to work for your future.";
  }
  
  const realityCheckColor = isOverspent || essentialsPercentage > 75 ? "border-destructive bg-destructive/10 text-destructive-foreground" : "border-chart-1 bg-chart-1/10 text-primary";


  return (
    <Card className="w-full max-w-4xl shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight text-center">Nexus Bucket Splitter</CardTitle>
        <CardDescription className="text-center">
          A simple, lovable, and complete tool to plan your financial surplus, together.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Step 1: Inputs */}
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold tracking-tight text-center">Observe: Your Financial Snapshot</h2>
          <p className="mb-6 text-center text-muted-foreground">Let's start by looking at our combined finances for the month.</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="income" className="text-base">Our Combined Monthly Net Income</Label>
              <Input
                id="income"
                type="number"
                placeholder="e.g., 9500"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="text-base"
                aria-label="Our Combined Monthly Net Income"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="essentials" className="text-base">Our Total Monthly Essentials</Label>
              <Input
                id="essentials"
                type="number"
                placeholder="e.g., 6732"
                value={essentials}
                onChange={(e) => setEssentials(e.target.value)}
                className="text-base"
                aria-label="Our Total Monthly Essentials"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8 transition-opacity duration-500 animate-in fade-in">
          { (isValid || isOverspent) && (
             <Card className={cn("p-4 text-center", realityCheckColor)}>
                <p className="font-medium">{realityCheckMessage()}</p>
             </Card>
          )}

          {/* Step 2: Reality Check */}
          {isValid && (
            <div className="space-y-4 text-center animate-in fade-in-50 duration-500">
              <h2 className="text-xl font-semibold tracking-tight">Your Reality Check</h2>
              <div className="space-y-2">
                <Progress value={essentialsPercentage} className="h-6" />
                <div className="flex justify-between text-sm font-medium">
                  <span>Essentials: {essentialsPercentage.toFixed(1)}%</span>
                  <span>Available Surplus: {surplusPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Strategic Allocation */}
          {isValid && (
            <div className="space-y-4 animate-in fade-in-50 duration-700">
              <h2 className="text-xl font-semibold tracking-tight text-center">Adapt: Allocate Our Surplus ({formatCurrency(surplusAmount)})</h2>
              <p className="text-center text-muted-foreground">Let's decide how we want to use our surplus. These numbers can be changed anytime.</p>
              <TooltipProvider>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {(['growth', 'stability', 'rewards'] as const).map((bucket) => (
                    <Card key={bucket}>
                      <CardHeader className="flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-2">
                          {bucket === 'growth' && <Icons.Growth className="w-6 h-6 text-chart-1" />}
                          {bucket === 'stability' && <Icons.Stability className="w-6 h-6 text-primary" />}
                          {bucket === 'rewards' && <Icons.Rewards className="w-6 h-6 text-accent" />}
                          <CardTitle className="text-lg capitalize">{bucket}</CardTitle>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-6 h-6">
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p className="max-w-xs">{bucketInfo[bucket]}</p></TooltipContent>
                        </Tooltip>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Label htmlFor={`${bucket}-alloc`}>Surplus Allocation (%)</Label>
                        <Input
                          id={`${bucket}-alloc`}
                          type="number"
                          value={allocation[bucket]}
                          onChange={(e) => handleAllocationChange(bucket, e.target.value)}
                          className={cn("text-lg font-bold", totalAllocationPercentage !== 100 && "border-destructive focus-visible:ring-destructive")}
                        />
                        <p className="text-2xl font-bold text-primary">{formatCurrency(surplusAmount * (allocation[bucket] / 100))}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TooltipProvider>
              {totalAllocationPercentage !== 100 && (
                <p className="text-sm font-medium text-center text-destructive">
                  Our allocations must add up to 100%. Current total: {totalAllocationPercentage}%.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Final Blueprint */}
          {isValid && finalBlueprint && (
             <div className="space-y-4 animate-in fade-in-50 duration-1000">
                <h2 className="text-xl font-semibold tracking-tight text-center">Reinforce: Our Financial Blueprint</h2>
                <Card className="bg-secondary/30">
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 gap-4 text-lg md:grid-cols-2 lg:grid-cols-4">
                            {(['essentials', 'growth', 'stability', 'rewards'] as const).map(key => (
                                <div key={key} className="p-4 text-center rounded-lg bg-card shadow">
                                    <p className="text-sm font-medium capitalize text-muted-foreground">{key}</p>
                                    <p className="text-2xl font-bold text-primary">{formatCurrency(finalBlueprint[key].amount)}</p>
                                    <p className="font-semibold">{finalBlueprint[key].percentage.toFixed(1)}% of income</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 text-center rounded-lg bg-accent/20">
                            <p className="font-semibold text-accent-foreground">Celebrate: Our guilt-free weekly spending for the two of us:</p>
                            <p className="text-3xl font-bold text-accent-foreground">{formatCurrency(finalBlueprint.rewards.amount / 4.33)}</p>
                        </div>
                    </CardContent>
                </Card>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
