/**
 * City API
 * Master data for cities
 */

import axios from '../axios-helper';
import type { City } from '@/types';

export const cityApi = {
  /**
   * Create a new city
   */
  create: async (city: Omit<City, 'identifier'>): Promise<City> => {
    const response = await axios.post<City>('/cities', city);
    return response.data;
  },

  /**
   * Get city by identifier
   */
  getById: async (identifier: string): Promise<City> => {
    const response = await axios.get<City>(`/cities/${identifier}`);
    return response.data;
  },

  /**
   * Get all cities
   */
  getAll: async (): Promise<City[]> => {
    const response = await axios.get<City[]>('/cities');
    return response.data;
  },

  /**
   * Delete city by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/cities/${identifier}`);
    return response.data;
  },

  /**
   * Find city by name and state
   */
  findByNameAndState: async (name: string, state: string): Promise<City | null> => {
    const response = await axios.get<City | null>('/cities/search', {
      params: { name, state },
    });
    return response.data;
  },

  /**
   * Find cities by state
   */
  findByState: async (state: string): Promise<City[]> => {
    const response = await axios.get<City[]>(`/cities/state/${state}`);
    return response.data;
  },

  /**
   * Find metro cities
   */
  findMetroCities: async (): Promise<City[]> => {
    const response = await axios.get<City[]>('/cities/metro');
    return response.data;
  },

  /**
   * Update city by identifier
   */
  update: async (identifier: string, data: Partial<City>): Promise<City> => {
    const response = await axios.put<City>(`/cities/${identifier}`, data);
    return response.data;
  },
};
