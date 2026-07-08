/**
 * Reviews Entities
 * Reviews & ratings - reviews and institute responses
 */

import { Standard } from './enums';

/**
 * Review - Student/parent reviews of institutes
 */
export interface Review {
  identifier: string;
  instituteIdentifier: string;
  userIdentifier: string;
  courseTaken: string;
  standardWhenEnrolled: Standard;
  reviewTitle: string;
  reviewText: string;
  pros?: string;
  cons?: string;
  overallRating: number | string;
  facultyRating: number | string;
  studyMaterialRating: number | string;
  infrastructureRating: number | string;
  feeValueRating: number | string;
  onlineSupportRating: number | string;
  resultAchievementRating: number | string;
  wouldRecommend?: boolean;
  helpfulCount?: number;
  isVerifiedStudent?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * InstituteResponse - Institute's official response to a review
 */
export interface InstituteResponse {
  identifier: string;
  reviewIdentifier: string;
  instituteIdentifier: string;
  responseText: string;
  respondedBy: string;
  createdAt: string;
  updatedAt: string;
}
