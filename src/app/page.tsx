"use client";

import * as React from "react";
import BucketSplitter from '@/components/bucket-splitter';
import ActionHub from '@/components/action-hub';
import SpendableHero from '@/components/spendable-hero';
import Gamification from '@/components/gamification';
import StageProgression, { Stage } from '@/components/stage-progression';
import NexusCompass from '@/components/nexus-compass';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarInset, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { showSuccessToast, showMilestoneToast } from '@/lib/toasts';
import { useNexusStorage } from '@/lib/storage';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import NotificationSystem, { useNotifications } from '@/components/notification-system';

export default function Home() {
  const storage = useNexusStorage();
  const notifications = useNotifications();
  
  // Derive state from storage
  const hasCompletedCompass = storage.data.progress.milestones.hasCompletedCompass;
  const userProfile = storage.data.userProfile;
  const weeklyBudget = storage.data.financial.weeklyBudget;
  const currentSpending = storage.data.financial.currentSpending;
  const currentStage = storage.data.progress.currentStage;
  const userXP = storage.data.progress.userXP;
  const userBadges = storage.data.progress.userBadges;
  const hasBasicBudget = storage.data.progress.milestones.hasBasicBudget;
  const hasTrackedSpending = storage.data.progress.milestones.hasTrackedSpending;
  const recentAchievements = storage.data.progress.recentAchievements;

  const handleBudgetCreated = (budget: number) => {
    storage.updateFinancialData({ weeklyBudget: budget });
    
    if (!hasBasicBudget) {
      storage.updateMilestone('hasBasicBudget', true);
      storage.updateProgress({
        userXP: userXP + 15,
        recentAchievements: [...recentAchievements, "Created first budget together!"],
        userBadges: userBadges.includes('first-budget') ? userBadges : [...userBadges, 'first-budget']
      });
      
      // Enhanced notification
      notifications.showCelebration(
        "Budget Created! 🎉",
        `Your weekly spendable amount is ${formatCurrency(budget)}. You've earned 15 XP!`,
        10000
      );
      
      // Follow-up info notification
      setTimeout(() => {
        notifications.showInfo(
          "Next Step",
          "Start tracking your spending to unlock more features and earn XP!",
          {
            label: "Track Spending",
            onClick: () => handleViewChange('dashboard')
          }
        );
      }, 8000);
    } else {
      notifications.showSuccess(
        "Budget Updated",
        `Your weekly spendable amount is now ${formatCurrency(budget)}.`
      );
    }
  };

  const handleSpendingUpdate = (newSpending: number, description?: string) => {
    storage.updateFinancialData({ currentSpending: newSpending });
    
    // Add spending entry to history
    if (description) {
      storage.addSpendingEntry({
        amount: newSpending - currentSpending,
        description,
        category: 'general'
      });
    }
    
    if (!hasTrackedSpending) {
      storage.updateMilestone('hasTrackedSpending', true);
      storage.updateProgress({
        userXP: userXP + 10,
        recentAchievements: [...recentAchievements, "Started tracking spending!"]
      });
      showSuccessToast('spendingTracked');
    } else {
      storage.updateProgress({ userXP: userXP + 5 }); // Small XP for each spending track
      // Show encouraging message occasionally
      if (Math.random() < 0.3) {
        showSuccessToast('encouragement');
      }
    }
  };

  const handleStageComplete = (stage: Stage) => {
    storage.updateProgress({
      currentStage: stage,
      userXP: userXP + 25,
      recentAchievements: [...recentAchievements, `Advanced to ${stage.charAt(0).toUpperCase() + stage.slice(1)} stage!`]
    });
  };

  const handleCompassComplete = (profile: any) => {
    const profileData = {
      ...profile,
      completedAt: new Date().toISOString()
    };
    
    storage.updateUserProfile(profileData);
    storage.updateProgress({
      userXP: userXP + 50, // Big XP boost for completing the compass
      recentAchievements: [...recentAchievements, "Completed the Nexus Compass!"],
      userBadges: userBadges.includes('compass-complete') ? userBadges : [...userBadges, 'compass-complete']
    });
    
    showMilestoneToast("🧭 Compass Complete! Your financial profile has been calibrated. Let's build your plan!");
  };

  // Navigation state
  const [activeView, setActiveView] = React.useState('dashboard');
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Handle view transitions with loading state
  const handleViewChange = (newView: string) => {
    if (newView === activeView) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveView(newView);
      setIsTransitioning(false);
    }, 150);
  };

  // Show Nexus Compass first if not completed
  if (!hasCompletedCompass) {
    return (
      <main className="min-h-screen w-full p-4 sm:p-8 flex items-center justify-center bg-gradient-to-br from-background via-card to-secondary/30">
        <NexusCompass onComplete={handleCompassComplete} />
      </main>
    );
  }

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Navigation items
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Icons.Growth,
      description: 'Overview and quick actions'
    },
    { 
      id: 'budget', 
      label: 'Budget Planner', 
      icon: Icons.Stability,
      description: 'Create and manage budgets'
    },
    { 
      id: 'progress', 
      label: 'Our Journey', 
      icon: Icons.Rewards,
      description: 'Track progress and achievements'
    },
    { 
      id: 'actions', 
      label: 'Action Hub', 
      icon: Icons.Flame,
      description: 'Advanced tools and data management'
    }
  ];

  // Render main content based on active view
  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Enhanced Hero Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-chart-2/5 to-chart-3/5 rounded-2xl blur-3xl opacity-50"></div>
              <Card className="relative border-none bg-gradient-to-br from-background/80 via-card/90 to-background/80 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-accent-foreground text-2xl shadow-lg">
                        🧭
                      </div>
                      <div>
                        <h1 className="heading-lg text-foreground">
                          Welcome Back, {userProfile?.name || 'Financial Team'}!
                        </h1>
                        <p className="body-base text-muted-foreground">
                          Your Nexus Coach is calibrated to <Badge variant="secondary" className="mx-1 font-mono">{userProfile?.coachingStyle || 'BALANCED'}</Badge> mode
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="group border-accent/20 bg-gradient-to-br from-accent/5 to-chart-2/10 hover:shadow-xl transition-all duration-500 hover:border-accent/40 hover:scale-105 cursor-pointer" onClick={() => handleViewChange('budget')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icons.Stability className="w-10 h-10 text-accent group-hover:scale-110 transition-transform duration-300" />
                    <Badge variant="outline" className="text-xs opacity-70 group-hover:opacity-100">
                      {weeklyBudget > 0 ? 'Active' : 'Setup'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Weekly Budget</p>
                    <p className="data-xl text-foreground group-hover:text-accent transition-colors duration-300">
                      {formatCurrency(weeklyBudget)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {weeklyBudget > 0 ? 'Click to edit' : 'Click to create'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group border-chart-2/20 bg-gradient-to-br from-chart-2/5 to-chart-3/10 hover:shadow-xl transition-all duration-500 hover:border-chart-2/40 hover:scale-105 cursor-pointer" onClick={() => handleViewChange('progress')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icons.Rewards className="w-10 h-10 text-chart-2 group-hover:scale-110 transition-transform duration-300" />
                    <Badge variant="outline" className="text-xs opacity-70 group-hover:opacity-100">
                      Level {Math.floor(userXP / 100) + 1}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Experience Points</p>
                    <p className="data-xl text-foreground group-hover:text-chart-2 transition-colors duration-300">
                      {userXP} XP
                    </p>
                    <div className="mt-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-chart-2 h-2 rounded-full transition-all duration-300 group-hover:bg-accent" 
                          style={{ width: `${(userXP % 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {100 - (userXP % 100)} XP to next level
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group border-chart-3/20 bg-gradient-to-br from-chart-3/5 to-primary/10 hover:shadow-xl transition-all duration-500 hover:border-chart-3/40 hover:scale-105 cursor-pointer" onClick={() => handleViewChange('progress')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icons.Growth className="w-10 h-10 text-chart-3 group-hover:scale-110 transition-transform duration-300" />
                    <Badge variant="outline" className="text-xs opacity-70 group-hover:opacity-100 capitalize">
                      {currentStage}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Progress Stage</p>
                    <p className="text-2xl font-bold text-foreground group-hover:text-chart-3 transition-colors duration-300 capitalize">
                      {currentStage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {userBadges.length} badge{userBadges.length !== 1 ? 's' : ''} earned
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10 hover:shadow-xl transition-all duration-500 hover:border-primary/40 hover:scale-105 cursor-pointer" onClick={() => handleViewChange('actions')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icons.Flame className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                    <Badge variant="outline" className="text-xs opacity-70 group-hover:opacity-100">
                      Tools
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Action Hub</p>
                    <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {storage.data.debts.length + storage.data.financial.budgetBlueprints.length} Items
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage debts & data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SpendableHero - Enhanced Main focal point */}
            {weeklyBudget > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="heading-sm text-foreground">This Week's Financial Focus</h2>
                    <p className="body-base text-muted-foreground">Track spending and celebrate staying on target together</p>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    Week {Math.ceil(new Date().getDate() / 7)}
                  </Badge>
                </div>
                <SpendableHero 
                  weeklyBudget={weeklyBudget}
                  currentSpending={currentSpending}
                  onSpendingUpdate={handleSpendingUpdate}
                  className="shadow-2xl border-primary/20 bg-gradient-to-br from-card/50 to-secondary/20 backdrop-blur-sm"
                />
              </div>
            ) : (
              <Card className="border-2 border-dashed border-accent/30 bg-gradient-to-br from-accent/5 to-chart-2/5">
                <CardContent className="p-8 text-center">
                  <Icons.Stability className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                  <h3 className="heading-sm text-foreground mb-2">Ready to Create Your First Budget?</h3>
                  <p className="body-base text-muted-foreground mb-6">
                    Set up your financial blueprint to unlock weekly spending tracking and start your journey together.
                  </p>
                  <Button size="lg" onClick={() => handleViewChange('budget')} className="bg-accent hover:bg-accent/90">
                    <Icons.Growth className="w-5 h-5 mr-2" />
                    Create Your Budget
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="heading-sm text-foreground">Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAchievements.slice(-4).reverse().map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg">
                        <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                        <span className="body-base text-foreground">{achievement}</span>
                      </div>
                    ))}
                    {recentAchievements.length === 0 && (
                      <p className="body-base text-muted-foreground">Complete your first milestone to see achievements here!</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="heading-sm text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start transition-smooth hover:border-accent/30" 
                    onClick={() => handleViewChange('budget')}
                  >
                    <Icons.Stability className="w-4 h-4 mr-2" />
                    Create Budget
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start transition-smooth hover:border-accent/30" 
                    onClick={() => handleViewChange('actions')}
                  >
                    <Icons.Flame className="w-4 h-4 mr-2" />
                    Manage Debts
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start transition-smooth hover:border-accent/30" 
                    onClick={() => handleViewChange('progress')}
                  >
                    <Icons.Rewards className="w-4 h-4 mr-2" />
                    View Progress
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="heading-xl text-foreground mb-4">Budget Planner</h1>
              <p className="body-lg text-muted-foreground">Create and manage your weekly spending plan together.</p>
            </div>
            <BucketSplitter onBudgetCreated={handleBudgetCreated} />
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="heading-xl text-foreground mb-4">Our Journey</h1>
              <p className="body-lg text-muted-foreground">Track your financial progress and celebrate milestones together.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <StageProgression 
                currentStage={currentStage}
                onStageComplete={handleStageComplete}
                hasBasicBudget={hasBasicBudget}
                hasTrackedSpending={hasTrackedSpending}
                hasEmergencyFund={storage.data.progress.milestones.hasEmergencyFund}
                hasSharedGoals={storage.data.progress.milestones.hasSharedGoals}
              />
              <Gamification 
                currentXP={userXP}
                maxXP={100}
                level={Math.floor(userXP / 100) + 1}
                badges={userBadges}
                recentAchievements={recentAchievements}
              />
            </div>
          </div>
        );

      case 'actions':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="heading-xl text-foreground mb-4">Action Hub</h1>
              <p className="body-lg text-muted-foreground">Advanced tools for debt management, emergency planning, and data control.</p>
            </div>
            <ActionHub />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-card/30 to-secondary/20">
        <NotificationSystem 
          notifications={notifications.notifications}
          onDismiss={notifications.dismissNotification}
        />
        
        <Sidebar className="border-r border-border/20 bg-gradient-to-b from-card/90 via-background/95 to-card/80 backdrop-blur-sm" variant="sidebar" collapsible="offcanvas">
          <SidebarHeader className="border-b border-border/20 bg-gradient-to-r from-accent/5 via-chart-2/5 to-primary/5">
            <div className="flex items-center gap-3 px-4 py-5">
              <div className="w-12 h-12 bg-gradient-to-br from-accent via-chart-2 to-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-2 ring-white/20">
                🧭
              </div>
              <div className="flex-1">
                <h2 className="heading-sm text-foreground font-bold">NEXUS</h2>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Strategic</p>
              </div>
              {userProfile && (
                <Badge variant="outline" className="text-xs font-mono bg-background/50 border-accent/30">
                  {userProfile.coachingStyle}
                </Badge>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-6">
            <SidebarGroup>
              <SidebarGroupLabel className="heading-xs text-muted-foreground/80 font-semibold uppercase tracking-wider mb-3">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navItems.map((item) => {
                    // Get contextual badges for each nav item
                    const getBadgeInfo = () => {
                      switch (item.id) {
                        case 'dashboard':
                          return { text: `${userXP} XP`, variant: 'secondary' as const, color: 'text-accent' };
                        case 'budget':
                          return weeklyBudget > 0 
                            ? { text: 'Active', variant: 'default' as const, color: 'text-chart-2' }
                            : { text: 'Setup', variant: 'outline' as const, color: 'text-muted-foreground' };
                        case 'progress':
                          return { text: `${userBadges.length}`, variant: 'secondary' as const, color: 'text-primary' };
                        case 'actions':
                          const totalItems = storage.data.debts.length + storage.data.financial.budgetBlueprints.length;
                          return totalItems > 0 
                            ? { text: `${totalItems} items`, variant: 'secondary' as const, color: 'text-chart-3' }
                            : { text: 'Empty', variant: 'outline' as const, color: 'text-muted-foreground' };
                        default:
                          return null;
                      }
                    };

                    const badgeInfo = getBadgeInfo();

                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={activeView === item.id}
                          onClick={() => handleViewChange(item.id)}
                          className={cn(
                            "group w-full justify-start h-12 px-3 rounded-xl transition-all duration-300",
                            "hover:bg-gradient-to-r hover:from-accent/10 hover:to-chart-2/5 hover:shadow-md hover:scale-[1.02]",
                            activeView === item.id 
                              ? "bg-gradient-to-r from-accent/20 via-chart-2/10 to-primary/10 text-accent border border-accent/30 shadow-lg shadow-accent/20" 
                              : "hover:text-foreground text-muted-foreground"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300",
                            activeView === item.id 
                              ? "bg-accent/20 text-accent shadow-inner" 
                              : "bg-muted/30 group-hover:bg-accent/10 group-hover:text-accent"
                          )}>
                            <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          </div>
                          <span className="body-base font-medium flex-1">{item.label}</span>
                          {badgeInfo && (
                            <Badge 
                              variant={badgeInfo.variant} 
                              className={cn(
                                "text-xs font-mono ml-auto px-2 py-0.5 rounded-full",
                                badgeInfo.color,
                                activeView === item.id ? "bg-background/50 border-accent/30" : "bg-background/30"
                              )}
                            >
                              {badgeInfo.text}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="my-6 bg-gradient-to-r from-transparent via-border to-transparent" />

            <SidebarGroup>
              <SidebarGroupLabel className="heading-xs text-muted-foreground/80 font-semibold uppercase tracking-wider mb-4">Progress Overview</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-4">
                <div className="relative overflow-hidden px-4 py-4 bg-gradient-to-br from-accent/10 via-chart-2/5 to-primary/10 rounded-2xl border border-accent/30 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-chart-2/5 opacity-50"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-accent/20 rounded-lg flex items-center justify-center">
                          <Icons.Rewards className="w-3 h-3 text-accent" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">L{Math.floor(userXP / 100) + 1}</span>
                      </div>
                      <span className="data-base font-bold text-accent">{userXP} XP</span>
                    </div>
                    <div className="w-full bg-background/20 rounded-full h-2.5 mb-2 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-accent via-chart-2 to-primary h-2.5 rounded-full transition-all duration-700 shadow-sm" 
                        style={{ width: `${(userXP % 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground/80 font-medium">
                      {100 - (userXP % 100)} XP to L{Math.floor(userXP / 100) + 2}
                    </p>
                  </div>
                </div>

                <div className="px-3 py-3 bg-gradient-to-br from-chart-2/5 to-chart-3/5 rounded-lg border border-chart-2/20">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Icons.Growth className="w-3 h-3 text-chart-2" />
                        <span className="text-xs text-muted-foreground">Stage</span>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize font-mono">
                        {currentStage}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Icons.Flame className="w-3 h-3 text-chart-3" />
                        <span className="text-xs text-muted-foreground">Badges</span>
                      </div>
                      <span className="data-sm font-bold text-foreground">{userBadges.length}</span>
                    </div>
                  </div>
                </div>

                {weeklyBudget > 0 && (
                  <div className="px-3 py-2 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icons.Stability className="w-3 h-3 text-primary" />
                        <span className="text-xs text-muted-foreground">Weekly</span>
                      </div>
                      <span className="data-sm font-bold text-foreground">{formatCurrency(weeklyBudget)}</span>
                    </div>
                    <div className="mt-1">
                      <div className="w-full bg-muted/50 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min((currentSpending / weeklyBudget) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(weeklyBudget - currentSpending)} remaining
                      </p>
                    </div>
                  </div>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border/40 bg-gradient-to-r from-card/80 to-secondary/20">
            <div className="px-3 py-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Data saved</span>
                <Badge variant="secondary" className="text-xs">
                  {new Date(storage.data.meta.lastSync).toLocaleDateString()}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Built for couples • Privacy-first
              </div>
              {recentAchievements.length > 0 && (
                <div className="text-xs text-center">
                  <span className="text-accent">🎉</span>
                  <span className="text-muted-foreground ml-1">
                    {recentAchievements[recentAchievements.length - 1]}
                  </span>
                </div>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-2 md:gap-4 px-4 md:px-6">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors duration-200" />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="heading-sm text-foreground truncate">
                    {navItems.find(item => item.id === activeView)?.label || 'Dashboard'}
                  </h1>
                  {activeView === 'dashboard' && weeklyBudget > 0 && (
                    <Badge variant="default" className="text-xs animate-pulse">
                      Live
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {navItems.find(item => item.id === activeView)?.description}
                </p>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                {weeklyBudget > 0 && (
                  <div className="hidden md:flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">This Week</p>
                      <p className="data-sm font-bold text-foreground">{formatCurrency(weeklyBudget - currentSpending)}</p>
                    </div>
                    <div className="w-12 h-6 bg-muted rounded-full p-1">
                      <div 
                        className="h-4 bg-gradient-to-r from-accent to-chart-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(8, Math.min(100 - (currentSpending / weeklyBudget) * 100, 100))}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <Badge variant="secondary" className="data-sm hidden sm:flex font-mono">
                  L{Math.floor(userXP / 100) + 1}
                </Badge>
                <Badge variant="outline" className="data-sm font-mono">
                  {userXP} XP
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <div className={cn(
                "transition-all duration-300 ease-in-out",
                isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
              )}>
                {renderMainContent()}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
