import axios from '../axios-helper';
import type { FeaturedPurchase } from '@/types';

export interface BuyFeaturedPayload {
  instituteIdentifier: string;
}

export const featuredPurchasesApi = {
  create: async (data: BuyFeaturedPayload): Promise<FeaturedPurchase> => {
    const response = await axios.post<FeaturedPurchase>('/featured-purchases', data);
    return response.data;
  },

  getByInstitute: async (instituteId: string): Promise<FeaturedPurchase[]> => {
    const response = await axios.get<FeaturedPurchase[]>(`/featured-purchases/institute/${instituteId}`);
    return response.data;
  },
};
