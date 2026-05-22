/**
 * Auth API
 * Authentication endpoints
 */

import axios from './axios-helper';
import type { User } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  instituteName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Sign up a new user with institute creation
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  me: async (): Promise<User> => {
    const response = await axios.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Refresh auth token
   */
  refresh: async (): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/auth/refresh');
    return response.data;
  },
};
