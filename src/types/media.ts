/**
 * Media Entity
 * Photos, videos, documents uploaded by institutes
 */

import { MediaEntityType, MediaType } from './enums';

export interface Media {
  identifier: string;
  instituteIdentifier: string;
  branchIdentifier: string | null;
  entityType: MediaEntityType;
  mediaType: MediaType;
  url: string;
  thumbnailUrl: string;
  caption: string;
  altText: string;
  isFeatured: boolean;
  displayOrder: number;
  fileSizeKb: number;
  uploadedBy: string;
  createdAt: string;
}
