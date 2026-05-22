/**
 * Lead Distribution API
 * For institute admins to view leads (users) sent by super admin
 */

import axios from '../axios-helper';
import type { LeadDistribution, User } from '@/types';

export const leadDistributionApi = {
  /**
   * Get lead distributions for my institute
   */
  getByInstitute: async (instituteIdentifier: string): Promise<LeadDistribution[]> => {
    const response = await axios.get<LeadDistribution[]>(`/lead-distributions/institute/${instituteIdentifier}`);
    return response.data;
  },

  /**
   * Update distribution status
   */
  updateStatus: async (identifier: string, status: string): Promise<LeadDistribution> => {
    const response = await axios.patch<LeadDistribution>(`/lead-distributions/${identifier}`, { status });
    return response.data;
  },

  /**
   * Update institute notes for a lead
   */
  updateNotes: async (identifier: string, instituteNotes: string): Promise<LeadDistribution> => {
    const response = await axios.patch<LeadDistribution>(`/lead-distributions/${identifier}`, { instituteNotes });
    return response.data;
  },
};

export const leadsApi = {
  /**
   * Get all student leads (users)
   */
  getAll: async (): Promise<User[]> => {
    const response = await axios.get<User[]>('/users/leads');
    return response.data;
  },
};
