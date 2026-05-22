/**
 * Institute Subscription API
 * Active subscriptions for institutes
 */

import axios from '../axios-helper';
import type { InstituteSubscription } from '@/types';

export const instituteSubscriptionApi = {
  /**
   * Create a new institute subscription
   */
  create: async (
    subscription: Omit<InstituteSubscription, 'identifier'>
  ): Promise<InstituteSubscription> => {
    const response = await axios.post<InstituteSubscription>('/institute-subscriptions', subscription);
    return response.data;
  },

  /**
   * Get institute subscription by identifier
   */
  getById: async (identifier: string): Promise<InstituteSubscription> => {
    const response = await axios.get<InstituteSubscription>(`/institute-subscriptions/${identifier}`);
    return response.data;
  },

  /**
   * Get all institute subscriptions
   */
  getAll: async (): Promise<InstituteSubscription[]> => {
    const response = await axios.get<InstituteSubscription[]>('/institute-subscriptions');
    return response.data;
  },

  /**
   * Delete institute subscription by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/institute-subscriptions/${identifier}`);
    return response.data;
  },

  /**
   * Find subscriptions by institute identifier
   */
  findByInstituteIdentifier: async (instituteIdentifier: string): Promise<InstituteSubscription[]> => {
    const response = await axios.get<InstituteSubscription[]>(
      `/institute-subscriptions/institute/${instituteIdentifier}`
    );
    return response.data;
  },

  /**
   * Find subscriptions by plan identifier
   */
  findByPlanIdentifier: async (planIdentifier: string): Promise<InstituteSubscription[]> => {
    const response = await axios.get<InstituteSubscription[]>(
      `/institute-subscriptions/plan/${planIdentifier}`
    );
    return response.data;
  },

  /**
   * Find active subscriptions
   */
  findActive: async (): Promise<InstituteSubscription[]> => {
    const response = await axios.get<InstituteSubscription[]>('/institute-subscriptions/active');
    return response.data;
  },

  /**
   * Update institutesubscription by identifier
   */
  update: async (identifier: string, data: Partial<InstituteSubscription>): Promise<InstituteSubscription> => {
    const response = await axios.put<InstituteSubscription>(`/institute-subscriptions/${identifier}`, data);
    return response.data;
  },
};
