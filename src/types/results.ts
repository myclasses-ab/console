/**
 * Results Entities
 * Results & achievements - student results
 */

/**
 * Result - Documented exam results/selections by students
 */
export interface Result {
  identifier: string;
  instituteIdentifier: string;
  exam: string;
  studentName: string;
  studentPhotoUrl: string;
  value: string;
  testimonialQuote: string;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
}

