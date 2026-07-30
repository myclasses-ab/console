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
  phone: string;
}

export interface InstituteSignupInitiateRequest {
  email: string;
  phone: string;
  password: string;
  instituteName: string;
}

export interface InstituteSignupInitiateResponse {
  message: string;
  email: string;
  phone: string;
  expiresInMinutes: number;
}

export interface InstituteSignupVerifyResponse {
  message: string;
  emailVerified: boolean;
  phoneVerified?: boolean;
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
   * Initiate institute signup: sends email code + phone OTP
   */
  initiateInstituteSignup: async (
    data: InstituteSignupInitiateRequest
  ): Promise<InstituteSignupInitiateResponse> => {
    const response = await axios.post<InstituteSignupInitiateResponse>('/auth/signup/initiate', data);
    return response.data;
  },

  /**
   * Verify email code for institute signup
   */
  verifySignupEmail: async (email: string, code: string): Promise<InstituteSignupVerifyResponse> => {
    const response = await axios.post<InstituteSignupVerifyResponse>('/auth/signup/verify-email', {
      email,
      code,
    });
    return response.data;
  },

  /**
   * Send phone OTP for institute signup after email is verified
   */
  sendSignupPhoneOtp: async (email: string): Promise<{ message: string; phone: string; expiresInMinutes: number }> => {
    const response = await axios.post<{ message: string; phone: string; expiresInMinutes: number }>(
      '/auth/signup/send-phone-otp',
      { email }
    );
    return response.data;
  },

  /**
   * Verify phone OTP for institute signup
   */
  verifySignupPhone: async (email: string, otp: string): Promise<InstituteSignupVerifyResponse> => {
    const response = await axios.post<InstituteSignupVerifyResponse>('/auth/signup/verify-phone', {
      email,
      otp,
    });
    return response.data;
  },

  /**
   * Resend email verification code
   */
  resendSignupEmail: async (email: string): Promise<{ message: string }> => {
    const response = await axios.post<{ message: string }>('/auth/signup/resend-email', { email });
    return response.data;
  },

  /**
   * Resend phone OTP
   */
  resendSignupPhone: async (email: string): Promise<{ message: string }> => {
    const response = await axios.post<{ message: string }>('/auth/signup/resend-phone', { email });
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
