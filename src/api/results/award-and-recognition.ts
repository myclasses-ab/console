/**
 * Award and Recognition API
 * External awards and certifications for institutes
 */

import axios from '../axios-helper';
import type { AwardAndRecognition } from '@/types';

export const awardAndRecognitionApi = {
  /**
   * Create a new award and recognition
   */
  create: async (award: Omit<AwardAndRecognition, 'identifier'>): Promise<AwardAndRecognition> => {
    const response = await axios.post<AwardAndRecognition>('/awards-and-recognitions', award);
    return response.data;
  },

  /**
   * Get award and recognition by identifier
   */
  getById: async (identifier: string): Promise<AwardAndRecognition> => {
    const response = await axios.get<AwardAndRecognition>(`/awards-and-recognitions/${identifier}`);
    return response.data;
  },

  /**
   * Get all awards and recognitions
   */
  getAll: async (): Promise<AwardAndRecognition[]> => {
    const response = await axios.get<AwardAndRecognition[]>('/awards-and-recognitions');
    return response.data;
  },

  /**
   * Delete award and recognition by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/awards-and-recognitions/${identifier}`);
    return response.data;
  },

  /**
   * Find awards by institute identifier
   */
  findByInstituteIdentifier: async (instituteIdentifier: string): Promise<AwardAndRecognition[]> => {
    const response = await axios.get<AwardAndRecognition[]>(
      `/awards-and-recognitions/institute/${instituteIdentifier}`
    );
    return response.data;
  },

  /**
   * Find awards by year
   */
  findByYear: async (year: number): Promise<AwardAndRecognition[]> => {
    const response = await axios.get<AwardAndRecognition[]>(`/awards-and-recognitions/year/${year}`);
    return response.data;
  },

  /**
   * Find verified awards
   */
  findByIsVerified: async (): Promise<AwardAndRecognition[]> => {
    const response = await axios.get<AwardAndRecognition[]>('/awards-and-recognitions/verified');
    return response.data;
  },

  /**
   * Update awardandrecognition by identifier
   */
  update: async (identifier: string, data: Partial<AwardAndRecognition>): Promise<AwardAndRecognition> => {
    const response = await axios.put<AwardAndRecognition>(`/awards-and-recognitions/${identifier}`, data);
    return response.data;
  },
};
