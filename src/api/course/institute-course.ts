/**
 * Institute Course API
 * Institute's specific course offerings
 */

import axios from '../axios-helper';
import type { InstituteCourse } from '@/types';

export const instituteCourseApi = {
  /**
   * Create a new institute course
   */
  create: async (instituteCourse: Omit<InstituteCourse, 'identifier'>): Promise<InstituteCourse> => {
    const response = await axios.post<InstituteCourse>('/institute-courses', instituteCourse);
    return response.data;
  },

  /**
   * Get institute course by identifier
   */
  getById: async (identifier: string): Promise<InstituteCourse> => {
    const response = await axios.get<InstituteCourse>(`/institute-courses/${identifier}`);
    return response.data;
  },

  /**
   * Get all institute courses
   */
  getAll: async (): Promise<InstituteCourse[]> => {
    const response = await axios.get<InstituteCourse[]>('/institute-courses');
    return response.data;
  },

  /**
   * Delete institute course by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/institute-courses/${identifier}`);
    return response.data;
  },

  /**
   * Find institute courses by institute identifier
   */
  findByInstituteIdentifier: async (instituteIdentifier: string): Promise<InstituteCourse[]> => {
    const response = await axios.get<InstituteCourse[]>(`/institute-courses/institute/${instituteIdentifier}`);
    return response.data;
  },

  /**
   * Find institute courses by branch identifier
   */
  findByBranchIdentifier: async (branchIdentifier: string): Promise<InstituteCourse[]> => {
    const response = await axios.get<InstituteCourse[]>(`/institute-courses/branch/${branchIdentifier}`);
    return response.data;
  },

  /**
   * Find institute courses with admission open
   */
  findByAdmissionOpen: async (): Promise<InstituteCourse[]> => {
    const response = await axios.get<InstituteCourse[]>('/institute-courses/admission-open');
    return response.data;
  },

  /**
   * Find active institute courses
   */
  findActive: async (): Promise<InstituteCourse[]> => {
    const response = await axios.get<InstituteCourse[]>('/institute-courses/active');
    return response.data;
  },

  /**
   * Update institutecourse by identifier
   */
  update: async (identifier: string, data: Partial<InstituteCourse>): Promise<InstituteCourse> => {
    const response = await axios.put<InstituteCourse>(`/institute-courses/${identifier}`, data);
    return response.data;
  },
};
