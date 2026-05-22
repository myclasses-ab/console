/**
 * User Institute Association API
 * Links institute admins/staff to their institutes
 */

import axios from '../axios-helper';
import type { UserInstituteAssociation, InstituteStaffRole } from '@/types';

export const userInstituteAssociationApi = {
  /**
   * Create a new user institute association
   */
  create: async (
    association: Omit<UserInstituteAssociation, 'identifier'>
  ): Promise<UserInstituteAssociation> => {
    const response = await axios.post<UserInstituteAssociation>('/user-institute-associations', association);
    return response.data;
  },

  /**
   * Get user institute association by identifier
   */
  getById: async (identifier: string): Promise<UserInstituteAssociation> => {
    const response = await axios.get<UserInstituteAssociation>(`/user-institute-associations/${identifier}`);
    return response.data;
  },

  /**
   * Get all user institute associations
   */
  getAll: async (): Promise<UserInstituteAssociation[]> => {
    const response = await axios.get<UserInstituteAssociation[]>('/user-institute-associations');
    return response.data;
  },

  /**
   * Delete user institute association by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/user-institute-associations/${identifier}`);
    return response.data;
  },

  /**
   * Find associations by user identifier
   */
  findByUserIdentifier: async (userIdentifier: string): Promise<UserInstituteAssociation[]> => {
    const response = await axios.get<UserInstituteAssociation[]>(
      `/user-institute-associations/user/${userIdentifier}`
    );
    return response.data;
  },

  /**
   * Find associations by institute identifier
   */
  findByInstituteIdentifier: async (instituteIdentifier: string): Promise<UserInstituteAssociation[]> => {
    const response = await axios.get<UserInstituteAssociation[]>(
      `/user-institute-associations/institute/${instituteIdentifier}`
    );
    return response.data;
  },

  /**
   * Find association by user and institute
   */
  findByUserIdentifierAndInstituteIdentifier: async (
    userIdentifier: string,
    instituteIdentifier: string
  ): Promise<UserInstituteAssociation | null> => {
    const response = await axios.get<UserInstituteAssociation | null>(
      `/user-institute-associations/user/${userIdentifier}/institute/${instituteIdentifier}`
    );
    return response.data;
  },

  /**
   * Find associations by role
   */
  findByRole: async (role: InstituteStaffRole): Promise<UserInstituteAssociation[]> => {
    const response = await axios.get<UserInstituteAssociation[]>(`/user-institute-associations/role/${role}`);
    return response.data;
  },

  /**
   * Find active associations
   */
  findActive: async (): Promise<UserInstituteAssociation[]> => {
    const response = await axios.get<UserInstituteAssociation[]>('/user-institute-associations/active');
    return response.data;
  },

  /**
   * Update userinstituteassociation by identifier
   */
  update: async (identifier: string, data: Partial<UserInstituteAssociation>): Promise<UserInstituteAssociation> => {
    const response = await axios.put<UserInstituteAssociation>(`/user-institute-associations/${identifier}`, data);
    return response.data;
  },
};
