/**
 * Exam Type API
 * Master data for exam types (JEE, NEET, MHT-CET, etc.)
 */

import axios from '../axios-helper';
import type { ExamType } from '@/types';

export const examTypeApi = {
  /**
   * Create a new exam type
   */
  create: async (examType: Omit<ExamType, 'identifier'>): Promise<ExamType> => {
    const response = await axios.post<ExamType>('/exam-types', examType);
    return response.data;
  },

  /**
   * Get exam type by identifier
   */
  getById: async (identifier: string): Promise<ExamType> => {
    const response = await axios.get<ExamType>(`/exam-types/${identifier}`);
    return response.data;
  },

  /**
   * Get all exam types
   */
  getAll: async (): Promise<ExamType[]> => {
    const response = await axios.get<ExamType[]>('/exam-types');
    return response.data;
  },

  /**
   * Delete exam type by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/exam-types/${identifier}`);
    return response.data;
  },

  /**
   * Find exam type by slug
   */
  findBySlug: async (slug: string): Promise<ExamType | null> => {
    const response = await axios.get<ExamType | null>(`/exam-types/slug/${slug}`);
    return response.data;
  },

  /**
   * Find exam types by stream identifier
   */
  findByStreamIdentifier: async (streamIdentifier: string): Promise<ExamType[]> => {
    const response = await axios.get<ExamType[]>(`/exam-types/stream/${streamIdentifier}`);
    return response.data;
  },

  /**
   * Update examtype by identifier
   */
  update: async (identifier: string, data: Partial<ExamType>): Promise<ExamType> => {
    const response = await axios.put<ExamType>(`/exam-types/${identifier}`, data);
    return response.data;
  },
};
