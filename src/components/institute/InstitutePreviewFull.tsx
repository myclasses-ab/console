import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
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
  BookMarked,
  Wifi,
  Monitor,
  FlaskConical,
  Wind,
  Home,
  Utensils,
  Bus,
  Video,
  GraduationCap,
  ClipboardCheck,
  Layers,
  Zap,
  PenSquare,
  ThumbsUp,
  ThumbsDown,
  Globe,
  Eye,
} from "lucide-react";
import { instituteLogoUrl, instituteBannerUrl, facultyImageUrl } from "@/lib/image-url";
import {
  branchApi,
  instituteFacilityApi,
  instituteCourseApi,
  facultyApi,
  resultApi,
  reviewApi,
  faqApi,
  awardAndRecognitionApi,
  examTypeApi,
} from "@/api";
import type {
  Branch,
  InstituteFacility,
  InstituteCourse,
  Faculty,
  Result,
  Review,
  Faq,
  AwardAndRecognition,
  ExamType,
} from "@/types";

/* ───────────────────────────────
   Types
   ─────────────────────────────── */

type TabType = "overview" | "courses" | "faculty" | "results" | "reviews" | "faqs";

interface InstitutePreviewFullProps {
  institute: any;
  onClose: () => void;
}



/* ───────────────────────────────
   Tab Config
   ─────────────────────────────── */

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Info },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "faculty", label: "Faculty", icon: Users },
  { id: "results", label: "Results", icon: Trophy },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
];

/* ───────────────────────────────
   Helpers
   ─────────────────────────────── */

function formatNumber(num: number | null | undefined): string {
  if (num == null) return "0";
  if (num >= 100000) return (num / 100000).toFixed(1) + "L";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatTime(time: string): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/* ───────────────────────────────
   Empty State
   ─────────────────────────────── */

function EmptyState({ message, icon: Icon }: { message: string; icon?: React.ElementType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-50 rounded-2xl p-10 text-center border border-slate-100"
    >
      {Icon && <Icon className="w-12 h-12 text-slate-300 mx-auto mb-3" />}
      <p className="text-slate-500 text-sm">{message}</p>
    </motion.div>
  );
}

/* ───────────────────────────────
   Tab Navigation
   ─────────────────────────────── */

function TabNavigation({ activeTab, onTabChange }: { activeTab: TabType; onTabChange: (t: TabType) => void }) {
  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 px-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? "text-primary-600" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
              {isActive && (
                <motion.div
                  layoutId="previewActiveTab"
                  className="absolute inset-0 bg-primary-50 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ───────────────────────────────
   Hero Section
   ─────────────────────────────── */

function HeroSection({ institute }: { institute: any }) {
  const banner = instituteBannerUrl(institute.bannerUrl);
  const logo = instituteLogoUrl(institute.logoUrl);
  const rating = Number(institute.averageRating || 0).toFixed(1);

  return (
    <div className="relative h-56 sm:h-64 lg:h-72">
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80 z-10" />
      <img
        src={banner || "/assets/sample_image_for_anything.png"}
        alt={institute.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 z-20 flex items-end">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl bg-white shadow-xl p-2 flex items-center justify-center">
                <img
                  src={logo || "/assets/sample_image_for_anything.png"}
                  alt={institute.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </motion.div>
            <div className="flex-1 min-w-0 text-center sm:text-left pb-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  {institute.isVerified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                  {institute.isFeatured && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-amber-500 text-white rounded-full">
                      <Award className="w-3.5 h-3.5" />
                      Featured
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                  {institute.name || "Institute Name"}
                </h1>
                {institute.tagline && (
                  <p className="text-base sm:text-lg text-white/90 font-medium">{institute.tagline}</p>
                )}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white text-sm">{rating}</span>
                    <span className="text-white/70 text-sm">({institute.totalReviews || 0} reviews)</span>
                  </div>
                  {institute.yearsOfExperience > 0 && (
                    <div className="flex items-center gap-1.5 text-white/80 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{institute.yearsOfExperience}+ years of excellence</span>
                    </div>
                  )}
                  {institute.totalStudentsEnrolled > 0 && (
                    <div className="flex items-center gap-1.5 text-white/80 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{formatNumber(institute.totalStudentsEnrolled)}+ students</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ───────────────────────────────
   Overview Tab
   ─────────────────────────────── */

const facilityConfig: Record<string, { icon: React.ElementType; label: string }> = {
  hasLibrary: { icon: BookOpen, label: "Library" },
  hasHostel: { icon: Home, label: "Hostel" },
  hasCanteen: { icon: Utensils, label: "Canteen" },
  hasTransport: { icon: Bus, label: "Transport" },
  hasAcClassrooms: { icon: Wind, label: "AC Classrooms" },
  hasDigitalBoards: { icon: Monitor, label: "Digital Boards" },
  hasLaboratory: { icon: FlaskConical, label: "Laboratory" },
  hasStudyRoom: { icon: BookMarked, label: "Study Room" },
  hasWifi: { icon: Wifi, label: "WiFi" },
  hasCctv: { icon: Video, label: "CCTV" },
  hasOnlinePortal: { icon: GraduationCap, label: "Online Portal" },
  hasDoubtSessions: { icon: ClipboardCheck, label: "Doubt Sessions" },
  hasMockTestSeries: { icon: Layers, label: "Mock Tests" },
  hasStudyMaterial: { icon: BookOpen, label: "Study Material" },
  hasCrashCourses: { icon: Zap, label: "Crash Courses" },
  hasScholarshipProgram: { icon: Award, label: "Scholarships" },
  hasFreeDemoClass: { icon: Users, label: "Free Demo" },
  hasParentTeacherMeetings: { icon: Calendar, label: "PTM" },
  hasPerformanceTracking: { icon: TrendingUp, label: "Performance Tracking" },
};

function OverviewTab({
  institute,
  facility,
  branches,
}: {
  institute: any;
  facility: InstituteFacility | null;
  branches: Branch[];
}) {
  const availableFacilities = facility
    ? Object.entries(facilityConfig).filter(([key]) => facility[key as keyof InstituteFacility] === true)
    : [];

  return (
    <div className="space-y-8">
      {/* About */}
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
            {institute.description || "No description available."}
          </p>
        </div>
      </motion.section>

      {/* Facilities */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary-600" />
          Facilities & Amenities
        </h2>
        {!facility ? (
          <EmptyState message="Facility information not available" icon={CheckCircle} />
        ) : (
          <div className="space-y-6">
            {facility.studentToTeacherRatio && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-primary-600 to-purple-500 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Student to Teacher Ratio</p>
                    <p className="text-2xl font-bold">{facility.studentToTeacherRatio}</p>
                  </div>
                </div>
              </motion.div>
            )}
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
        )}
      </section>

      {/* Branches */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-600" />
          Branch Locations
        </h2>
        {!branches.length ? (
          <EmptyState message="No branch information available" icon={Building2} />
        ) : (
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
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-sm text-slate-600">
                            {branch.cityName}, {branch.state}
                          </span>
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
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Address</p>
                        <p className="text-slate-800 font-medium">{branch.addressLine1}</p>
                        {branch.addressLine2 && <p className="text-slate-600">{branch.addressLine2}</p>}
                        <p className="text-slate-700 mt-2">
                          {branch.cityName}, {branch.state} - {branch.pincode}
                        </p>
                      </div>
                      {(branch.totalClassrooms || branch.seatingCapacity) && (
                        <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
                          {branch.totalClassrooms > 0 && (
                            <div className="px-3 py-1.5 bg-slate-100 rounded-lg">
                              <span className="text-sm text-slate-600">{branch.totalClassrooms} Classrooms</span>
                            </div>
                          )}
                          {branch.seatingCapacity > 0 && (
                            <div className="px-3 py-1.5 bg-slate-100 rounded-lg">
                              <span className="text-sm text-slate-600">{branch.seatingCapacity} Seats</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      {branch.phone && (
                        <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Phone className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-slate-700">{branch.phone}</span>
                        </div>
                      )}
                      {branch.email && (
                        <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Mail className="w-4 h-4 text-primary-600" />
                          </div>
                          <span className="text-slate-700">{branch.email}</span>
                        </div>
                      )}
                      {(branch.operatingHoursStart || branch.operatingDays) && (
                        <div className="pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {branch.operatingHoursStart && branch.operatingHoursEnd
                                ? `${formatTime(branch.operatingHoursStart)} - ${formatTime(branch.operatingHoursEnd)}`
                                : "Contact for timings"}
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
        )}
      </section>
    </div>
  );
}


/* ───────────────────────────────
   Courses Tab
   ─────────────────────────────── */

function CoursesTab({ courses, isLoading }: { courses: InstituteCourse[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return <EmptyState message="No courses available at this institute yet." icon={BookOpen} />;
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
        {courses.map((course, index) => {
          const displayName = course.customName || "Course";
          return (
            <motion.div
              key={course.identifier}
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

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {course.studyMaterialIncluded && (
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Study Material</span>
                  )}
                  {course.testSeriesIncluded && (
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Test Series</span>
                  )}
                  {course.onlineClassesAvailable && (
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Online Classes</span>
                  )}
                  {course.recordedLecturesAvailable && (
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Recorded Lectures</span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline gap-2">
                    {course.feeMin ? (
                      <>
                        <span className="text-2xl font-bold text-slate-900">
                          ₹{Number(course.feeMin).toLocaleString()}
                        </span>
                        {course.feeMax && Number(course.feeMax) !== Number(course.feeMin) && (
                          <span className="text-sm text-slate-500">- ₹{Number(course.feeMax).toLocaleString()}</span>
                        )}
                        {course.durationMonths > 0 && (
                          <span className="text-xs text-slate-400 ml-1">/ {course.durationMonths} months</span>
                        )}
                      </>
                    ) : (
                      <span className="text-lg font-medium text-slate-500">Contact for fee details</span>
                    )}
                  </div>
                  {course.feeDescription && (
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{course.feeDescription}</p>
                  )}
                  {course.scholarshipAvailable && (
                    <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Scholarship Available</p>
                        {course.scholarshipDetails && <p className="text-xs text-amber-700 mt-0.5">{course.scholarshipDetails}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button className="w-full mt-auto pt-4 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors text-sm">
                Enquire
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────
   Faculty Tab
   ─────────────────────────────── */

function FacultyTab({ faculty, isLoading }: { faculty: Faculty[]; isLoading: boolean }) {
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
    return <EmptyState message="No faculty information available yet." icon={Users} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-600" />
          Meet Our Expert Faculty
        </h2>
        <p className="text-slate-600 mt-1">Learn from experienced educators dedicated to your success</p>
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
                <img src={facultyImageUrl(f.photoUrl)} alt={f.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-slate-900">{f.name}</h3>
            <p className="text-sm text-primary-600 font-medium mt-0.5">{f.designation}</p>
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
   Results Tab
   ─────────────────────────────── */

function ResultsTab({ results, examTypeNames, isLoading }: { results: Result[]; examTypeNames: Record<string, string>; isLoading: boolean }) {
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  const years = [...new Set(results.map((r) => r.examYear))].sort((a, b) => b - a);
  const filteredResults = selectedYear === "all" ? results : results.filter((r) => r.examYear === selectedYear);
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
    return <EmptyState message="No results available for this institute yet." icon={Trophy} />;
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

      {/* Featured Results */}
      {featuredResults.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Featured Toppers
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {featuredResults.map((result) => (
              <div
                key={result.identifier}
                className="flex-shrink-0 w-48 bg-white rounded-xl p-4 shadow-sm border border-amber-100"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-100 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-sm font-bold text-slate-900 text-center">{result.studentName}</p>
                <p className="text-xs text-slate-500 text-center mt-0.5">
                  {examTypeNames[result.examTypeIdentifier] || "Exam"}
                </p>
                <div className="mt-2 text-center">
                  <span className="text-lg font-bold text-amber-600">{result.value}</span>
                  <span className="text-xs text-slate-500 ml-1">{result.rankOrScoreType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Selections", value: results.length, color: "bg-primary-50 text-primary-700" },
          { label: "Years", value: years.length, color: "bg-purple-50 text-purple-700" },
          { label: "Featured", value: featuredResults.length, color: "bg-amber-50 text-amber-700" },
          { label: "Verified", value: results.filter((r) => r.isVerified).length, color: "bg-green-50 text-green-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color} border border-slate-100`}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Year Filter */}
      {years.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600">Filter by year:</span>
          <button
            onClick={() => setSelectedYear("all")}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              selectedYear === "all" ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Years
          </button>
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                selectedYear === year ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResults.map((result, index) => (
          <motion.div
            key={result.identifier}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{result.studentName}</p>
                  <p className="text-xs text-slate-500">
                    {examTypeNames[result.examTypeIdentifier] || "Exam"} · {result.examYear}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary-600">{result.value}</p>
                <p className="text-xs text-slate-500">{result.rankOrScoreType}</p>
              </div>
            </div>
            {result.collegeAdmitted && (
              <p className="text-sm text-slate-600 mt-2">Admitted to: {result.collegeAdmitted}</p>
            )}
            {result.testimonialQuote && (
              <p className="text-sm text-slate-500 mt-2 italic">&ldquo;{result.testimonialQuote}&rdquo;</p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────
   Reviews Tab
   ─────────────────────────────── */

function ReviewsTab({ reviews, isLoading }: { reviews: Review[]; isLoading: boolean }) {
  const [filter, setFilter] = useState<"all" | "verified" | "positive" | "critical">("all");

  const filteredReviews = reviews.filter((review) => {
    switch (filter) {
      case "verified":
        return review.isVerifiedStudent;
      case "positive":
        return Number(review.overallRating) >= 4;
      case "critical":
        return Number(review.overallRating) <= 2;
      default:
        return true;
    }
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + Number(r.overallRating), 0) / reviews.length).toFixed(1)
      : "0.0";

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

  if (reviews.length === 0) {
    return <EmptyState message="No reviews yet. Be the first to share your experience!" icon={MessageSquare} />;
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
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center sm:text-left">
            <p className="text-5xl font-bold text-slate-900">{avgRating}</p>
            <div className="flex items-center gap-1 mt-1 justify-center sm:justify-start">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(Number(avgRating)) ? "text-amber-400 fill-amber-400" : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 w-full space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((r) => Math.round(Number(r.overallRating)) === rating).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
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

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-sm text-slate-600">Filter:</span>
        {[
          { key: "all", label: "All Reviews" },
          { key: "verified", label: "Verified Students" },
          { key: "positive", label: "Positive (4+)" },
          { key: "critical", label: "Critical (1-2)" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              filter === key ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review, index) => (
          <motion.div
            key={review.identifier}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-600">
                    {review.reviewTitle?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{review.reviewTitle || "Anonymous"}</p>
                  <p className="text-xs text-slate-500">
                    {review.isVerifiedStudent && (
                      <span className="inline-flex items-center gap-1 text-green-600 mr-2">
                        <CheckCircle className="w-3 h-3" />
                        Verified Student
                      </span>
                    )}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-amber-700">{Number(review.overallRating).toFixed(1)}</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">{review.reviewText}</p>
            {(review.pros || review.cons) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {review.pros && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-700 mb-1">Pros</p>
                    <p className="text-sm text-green-800">{review.pros}</p>
                  </div>
                )}
                {review.cons && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-700 mb-1">Cons</p>
                    <p className="text-sm text-red-800">{review.cons}</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
              <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                Helpful ({review.helpfulCount || 0})
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500">No reviews match the selected filter.</p>
          <button onClick={() => setFilter("all")} className="mt-2 text-primary-600 hover:underline">
            Show all reviews
          </button>
        </div>
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
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
                  openFaq === faq.identifier ? "rotate-90" : ""
                }`}
              />
            </button>
            {openFaq === faq.identifier && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
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
   Sidebar (Awards)
   ─────────────────────────────── */

function Sidebar({
  awards,
  isLoading,
}: {
  awards: AwardAndRecognition[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {awards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            Awards & Recognition
          </h3>
          <div className="space-y-3">
            {awards.map((award) => (
              <div key={award.identifier} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{award.title}</p>
                  <p className="text-xs text-slate-500">
                    {award.issuingBody}, {award.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Contact Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary-600" />
          Contact
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-slate-700 text-sm">Contact for details</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────
   Main Component
   ─────────────────────────────── */

export default function InstitutePreviewFull({ institute, onClose }: InstitutePreviewFullProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isLoading, setIsLoading] = useState(true);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [facility, setFacility] = useState<InstituteFacility | null>(null);
  const [courses, setCourses] = useState<InstituteCourse[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [awards, setAwards] = useState<AwardAndRecognition[]>([]);
  const [examTypeNames, setExamTypeNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!institute?.identifier) return;

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [
          branchesData,
          facilityData,
          coursesData,
          facultyData,
          resultsData,
          reviewsData,
          faqsData,
          awardsData,
          examTypes,
        ] = await Promise.all([
          branchApi.findByInstituteIdentifier(institute.identifier).catch(() => [] as Branch[]),
          instituteFacilityApi.findByInstituteIdentifier(institute.identifier).catch(() => null),
          instituteCourseApi.findByInstituteIdentifier(institute.identifier).catch(() => [] as InstituteCourse[]),
          facultyApi.findByInstituteIdentifier(institute.identifier).catch(() => [] as Faculty[]),
          resultApi.findByInstituteIdentifier(institute.identifier).catch(() => [] as Result[]),
          reviewApi.findByInstituteIdentifier(institute.identifier).catch(() => [] as Review[]),
          faqApi.findByInstituteIdentifier(institute.identifier).catch(() => [] as Faq[]),
          awardAndRecognitionApi.findByInstituteIdentifier(institute.identifier).catch(() => [] as AwardAndRecognition[]),
          examTypeApi.getAll().catch(() => [] as ExamType[]),
        ]);

        setBranches(branchesData);
        setFacility(facilityData);
        setFaculty(facultyData);
        setResults(resultsData);
        setReviews(reviewsData);
        setFaqs(faqsData);
        setAwards(awardsData);

        setCourses(coursesData);

        // Exam type names
        const names: Record<string, string> = {};
        examTypes.forEach((et) => {
          names[et.identifier] = et.name;
        });
        setExamTypeNames(names);
      } catch (err) {
        console.error("Failed to fetch preview data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [institute?.identifier]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab institute={institute} facility={facility} branches={branches} />;
      case "courses":
        return <CoursesTab courses={courses} isLoading={isLoading} />;
      case "faculty":
        return <FacultyTab faculty={faculty} isLoading={isLoading} />;
      case "results":
        return <ResultsTab results={results} examTypeNames={examTypeNames} isLoading={isLoading} />;
      case "reviews":
        return <ReviewsTab reviews={reviews} isLoading={isLoading} />;
      case "faqs":
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
                {institute.name || "Institute Preview"}
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
        <div className="flex-1 overflow-y-auto">
          <HeroSection institute={institute} />
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">{renderTabContent()}</div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <Sidebar awards={awards} isLoading={isLoading} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
