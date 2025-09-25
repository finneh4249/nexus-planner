"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DebtSnowball from "@/components/debt-snowball";
import StabilityRoadmap from "@/components/stability-roadmap";
import DataManager from "@/components/data-manager";
import { Icons } from "@/components/icons";
import { useNexusStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";

export default function ActionHub() {
  const storage = useNexusStorage();
  const [activeTab, setActiveTab] = React.useState('debt');

  // Get contextual information for each tab
  const tabInfo = {
    debt: {
      count: storage.data.debts.length,
      description: "Accelerate debt payoff with strategic planning",
      gradient: "from-destructive/5 to-chart-4/10",
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive"
    },
    stability: {
      count: Math.floor(storage.data.emergencyFund.currentAmount),
      description: "Build your financial safety net milestone by milestone",
      gradient: "from-primary/5 to-chart-1/10", 
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    data: {
      count: storage.data.financial.budgetBlueprints.length + storage.data.debts.length,
      description: "Manage your financial data and track your progress",
      gradient: "from-accent/5 to-chart-2/10",
      iconBg: "bg-accent/10", 
      iconColor: "text-accent"
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-primary/5 to-destructive/5 rounded-2xl blur-3xl opacity-50"></div>
        <Card className="relative border-none bg-gradient-to-br from-background/80 via-card/90 to-background/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center text-accent-foreground text-2xl shadow-lg">
                🎯
              </div>
              <div>
                <CardTitle className="heading-lg text-foreground">Action Hub</CardTitle>
                <CardDescription className="body-base">
                  Advanced tools for debt management, emergency planning, and data control
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 h-auto bg-transparent p-0">
          {Object.entries(tabInfo).map(([key, info]) => (
            <TabsTrigger
              key={key}
              value={key}
              className={cn(
                "flex-col h-auto p-0 data-[state=active]:bg-transparent transition-all duration-300 hover:scale-105 border-0",
                "data-[state=active]:shadow-none"
              )}
              asChild
            >
              <Card className={cn(
                "cursor-pointer border-2 transition-all duration-300 hover:shadow-lg",
                activeTab === key ? `bg-gradient-to-br ${info.gradient} border-primary/30 shadow-lg` : "hover:bg-muted/30"
              )}>
                <CardContent className="p-6 text-center space-y-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mx-auto", info.iconBg)}>
                    {key === 'debt' && <Icons.Flame className={cn("w-6 h-6", info.iconColor)} />}
                    {key === 'stability' && <Icons.Stability className={cn("w-6 h-6", info.iconColor)} />}
                    {key === 'data' && <Icons.Growth className={cn("w-6 h-6", info.iconColor)} />}
                  </div>
                  <div>
                    <h3 className="heading-xs text-foreground mb-1">
                      {key === 'debt' && 'Debt Offense'}
                      {key === 'stability' && 'Stability Defense'}  
                      {key === 'data' && 'Data Manager'}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {info.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {key === 'stability' ? `$${info.count.toLocaleString()}` : `${info.count} items`}
                  </Badge>
                </CardContent>
              </Card>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="relative">
          <div className={cn(
            "absolute inset-0 rounded-2xl blur-2xl opacity-20 transition-all duration-500",
            activeTab === 'debt' && "bg-gradient-to-br from-destructive/20 to-chart-4/20",
            activeTab === 'stability' && "bg-gradient-to-br from-primary/20 to-chart-1/20",
            activeTab === 'data' && "bg-gradient-to-br from-accent/20 to-chart-2/20"
          )}></div>
          
          <div className="relative">
            <TabsContent value="debt" className="mt-0">
              <div className="animate-in fade-in-50 duration-500">
                <DebtSnowball />
              </div>
            </TabsContent>
            <TabsContent value="stability" className="mt-0">
              <div className="animate-in fade-in-50 duration-500">
                <StabilityRoadmap />
              </div>
            </TabsContent>
            <TabsContent value="data" className="mt-0">
              <div className="animate-in fade-in-50 duration-500">
                <DataManager />
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
