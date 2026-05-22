/**
 * Subscription Plan API
 * Platform tier definitions
 */

import axios from '../axios-helper';
import type { SubscriptionPlan, SubscriptionTier } from '@/types';

export const subscriptionPlanApi = {
  /**
   * Create a new subscription plan
   */
  create: async (plan: Omit<SubscriptionPlan, 'identifier'>): Promise<SubscriptionPlan> => {
    const response = await axios.post<SubscriptionPlan>('/subscription-plans', plan);
    return response.data;
  },

  /**
   * Get subscription plan by identifier
   */
  getById: async (identifier: string): Promise<SubscriptionPlan> => {
    const response = await axios.get<SubscriptionPlan>(`/subscription-plans/${identifier}`);
    return response.data;
  },

  /**
   * Get all subscription plans
   */
  getAll: async (): Promise<SubscriptionPlan[]> => {
    const response = await axios.get<SubscriptionPlan[]>('/subscription-plans');
    return response.data;
  },

  /**
   * Delete subscription plan by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/subscription-plans/${identifier}`);
    return response.data;
  },

  /**
   * Find subscription plan by tier name
   */
  findByTier: async (name: SubscriptionTier): Promise<SubscriptionPlan | null> => {
    const response = await axios.get<SubscriptionPlan | null>(`/subscription-plans/tier/${name}`);
    return response.data;
  },

  /**
   * Update subscriptionplan by identifier
   */
  update: async (identifier: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
    const response = await axios.put<SubscriptionPlan>(`/subscription-plans/${identifier}`, data);
    return response.data;
  },
};
