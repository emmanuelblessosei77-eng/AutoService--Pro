import { useEffect, useState } from 'react';
import { API_BASE } from '../../services/api';

export interface Notification {
  id: number;
  user_id: number;
  type: 'reminder' | 'alert' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  related_entity_type?: string;
  related_entity_id?: number;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (type: string = 'all', limit: number = 50) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const url = new URL(`${API_BASE}/notifications`);
      url.searchParams.append('type', type);
      url.searchParams.append('limit', limit.toString());

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.total_unread || 0);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications/unread/count`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch unread count');

      const data = await response.json();
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to mark all as read');

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Recalculate unread count
      const unread = notifications.filter(n => n.id !== notificationId && !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
