/**
 * Institute Response API
 * Institute's official responses to reviews
 */

import axios from '../axios-helper';
import type { InstituteResponse } from '@/types';

export const instituteResponseApi = {
  /**
   * Create a new institute response
   */
  create: async (response: Omit<InstituteResponse, 'identifier'>): Promise<InstituteResponse> => {
    const result = await axios.post<InstituteResponse>('/institute-responses', response);
    return result.data;
  },

  /**
   * Get institute response by identifier
   */
  getById: async (identifier: string): Promise<InstituteResponse> => {
    const response = await axios.get<InstituteResponse>(`/institute-responses/${identifier}`);
    return response.data;
  },

  /**
   * Get all institute responses
   */
  getAll: async (): Promise<InstituteResponse[]> => {
    const response = await axios.get<InstituteResponse[]>('/institute-responses');
    return response.data;
  },

  /**
   * Delete institute response by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/institute-responses/${identifier}`);
    return response.data;
  },

  /**
   * Find institute responses by review identifier
   */
  findByReviewIdentifier: async (reviewIdentifier: string): Promise<InstituteResponse | null> => {
    const response = await axios.get<InstituteResponse | null>(
      `/institute-responses/review/${reviewIdentifier}`
    );
    return response.data;
  },

  /**
   * Find institute responses by institute identifier
   */
  findByInstituteIdentifier: async (instituteIdentifier: string): Promise<InstituteResponse[]> => {
    const response = await axios.get<InstituteResponse[]>(
      `/institute-responses/institute/${instituteIdentifier}`
    );
    return response.data;
  },

  /**
   * Find institute responses by responded by user
   */
  findByRespondedBy: async (respondedBy: string): Promise<InstituteResponse[]> => {
    const response = await axios.get<InstituteResponse[]>(
      `/institute-responses/responded-by/${respondedBy}`
    );
    return response.data;
  },

  /**
   * Update instituteresponse by identifier
   */
  update: async (identifier: string, data: Partial<InstituteResponse>): Promise<InstituteResponse> => {
    const response = await axios.put<InstituteResponse>(`/institute-responses/${identifier}`, data);
    return response.data;
  },
};
