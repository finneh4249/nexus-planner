"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DebtSnowball from "@/components/debt-avalanche";
import StabilityRoadmap from "@/components/stability-roadmap";
import { Icons } from "@/components/icons";

export default function ActionHub() {
  return (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="debt" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="debt">
            <Icons.Flame className="mr-2" />
            Debt Offense
          </TabsTrigger>
          <TabsTrigger value="stability">
            <Icons.Landmark className="mr-2" />
            Stability Defense
          </TabsTrigger>
        </TabsList>
        <TabsContent value="debt">
          <DebtSnowball />
        </TabsContent>
        <TabsContent value="stability">
          <StabilityRoadmap />
        </TabsContent>
      </Tabs>
    </div>
  );
}
