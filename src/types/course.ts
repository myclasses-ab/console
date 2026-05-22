/**
 * InstituteCourse - Institute's specific course offering
 */
export interface InstituteCourse {
  identifier: string;
  instituteIdentifier: string;
  branchIdentifier: string | null;
  customName: string;
  feeMin: number | string;
  feeMax: number | string;
  feeDescription: string;
  scholarshipAvailable: boolean;
  scholarshipDetails: string;
  durationMonths: number;
  studyMaterialIncluded: boolean;
  testSeriesIncluded: boolean;
  onlineClassesAvailable: boolean;
  recordedLecturesAvailable: boolean;
  isActive: boolean;
  admissionOpen: boolean;
  createdAt: string;
  updatedAt: string;
}


