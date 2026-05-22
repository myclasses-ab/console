/**
 * Institute Facility API
 * Institute amenities and facilities
 */

import axios from '../axios-helper';
import type { InstituteFacility } from '@/types';

export const instituteFacilityApi = {
  /**
   * Create institute facility
   */
  create: async (facility: Omit<InstituteFacility, 'identifier'>): Promise<InstituteFacility> => {
    const response = await axios.post<InstituteFacility>('/institute-facilities', facility);
    return response.data;
  },

  /**
   * Get facility by identifier
   */
  getById: async (identifier: string): Promise<InstituteFacility> => {
    const response = await axios.get<InstituteFacility>(`/institute-facilities/${identifier}`);
    return response.data;
  },

  /**
   * Get all facilities
   */
  getAll: async (): Promise<InstituteFacility[]> => {
    const response = await axios.get<InstituteFacility[]>('/institute-facilities');
    return response.data;
  },

  /**
   * Delete facility by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/institute-facilities/${identifier}`);
    return response.data;
  },

  /**
   * Find facility by institute identifier
   */
  findByInstituteIdentifier: async (instituteIdentifier: string): Promise<InstituteFacility | null> => {
    const response = await axios.get<InstituteFacility | null>(`/institute-facilities/institute/${instituteIdentifier}`);
    return response.data;
  },

  /**
   * Update institutefacility by identifier
   */
  update: async (identifier: string, data: Partial<InstituteFacility>): Promise<InstituteFacility> => {
    const response = await axios.put<InstituteFacility>(`/institute-facilities/${identifier}`, data);
    return response.data;
  },
};
