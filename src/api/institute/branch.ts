/**
 * Branch API
 * Institute branch locations
 */

import axios from '../axios-helper';
import type { Branch } from '@/types';

export const branchApi = {
  /**
   * Create a new branch
   */
  create: async (branch: Omit<Branch, 'identifier'>): Promise<Branch> => {
    const response = await axios.post<Branch>('/branches', branch);
    return response.data;
  },

  /**
   * Get branch by identifier
   */
  getById: async (identifier: string): Promise<Branch> => {
    const response = await axios.get<Branch>(`/branches/${identifier}`);
    return response.data;
  },

  /**
   * Get all branches
   */
  getAll: async (): Promise<Branch[]> => {
    const response = await axios.get<Branch[]>('/branches');
    return response.data;
  },

  /**
   * Delete branch by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/branches/${identifier}`);
    return response.data;
  },

  /**
   * Find branches by institute identifier
   */
  findByInstituteIdentifier: async (instituteIdentifier: string): Promise<Branch[]> => {
    const response = await axios.get<Branch[]>(`/branches/institute/${instituteIdentifier}`);
    return response.data;
  },

  /**
   * Find branches by city identifier
   */
  findByCityIdentifier: async (cityIdentifier: string): Promise<Branch[]> => {
    const response = await axios.get<Branch[]>(`/branches/city/${cityIdentifier}`);
    return response.data;
  },

  /**
   * Find main branch by institute identifier
   */
  findMainBranchByInstitute: async (instituteIdentifier: string): Promise<Branch | null> => {
    const response = await axios.get<Branch | null>(`/branches/institute/${instituteIdentifier}/main`);
    return response.data;
  },

  /**
   * Find online only branches
   */
  findOnlineOnly: async (): Promise<Branch[]> => {
    const response = await axios.get<Branch[]>('/branches/online-only');
    return response.data;
  },

  /**
   * Update branch by identifier
   */
  update: async (identifier: string, data: Partial<Branch>): Promise<Branch> => {
    const response = await axios.put<Branch>(`/branches/${identifier}`, data);
    return response.data;
  },
};
