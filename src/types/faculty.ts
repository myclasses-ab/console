/**
 * Faculty Entity
 * Teachers and educators at an institute
 */

export interface Faculty {
  identifier: string;
  instituteIdentifier: string;
  name: string;
  photoUrl: string;
  designation: string;
  qualification: string;
  experienceYears: number;
  studentRating: number | string;
  displayOrder: number;
  createdAt: string;
  subjectIdentifiers: string[];
  examTypeIdentifiers: string[];
}
