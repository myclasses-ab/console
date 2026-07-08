/**
 * Result API
 * Student exam results and achievements
 */

import axios from '../axios-helper';
import type { Result } from '@/types';

export const resultApi = {
  /**
   * Create a new result
   */
  create: async (result: Omit<Result, 'identifier'>): Promise<Result> => {
    const response = await axios.post<Result>('/results', result);
    return response.data;
  },

  /**
   * Get result by identifier
   */
  getById: async (identifier: string): Promise<Result> => {
    const response = await axios.get<Result>(`/results/${identifier}`);
    return response.data;
  },

  /**
   * Get all results
   */
  getAll: async (): Promise<Result[]> => {
    const response = await axios.get<Result[]>('/results');
    return response.data;
  },

  /**
   * Delete result by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/results/${identifier}`);
    return response.data;
  },

  /**
   * Find results by institute identifier
   */
  findByInstituteIdentifier: async (instituteIdentifier: string): Promise<Result[]> => {
    const response = await axios.get<Result[]>(`/results/institute/${instituteIdentifier}`);
    return response.data;
  },

  /**
   * Find featured results
   */
  findByIsFeatured: async (): Promise<Result[]> => {
    const response = await axios.get<Result[]>('/results/featured');
    return response.data;
  },

  /**
   * Update result by identifier
   */
  update: async (identifier: string, data: Partial<Result>): Promise<Result> => {
    const response = await axios.put<Result>(`/results/${identifier}`, data);
    return response.data;
  },
};
