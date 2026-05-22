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
  bio: string;
  specialization: string;
  iitIimBackground: boolean;
  nitBackground: boolean;
  achievements: string;
  formerInstitutes: string;
  studentRating: number | string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  subjectIdentifiers: string[];
  examTypeIdentifiers: string[];
}
