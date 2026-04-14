import { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';
import { bookings as apiBookings } from '../../services/api';
import { Card } from './ui/card';
import { Button } from './ui/button';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
  read: boolean;
  dismissible?: boolean;
}

interface NotificationSystemProps {
  onNotificationRead?: (id) => void;
}

const typeConfig = {
  success: { icon, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
  error: { icon, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
  warning: { icon, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
  info: { icon, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
};

export function NotificationCenter({ onNotificationRead }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read,
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Auto-dismiss after 5 seconds if dismissible
    if (notification.dismissible !== false) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }

    return id;
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } )));
    onNotificationRead?.(id);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    // Expose the addNotification function globally for testing
    (window as any).addNotification = addNotification;
  }, [addNotification]);

  return (
    
      {/* Bell Icon */}
       setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        
        {unreadCount > 0 && (
          
            {unreadCount}
          
        )}
      

      {/* Notification Dropdown */}
      {isOpen && (
        
          
            Notifications
          
          
            {notifications.length === 0 ? (
              No notifications
            ) : (
              notifications.map(notif => {
                const config = typeConfig[notif.type];
                const Icon = config.icon;
                return (
                   markAsRead(notif.id)}
                  >
                    
                      
                        
                        
                          {notif.title}
                          {notif.message}
                          
                            {notif.timestamp.toLocaleTimeString()}
                          
                        
                      
                       dismissNotification(notif.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        
                      
                    
                  
                );
              })
            )}
          
        
      )}

      {/* Toast Notifications */}
      
        {notifications
          .filter(n => !n.read && n.dismissible !== false)
          .slice(0, 3)
          .map(notif => {
            const config = typeConfig[notif.type];
            const Icon = config.icon;
            return (
              
                
                  
                  
                    {notif.title}
                    {notif.message}
                  
                   dismissNotification(notif.id)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    
                  
                
              
            );
          })}
      
    
  );
}

export function useNotifications() {
  return {
    addNotification: (window as any).addNotification,
  };
}




