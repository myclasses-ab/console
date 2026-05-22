/**
 * Bookmark API
 * User bookmarks for institutes and courses
 */

import axios from '../axios-helper';
import type { Bookmark, BookmarkEntityType } from '@/types';

export const bookmarkApi = {
  /**
   * Create a new bookmark
   */
  create: async (bookmark: Omit<Bookmark, 'identifier'>): Promise<Bookmark> => {
    const response = await axios.post<Bookmark>('/bookmarks', bookmark);
    return response.data;
  },

  /**
   * Get bookmark by identifier
   */
  getById: async (identifier: string): Promise<Bookmark> => {
    const response = await axios.get<Bookmark>(`/bookmarks/${identifier}`);
    return response.data;
  },

  /**
   * Get all bookmarks
   */
  getAll: async (): Promise<Bookmark[]> => {
    const response = await axios.get<Bookmark[]>('/bookmarks');
    return response.data;
  },

  /**
   * Delete bookmark by identifier
   */
  delete: async (identifier: string): Promise<string> => {
    const response = await axios.delete<string>(`/bookmarks/${identifier}`);
    return response.data;
  },

  /**
   * Find bookmarks by user identifier
   */
  findByUserIdentifier: async (userIdentifier: string): Promise<Bookmark[]> => {
    const response = await axios.get<Bookmark[]>(`/bookmarks/user/${userIdentifier}`);
    return response.data;
  },

  /**
   * Find bookmarks by user and entity type
   */
  findByUserIdentifierAndEntityType: async (
    userIdentifier: string,
    entityType: BookmarkEntityType
  ): Promise<Bookmark[]> => {
    const response = await axios.get<Bookmark[]>(
      `/bookmarks/user/${userIdentifier}/entity-type/${entityType}`
    );
    return response.data;
  },

  /**
   * Find specific bookmark
   */
  findByUserIdentifierAndEntityTypeAndEntityIdentifier: async (
    userIdentifier: string,
    entityType: BookmarkEntityType,
    entityIdentifier: string
  ): Promise<Bookmark | null> => {
    const response = await axios.get<Bookmark | null>(
      `/bookmarks/user/${userIdentifier}/entity-type/${entityType}/entity/${entityIdentifier}`
    );
    return response.data;
  },

  /**
   * Check if bookmark exists
   */
  existsByUserIdentifierAndEntityTypeAndEntityIdentifier: async (
    userIdentifier: string,
    entityType: BookmarkEntityType,
    entityIdentifier: string
  ): Promise<boolean> => {
    const response = await axios.get<boolean>(
      `/bookmarks/exists/user/${userIdentifier}/entity-type/${entityType}/entity/${entityIdentifier}`
    );
    return response.data;
  },

  /**
   * Update bookmark by identifier
   */
  update: async (identifier: string, data: Partial<Bookmark>): Promise<Bookmark> => {
    const response = await axios.put<Bookmark>(`/bookmarks/${identifier}`, data);
    return response.data;
  },
};
