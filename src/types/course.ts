/**
 * InstituteCourse - Institute's specific course offering
 */
export interface InstituteCourse {
  identifier: string;
  instituteIdentifier: string;
  branchIdentifier: string | null;
  customName: string;
  fee: number | string;
  scholarshipAvailable: boolean;
  scholarshipDetails: string;
  durationMonths: number;
  studyMaterialIncluded: boolean;
  testSeriesIncluded: boolean;
  recordedLecturesAvailable: boolean;
  admissionOpen: boolean;
  createdAt: string;
  updatedAt: string;
}


