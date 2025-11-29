/**
 * Zustand Store para Notificações
 */
import { create } from 'zustand';
import { NotificationResponse } from '../types/notification';
import { fetchNotifications, markNotificationsAsRead } from '../services/notificationsApi';

interface NotificationsState {
  notifications: NotificationResponse[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  loadNotifications: (unreadOnly?: boolean) => Promise<void>;
  markAsRead: (ids: string[]) => Promise<void>;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  loadNotifications: async (unreadOnly = false) => {
    set({ loading: true, error: null });
    try {
      const notifications = await fetchNotifications(unreadOnly);
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      set({ notifications, unreadCount, loading: false });
    } catch (error: any) {
      console.error('Erro ao carregar notificações:', error);
      set({ error: error.message || 'Erro ao carregar notificações', loading: false });
    }
  },

  markAsRead: async (ids: string[]) => {
    try {
      await markNotificationsAsRead(ids);
      // Atualizar estado local
      const { notifications } = get();
      const updated = notifications.map((n) =>
        ids.includes(n.id) ? { ...n, is_read: true } : n
      );
      const unreadCount = updated.filter((n) => !n.is_read).length;
      set({ notifications: updated, unreadCount });
    } catch (error: any) {
      console.error('Erro ao marcar notificações como lidas:', error);
      throw error;
    }
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0, error: null });
  },
}));

