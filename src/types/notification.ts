/**
 * Types para Notificações
 */
import { UUID } from './api';

export interface NotificationResponse {
  id: UUID;
  user_id: UUID;
  type: string;
  payload?: any;
  is_read: boolean;
  created_at: string;
}

