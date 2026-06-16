import axios from '../axios-helper';
import type { LeadRequest } from '@/types';

export interface CreateLeadRequestPayload {
  instituteIdentifier: string;
  examTypeIdentifier: string;
  quantity: number;
  notes: string;
}

export const leadRequestsApi = {
  create: async (data: CreateLeadRequestPayload): Promise<LeadRequest> => {
    const response = await axios.post<LeadRequest>('/lead-requests', data);
    return response.data;
  },

  getByInstitute: async (instituteId: string): Promise<LeadRequest[]> => {
    const response = await axios.get<LeadRequest[]>(`/lead-requests/institute/${instituteId}`);
    return response.data;
  },
};
