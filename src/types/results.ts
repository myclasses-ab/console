/**
 * Results Entities
 * Results & achievements - student results and awards
 */

import { RankOrScoreType } from './enums';

/**
 * Result - Documented exam results/selections by students
 */
export interface Result {
  identifier: string;
  instituteIdentifier: string;
  examTypeIdentifier: string;
  examYear: number;
  studentName: string;
  studentPhotoUrl: string;
  rankOrScoreType: RankOrScoreType;
  value: string;
  collegeAdmitted: string;
  testimonialQuote: string;
  isVerified: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
}

/**
 * AwardAndRecognition - External awards and certifications
 */
export interface AwardAndRecognition {
  identifier: string;
  instituteIdentifier: string;
  title: string;
  issuingBody: string;
  year: number;
  description: string;
  certificateUrl: string;
  isVerified: boolean;
  displayOrder: number;
  createdAt: string;
}
