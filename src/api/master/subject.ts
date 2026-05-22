/**
 * Subject API
 * Master data for subjects
 */

import axios from '../axios-helper';
import type { Subject } from '@/types';

export const subjectApi = {
  /**
   * Create a new subject
   */
  create: async (subject: Omit<Subject, 'identifier'>): Promise<Subject> => {
    const response = await axios.post<Subject>('/subjects', subject);
    return response.data;
  },

  /**
   * Get subject by identifier
   */
  getById: async (identifier: string): Promise<Subject> => {
    const response = await axios.get<Subject>(`/subjects/${identifier}`);
    return response.data;
  },

  /**
   * Get all subjects
   */
  getAll: async (): Promise<Subject[]> => {
    const response = await axios.get<Subject[]>('/subjects');
    return response.data;
  },

  /**
   * Delete subject by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/subjects/${identifier}`);
    return response.data;
  },

  /**
   * Find subject by slug
   */
  findBySlug: async (slug: string): Promise<Subject | null> => {
    const response = await axios.get<Subject | null>(`/subjects/slug/${slug}`);
    return response.data;
  },

  /**
   * Find subjects by stream identifier
   */
  findByStreamIdentifier: async (streamIdentifier: string): Promise<Subject[]> => {
    const response = await axios.get<Subject[]>(`/subjects/stream/${streamIdentifier}`);
    return response.data;
  },

  /**
   * Update subject by identifier
   */
  update: async (identifier: string, data: Partial<Subject>): Promise<Subject> => {
    const response = await axios.put<Subject>(`/subjects/${identifier}`, data);
    return response.data;
  },
};
