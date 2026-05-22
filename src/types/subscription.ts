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
