/**
 * Leads Entity
 * Leads & inquiries - users who have searched/visited institutes
 * In this model: User IS the Lead
 */

import type { InquirySource, InquiryStatus, LeadDistributionStatus } from './enums';

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
}

export interface LeadDistribution {
  identifier: string;
  /** User (lead) identifier */
  userIdentifier: string;
  /** User name cached at distribution time */
  userName: string | null;
  /** User phone cached at distribution time */
  userPhone: string | null;
  /** Institute receiving the lead */
  instituteIdentifier: string;
  /** Super admin who distributed */
  distributedBy: string | null;
  distributedAt: string | null;
  status: LeadDistributionStatus;
  notes: string | null;
  instituteNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadRequest {
  identifier: string;
  instituteIdentifier: string;
  examTypeIdentifier: string;
  quantity: number;
  totalCost: number;
  status: string;
  notes: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}
