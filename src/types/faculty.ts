/**
 * Faculty Entity
 * Teachers and educators at an institute
 */

export interface Faculty {
  identifier: string;
  instituteIdentifier: string;
  name: string;
  photoUrl: string;
  subject: string;
  qualification: string;
  experienceYears: number;
  displayOrder: number;
  createdAt: string;
  subjectIdentifiers: string[];
  examTypeIdentifiers: string[];
}
