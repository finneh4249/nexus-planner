"use client";
import * as React from "react";
import { Info, Edit, Save, X } from "lucide-react";

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
import { useNexusStorage } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const bucketInfo = {
  growth: "Your engine for freedom. This fuels investments, high-interest debt payments, and other wealth-building activities.",
  stability: "Your financial firewall. This builds your emergency fund and covers essential insurance.",
  rewards: "Your guilt-free spending. Enjoy this money without worry. If you don't spend it, it rolls over.",
};

interface BucketSplitterProps {
  onBudgetCreated?: (weeklyBudget: number) => void;
}

export default function BucketSplitter({ onBudgetCreated }: BucketSplitterProps) {
  const storage = useNexusStorage();
  
  const [income, setIncome] = React.useState("");
  const [essentials, setEssentials] = React.useState("");
  const [budgetName, setBudgetName] = React.useState("");
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingBudgetId, setEditingBudgetId] = React.useState<string | null>(null);
  
  // Default allocation based on the "Crawl Stage" philosophy
  const [allocation, setAllocation] = React.useState({
    growth: 52,
    stability: 31,
    rewards: 17,
  });

  // Load existing budget data on mount
  React.useEffect(() => {
    const activeBudget = storage.getActiveBudget();
    if (activeBudget) {
      setIncome(activeBudget.monthlyIncome.toString());
      setEssentials(activeBudget.monthlyEssentials.toString());
      setBudgetName(activeBudget.name);
      setAllocation(activeBudget.allocation);
      setEditingBudgetId(activeBudget.id);
    }
  }, [storage]);

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

  // Handle saving budget blueprint
  const handleSaveBudget = () => {
    if (!finalBlueprint || !budgetName.trim()) return;

    const blueprintData = {
      name: budgetName.trim(),
      monthlyIncome: parsedIncome,
      monthlyEssentials: parsedEssentials,
      allocation,
      calculatedAmounts: finalBlueprint,
      isActive: true,
    };

    if (editingBudgetId) {
      // Update existing budget
      storage.updateBudgetBlueprint(editingBudgetId, blueprintData);
    } else {
      // Create new budget
      const newBlueprint = storage.saveBudgetBlueprint(blueprintData);
      setEditingBudgetId(newBlueprint.id);
    }

    // Update weekly budget
    const weeklyAmount = finalBlueprint.rewards.amount / 4.33;
    storage.updateFinancialData({ weeklyBudget: weeklyAmount });
    
    if (onBudgetCreated) {
      onBudgetCreated(weeklyAmount);
    }

    // Show celebration animation
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
    
    setIsEditing(false);
  };

  // Handle creating a new budget
  const handleNewBudget = () => {
    setIncome("");
    setEssentials("");
    setBudgetName("");
    setAllocation({ growth: 52, stability: 31, rewards: 17 });
    setEditingBudgetId(null);
    setIsEditing(true);
  };

  // Handle editing current budget
  const handleEditBudget = () => {
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    const activeBudget = storage.getActiveBudget();
    if (activeBudget) {
      setIncome(activeBudget.monthlyIncome.toString());
      setEssentials(activeBudget.monthlyEssentials.toString());
      setBudgetName(activeBudget.name);
      setAllocation(activeBudget.allocation);
    }
    setIsEditing(false);
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


  const activeBudget = storage.getActiveBudget();
  const allBudgets = storage.data.financial.budgetBlueprints;
  const hasExistingBudgets = allBudgets.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {hasExistingBudgets && !isEditing && (
        <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-chart-2/5">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="heading-md text-foreground">
                  {activeBudget ? activeBudget.name : 'Budget Library'}
                </CardTitle>
                <CardDescription className="body-base">
                  {activeBudget 
                    ? `Active budget • Created ${new Date(activeBudget.createdAt).toLocaleDateString()}`
                    : `${allBudgets.length} saved budget${allBudgets.length === 1 ? '' : 's'}`
                  }
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {activeBudget && (
                  <Button variant="outline" onClick={handleEditBudget} className="transition-smooth">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Budget
                  </Button>
                )}
                <Button onClick={handleNewBudget} className="bg-accent hover:bg-accent/90">
                  <Icons.Growth className="w-4 h-4 mr-2" />
                  New Budget
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {activeBudget && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Monthly Income</p>
                  <p className="data-lg text-foreground">{formatCurrency(activeBudget.monthlyIncome)}</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Essentials</p>
                  <p className="data-lg text-foreground">{formatCurrency(activeBudget.monthlyEssentials)}</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Weekly Spending</p>
                  <p className="data-lg text-accent">{formatCurrency(activeBudget.calculatedAmounts.rewards.amount / 4.33)}</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Monthly Surplus</p>
                  <p className="data-lg text-chart-2">{formatCurrency(activeBudget.monthlyIncome - activeBudget.monthlyEssentials)}</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-chart-2/5 to-primary/10 rounded-3xl blur-3xl opacity-50"></div>
        <Card className="relative shadow-2xl overflow-hidden border-primary/30 bg-gradient-to-br from-card/95 via-background/90 to-card/95 backdrop-blur-sm">
          {showCelebration && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-8xl animate-bounce">🎉</div>
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-chart-2/20 to-primary/20 animate-pulse rounded-2xl"></div>
            </div>
          )}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-8 right-8 w-32 h-32 bg-accent rounded-full blur-3xl"></div>
            <div className="absolute bottom-8 left-8 w-24 h-24 bg-chart-2 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
          </div>

          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-chart-2 rounded-xl flex items-center justify-center text-accent-foreground text-2xl shadow-lg">
                    🏗️
                  </div>
                  <div>
                    <CardTitle className="heading-lg text-foreground">
                      {editingBudgetId ? 'Edit Financial Blueprint' : 'Create Financial Blueprint'}
                    </CardTitle>
                    <CardDescription className="body-lg">Let's build our financial future together, one step at a time.</CardDescription>
                  </div>
                </div>
              </div>
              {isEditing && activeBudget && (
                <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="hover:bg-destructive/10 hover:text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
      <CardContent className="space-y-8">
        {/* Budget Name Input */}
        {(isEditing || !activeBudget) && (
          <div className="p-4 border-2 border-accent/20 rounded-lg bg-accent/5">
            <div className="space-y-2">
              <Label htmlFor="budget-name" className="body-base font-medium">Budget Name</Label>
              <Input
                id="budget-name"
                type="text"
                placeholder="e.g., Our Monthly Budget, Holiday Season Budget"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                className="text-base"
                aria-label="Budget Name"
              />
            </div>
          </div>
        )}

        {/* Step 1: Inputs */}
        {(isEditing || !activeBudget) && (
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-2xl font-semibold tracking-tight text-center mb-2">💡 Observe: Our Financial Snapshot</h2>
            <p className="mb-6 text-center text-muted-foreground text-lg">Let's start by looking at what we bring in and what we need to cover each month.</p>
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
        )}

        <div className="space-y-8 transition-opacity duration-500 animate-in fade-in">
          { (isValid || isOverspent) && (
             <Card className={cn("p-4 text-center", realityCheckColor)}>
                <p className="font-medium">{realityCheckMessage()}</p>
             </Card>
          )}

          {isValid && (
            <div className="space-y-4 text-center animate-in fade-in-50 duration-500">
              <h2 className="text-2xl font-semibold tracking-tight">📊 Our Reality Check</h2>
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
          {isValid && (isEditing || !activeBudget) && (
            <div className="space-y-4 animate-in fade-in-50 duration-700">
              <h2 className="text-2xl font-semibold tracking-tight text-center">🔄 Adapt: Let's Allocate Our Surplus ({formatCurrency(surplusAmount)})</h2>
              <p className="text-center text-muted-foreground text-lg">We get to decide how we want to use our surplus together. These numbers can always be adjusted as we learn what works for us.</p>
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
                        <p className="text-2xl font-bold text-accent drop-shadow-sm">{formatCurrency(surplusAmount * (allocation[bucket] / 100))}</p>
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

          {isValid && finalBlueprint && (
             <div className="space-y-4 animate-in fade-in-50 duration-1000">
                <h2 className="text-2xl font-semibold tracking-tight text-center">🎯 Reinforce: Our Complete Financial Blueprint</h2>
                <Card className="bg-secondary/30">
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 gap-4 text-lg md:grid-cols-2 lg:grid-cols-4">
                            {(['essentials', 'growth', 'stability', 'rewards'] as const).map(key => (
                                <div key={key} className="p-4 text-center rounded-lg bg-card shadow border border-secondary/30">
                                    <p className="text-sm font-medium capitalize text-muted-foreground">{key}</p>
                                    <p className="text-2xl font-bold text-accent drop-shadow-sm">{formatCurrency(finalBlueprint[key].amount)}</p>
                                    <p className="font-semibold text-chart-2">{finalBlueprint[key].percentage.toFixed(1)}% of income</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 text-center rounded-lg bg-accent/20 border-2 border-accent/50 shadow-lg">
                            <p className="font-semibold text-foreground text-lg mb-2">🎉 Celebrate: Our guilt-free weekly spending together!</p>
                            <p className="text-4xl font-bold text-accent drop-shadow-lg mb-2">{formatCurrency(finalBlueprint.rewards.amount / 4.33)}</p>
                            <p className="text-sm text-foreground/80">Every week, we get to enjoy this amount without any worry or guilt!</p>
                        </div>

                        {(isEditing || !activeBudget) && (
                          <div className="flex gap-4 pt-4">
                            <Button 
                              onClick={handleSaveBudget}
                              disabled={!budgetName.trim() || totalAllocationPercentage !== 100}
                              className="flex-1 bg-accent hover:bg-accent/90"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {editingBudgetId ? 'Update Budget' : 'Save Budget'}
                            </Button>
                            {isEditing && activeBudget && (
                              <Button variant="outline" onClick={handleCancelEdit}>
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        )}
                    </CardContent>
                </Card>
             </div>
          )}
        </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
