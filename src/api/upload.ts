/**
 * File Upload API
 * Upload files to S3 via dedicated endpoints
 */

import axios from './axios-helper';

export const uploadApi = {
  /**
   * Upload institute logo
   * @param file - The image file
   * @param instituteIdentifier - Institute identifier for deterministic naming
   * @param oldLogoUrl - Optional previous logo URL/key to delete before upload (for replacement)
   * @returns Object with key (S3 object key) and fileName
   */
  uploadLogo: async (
    file: File, 
    instituteIdentifier: string, 
    oldLogoUrl?: string | null
  ): Promise<{ key: string; url: string; fileName: string; folder: string; resourceId: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('instituteIdentifier', instituteIdentifier);
    if (oldLogoUrl) {
      formData.append('oldLogoUrl', oldLogoUrl);
    }

    const response = await axios.post('/upload/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Upload institute banner
   * @param file - The image file
   * @param instituteIdentifier - Institute identifier for deterministic naming
   * @param oldBannerUrl - Optional previous banner URL/key to delete before upload (for replacement)
   * @returns Object with key (S3 object key) and fileName
   */
  uploadBanner: async (
    file: File, 
    instituteIdentifier: string, 
    oldBannerUrl?: string | null
  ): Promise<{ key: string; url: string; fileName: string; folder: string; resourceId: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('instituteIdentifier', instituteIdentifier);
    if (oldBannerUrl) {
      formData.append('oldBannerUrl', oldBannerUrl);
    }

    const response = await axios.post('/upload/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Upload faculty image
   * @param file - The image file
   * @param facultyIdentifier - Faculty identifier for deterministic naming
   * @param oldImageUrl - Optional previous image URL/key to delete before upload (for replacement)
   * @returns Object with key (S3 object key) and fileName
   */
  uploadFacultyImage: async (
    file: File, 
    facultyIdentifier: string, 
    oldImageUrl?: string | null
  ): Promise<{ key: string; url: string; fileName: string; folder: string; resourceId: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('facultyIdentifier', facultyIdentifier);
    if (oldImageUrl) {
      formData.append('oldImageUrl', oldImageUrl);
    }

    const response = await axios.post('/upload/faculty', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Generic upload (fallback for other media types)
   * @param file - The file to upload
   * @param folder - S3 folder name
   * @param resourceId - Optional resource identifier for deterministic object naming
   * @param oldFileUrl - Optional previous file URL/key to delete before upload (for replacement)
   * @returns Object with key (S3 object key) and fileName
   */
  upload: async (
    file: File, 
    folder: string, 
    resourceId?: string, 
    oldFileUrl?: string | null
  ): Promise<{ key: string; url: string; fileName: string; folder: string; resourceId?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    if (resourceId) {
      formData.append('resourceId', resourceId);
    }
    if (oldFileUrl) {
      formData.append('oldFileUrl', oldFileUrl);
    }

    const response = await axios.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Delete a file from S3 by its URL
   * @param url - The full S3 URL of the file to delete
   */
  deleteFile: async (url: string): Promise<{ message: string }> => {
    const response = await axios.delete('/upload', {
      params: { url },
    });
    return response.data;
  },

  /**
   * Get the expected S3 URL for a resource without uploading
   * Useful for checking if a file exists or for preview purposes
   * @param folder - S3 folder name
   * @param resourceId - Resource identifier
   * @param extension - File extension (default: .png)
   * @returns Object with objectKey, url, and exists flag
   */
  getExpectedUrl: async (
    folder: string, 
    resourceId: string, 
    extension?: string
  ): Promise<{ objectKey: string; url: string; exists: boolean }> => {
    const params: Record<string, string> = { folder, resourceId };
    if (extension) {
      params.extension = extension;
    }
    
    const response = await axios.get('/upload/url', { params });
    return response.data;
  },
};
