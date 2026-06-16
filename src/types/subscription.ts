/**
 * Subscription Entities
 * Subscription management - plans and institute subscriptions
 */

import { SubscriptionTier } from './enums';

/**
 * SubscriptionPlan - Platform tier definitions
 */
export interface SubscriptionPlan {
  identifier: string;
  name: SubscriptionTier;
  priceMonthly: number | string;
  priceYearly: number | string;
  maxBranches: number;
  maxCourses: number;
  maxFaculty: number;
  maxMediaUploads: number;
  canRespondToReviews: boolean;
  canViewLeads: boolean;
  canFeatureResults: boolean;
  priorityInSearch: number;
  badgeShown: string;
  isActive: boolean;
}

/**
 * InstituteSubscription - Active subscription for each institute
 */
export interface InstituteSubscription {
  identifier: string;
  instituteIdentifier: string;
  planIdentifier: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  paymentReference: string;
  createdAt: string;
}

export interface InstituteCredit {
  identifier: string;
  instituteIdentifier: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  identifier: string;
  instituteIdentifier: string;
  amount: number;
  type: string;
  description: string;
  referenceIdentifier: string;
  createdAt: string;
}

export interface FeaturedPurchase {
  identifier: string;
  instituteIdentifier: string;
  cost: number;
  durationDays: number;
  status: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTopUpRequest {
  identifier: string;
  instituteIdentifier: string;
  requestedCredits: number;
  amountInRupees: number;
  transactionIdLast6: string;
  status: string;
  approvedBy: string;
  approvedAt: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}
