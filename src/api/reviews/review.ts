/**
 * Review API
 * Student and parent reviews of institutes
 */

import axios from '../axios-helper';
import type { Review, Standard } from '@/types';

export const reviewApi = {
  /**
   * Create a new review
   */
  create: async (review: Omit<Review, 'identifier'>): Promise<Review> => {
    const response = await axios.post<Review>('/reviews', review);
    return response.data;
  },

  /**
   * Get review by identifier
   */
  getById: async (identifier: string): Promise<Review> => {
    const response = await axios.get<Review>(`/reviews/${identifier}`);
    return response.data;
  },

  /**
   * Get all reviews
   */
  getAll: async (): Promise<Review[]> => {
    const response = await axios.get<Review[]>('/reviews');
    return response.data;
  },

  /**
   * Delete review by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/reviews/${identifier}`);
    return response.data;
  },

  /**
   * Find reviews by institute identifier
   */
  findByInstituteIdentifier: async (instituteIdentifier: string): Promise<Review[]> => {
    const response = await axios.get<Review[]>(`/reviews/institute/${instituteIdentifier}`);
    return response.data;
  },

  /**
   * Find reviews by user identifier
   */
  findByUserIdentifier: async (userIdentifier: string): Promise<Review[]> => {
    const response = await axios.get<Review[]>(`/reviews/user/${userIdentifier}`);
    return response.data;
  },

  /**
   * Find reviews by standard when enrolled
   */
  findByStandardWhenEnrolled: async (standard: Standard): Promise<Review[]> => {
    const response = await axios.get<Review[]>(`/reviews/standard/${standard}`);
    return response.data;
  },

  /**
   * Update review by identifier
   */
  update: async (identifier: string, data: Partial<Review>): Promise<Review> => {
    const response = await axios.put<Review>(`/reviews/${identifier}`, data);
    return response.data;
  },
};
