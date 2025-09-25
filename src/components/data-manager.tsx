"use client";

import * as React from "react";
import { Download, Upload, Trash2, Database, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNexusStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function DataManager() {
  const storage = useNexusStorage();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = storage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexus-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Exported",
        description: "Your Nexus data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = storage.importData(content);
        
        if (success) {
          toast({
            title: "Data Imported",
            description: "Your Nexus data has been restored successfully.",
          });
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "There was an error importing your data. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    storage.clearData();
    toast({
      title: "Data Cleared",
      description: "All your Nexus data has been reset to defaults.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStorageSize = () => {
    const data = storage.exportData();
    return `${(data.length / 1024).toFixed(1)} KB`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2 font-heading">
          <Database className="w-6 h-6" />
          DATA MANAGEMENT
        </CardTitle>
        <CardDescription>
          Manage your Nexus financial data - export, import, or reset your information.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="backup">💾 Backup</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Compass Complete</span>
                    <Badge variant={storage.data.progress.milestones.hasCompletedCompass ? "default" : "secondary"}>
                      {storage.data.progress.milestones.hasCompletedCompass ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {storage.data.userProfile && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">{storage.data.userProfile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {storage.data.userProfile.coachingStyle} • {Math.round(storage.data.userProfile.alignment * 100)}% aligned
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Financial Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Weekly Budget</span>
                      <span className="text-sm font-mono">{formatCurrency(storage.data.financial.weeklyBudget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Spending</span>
                      <span className="text-sm font-mono">{formatCurrency(storage.data.financial.currentSpending)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Emergency Fund</span>
                      <span className="text-sm font-mono">{formatCurrency(storage.data.emergencyFund.currentAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">XP Level</span>
                      <span className="text-sm font-mono">{storage.data.progress.userXP} XP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Stage</span>
                      <Badge variant="outline" className="text-xs">
                        {storage.data.progress.currentStage.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Badges</span>
                      <span className="text-sm font-mono">{storage.data.progress.userBadges.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Budgets</span>
                      <span className="text-sm font-mono">{storage.data.financial.budgetBlueprints.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Debts</span>
                      <span className="text-sm font-mono">{storage.data.debts.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Budget History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {storage.data.financial.budgetBlueprints.slice(-4).reverse().map((budget, index) => (
                    <div key={budget.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{budget.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(budget.monthlyIncome)} income • {new Date(budget.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {budget.isActive && (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      )}
                    </div>
                  ))}
                  {storage.data.financial.budgetBlueprints.length === 0 && (
                    <p className="text-sm text-muted-foreground">No budgets created yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="backup" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Export Data</CardTitle>
                  <CardDescription>
                    Download your Nexus data as a JSON file for backup or transfer.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Data Size:</span>
                    <span className="font-mono">{getStorageSize()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-mono text-xs">{formatDate(storage.data.meta.lastSync)}</span>
                  </div>
                  <Button onClick={handleExport} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Import Data</CardTitle>
                  <CardDescription>
                    Restore your Nexus data from a previously exported JSON file.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    This will replace all current data with the imported data.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Automatic Backups</CardTitle>
                <CardDescription>
                  Nexus automatically creates local backups of your data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {storage.getBackups().slice(0, 5).map((backupKey, index) => (
                    <div key={backupKey} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Backup #{storage.getBackups().length - index}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(new Date(parseInt(backupKey.split('_')[2])).toISOString())}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (storage.restoreBackup(backupKey)) {
                            toast({
                              title: "Backup Restored",
                              description: "Your data has been restored from the backup.",
                            });
                          }
                        }}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Restore
                      </Button>
                    </div>
                  ))}
                  {storage.getBackups().length === 0 && (
                    <p className="text-sm text-muted-foreground">No automatic backups available yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  These actions cannot be undone. Please be careful.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your profile, 
                        financial data, progress, and all stored information.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, clear all data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Storage Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Storage Type:</span>
                    <span className="text-sm">Local Storage</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Data Version:</span>
                    <span className="text-sm font-mono">{storage.data.meta.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="text-xs font-mono">{formatDate(storage.data.meta.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Auto-save:</span>
                    <Badge variant={storage.data.preferences.autoSave ? "default" : "secondary"}>
                      {storage.data.preferences.autoSave ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
