/**
 * Inquiry API
 * Contact and admission inquiries from users
 */

import axios from '../axios-helper';
import type { Inquiry, InquirySource, InquiryStatus } from '@/types';

export const inquiryApi = {
  /**
   * Create a new inquiry
   */
  create: async (inquiry: Omit<Inquiry, 'identifier'>): Promise<Inquiry> => {
    const response = await axios.post<Inquiry>('/inquiries', inquiry);
    return response.data;
  },

  /**
   * Get inquiry by identifier
   */
  getById: async (identifier: string): Promise<Inquiry> => {
    const response = await axios.get<Inquiry>(`/inquiries/${identifier}`);
    return response.data;
  },

  /**
   * Get all inquiries
   */
  getAll: async (): Promise<Inquiry[]> => {
    const response = await axios.get<Inquiry[]>('/inquiries');
    return response.data;
  },

  /**
   * Delete inquiry by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/inquiries/${identifier}`);
    return response.data;
  },

  /**
   * Find inquiries by institute identifier
   */
  findByInstituteIdentifier: async (instituteIdentifier: string): Promise<Inquiry[]> => {
    const response = await axios.get<Inquiry[]>(`/inquiries/institute/${instituteIdentifier}`);
    return response.data;
  },

  /**
   * Find inquiries by branch identifier
   */
  findByBranchIdentifier: async (branchIdentifier: string): Promise<Inquiry[]> => {
    const response = await axios.get<Inquiry[]>(`/inquiries/branch/${branchIdentifier}`);
    return response.data;
  },

  /**
   * Find inquiries by course identifier
   */
  findByCourseIdentifier: async (courseIdentifier: string): Promise<Inquiry[]> => {
    const response = await axios.get<Inquiry[]>(`/inquiries/course/${courseIdentifier}`);
    return response.data;
  },

  /**
   * Find inquiries by user identifier
   */
  findByUserIdentifier: async (userIdentifier: string): Promise<Inquiry[]> => {
    const response = await axios.get<Inquiry[]>(`/inquiries/user/${userIdentifier}`);
    return response.data;
  },

  /**
   * Find inquiries by status
   */
  findByStatus: async (status: InquiryStatus): Promise<Inquiry[]> => {
    const response = await axios.get<Inquiry[]>(`/inquiries/status/${status}`);
    return response.data;
  },

  /**
   * Find inquiries by source
   */
  findBySource: async (source: InquirySource): Promise<Inquiry[]> => {
    const response = await axios.get<Inquiry[]>(`/inquiries/source/${source}`);
    return response.data;
  },

  /**
   * Find inquiries by assigned to user
   */
  findByAssignedTo: async (assignedTo: string): Promise<Inquiry[]> => {
    const response = await axios.get<Inquiry[]>(`/inquiries/assigned-to/${assignedTo}`);
    return response.data;
  },

  /**
   * Find inquiries by institute and status
   */
  findByInstituteIdentifierAndStatus: async (
    instituteIdentifier: string,
    status: InquiryStatus
  ): Promise<Inquiry[]> => {
    const response = await axios.get<Inquiry[]>(
      `/inquiries/institute/${instituteIdentifier}/status/${status}`
    );
    return response.data;
  },

  /**
   * Update inquiry by identifier
   */
  update: async (identifier: string, data: Partial<Inquiry>): Promise<Inquiry> => {
    const response = await axios.put<Inquiry>(`/inquiries/${identifier}`, data);
    return response.data;
  },

  /**
   * Unlock contact details for an inquiry (spends 1 credit)
   */
  unlock: async (inquiryIdentifier: string, instituteIdentifier: string): Promise<Inquiry> => {
    const response = await axios.post<Inquiry>(`/inquiries/${inquiryIdentifier}/unlock`, { instituteIdentifier });
    return response.data;
  },
};
