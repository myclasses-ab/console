/**
 * Reviews Entities
 * Reviews & ratings - reviews, votes, and institute responses
 */

import { ReviewStatus, VoteType, Standard } from './enums';

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
  pros: string;
  cons: string;
  overallRating: number | string;
  facultyRating: number | string;
  studyMaterialRating: number | string;
  infrastructureRating: number | string;
  feeValueRating: number | string;
  onlineSupportRating: number | string;
  resultAchievementRating: number | string;
  wouldRecommend: boolean;
  status: ReviewStatus;
  adminNotes: string;
  helpfulCount: number;
  reportedCount: number;
  isVerifiedStudent: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * ReviewVote - Like/dislike votes on reviews
 */
export interface ReviewVote {
  identifier: string;
  reviewIdentifier: string;
  userIdentifier: string;
  vote: VoteType;
  createdAt: string;
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
