import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: string;
  message: string;
  ticketId?: string;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      // Authenticate the connection
      socket.send(JSON.stringify({
        type: 'auth',
        userId: user.id
      }));
    };

    socket.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        
        // Add to notifications list
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: notification.type,
          message: notification.message,
          ticketId: notification.ticketId,
          timestamp: new Date()
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Show toast notification
        toast({
          title: getNotificationTitle(notification.type),
          description: notification.message,
        });

      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWs(socket);

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [user, toast]);

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'new_ticket':
        return 'New Ticket';
      case 'ticket_update':
        return 'Ticket Update';
      case 'ticket_assigned':
        return 'Ticket Assigned';
      default:
        return 'Notification';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      markAsRead,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
