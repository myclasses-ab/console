/**
 * API Index
 * Export all API modules and axios helper
 */

// Axios Helper
export { default as axios } from './axios-helper';

// Auth
export { authApi, type LoginRequest, type RegisterRequest, type SignupRequest, type AuthResponse } from './auth';

// Upload
export { uploadApi } from './upload';

// Health
export { healthApi, type HealthStatus } from './health';

// Master
export { cityApi } from './master/city';
export { examTypeApi } from './master/exam-type';
export { streamApi } from './master/stream';
export { subjectApi } from './master/subject';

// Institute
export { instituteApi } from './institute/institute';
export { branchApi } from './institute/branch';
export { instituteFacilityApi } from './institute/institute-facility';

// Course
export { instituteCourseApi } from './course/institute-course';

// Faculty
export { facultyApi } from './faculty/faculty';

// Results
export { resultApi } from './results/result';
export { awardAndRecognitionApi } from './results/award-and-recognition';

// Reviews
export { reviewApi } from './reviews/review';
export { reviewVoteApi } from './reviews/review-vote';
export { instituteResponseApi } from './reviews/institute-response';

// Users
export { userApi } from './users/user';
export { bookmarkApi } from './users/bookmark';
export { userInstituteAssociationApi } from './users/user-institute-association';

// Leads
export { inquiryApi } from './leads/inquiry';

// Media
export { mediaApi } from './media/media';

// Subscription
export { subscriptionPlanApi } from './subscription/subscription-plan';
export { instituteSubscriptionApi } from './subscription/institute-subscription';
export { creditsApi } from './subscription/credits';
export { featuredPurchasesApi, type BuyFeaturedPayload } from './subscription/featured-purchases';
export { creditTopUpsApi, type CreateCreditTopUpPayload } from './subscription/credit-top-ups';

// Notification
export { notificationApi } from './notification/notification';
export { faqApi } from './notification/faq';
