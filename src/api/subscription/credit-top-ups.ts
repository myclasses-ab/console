import axios from '../axios-helper';
import type { CreditTopUpRequest } from '@/types';

export interface CreateCreditTopUpPayload {
  instituteIdentifier: string;
  requestedCredits: number;
  transactionIdLast6: string;
}

export const creditTopUpsApi = {
  create: async (data: CreateCreditTopUpPayload): Promise<CreditTopUpRequest> => {
    const response = await axios.post<CreditTopUpRequest>('/credit-top-ups', data);
    return response.data;
  },

  getByInstitute: async (instituteId: string): Promise<CreditTopUpRequest[]> => {
    const response = await axios.get<CreditTopUpRequest[]>(`/credit-top-ups/institute/${instituteId}`);
    return response.data;
  },
};
