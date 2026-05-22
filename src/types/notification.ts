/**
 * Notification & FAQ Entities
 * Platform notifications and institute FAQs
 */

import { NotificationType } from './enums';

/**
 * Notification - Platform notifications for users
 */
export interface Notification {
  identifier: string;
  userIdentifier: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType: string;
  entityIdentifier: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Faq - Frequently asked questions for an institute
 */
export interface Faq {
  identifier: string;
  instituteIdentifier: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}
