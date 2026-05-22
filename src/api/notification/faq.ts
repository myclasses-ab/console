/**
 * FAQ API
 * Frequently asked questions for institutes
 */

import axios from '../axios-helper';
import type { Faq } from '@/types';

export const faqApi = {
  /**
   * Create a new FAQ
   */
  create: async (faq: Omit<Faq, 'identifier'>): Promise<Faq> => {
    const response = await axios.post<Faq>('/faqs', faq);
    return response.data;
  },

  /**
   * Get FAQ by identifier
   */
  getById: async (identifier: string): Promise<Faq> => {
    const response = await axios.get<Faq>(`/faqs/${identifier}`);
    return response.data;
  },

  /**
   * Get all FAQs
   */
  getAll: async (): Promise<Faq[]> => {
    const response = await axios.get<Faq[]>('/faqs');
    return response.data;
  },

  /**
   * Delete FAQ by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/faqs/${identifier}`);
    return response.data;
  },

  /**
   * Find FAQs by institute identifier
   */
  findByInstituteIdentifier: async (instituteIdentifier: string): Promise<Faq[]> => {
    const response = await axios.get<Faq[]>(`/faqs/institute/${instituteIdentifier}`);
    return response.data;
  },

  /**
   * Find active FAQs by institute identifier
   */
  findActiveByInstituteIdentifier: async (instituteIdentifier: string): Promise<Faq[]> => {
    const response = await axios.get<Faq[]>(`/faqs/institute/${instituteIdentifier}/active`);
    return response.data;
  },

  /**
   * Update faq by identifier
   */
  update: async (identifier: string, data: Partial<Faq>): Promise<Faq> => {
    const response = await axios.put<Faq>(`/faqs/${identifier}`, data);
    return response.data;
  },
};
