/**
 * Review Vote API
 * Like/dislike votes on reviews
 */

import axios from '../axios-helper';
import type { ReviewVote, VoteType } from '@/types';

export const reviewVoteApi = {
  /**
   * Create a new review vote
   */
  create: async (reviewVote: Omit<ReviewVote, 'identifier'>): Promise<ReviewVote> => {
    const response = await axios.post<ReviewVote>('/review-votes', reviewVote);
    return response.data;
  },

  /**
   * Get review vote by identifier
   */
  getById: async (identifier: string): Promise<ReviewVote> => {
    const response = await axios.get<ReviewVote>(`/review-votes/${identifier}`);
    return response.data;
  },

  /**
   * Get all review votes
   */
  getAll: async (): Promise<ReviewVote[]> => {
    const response = await axios.get<ReviewVote[]>('/review-votes');
    return response.data;
  },

  /**
   * Delete review vote by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/review-votes/${identifier}`);
    return response.data;
  },

  /**
   * Find review votes by review identifier
   */
  findByReviewIdentifier: async (reviewIdentifier: string): Promise<ReviewVote[]> => {
    const response = await axios.get<ReviewVote[]>(`/review-votes/review/${reviewIdentifier}`);
    return response.data;
  },

  /**
   * Find review votes by user identifier
   */
  findByUserIdentifier: async (userIdentifier: string): Promise<ReviewVote[]> => {
    const response = await axios.get<ReviewVote[]>(`/review-votes/user/${userIdentifier}`);
    return response.data;
  },

  /**
   * Find review vote by review and user
   */
  findByReviewIdentifierAndUserIdentifier: async (
    reviewIdentifier: string,
    userIdentifier: string
  ): Promise<ReviewVote | null> => {
    const response = await axios.get<ReviewVote | null>(
      `/review-votes/review/${reviewIdentifier}/user/${userIdentifier}`
    );
    return response.data;
  },

  /**
   * Find review votes by vote type
   */
  findByVote: async (vote: VoteType): Promise<ReviewVote[]> => {
    const response = await axios.get<ReviewVote[]>(`/review-votes/vote/${vote}`);
    return response.data;
  },

  /**
   * Update reviewvote by identifier
   */
  update: async (identifier: string, data: Partial<ReviewVote>): Promise<ReviewVote> => {
    const response = await axios.put<ReviewVote>(`/review-votes/${identifier}`, data);
    return response.data;
  },
};
