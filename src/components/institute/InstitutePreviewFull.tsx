'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Eye,
  Info,
  BookOpen,
  Users,
  Trophy,
  MessageSquare,
  HelpCircle,
  Building2,
  CheckCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  Calendar,
  Award,
  TrendingUp,
  Shield,
  Sparkles,
  Filter,
  ChevronRight,
  ChevronLeft,
  Home,
  Utensils,
  Bus,
  Wind,
  Monitor,
  FlaskConical,
  BookMarked,
  Wifi,
  Video,
  GraduationCap,
  ClipboardCheck,
  Layers,
  Zap,
  PenSquare,
  ThumbsUp,
  ThumbsDown,
  Flag,
  FileText,
  Share2,
  Bookmark,
  AlertCircle,
} from 'lucide-react';
import { instituteLogoUrl, instituteBannerUrl, facultyImageUrl } from '@/lib/image-url';
import {
  branchApi,
  instituteFacilityApi,
  instituteCourseApi,
  facultyApi,
  resultApi,
  reviewApi,
  faqApi,
  instituteResponseApi,
} from '@/api';
import type {
  Branch,
  InstituteFacility,
  InstituteCourse,
  Faculty,
  Result,
  Review,
  Faq,
  InstituteResponse,
  Institute,
} from '@/types';
import EmptyState from '@/components/shared/EmptyState';

/* ───────────────────────────────
   Types
   ─────────────────────────────── */

type TabType = 'overview' | 'courses' | 'faculty' | 'results' | 'reviews' | 'faqs';

interface InstitutePreviewFullProps {
  institute: Institute;
  onClose: () => void;
}

/* ───────────────────────────────
   Tab Config
   ─────────────────────────────── */

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'faculty', label: 'Faculty', icon: Users },
  { id: 'results', label: 'Results', icon: Trophy },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
];

/* ───────────────────────────────
   Helpers
   ─────────────────────────────── */

function formatNumber(num: number | null | undefined): string {
  if (num == null) return '0';
  if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function getPlaceholderImage(): string {
  return '/assets/sample_image_for_anything.png';
}

/* ───────────────────────────────
   Tab Navigation
   ─────────────────────────────── */

function TabNavigation({ activeTab, onTabChange }: { activeTab: TabType; onTabChange: (t: TabType) => void }) {
  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                {isActive && (
                  <motion.div
                    layoutId="previewActiveTab"
                    className="absolute inset-0 bg-primary-50 rounded-lg -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/* ───────────────────────────────
   Hero Section
   ─────────────────────────────── */

function InstituteHero({ institute }: { institute: Institute }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const {
    name,
    tagline,
    logoUrl,
    bannerUrl,
    averageRating,
    totalReviews,
    totalStudentsEnrolled,
    yearsOfExperience,
    foundedYear,
    isVerified,
    isFeatured,
    subscriptionTier,
  } = institute;

  const banner = instituteBannerUrl(bannerUrl) || getPlaceholderImage();
  const logo = instituteLogoUrl(logoUrl) || getPlaceholderImage();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch {
      // ignore
    }
  };

  const getTierBadge = () => {
    if (subscriptionTier === 'FEATURED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-lg">
          <Award className="w-4 h-4" />
          Featured
        </span>
      );
    }
    return null;
  };

  return (
    <div className="relative">
      <div className="relative h-48 sm:h-64 lg:h-80">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80 z-10" />
        <img
          src={banner}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getPlaceholderImage();
          }}
        />

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2.5 backdrop-blur-md rounded-full transition-colors ${
              isBookmarked
                ? 'bg-amber-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            aria-label="Bookmark"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Share Toast */}
        <AnimatePresence>
          {showShareToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-16 right-4 z-30 px-4 py-2 bg-green-500 text-white text-sm rounded-lg shadow-lg"
            >
              Link copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center p-4 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg w-fit">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl bg-white shadow-xl p-2 flex items-center justify-center mx-auto sm:mx-0">
                  <img
                    src={logo}
                    alt={name}
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getPlaceholderImage();
                    }}
                  />
                </div>
              </motion.div>

              <div className="flex-1 min-w-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                    {getTierBadge()}
                    {isVerified && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-green-500 text-white rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    )}
                    {isFeatured && subscriptionTier !== 'FEATURED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-amber-500 text-white rounded-full">
                        <Award className="w-4 h-4" />
                        Featured
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 text-center sm:text-left">
                    {name || 'Institute Name'}
                  </h1>

                  {tagline && (
                    <p className="text-base sm:text-lg text-white/90 font-medium text-center sm:text-left">
                      {tagline}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-white">{Number(averageRating || 0).toFixed(1)}</span>
                      <span className="text-white/70 text-sm">({totalReviews || 0} reviews)</span>
                    </div>
                    {yearsOfExperience > 0 && (
                      <div className="flex items-center gap-1.5 text-white/80 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{yearsOfExperience}+ years of excellence</span>
                      </div>
                    )}
                    {totalStudentsEnrolled > 0 && (
                      <div className="flex items-center gap-1.5 text-white/80 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{formatNumber(totalStudentsEnrolled)}+ students</span>
                      </div>
                    )}
                    {foundedYear > 0 && (
                      <div className="flex items-center gap-1.5 text-white/80 text-sm">
                        <span>Since {foundedYear}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ───────────────────────────────
   Facilities
   ─────────────────────────────── */

const facilityConfig: Record<string, { icon: React.ElementType; label: string }> = {
  hasLibrary: { icon: BookOpen, label: 'Library' },
  hasHostel: { icon: Home, label: 'Hostel' },
  hasCanteen: { icon: Utensils, label: 'Canteen' },
  hasTransport: { icon: Bus, label: 'Transport' },
  hasAcClassrooms: { icon: Wind, label: 'AC Classrooms' },
  hasDigitalBoards: { icon: Monitor, label: 'Digital Boards' },
  hasLaboratory: { icon: FlaskConical, label: 'Laboratory' },
  hasStudyRoom: { icon: BookMarked, label: 'Study Room' },
  hasWifi: { icon: Wifi, label: 'WiFi' },
  hasCctv: { icon: Video, label: 'CCTV' },
  hasOnlinePortal: { icon: GraduationCap, label: 'Online Portal' },
  hasDoubtSessions: { icon: ClipboardCheck, label: 'Doubt Sessions' },
  hasMockTestSeries: { icon: Layers, label: 'Mock Tests' },
  hasStudyMaterial: { icon: BookOpen, label: 'Study Material' },
  hasCrashCourses: { icon: Zap, label: 'Crash Courses' },
  hasScholarshipProgram: { icon: Award, label: 'Scholarships' },
  hasFreeDemoClass: { icon: Users, label: 'Free Demo' },
  hasParentTeacherMeetings: { icon: Calendar, label: 'PTM' },
  hasPerformanceTracking: { icon: TrendingUp, label: 'Performance Tracking' },
};

function InstituteFacilities({ facility }: { facility: InstituteFacility | null }) {
  if (!facility) {
    return (
      <div className="bg-slate-50 rounded-2xl p-6 text-center">
        <p className="text-slate-500">Facility information not available</p>
      </div>
    );
  }

  const availableFacilities = Object.entries(facilityConfig).filter(
    ([key]) => facility[key as keyof InstituteFacility] === true
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {availableFacilities.map(([key, config], index) => {
          const Icon = config.icon;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-primary-200 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">{config.label}</span>
            </motion.div>
          );
        })}
      </div>

      {facility.notes && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-primary-50 rounded-xl p-4 border border-primary-100"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <p className="text-slate-700 text-sm leading-relaxed">{facility.notes}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ───────────────────────────────
   Branches
   ─────────────────────────────── */

function InstituteBranches({ branches }: { branches: Branch[] }) {
  if (!branches || branches.length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl p-8 text-center">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600">No branch information available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {branches.map((branch, index) => (
        <motion.div
          key={branch.identifier}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{branch.name}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-sm text-slate-600">
                      {(branch.serviceCities && branch.serviceCities.length > 0
                        ? branch.serviceCities[0]
                        : branch.cityName) || '-'}
                      , {branch.state}
                    </span>
                    {branch.serviceCities && branch.serviceCities.length > 1 && (
                      <>
                        {branch.serviceCities.slice(1).map((city) => (
                          <span
                            key={city}
                            className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs"
                          >
                            {city}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {branch.isMainBranch && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Main Branch
                  </span>
                )}
                {branch.isOnlineOnly && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
                    Online Only
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Address</p>
                  <p className="text-slate-800 font-medium">{branch.address}</p>
                  {branch.landmark && (
                    <p className="text-sm text-slate-500 mt-1">Landmark: {branch.landmark}</p>
                  )}
                  <p className="text-slate-700 mt-2">
                    {(branch.serviceCities && branch.serviceCities.length > 0
                      ? branch.serviceCities[0]
                      : branch.cityName) || '-'}
                    , {branch.state} - {branch.pincode}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {branch.phone && (
                  <a
                    href={`tel:${branch.phone}`}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-slate-700">{branch.phone}</span>
                  </a>
                )}
                {branch.email && (
                  <a
                    href={`mailto:${branch.email}`}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-slate-700">{branch.email}</span>
                  </a>
                )}
                {(branch.operatingHoursStart || branch.operatingDays) && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {branch.operatingHoursStart && branch.operatingHoursEnd
                          ? `${formatTime(branch.operatingHoursStart)} - ${formatTime(branch.operatingHoursEnd)}`
                          : 'Contact for timings'}
                      </span>
                    </div>
                    {branch.operatingDays && (
                      <p className="text-sm text-slate-500 ml-6 mt-1">{branch.operatingDays}</p>
                    )}
                  </div>
                )}
                {branch.googleMapsUrl && (
                  <a
                    href={branch.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────────────────────────
   Overview Tab
   ─────────────────────────────── */

function OverviewTab({
  institute,
  facility,
  branches,
}: {
  institute: Institute;
  facility: InstituteFacility | null;
  branches: Branch[];
}) {
  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-600" />
          About Institute
        </h2>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">
            {institute.description || 'No description available.'}
          </p>
        </div>
      </motion.section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary-600" />
          Facilities & Amenities
        </h2>
        <InstituteFacilities facility={facility} />
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-600" />
          Branch Locations
        </h2>
        <InstituteBranches branches={branches} />
      </section>
    </div>
  );
}

/* ───────────────────────────────
   Course Curriculum / Features
   ─────────────────────────────── */

function CourseCurriculum({
  features,
}: {
  features?: {
    studyMaterialIncluded?: boolean;
    testSeriesIncluded?: boolean;
    recordedLecturesAvailable?: boolean;
  };
}) {
  if (!features) return null;

  const featureList = [
    { key: 'studyMaterialIncluded', label: 'Study Material', icon: BookOpen, color: 'green' },
    { key: 'testSeriesIncluded', label: 'Test Series', icon: FileText, color: 'blue' },
    { key: 'recordedLecturesAvailable', label: 'Recorded', icon: Clock, color: 'amber' },
  ] as const;

  const activeFeatures = featureList.filter((f) => features[f.key as keyof typeof features]);

  const colorClasses: Record<string, string> = {
    green: 'bg-green-50 text-green-700 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
      {activeFeatures.map((feature) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.key}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs ${colorClasses[feature.color]}`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium truncate">{feature.label}</span>
          </div>
        );
      })}
    </motion.div>
  );
}

/* ───────────────────────────────
   Course Card
   ─────────────────────────────── */

function CourseCardSimple({
  course,
  index,
}: {
  course: InstituteCourse;
  index: number;
}) {
  const displayName = course.courseName || 'Course';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col h-full"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 leading-tight">{displayName}</h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {course.admissionOpen && (
              <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full font-medium">Open</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 mb-4">
        <CourseCurriculum
          features={{
            studyMaterialIncluded: course.studyMaterialIncluded,
            testSeriesIncluded: course.testSeriesIncluded,
            recordedLecturesAvailable: course.recordedLecturesAvailable,
          }}
        />

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-baseline gap-2">
            {course.fee ? (
              <>
                <span className="text-2xl font-bold text-slate-900">₹{Number(course.fee).toLocaleString()}</span>
                {course.durationMonths > 0 && (
                  <span className="text-xs text-slate-400 ml-1">/ {course.durationMonths} months</span>
                )}
              </>
            ) : (
              <span className="text-lg font-medium text-slate-500">Contact for fee details</span>
            )}
          </div>

          {course.scholarshipAvailable && (
            <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Scholarship Available</p>
                {course.scholarshipDetails && (
                  <p className="text-xs text-amber-700 mt-0.5">{course.scholarshipDetails}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => alert('This is a preview. Demo requests are not sent from here.')}
        className="w-full mt-auto pt-4 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors text-sm"
      >
        Book a Demo
      </button>
    </motion.div>
  );
}


/* ───────────────────────────────
   Courses Tab
   ─────────────────────────────── */

function CoursesTab({ instituteIdentifier }: { instituteIdentifier: string }) {
  const [courses, setCourses] = useState<InstituteCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await instituteCourseApi.findByInstituteIdentifier(instituteIdentifier);
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch courses'));
      } finally {
        setIsLoading(false);
      }
    };
    if (instituteIdentifier) fetchCourses();
  }, [instituteIdentifier]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-64 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={AlertCircle} title="Error" description="Failed to load courses. Please try again." />;
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses"
        description="No courses available at this institute yet."
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            Our Courses
          </h2>
          <p className="text-slate-600 mt-1">{courses.length} courses available</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          {courses.filter((c) => c.admissionOpen).length} Admissions Open
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course, index) => (
          <CourseCardSimple key={course.identifier} course={course} index={index} />
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────
   Faculty Tab
   ─────────────────────────────── */

function FacultyTab({ instituteIdentifier }: { instituteIdentifier: string }) {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setIsLoading(true);
        const data = await facultyApi.findByInstituteIdentifier(instituteIdentifier);
        data.sort((a, b) => a.displayOrder - b.displayOrder);
        setFaculty(data);
      } catch (err) {
        console.error('Failed to fetch faculty:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (instituteIdentifier) fetchFaculty();
  }, [instituteIdentifier]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (faculty.length === 0) {
    return <EmptyState icon={Users} title="No faculty" description="No faculty information available yet." />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2"
        >
          Meet Our Expert Faculty
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-600"
        >
          Learn from experienced educators dedicated to your success
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {faculty.map((f, index) => (
          <motion.div
            key={f.identifier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow text-center"
          >
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-slate-100 overflow-hidden">
              {f.photoUrl ? (
                <img
                  src={facultyImageUrl(f.photoUrl)}
                  alt={f.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getPlaceholderImage();
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-slate-900">{f.name}</h3>
            <p className="text-sm text-primary-600 font-medium mt-0.5">{f.subject}</p>
            {f.qualification && <p className="text-xs text-slate-500 mt-1">{f.qualification}</p>}
            {f.experienceYears > 0 && (
              <p className="text-xs text-slate-500 mt-1">{f.experienceYears}+ years experience</p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────
   Results - Carousel
   ─────────────────────────────── */

function ResultsCarousel({
  results,
}: {
  results: Result[];
}) {
  const featuredResults = results.filter((r) => r.isFeatured).length > 0 ? results.filter((r) => r.isFeatured) : results.slice(0, 5);
  const totalSlides = featuredResults.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  useEffect(() => {
    if (isAutoPlaying && totalSlides > 0) {
      autoPlayRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, currentIndex, totalSlides, nextSlide]);

  if (totalSlides === 0) return null;

  const currentResult = featuredResults[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
  };

  return (
    <div
      className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-2xl border border-amber-200 overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="absolute top-4 left-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-amber-700 shadow-sm">
          <Trophy className="w-4 h-4" />
          Featured Toppers
        </span>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-slate-600 shadow-sm">
          {currentIndex + 1} / {totalSlides}
        </span>
      </div>

      <div className="relative h-[320px] md:h-[280px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 p-6 md:p-8"
          >
            <div className="h-full flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="relative flex-shrink-0">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-amber-200 overflow-hidden bg-white shadow-lg">
                  <img
                    src={currentResult.studentPhotoUrl || getPlaceholderImage()}
                    alt={currentResult.studentName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getPlaceholderImage();
                    }}
                  />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{currentResult.studentName}</h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-lg font-bold rounded-full">
                    <Trophy className="w-5 h-5" />
                    Score {currentResult.value}
                  </span>
                  {currentResult.exam && (
                    <span className="text-sm text-slate-500">
                      {currentResult.exam}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-primary-600 hover:shadow-lg transition-all z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-primary-600 hover:shadow-lg transition-all z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {featuredResults.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'w-6 bg-amber-500' : 'w-2 bg-amber-300 hover:bg-amber-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}



/* ───────────────────────────────
   Result Card
   ─────────────────────────────── */

function ResultCard({ result, index }: { result: Result; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index || 0) * 0.05 }}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 group-hover:border-primary-300 transition-colors">
              <img
                src={result.studentPhotoUrl || getPlaceholderImage()}
                alt={result.studentName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getPlaceholderImage();
                }}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                {result.studentName}
              </h4>
              {result.isFeatured && (
                <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                  <Star className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-lg">
                <Trophy className="w-4 h-4" />
                Score {result.value}
              </span>
              {result.exam && <span className="text-xs text-slate-500">{result.exam}</span>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────
   Results Tab
   ─────────────────────────────── */

function ResultsTab({ instituteIdentifier }: { instituteIdentifier: string }) {
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const resultsData = await resultApi.findByInstituteIdentifier(instituteIdentifier).catch(() => [] as Result[]);
        setResults(resultsData);
      } catch (err) {
        console.error('Failed to fetch results:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (instituteIdentifier) fetchData();
  }, [instituteIdentifier]);

  const featuredResults = results.filter((r) => r.isFeatured);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return <EmptyState icon={Trophy} title="No results" description="No results available for this institute yet." />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary-600" />
            Results & Achievements
          </h2>
          <p className="text-slate-600 mt-1">Celebrating our students&apos; outstanding achievements</p>
        </div>
      </div>

      {featuredResults.length > 0 && <ResultsCarousel results={featuredResults} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((result, index) => (
          <ResultCard
            key={result.identifier}
            result={result}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────
   Rating Stars
   ─────────────────────────────── */

function RatingStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const rounded = Math.round(rating);
  const sizeClass = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${star <= rounded ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

/* ───────────────────────────────
   Review Stats
   ─────────────────────────────── */

function ReviewStats({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;

  const totalReviews = reviews.length;
  const averageOverall = reviews.reduce((sum, r) => sum + Number(r.overallRating), 0) / totalReviews;
  const averageFaculty =
    reviews.reduce((sum, r) => sum + (Number(r.facultyRating) || 0), 0) / totalReviews;
  const averageStudyMaterial =
    reviews.reduce((sum, r) => sum + (Number(r.studyMaterialRating) || 0), 0) / totalReviews;
  const averageInfrastructure =
    reviews.reduce((sum, r) => sum + (Number(r.infrastructureRating) || 0), 0) / totalReviews;
  const averageFeeValue =
    reviews.reduce((sum, r) => sum + (Number(r.feeValueRating) || 0), 0) / totalReviews;

  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const rating = Math.floor(Number(r.overallRating));
    if (rating >= 1 && rating <= 5) ratingCounts[rating]++;
  });

  const verifiedStudents = reviews.filter((r) => r.isVerifiedStudent).length;
  const wouldRecommend = reviews.filter((r) => r.wouldRecommend).length;
  const totalHelpful = reviews.reduce((sum, r) => sum + (r.helpfulCount || 0), 0);

  const categoryRatings = [
    { label: 'Faculty', rating: averageFaculty, icon: Users },
    { label: 'Study Material', rating: averageStudyMaterial, icon: TrendingUp },
    { label: 'Infrastructure', rating: averageInfrastructure, icon: Building2 },
    { label: 'Value for Money', rating: averageFeeValue, icon: ThumbsUp },
  ].filter((c) => c.rating > 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-baseline gap-2 justify-center md:justify-start">
              <span className="text-5xl font-bold text-slate-900">{averageOverall.toFixed(1)}</span>
              <span className="text-xl text-slate-500">/5</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              <RatingStars rating={averageOverall} size="md" />
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {categoryRatings.length > 0 && (
            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              {categoryRatings.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.label} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <Icon className="w-4 h-4 text-primary-600" />
                    <div>
                      <div className="text-xs text-slate-500">{category.label}</div>
                      <div className="text-sm font-semibold text-slate-900">{category.rating.toFixed(1)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Rating Breakdown</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingCounts[rating];
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-4">{rating}</span>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm text-slate-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-primary-600 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-xl font-bold">{verifiedStudents}</span>
          </div>
          <p className="text-xs text-slate-500">Verified Students</p>
        </div>
        <div className="text-center border-x border-slate-100">
          <div className="flex items-center justify-center gap-1.5 text-green-600 mb-1">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xl font-bold">{wouldRecommend}</span>
          </div>
          <p className="text-xs text-slate-500">Would Recommend</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-1">
            <Star className="w-4 h-4" />
            <span className="text-xl font-bold">{totalHelpful}</span>
          </div>
          <p className="text-xs text-slate-500">Helpful Votes</p>
        </div>
      </div>

      {wouldRecommend > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-800">Recommendation Rate</span>
            <span className="text-lg font-bold text-green-700">{Math.round((wouldRecommend / totalReviews) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(wouldRecommend / totalReviews) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full bg-green-500 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}


/* ───────────────────────────────
   Review Card
   ─────────────────────────────── */

function ReviewCard({
  review,
  index,
  response,
}: {
  review: Review;
  index?: number;
  response?: InstituteResponse | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResponse, setShowResponse] = useState(true);

  const {
    userIdentifier,
    courseTaken,
    reviewTitle,
    reviewText,
    pros,
    cons,
    overallRating,
    facultyRating,
    studyMaterialRating,
    infrastructureRating,
    feeValueRating,
    wouldRecommend,
    isVerifiedStudent,
    helpfulCount,
    createdAt,
  } = review;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const userInitials = userIdentifier ? userIdentifier.slice(0, 2).toUpperCase() : 'US';
  const isLongReview = reviewText && reviewText.length > 200;
  const displayText = isExpanded || !isLongReview ? reviewText : reviewText.slice(0, 200) + '...';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index || 0) * 0.05 }}
      className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white font-semibold text-sm">
            {userInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">Student</span>
              {isVerifiedStudent && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 rounded-lg">
            <span className="text-lg font-bold text-primary-600">{overallRating}</span>
            <span className="text-sm text-slate-500">/5</span>
          </div>
          <RatingStars rating={Number(overallRating)} size="sm" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
          <BookOpen className="w-3 h-3" />
          {courseTaken}
        </span>
        {wouldRecommend && (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Recommends
          </span>
        )}
      </div>

      {reviewTitle && <h4 className="font-semibold text-slate-900 mb-2">{reviewTitle}</h4>}

      <div className="mb-4">
        <p className="text-slate-600 text-sm leading-relaxed">{displayText}</p>
        {isLongReview && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-600 text-sm font-medium mt-1 hover:underline"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {(pros || cons) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {pros && (
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                Pros
              </h5>
              <p className="text-sm text-green-700">{pros}</p>
            </div>
          )}
          {cons && (
            <div className="p-3 bg-red-50 rounded-lg">
              <h5 className="text-sm font-semibold text-red-800 mb-1 flex items-center gap-1">
                <ThumbsDown className="w-3.5 h-3.5" />
                Cons
              </h5>
              <p className="text-sm text-red-700">{cons}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
        {Number(facultyRating) > 0 && (
          <div>
            <span className="text-xs text-slate-500 block mb-1">Faculty</span>
            <RatingStars rating={Number(facultyRating)} size="sm" />
          </div>
        )}
        {Number(studyMaterialRating) > 0 && (
          <div>
            <span className="text-xs text-slate-500 block mb-1">Study Material</span>
            <RatingStars rating={Number(studyMaterialRating)} size="sm" />
          </div>
        )}
        {Number(infrastructureRating) > 0 && (
          <div>
            <span className="text-xs text-slate-500 block mb-1">Infrastructure</span>
            <RatingStars rating={Number(infrastructureRating)} size="sm" />
          </div>
        )}
        {Number(feeValueRating) > 0 && (
          <div>
            <span className="text-xs text-slate-500 block mb-1">Value for Money</span>
            <RatingStars rating={Number(feeValueRating)} size="sm" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ThumbsUp className="w-4 h-4" />
            Helpful ({helpfulCount || 0})
          </button>
          <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ThumbsDown className="w-4 h-4" />
            Not Helpful
          </button>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors">
          <Flag className="w-4 h-4" />
          <span className="hidden sm:inline">Report</span>
        </button>
      </div>

      {response && showResponse && (
        <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-slate-900">Institute Response</span>
            </div>
            <button onClick={() => setShowResponse(false)} className="text-xs text-slate-500 hover:text-slate-700">
              Hide
            </button>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{response.responseText}</p>
          <p className="text-xs text-slate-500 mt-2">Responded by {response.respondedBy}</p>
        </div>
      )}
    </motion.div>
  );
}

/* ───────────────────────────────
   Review Form (preview placeholder)
   ─────────────────────────────── */

function ReviewFormPlaceholder({ instituteName, onClose }: { instituteName: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-8 text-center max-w-md w-full mx-4"
    >
      <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <PenSquare className="w-8 h-8 text-primary-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Write a Review</h3>
      <p className="text-slate-600 mb-6">
        This is a preview of the review form for {instituteName}. Students will be able to submit reviews here.
      </p>
      <button
        onClick={onClose}
        className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
      >
        Close
      </button>
    </motion.div>
  );
}

/* ───────────────────────────────
   Reviews Tab
   ─────────────────────────────── */

function ReviewsTab({ instituteIdentifier, instituteName }: { instituteIdentifier: string; instituteName: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [responses, setResponses] = useState<Record<string, InstituteResponse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'positive' | 'critical'>('all');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [reviewsData, responsesData] = await Promise.all([
          reviewApi.findByInstituteIdentifier(instituteIdentifier).catch(() => [] as Review[]),
          instituteResponseApi.findByInstituteIdentifier(instituteIdentifier).catch(() => [] as InstituteResponse[]),
        ]);
        setReviews(reviewsData);
        const map: Record<string, InstituteResponse> = {};
        responsesData.forEach((r) => {
          map[r.reviewIdentifier] = r;
        });
        setResponses(map);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (instituteIdentifier) fetchData();
  }, [instituteIdentifier]);

  const filteredReviews = reviews.filter((review) => {
    switch (filter) {
      case 'verified':
        return review.isVerifiedStudent;
      case 'positive':
        return Number(review.overallRating) >= 4;
      case 'critical':
        return Number(review.overallRating) <= 2;
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary-600" />
            Student Reviews
          </h2>
          <p className="text-slate-600 mt-1">Read what our students have to say about their experience</p>
        </div>
        <button
          onClick={() => setShowReviewForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PenSquare className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowReviewForm(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ReviewFormPlaceholder instituteName={instituteName} onClose={() => setShowReviewForm(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description="Be the first to share your experience!"
        />
      ) : (
        <>
          <ReviewStats reviews={reviews} />

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">Filter:</span>
            {[
              { key: 'all', label: 'All Reviews' },
              { key: 'verified', label: 'Verified Students' },
              { key: 'positive', label: 'Positive (4+)' },
              { key: 'critical', label: 'Critical (1-2)' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as typeof filter)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  filter === key
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredReviews.map((review, index) => (
              <ReviewCard
                key={review.identifier}
                review={review}
                index={index}
                response={responses[review.identifier] || null}
              />
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500">No reviews match the selected filter.</p>
              <button onClick={() => setFilter('all')} className="mt-2 text-primary-600 hover:underline">
                Show all reviews
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}


/* ───────────────────────────────
   FAQs Tab
   ─────────────────────────────── */

function FaqsTab({ faqs }: { faqs: Faq[] }) {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  if (faqs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200"
      >
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No FAQs Available</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Frequently asked questions will be added soon. Contact the institute directly for any queries.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.identifier}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            <button
              onClick={() => setOpenFaq(openFaq === faq.identifier ? null : faq.identifier)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="font-medium text-slate-900 pr-4">{faq.question}</span>
              <ChevronRight
                className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                  openFaq === faq.identifier ? 'rotate-90' : ''
                }`}
              />
            </button>
            {openFaq === faq.identifier && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-100"
              >
                <p className="p-4 text-slate-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────
   Main Component
   ─────────────────────────────── */

export default function InstitutePreviewFull({ institute, onClose }: InstitutePreviewFullProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [branches, setBranches] = useState<Branch[]>([]);
  const [facility, setFacility] = useState<InstituteFacility | null>(null);
  const [faqs, setFaqs] = useState<Faq[]>([]);

  useEffect(() => {
    if (!institute?.identifier) return;

    const fetchRelatedData = async () => {
      try {
        const [branchesData, facilityData, faqsData] = await Promise.all([
          branchApi.findByInstituteIdentifier(institute.identifier).catch(() => [] as Branch[]),
          instituteFacilityApi.findByInstituteIdentifier(institute.identifier).catch(() => null),
          faqApi.findByInstituteIdentifier(institute.identifier).catch(() => [] as Faq[]),
        ]);

        setBranches(branchesData);
        setFacility(facilityData);
        setFaqs(faqsData);
      } catch (err) {
        console.error('Error fetching related data:', err);
      }
    };

    fetchRelatedData();
  }, [institute?.identifier]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab institute={institute} facility={facility} branches={branches} />;
      case 'courses':
        return <CoursesTab instituteIdentifier={institute.identifier} />;
      case 'faculty':
        return <FacultyTab instituteIdentifier={institute.identifier} />;
      case 'results':
        return <ResultsTab instituteIdentifier={institute.identifier} />;
      case 'reviews':
        return (
          <ReviewsTab instituteIdentifier={institute.identifier} instituteName={institute.name || 'Institute'} />
        );
      case 'faqs':
        return <FaqsTab faqs={faqs} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Sticky Header */}
        <div className="flex-shrink-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Eye className="w-4 h-4 text-primary-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {institute.name || 'Institute Preview'}
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">This is how students will see your institute page</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <InstituteHero institute={institute} />
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">{renderTabContent()}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
