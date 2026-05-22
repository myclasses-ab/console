/**
 * User API
 * User management for all platform users
 */

import axios from '../axios-helper';
import type { User, UserRole } from '@/types';

export const userApi = {
  /**
   * Create a new user
   */
  create: async (user: Omit<User, 'identifier'>): Promise<User> => {
    const response = await axios.post<User>('/users', user);
    return response.data;
  },

  /**
   * Get user by identifier
   */
  getById: async (identifier: string): Promise<User> => {
    const response = await axios.get<User>(`/users/${identifier}`);
    return response.data;
  },

  /**
   * Get all users
   */
  getAll: async (): Promise<User[]> => {
    const response = await axios.get<User[]>('/users');
    return response.data;
  },

  /**
   * Delete user by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/users/${identifier}`);
    return response.data;
  },

  /**
   * Find user by email
   */
  findByEmail: async (email: string): Promise<User | null> => {
    const response = await axios.get<User | null>(`/users/email/${email}`);
    return response.data;
  },

  /**
   * Find user by phone
   */
  findByPhone: async (phone: string): Promise<User | null> => {
    const response = await axios.get<User | null>(`/users/phone/${phone}`);
    return response.data;
  },

  /**
   * Find users by role
   */
  findByRole: async (role: UserRole): Promise<User[]> => {
    const response = await axios.get<User[]>(`/users/role/${role}`);
    return response.data;
  },

  /**
   * Find users by city identifier
   */
  findByCityIdentifier: async (cityIdentifier: string): Promise<User[]> => {
    const response = await axios.get<User[]>(`/users/city/${cityIdentifier}`);
    return response.data;
  },

  /**
   * Find active users
   */
  findActive: async (): Promise<User[]> => {
    const response = await axios.get<User[]>('/users/active');
    return response.data;
  },

  /**
   * Check if email exists
   */
  existsByEmail: async (email: string): Promise<boolean> => {
    const response = await axios.get<boolean>(`/users/exists/email/${email}`);
    return response.data;
  },

  /**
   * Check if phone exists
   */
  existsByPhone: async (phone: string): Promise<boolean> => {
    const response = await axios.get<boolean>(`/users/exists/phone/${phone}`);
    return response.data;
  },

  /**
   * Update user by identifier
   */
  update: async (identifier: string, data: Partial<User>): Promise<User> => {
    const response = await axios.put<User>(`/users/${identifier}`, data);
    return response.data;
  },
};
