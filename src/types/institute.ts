/**
 * Institute Entities
 * Institute core entities - institutes, branches, and facilities
 */

import { InstituteType, OwnershipType, SubscriptionTier } from './enums';

/**
 * Institute - Primary entity representing a coaching institute brand
 */
export interface Institute {
  identifier: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  foundedYear: number;
  logoUrl: string;
  bannerUrl: string;
  websiteUrl: string;
  email: string;
  phonePrimary: string;
  whatsappNumber: string;
  type: InstituteType;
  ownershipType: OwnershipType;
  isFranchise: boolean;
  parentInstituteIdentifier: string | null;
  averageRating: number | string;
  totalReviews: number;
  totalStudentsEnrolled: number;
  yearsOfExperience: number;
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  subscriptionTier: SubscriptionTier;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Branch - Physical/online locations of an institute
 */
export interface Branch {
  identifier: string;
  instituteIdentifier: string;
  name: string;
  isMainBranch: boolean;
  isOnlineOnly: boolean;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  cityIdentifier: string;
  cityName: string;
  state: string;
  pincode: string;
  latitude: number | string;
  longitude: number | string;
  googleMapsUrl: string;
  phone: string;
  email: string;
  totalAreaSqft: number;
  totalClassrooms: number;
  seatingCapacity: number;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  operatingDays: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * InstituteFacility - Infrastructure/amenities offered by institute
 */
export interface InstituteFacility {
  identifier: string;
  instituteIdentifier: string;
  hasLibrary: boolean;
  hasHostel: boolean;
  hasCanteen: boolean;
  hasTransport: boolean;
  hasAcClassrooms: boolean;
  hasDigitalBoards: boolean;
  hasLaboratory: boolean;
  hasStudyRoom: boolean;
  hasWifi: boolean;
  hasCctv: boolean;
  hasOnlinePortal: boolean;
  hasDoubtSessions: boolean;
  hasMockTestSeries: boolean;
  hasStudyMaterial: boolean;
  hasCrashCourses: boolean;
  hasScholarshipProgram: boolean;
  hasFreeDemoClass: boolean;
  hasParentTeacherMeetings: boolean;
  hasPerformanceTracking: boolean;
  studentToTeacherRatio: string;
  notes: string;
  updatedAt: string;
}
