"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type NotificationType = 'success' | 'warning' | 'info' | 'celebration';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const notificationConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-gradient-to-r from-chart-2/10 to-accent/10",
    borderColor: "border-chart-2/30",
    iconColor: "text-chart-2",
    titleColor: "text-chart-2"
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-gradient-to-r from-chart-4/10 to-destructive/10",
    borderColor: "border-chart-4/30",
    iconColor: "text-chart-4",
    titleColor: "text-chart-4"
  },
  info: {
    icon: Info,
    bgColor: "bg-gradient-to-r from-chart-3/10 to-primary/10",
    borderColor: "border-chart-3/30",
    iconColor: "text-chart-3",
    titleColor: "text-chart-3"
  },
  celebration: {
    icon: Zap,
    bgColor: "bg-gradient-to-r from-accent/20 to-chart-2/20",
    borderColor: "border-accent/40",
    iconColor: "text-accent",
    titleColor: "text-accent"
  }
};

function NotificationItem({ notification, onDismiss }: { notification: Notification; onDismiss: (id: string) => void }) {
  const config = notificationConfig[notification.type];
  const Icon = config.icon;

  React.useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative group"
    >
      <Card className={cn(
        "border shadow-lg backdrop-blur-sm",
        config.bgColor,
        config.borderColor,
        "hover:shadow-xl transition-all duration-300"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              notification.type === 'celebration' ? "bg-accent/20 animate-pulse" : "bg-background/50"
            )}>
              <Icon className={cn("w-4 h-4", config.iconColor)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className={cn("font-semibold text-sm", config.titleColor)}>
                  {notification.title}
                  {notification.type === 'celebration' && (
                    <span className="ml-1 animate-bounce">🎉</span>
                  )}
                </h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-70 hover:opacity-100 transition-opacity"
                  onClick={() => onDismiss(notification.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              {notification.message && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {notification.message}
                </p>
              )}
              
              {notification.action && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={notification.action.onClick}
                >
                  {notification.action.label}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function NotificationSystem({ notifications, onDismiss }: NotificationSystemProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const addNotification = React.useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000, // Default 5 seconds
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const dismissNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = React.useCallback((title: string, message?: string, action?: Notification['action']) => {
    return addNotification({ type: 'success', title, message, action });
  }, [addNotification]);

  const showWarning = React.useCallback((title: string, message?: string, action?: Notification['action']) => {
    return addNotification({ type: 'warning', title, message, action });
  }, [addNotification]);

  const showInfo = React.useCallback((title: string, message?: string, action?: Notification['action']) => {
    return addNotification({ type: 'info', title, message, action });
  }, [addNotification]);

  const showCelebration = React.useCallback((title: string, message?: string, duration = 8000) => {
    return addNotification({ type: 'celebration', title, message, duration });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
    showSuccess,
    showWarning,
    showInfo,
    showCelebration,
  };
}
