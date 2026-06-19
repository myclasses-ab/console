/**
 * Leads Entity
 * Contact and admission inquiries from users
 * In this model: Inquiry is the lead
 */

import type { InquirySource, InquiryStatus } from './enums';

export interface Inquiry {
  identifier: string;
  instituteIdentifier: string;
  branchIdentifier: string | null;
  courseIdentifier: string | null;
  userIdentifier: string | null;
  name: string;
  email: string;
  phone: string;
  standard: string;
  targetExam: string | null;
  message: string | null;
  source: InquirySource;
  status: InquiryStatus;
  assignedTo: string | null;
  instituteNotes: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
  updatedAt: string;

  // Fields returned for institute-scoped inquiry responses
  studentName?: string;
  studentPhone?: string;
  courseName?: string;
  contactUnlocked?: boolean;
  unlockedAt?: string | null;
  unlockedBy?: string | null;
}
