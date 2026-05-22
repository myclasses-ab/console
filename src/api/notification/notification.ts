/**
 * Notification API
 * Platform notifications for users
 */

import axios from '../axios-helper';
import type { Notification, NotificationType } from '@/types';

export const notificationApi = {
  /**
   * Create a new notification
   */
  create: async (notification: Omit<Notification, 'identifier'>): Promise<Notification> => {
    const response = await axios.post<Notification>('/notifications', notification);
    return response.data;
  },

  /**
   * Get notification by identifier
   */
  getById: async (identifier: string): Promise<Notification> => {
    const response = await axios.get<Notification>(`/notifications/${identifier}`);
    return response.data;
  },

  /**
   * Get all notifications
   */
  getAll: async (): Promise<Notification[]> => {
    const response = await axios.get<Notification[]>('/notifications');
    return response.data;
  },

  /**
   * Delete notification by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/notifications/${identifier}`);
    return response.data;
  },

  /**
   * Find notifications by user identifier
   */
  findByUserIdentifier: async (userIdentifier: string): Promise<Notification[]> => {
    const response = await axios.get<Notification[]>(`/notifications/user/${userIdentifier}`);
    return response.data;
  },

  /**
   * Find unread notifications for user
   */
  findUnreadByUserIdentifier: async (userIdentifier: string): Promise<Notification[]> => {
    const response = await axios.get<Notification[]>(`/notifications/user/${userIdentifier}/unread`);
    return response.data;
  },

  /**
   * Find notifications by type
   */
  findByType: async (type: NotificationType): Promise<Notification[]> => {
    const response = await axios.get<Notification[]>(`/notifications/type/${type}`);
    return response.data;
  },

  /**
   * Update notification by identifier
   */
  update: async (identifier: string, data: Partial<Notification>): Promise<Notification> => {
    const response = await axios.put<Notification>(`/notifications/${identifier}`, data);
    return response.data;
  },
};
