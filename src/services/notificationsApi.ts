/**
 * API Service para Notificações
 */
import { getApi } from '../config/api';
const apiInstance = getApi();
import { NotificationResponse } from '../types/notification';

/**
 * Busca notificações do usuário
 */
export async function fetchNotifications(
  unreadOnly = false,
  limit = 50,
  offset = 0
): Promise<NotificationResponse[]> {
  const response = await apiInstance.get('/api/v1/notifications', {
    params: { unread_only: unreadOnly, limit, offset },
  });
  return response.data;
}

/**
 * Marca notificações como lidas
 */
export async function markNotificationsAsRead(ids: string[]): Promise<{ success: boolean; marked_count: number }> {
  const response = await apiInstance.post('/api/v1/notifications/mark-read', {
    notification_ids: ids,
  });
  return response.data;
}

