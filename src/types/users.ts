/**
 * Users Entities
 * User management - users, associations, and bookmarks
 */

import { UserRole, Standard, InstituteStaffRole, BookmarkEntityType } from './enums';

/**
 * User - All platform users (students, parents, institute staff, admins)
 */
export interface User {
  identifier: string;
  fullName: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  passwordHash: string;
  avatarUrl: string;
  role: UserRole;
  currentStandard: Standard;
  targetExamIdentifiers: string[];
  cityIdentifier: string;
  state: string;
  pincode: string;
  schoolCollegeName: string;
  preferredLanguage: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * UserInstituteAssociation - Links institute admins/staff to their institutes
 */
export interface UserInstituteAssociation {
  identifier: string;
  userIdentifier: string;
  instituteIdentifier: string;
  role: InstituteStaffRole;
  isActive: boolean;
  createdAt: string;
}

/**
 * Bookmark - Users saving institutes or courses
 */
export interface Bookmark {
  identifier: string;
  userIdentifier: string;
  entityType: BookmarkEntityType;
  entityIdentifier: string;
  createdAt: string;
}
