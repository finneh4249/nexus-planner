"use client";

import * as React from "react";
import { Plus, Trash } from "lucide-react";
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
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Debt = {
  id: string;
  name: string;
  amount: number;
  minPayment: number;
};

type TimelineEntry = {
    debtId: string;
    debtName: string;
    payoffDate: string;
    startingBalance: number;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
};

export default function DebtAvalanche() {
  const [debts, setDebts] = React.useState<Debt[]>([]);
  const [newDebt, setNewDebt] = React.useState({ name: "", amount: "", minPayment: "" });
  const [growthAllocation, setGrowthAllocation] = React.useState("");
  const [bonusPayment, setBonusPayment] = React.useState("");

  const addDebt = () => {
    if (newDebt.name && newDebt.amount && newDebt.minPayment) {
      const debt: Debt = {
        id: new Date().toISOString(),
        name: newDebt.name,
        amount: parseFloat(newDebt.amount),
        minPayment: parseFloat(newDebt.minPayment),
      };
      setDebts([...debts, debt]);
      setNewDebt({ name: "", amount: "", minPayment: "" });
    }
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter((debt) => debt.id !== id));
  };
  
  const handleNewDebtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDebt(prev => ({ ...prev, [name]: value }));
  };

  const { sortedDebts, totalMinPayments, monthlyFirepower, isValid, timeline, finalPayoffDate, currentMissionPayment } = React.useMemo(() => {
    const parsedFirepower = parseFloat(growthAllocation) || 0;
    const parsedBonus = parseFloat(bonusPayment) || 0;
    const totalMin = debts.reduce((acc, debt) => acc + debt.minPayment, 0);

    const isValid = debts.length > 0 && parsedFirepower >= totalMin;

    if (!isValid) {
      return { sortedDebts: [], totalMinPayments: totalMin, monthlyFirepower: parsedFirepower, isValid, timeline: [], finalPayoffDate: null, currentMissionPayment: 0 };
    }

    const sDebts = [...debts].sort((a, b) => a.amount - b.amount);
    
    // Create a mutable copy of debts for simulation
    let simDebts = sDebts.map(d => ({ ...d, balance: d.amount }));
    
    // Apply one-time bonus payment to the first debt
    if (simDebts.length > 0) {
      simDebts[0].balance -= parsedBonus;
    }

    const timelineResult: TimelineEntry[] = [];
    let freedCashflow = 0;
    let months = 0;
    let currentDate = new Date();
    
    const extraPayment = parsedFirepower - totalMin;
    let missionPayment = 0;

    while(simDebts.some(d => d.balance > 0)) {
        months++;
        if (months > 1200) break; // Safety break

        let monthPayment = parsedFirepower + freedCashflow;

        for (const debt of simDebts) {
            if(debt.balance <= 0) continue;

            // This is the target debt
            const targetDebt = simDebts.find(d => d.balance > 0);
            if (!targetDebt || debt.id !== targetDebt.id) {
                const payment = Math.min(debt.minPayment, debt.balance);
                debt.balance -= payment;
                monthPayment -= payment;
            }
        }
        
        // Apply remaining firepower to the target debt
        const targetDebt = simDebts.find(d => d.balance > 0);
        if (targetDebt) {
             const payment = Math.min(monthPayment, targetDebt.balance);
             if (months === 1) { // Calculate mission payment only on the first month
                missionPayment = payment;
             }
             targetDebt.balance -= payment;
        }

        // Check for paid off debts
        for (const debt of simDebts) {
            if (debt.balance <= 0 && !timelineResult.find(t => t.debtId === debt.id)) {
                const payoffDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + months -1, 1);
                timelineResult.push({
                    debtId: debt.id,
                    debtName: debt.name,
                    payoffDate: payoffDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
                    startingBalance: debt.amount
                });
                freedCashflow += debt.minPayment;
            }
        }
    }

    const finalDate = timelineResult.length > 0 ? timelineResult[timelineResult.length - 1].payoffDate : null;

    const timelineWithOriginalDebts = timelineResult.map(t => {
        const originalDebt = debts.find(d => d.id === t.debtId)!;
        return { debt: originalDebt, payoffDate: t.payoffDate };
    });

    return {
      sortedDebts: sDebts,
      totalMinPayments: totalMin,
      monthlyFirepower: parsedFirepower,
      isValid,
      timeline: timelineWithOriginalDebts,
      finalPayoffDate: finalDate,
      currentMissionPayment: missionPayment
    };
  }, [debts, growthAllocation, bonusPayment]);

  const currentMission = isValid ? timeline[0] : null;

  return (
    <Card className="w-full max-w-4xl shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight text-center">Debt Snowball</CardTitle>
        <CardDescription className="text-center">
          Your path to being debt-free. One step at a time. Together.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Step 1 & 2: Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Debt Input */}
            <div className="p-6 border rounded-lg bg-card space-y-4">
                <h2 className="text-xl font-semibold tracking-tight text-center">Our Debts</h2>
                 <div className="space-y-2">
                    <Label htmlFor="debt-name">Debt Name</Label>
                    <Input id="debt-name" name="name" placeholder="e.g., 'Zip'" value={newDebt.name} onChange={handleNewDebtChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="debt-amount">Total Amount</Label>
                        <Input id="debt-amount" name="amount" type="number" placeholder="1741.81" value={newDebt.amount} onChange={handleNewDebtChange}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="min-payment">Min. Payment</Label>
                        <Input id="min-payment" name="minPayment" type="number" placeholder="86.60" value={newDebt.minPayment} onChange={handleNewDebtChange}/>
                    </div>
                </div>
                <Button onClick={addDebt} className="w-full">
                    <Plus className="mr-2" /> Add Debt
                </Button>
                 <AnimatePresence>
                    {debts.map((debt, index) => (
                    <motion.div
                        key={debt.id}
                        layout
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center justify-between p-2 rounded-md bg-secondary/20"
                    >
                        <div>
                            <p className="font-semibold">{debt.name}</p>
                            <p className="text-sm text-muted-foreground">{formatCurrency(debt.amount)} | {formatCurrency(debt.minPayment)}/mo</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeDebt(debt.id)}>
                            <Trash className="w-4 h-4 text-destructive" />
                        </Button>
                    </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            
            {/* Firepower Input */}
            <div className="p-6 border rounded-lg bg-card space-y-6">
                <h2 className="text-xl font-semibold tracking-tight text-center">Our Firepower</h2>
                 <div className="space-y-2">
                    <Label htmlFor="growth-alloc" className="text-base">Monthly Growth Allocation</Label>
                    <Input id="growth-alloc" type="number" placeholder="From Bucket Splitter" value={growthAllocation} onChange={e => setGrowthAllocation(e.target.value)} className="text-lg"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bonus-payment" className="text-base">One-Time Bonus Payment</Label>
                    <Input id="bonus-payment" type="number" placeholder="e.g. 500" value={bonusPayment} onChange={e => setBonusPayment(e.target.value)} className="text-lg" />
                    <p className="text-xs text-muted-foreground">Add any extra amount to see how it accelerates your timeline!</p>
                </div>
            </div>
        </div>
        
        {/* Step 3 & 4: Visualization & Mission */}
        {isValid ? (
          <div className="space-y-8 animate-in fade-in-50 duration-700">
             {/* Current Mission */}
            {currentMission && (
                <Card className="bg-primary/10 border-primary shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2 text-xl text-primary-foreground tracking-tight">
                           <Icons.Mission className="text-accent" /> YOUR CURRENT MISSION: DESTROY '{currentMission.debt.name}'
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground">Total Monthly Payment</p>
                        <p className="text-4xl font-bold text-primary-foreground">{formatCurrency(currentMissionPayment)}</p>
                        <p className="font-semibold text-accent mt-2">Projected Payoff: {currentMission.payoffDate}</p>
                    </CardContent>
                </Card>
            )}

            {/* Visualization Timeline */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight text-center">Our Freedom Timeline</h2>
              <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-[30px] top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
                
                <AnimatePresence>
                {timeline.map(({ debt, payoffDate }, index) => (
                  <motion.div 
                    key={debt.id} 
                    className="flex items-start gap-6 mb-6 relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                     {/* Dot */}
                    <div className={cn("absolute left-[30px] top-1.5 h-4 w-4 rounded-full -translate-x-1/2 z-10", index === 0 ? "bg-accent ring-4 ring-accent/30" : "bg-primary")}></div>
                    <div className="pt-0.5">
                      <p className={cn("font-bold text-lg", index === 0 ? "text-accent" : "text-primary")}>{debt.name}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(debt.amount)}</p>
                    </div>
                    <div className="pt-0.5">
                        <p className="font-semibold">{payoffDate}</p>
                        <p className="text-sm text-muted-foreground">Payoff Date</p>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
              {finalPayoffDate && (
                 <Card className="text-center p-4 bg-chart-1/20 border-chart-1">
                    <p className="text-lg font-semibold text-chart-1">Consumer Debt Freedom Date</p>
                    <p className="text-2xl font-bold text-primary">{finalPayoffDate}</p>
                </Card>
              )}
            </div>
          </div>
        ) : (
            debts.length > 0 && growthAllocation && (
                <div className="text-center p-4 rounded-lg bg-destructive/10 text-destructive-foreground border border-destructive">
                    <p className="font-semibold">Your Growth Allocation isn't enough to cover the minimum payments. Let's adjust the numbers.</p>
                </div>
            )
        )}
      </CardContent>
    </Card>
  );
}
