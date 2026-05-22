/**
 * Media API
 * Photos, videos, documents uploaded by institutes
 */

import axios from '../axios-helper';
import type { Media, MediaEntityType, MediaType } from '@/types';

export const mediaApi = {
  /**
   * Create a new media entry
   */
  create: async (media: Omit<Media, 'identifier'>): Promise<Media> => {
    const response = await axios.post<Media>('/media', media);
    return response.data;
  },

  /**
   * Get media by identifier
   */
  getById: async (identifier: string): Promise<Media> => {
    const response = await axios.get<Media>(`/media/${identifier}`);
    return response.data;
  },

  /**
   * Get all media
   */
  getAll: async (): Promise<Media[]> => {
    const response = await axios.get<Media[]>('/media');
    return response.data;
  },

  /**
   * Delete media by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/media/${identifier}`);
    return response.data;
  },

  /**
   * Find media by institute identifier
   */
  findByInstituteIdentifier: async (instituteIdentifier: string): Promise<Media[]> => {
    const response = await axios.get<Media[]>(`/media/institute/${instituteIdentifier}`);
    return response.data;
  },

  /**
   * Find media by branch identifier
   */
  findByBranchIdentifier: async (branchIdentifier: string): Promise<Media[]> => {
    const response = await axios.get<Media[]>(`/media/branch/${branchIdentifier}`);
    return response.data;
  },

  /**
   * Find media by entity type
   */
  findByEntityType: async (entityType: MediaEntityType): Promise<Media[]> => {
    const response = await axios.get<Media[]>(`/media/entity-type/${entityType}`);
    return response.data;
  },

  /**
   * Find media by media type
   */
  findByMediaType: async (mediaType: MediaType): Promise<Media[]> => {
    const response = await axios.get<Media[]>(`/media/media-type/${mediaType}`);
    return response.data;
  },

  /**
   * Find media by institute and entity type
   */
  findByInstituteIdentifierAndEntityType: async (
    instituteIdentifier: string,
    entityType: MediaEntityType
  ): Promise<Media[]> => {
    const response = await axios.get<Media[]>(
      `/media/institute/${instituteIdentifier}/entity-type/${entityType}`
    );
    return response.data;
  },

  /**
   * Find featured media
   */
  findByIsFeatured: async (): Promise<Media[]> => {
    const response = await axios.get<Media[]>('/media/featured');
    return response.data;
  },

  /**
   * Update media by identifier
   */
  update: async (identifier: string, data: Partial<Media>): Promise<Media> => {
    const response = await axios.put<Media>(`/media/${identifier}`, data);
    return response.data;
  },
};
