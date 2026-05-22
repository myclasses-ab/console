/**
 * Institute API
 * Coaching institute management
 */

import axios from '../axios-helper';
import type { Institute, InstituteType, OwnershipType, SubscriptionTier } from '@/types';

export const instituteApi = {
  /**
   * Create a new institute
   */
  create: async (institute: Omit<Institute, 'identifier'>): Promise<Institute> => {
    const response = await axios.post<Institute>('/institutes', institute);
    return response.data;
  },

  /**
   * Get institute by identifier
   */
  getById: async (identifier: string): Promise<Institute> => {
    const response = await axios.get<Institute>(`/institutes/${identifier}`);
    return response.data;
  },

  /**
   * Get all institutes
   */
  getAll: async (): Promise<Institute[]> => {
    const response = await axios.get<Institute[]>('/institutes');
    return response.data;
  },

  /**
   * Delete institute by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/institutes/${identifier}`);
    return response.data;
  },

  /**
   * Find institute by slug
   */
  findBySlug: async (slug: string): Promise<Institute | null> => {
    const response = await axios.get<Institute | null>(`/institutes/slug/${slug}`);
    return response.data;
  },

  /**
   * Find institutes by type
   */
  findByType: async (type: InstituteType): Promise<Institute[]> => {
    const response = await axios.get<Institute[]>(`/institutes/type/${type}`);
    return response.data;
  },

  /**
   * Find institutes by ownership type
   */
  findByOwnershipType: async (ownershipType: OwnershipType): Promise<Institute[]> => {
    const response = await axios.get<Institute[]>(`/institutes/ownership/${ownershipType}`);
    return response.data;
  },

  /**
   * Find institutes by subscription tier
   */
  findBySubscriptionTier: async (subscriptionTier: SubscriptionTier): Promise<Institute[]> => {
    const response = await axios.get<Institute[]>(`/institutes/subscription-tier/${subscriptionTier}`);
    return response.data;
  },

  /**
   * Find verified institutes
   */
  findVerified: async (): Promise<Institute[]> => {
    const response = await axios.get<Institute[]>('/institutes/verified');
    return response.data;
  },

  /**
   * Find featured institutes
   */
  findFeatured: async (): Promise<Institute[]> => {
    const response = await axios.get<Institute[]>('/institutes/featured');
    return response.data;
  },

  /**
   * Find active institutes
   */
  findActive: async (): Promise<Institute[]> => {
    const response = await axios.get<Institute[]>('/institutes/active');
    return response.data;
  },

  /**
   * Find institutes by parent institute identifier (franchises)
   */
  findByParentInstituteIdentifier: async (parentInstituteIdentifier: string): Promise<Institute[]> => {
    const response = await axios.get<Institute[]>(`/institutes/parent/${parentInstituteIdentifier}`);
    return response.data;
  },

  /**
   * Search institutes with filters
   */
  search: async (params: {
    query?: string;
    cityIdentifier?: string;
    cityName?: string;
    minFee?: number;
    maxFee?: number;
    minRating?: number;
    type?: InstituteType;
    subscriptionTier?: SubscriptionTier;
    isVerified?: boolean;
    isFeatured?: boolean;
    hasHostel?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Institute[]> => {
    const response = await axios.get<Institute[]>('/institutes/search', {
      params,
    });
    return response.data;
  },

  /**
   * Update institute by identifier
   */
  update: async (identifier: string, data: Partial<Institute>): Promise<Institute> => {
    const response = await axios.put<Institute>(`/institutes/${identifier}`, data);
    return response.data;
  },
};
