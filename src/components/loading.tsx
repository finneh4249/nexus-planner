"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LoadingLayoutProps {
  className?: string;
}

export function DashboardLoading({ className }: LoadingLayoutProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
      </div>

      {/* Quick stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="w-8 h-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Two column layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function PageLoading({ className }: LoadingLayoutProps) {
  return (
    <div className={cn("space-y-8", className)}>
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function SidebarLoading({ className }: LoadingLayoutProps) {
  return (
    <div className={cn("space-y-6 p-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16 mb-3" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 p-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      {/* Progress section */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Animated loading spinner component
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        <div className="w-8 h-8 border-4 border-muted rounded-full animate-spin border-t-accent"></div>
        <div className="absolute inset-0 w-8 h-8 border-4 border-transparent rounded-full animate-ping border-t-accent/20"></div>
      </div>
    </div>
  );
}

// Loading overlay for transitions
export function LoadingOverlay({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
