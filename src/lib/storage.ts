/**
 * Nexus Storage System
 * Persistent storage utility for Nexus financial planning data
 * Supports localStorage with future extensibility for cloud sync
 */

import { Stage } from '@/components/stage-progression';

// Core data types
export interface UserProfile {
  name: string;
  alignment: number;
  coachingStyle: string;
  answers: Record<string, any>;
  completedAt: string;
}

export interface BudgetBlueprint {
  id: string;
  name: string;
  monthlyIncome: number;
  monthlyEssentials: number;
  allocation: {
    growth: number;
    stability: number;
    rewards: number;
  };
  calculatedAmounts: {
    essentials: { amount: number; percentage: number };
    growth: { amount: number; percentage: number };
    stability: { amount: number; percentage: number };
    rewards: { amount: number; percentage: number };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialData {
  weeklyBudget: number;
  currentSpending: number;
  spendingHistory: SpendingEntry[];
  budgetBlueprints: BudgetBlueprint[];
  activeBudgetId: string | null;
  lastUpdated: string;
}

export interface SpendingEntry {
  id: string;
  amount: number;
  description?: string;
  category?: string;
  timestamp: string;
}

export interface ProgressData {
  currentStage: Stage;
  userXP: number;
  userBadges: string[];
  recentAchievements: string[];
  milestones: {
    hasCompletedCompass: boolean;
    hasBasicBudget: boolean;
    hasTrackedSpending: boolean;
    hasEmergencyFund: boolean;
    hasSharedGoals: boolean;
  };
  lastUpdated: string;
}

export interface DebtEntry {
  id: string;
  name: string;
  amount: number;
  minPayment: number;
  remainingBalance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyFundData {
  currentAmount: number;
  targetAmount: number;
  milestones: Array<{
    id: string;
    name: string;
    amount: number;
    completed: boolean;
    completedAt?: string;
  }>;
  lastUpdated: string;
}

export interface NexusData {
  userProfile: UserProfile | null;
  financial: FinancialData;
  progress: ProgressData;
  debts: DebtEntry[];
  emergencyFund: EmergencyFundData;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    autoSave: boolean;
  };
  meta: {
    version: string;
    createdAt: string;
    lastSync: string;
  };
}

// Storage keys
const STORAGE_KEYS = {
  NEXUS_DATA: 'nexus_data',
  BACKUP_PREFIX: 'nexus_backup_',
} as const;

// Default data structure
const getDefaultData = (): NexusData => ({
  userProfile: null,
  financial: {
    weeklyBudget: 0,
    currentSpending: 0,
    spendingHistory: [],
    budgetBlueprints: [],
    activeBudgetId: null,
    lastUpdated: new Date().toISOString(),
  },
  progress: {
    currentStage: 'crawl',
    userXP: 25,
    userBadges: [],
    recentAchievements: [],
    milestones: {
      hasCompletedCompass: false,
      hasBasicBudget: false,
      hasTrackedSpending: false,
      hasEmergencyFund: false,
      hasSharedGoals: false,
    },
    lastUpdated: new Date().toISOString(),
  },
  debts: [],
  emergencyFund: {
    currentAmount: 0,
    targetAmount: 1000,
    milestones: [
      { id: 'starter', name: 'Starter Fund', amount: 500, completed: false },
      { id: 'basic', name: 'Basic Shield', amount: 1000, completed: false },
      { id: 'three-month', name: 'Three-Month Cushion', amount: 5000, completed: false },
      { id: 'fully-funded', name: 'Fully Funded EF', amount: 10000, completed: false },
    ],
    lastUpdated: new Date().toISOString(),
  },
  preferences: {
    theme: 'dark',
    notifications: true,
    autoSave: true,
  },
  meta: {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    lastSync: new Date().toISOString(),
  },
});

// Storage utilities
class NexusStorage {
  private static instance: NexusStorage;
  private data: NexusData;
  private isClient: boolean;

  private constructor() {
    this.isClient = typeof window !== 'undefined';
    this.data = this.loadData();
  }

  static getInstance(): NexusStorage {
    if (!NexusStorage.instance) {
      NexusStorage.instance = new NexusStorage();
    }
    return NexusStorage.instance;
  }

  private loadData(): NexusData {
    if (!this.isClient) {
      return getDefaultData();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NEXUS_DATA);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle version updates
        return this.mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.warn('Failed to load Nexus data from storage:', error);
    }

    return getDefaultData();
  }

  private mergeWithDefaults(stored: any): NexusData {
    const defaults = getDefaultData();
    return {
      userProfile: stored.userProfile || defaults.userProfile,
      financial: { ...defaults.financial, ...stored.financial },
      progress: { 
        ...defaults.progress, 
        ...stored.progress,
        milestones: { ...defaults.progress.milestones, ...stored.progress?.milestones }
      },
      debts: stored.debts || defaults.debts,
      emergencyFund: { ...defaults.emergencyFund, ...stored.emergencyFund },
      preferences: { ...defaults.preferences, ...stored.preferences },
      meta: { ...defaults.meta, ...stored.meta, lastSync: new Date().toISOString() },
    };
  }

  private saveData(): void {
    if (!this.isClient) return;

    try {
      this.data.meta.lastSync = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.NEXUS_DATA, JSON.stringify(this.data));
      
      // Create backup periodically
      if (Math.random() < 0.1) { // 10% chance
        this.createBackup();
      }
    } catch (error) {
      console.error('Failed to save Nexus data to storage:', error);
    }
  }

  private createBackup(): void {
    if (!this.isClient) return;

    try {
      const backupKey = `${STORAGE_KEYS.BACKUP_PREFIX}${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(this.data));
      
      // Clean old backups (keep last 5)
      this.cleanOldBackups();
    } catch (error) {
      console.warn('Failed to create backup:', error);
    }
  }

  private cleanOldBackups(): void {
    if (!this.isClient) return;

    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_KEYS.BACKUP_PREFIX))
        .sort()
        .reverse();

      // Remove old backups, keep last 5
      backupKeys.slice(5).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clean old backups:', error);
    }
  }

  // Public API methods
  getData(): NexusData {
    return this.data;
  }

  updateUserProfile(profile: UserProfile): void {
    this.data.userProfile = profile;
    this.data.progress.milestones.hasCompletedCompass = true;
    this.saveData();
  }

  updateFinancialData(updates: Partial<FinancialData>): void {
    this.data.financial = {
      ...this.data.financial,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    this.saveData();
  }

  addSpendingEntry(entry: Omit<SpendingEntry, 'id' | 'timestamp'>): void {
    const newEntry: SpendingEntry = {
      ...entry,
      id: `spending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    this.data.financial.spendingHistory.push(newEntry);
    this.data.financial.lastUpdated = new Date().toISOString();
    this.saveData();
  }

  updateProgress(updates: Partial<ProgressData>): void {
    this.data.progress = {
      ...this.data.progress,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    this.saveData();
  }

  updateMilestone(milestone: keyof ProgressData['milestones'], completed: boolean): void {
    this.data.progress.milestones[milestone] = completed;
    this.data.progress.lastUpdated = new Date().toISOString();
    this.saveData();
  }

  addDebt(debt: Omit<DebtEntry, 'id' | 'createdAt' | 'updatedAt'>): DebtEntry {
    const newDebt: DebtEntry = {
      ...debt,
      id: `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      remainingBalance: debt.amount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.data.debts.push(newDebt);
    this.saveData();
    return newDebt;
  }

  updateDebt(id: string, updates: Partial<DebtEntry>): void {
    const index = this.data.debts.findIndex(debt => debt.id === id);
    if (index !== -1) {
      this.data.debts[index] = {
        ...this.data.debts[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveData();
    }
  }

  removeDebt(id: string): void {
    this.data.debts = this.data.debts.filter(debt => debt.id !== id);
    this.saveData();
  }

  updateEmergencyFund(updates: Partial<EmergencyFundData>): void {
    this.data.emergencyFund = {
      ...this.data.emergencyFund,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    this.saveData();
  }

  saveBudgetBlueprint(blueprint: Omit<BudgetBlueprint, 'id' | 'createdAt' | 'updatedAt'>): BudgetBlueprint {
    const newBlueprint: BudgetBlueprint = {
      ...blueprint,
      id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deactivate other blueprints if this one is active
    if (newBlueprint.isActive) {
      this.data.financial.budgetBlueprints = this.data.financial.budgetBlueprints.map(bp => ({
        ...bp,
        isActive: false
      }));
      this.data.financial.activeBudgetId = newBlueprint.id;
    }

    this.data.financial.budgetBlueprints.push(newBlueprint);
    this.data.financial.lastUpdated = new Date().toISOString();
    this.saveData();
    return newBlueprint;
  }

  updateBudgetBlueprint(id: string, updates: Partial<BudgetBlueprint>): void {
    const index = this.data.financial.budgetBlueprints.findIndex(bp => bp.id === id);
    if (index !== -1) {
      // If making this blueprint active, deactivate others
      if (updates.isActive) {
        this.data.financial.budgetBlueprints = this.data.financial.budgetBlueprints.map(bp => ({
          ...bp,
          isActive: false
        }));
        this.data.financial.activeBudgetId = id;
      }

      this.data.financial.budgetBlueprints[index] = {
        ...this.data.financial.budgetBlueprints[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.data.financial.lastUpdated = new Date().toISOString();
      this.saveData();
    }
  }

  deleteBudgetBlueprint(id: string): void {
    const blueprint = this.data.financial.budgetBlueprints.find(bp => bp.id === id);
    this.data.financial.budgetBlueprints = this.data.financial.budgetBlueprints.filter(bp => bp.id !== id);
    
    // If we deleted the active blueprint, clear the active ID
    if (this.data.financial.activeBudgetId === id) {
      this.data.financial.activeBudgetId = null;
      this.data.financial.weeklyBudget = 0;
    }

    this.data.financial.lastUpdated = new Date().toISOString();
    this.saveData();
  }

  getActiveBudget(): BudgetBlueprint | null {
    if (!this.data.financial.activeBudgetId) return null;
    return this.data.financial.budgetBlueprints.find(bp => bp.id === this.data.financial.activeBudgetId) || null;
  }

  updatePreferences(updates: Partial<NexusData['preferences']>): void {
    this.data.preferences = {
      ...this.data.preferences,
      ...updates,
    };
    this.saveData();
  }

  // Utility methods
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      this.data = this.mergeWithDefaults(imported);
      this.saveData();
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  clearData(): void {
    this.data = getDefaultData();
    this.saveData();
  }

  getBackups(): string[] {
    if (!this.isClient) return [];
    
    return Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_KEYS.BACKUP_PREFIX))
      .sort()
      .reverse();
  }

  restoreBackup(backupKey: string): boolean {
    if (!this.isClient) return false;
    
    try {
      const backup = localStorage.getItem(backupKey);
      if (backup) {
        const parsed = JSON.parse(backup);
        this.data = this.mergeWithDefaults(parsed);
        this.saveData();
        return true;
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
    }
    
    return false;
  }
}

// Hook for React components
export const useNexusStorage = () => {
  const storage = NexusStorage.getInstance();
  const [data, setData] = React.useState<NexusData>(storage.getData());

  // Subscribe to storage changes
  React.useEffect(() => {
    const updateData = () => setData(storage.getData());
    
    // Listen to storage events for cross-tab synchronization
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', updateData);
      return () => window.removeEventListener('storage', updateData);
    }
  }, [storage]);

  return {
    data,
    updateUserProfile: (profile: UserProfile) => {
      storage.updateUserProfile(profile);
      setData(storage.getData());
    },
    updateFinancialData: (updates: Partial<FinancialData>) => {
      storage.updateFinancialData(updates);
      setData(storage.getData());
    },
    addSpendingEntry: (entry: Omit<SpendingEntry, 'id' | 'timestamp'>) => {
      storage.addSpendingEntry(entry);
      setData(storage.getData());
    },
    updateProgress: (updates: Partial<ProgressData>) => {
      storage.updateProgress(updates);
      setData(storage.getData());
    },
    updateMilestone: (milestone: keyof ProgressData['milestones'], completed: boolean) => {
      storage.updateMilestone(milestone, completed);
      setData(storage.getData());
    },
    addDebt: (debt: Omit<DebtEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newDebt = storage.addDebt(debt);
      setData(storage.getData());
      return newDebt;
    },
    updateDebt: (id: string, updates: Partial<DebtEntry>) => {
      storage.updateDebt(id, updates);
      setData(storage.getData());
    },
    removeDebt: (id: string) => {
      storage.removeDebt(id);
      setData(storage.getData());
    },
    updateEmergencyFund: (updates: Partial<EmergencyFundData>) => {
      storage.updateEmergencyFund(updates);
      setData(storage.getData());
    },
    updatePreferences: (updates: Partial<NexusData['preferences']>) => {
      storage.updatePreferences(updates);
      setData(storage.getData());
    },
    exportData: () => storage.exportData(),
    importData: (jsonData: string) => {
      const result = storage.importData(jsonData);
      if (result) setData(storage.getData());
      return result;
    },
    clearData: () => {
      storage.clearData();
      setData(storage.getData());
    },
    getBackups: () => storage.getBackups(),
    restoreBackup: (backupKey: string) => {
      const result = storage.restoreBackup(backupKey);
      if (result) setData(storage.getData());
      return result;
    },
    saveBudgetBlueprint: (blueprint: Omit<BudgetBlueprint, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newBlueprint = storage.saveBudgetBlueprint(blueprint);
      setData(storage.getData());
      return newBlueprint;
    },
    updateBudgetBlueprint: (id: string, updates: Partial<BudgetBlueprint>) => {
      storage.updateBudgetBlueprint(id, updates);
      setData(storage.getData());
    },
    deleteBudgetBlueprint: (id: string) => {
      storage.deleteBudgetBlueprint(id);
      setData(storage.getData());
    },
    getActiveBudget: () => storage.getActiveBudget(),
  };
};

// Named export for direct access
export default NexusStorage;

// React import for the hook
import * as React from 'react';
