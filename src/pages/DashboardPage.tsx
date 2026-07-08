import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitute } from '@/context/InstituteContext';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/shared/StatCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import MobileListCard from '@/components/shared/MobileListCard';
import { cn, formatDate } from '@/lib/utils';
import { InquiryStatus } from '@/types';
import {
  branchApi,
  facultyApi,
  inquiryApi,
  reviewApi,
  instituteCourseApi,
  instituteSubscriptionApi,
  creditsApi,
  featuredPurchasesApi,
} from '@/api';
import type {
  Branch,
  Faculty,
  Inquiry,
  Review,
  InstituteCourse,
  InstituteSubscription,
  InstituteCredit,
  FeaturedPurchase,
} from '@/types';
import { toast } from 'sonner';
import {
  BookOpen,
  Users,
  Mail,
  Star,
  MessageSquare,
  CreditCard,
  TrendingUp,
  UserCheck,
  Coins,
  MapPin,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

const statusColors: Record<InquiryStatus, string> = {
  [InquiryStatus.NEW]: 'bg-blue-50 text-blue-700',
  [InquiryStatus.CONTACTED]: 'bg-purple-50 text-purple-700',
  [InquiryStatus.FOLLOW_UP]: 'bg-amber-50 text-amber-700',
  [InquiryStatus.ENROLLED]: 'bg-green-50 text-green-700',
  [InquiryStatus.NOT_INTERESTED]: 'bg-slate-100 text-slate-600',
  [InquiryStatus.DROPPED]: 'bg-red-50 text-red-700',
};

const statusBarColors: Record<InquiryStatus, string> = {
  [InquiryStatus.NEW]: '#3b82f6',
  [InquiryStatus.CONTACTED]: '#9333ea',
  [InquiryStatus.FOLLOW_UP]: '#f59e0b',
  [InquiryStatus.ENROLLED]: '#22c55e',
  [InquiryStatus.NOT_INTERESTED]: '#64748b',
  [InquiryStatus.DROPPED]: '#ef4444',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        statusColors[status as InquiryStatus] || 'bg-slate-100 text-slate-600'
      )}
    >
      {status}
    </span>
  );
}

function ensureArray<T>(value: T[] | null | undefined): T[];
function ensureArray<T>(value: T | null | undefined): T[];
function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value) return [value as T];
  return [];
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <h2 className="text-base sm:text-lg font-semibold text-slate-900">{title}</h2>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { institute } = useInstitute();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(() => !!institute?.identifier);
  const [now] = useState(() => new Date());
  const [branches, setBranches] = useState<Branch[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [courses, setCourses] = useState<InstituteCourse[]>([]);
  const [subscriptions, setSubscriptions] = useState<InstituteSubscription[]>([]);
  const [credit, setCredit] = useState<InstituteCredit | null>(null);
  const [featuredPurchases, setFeaturedPurchases] = useState<FeaturedPurchase[]>([]);

  useEffect(() => {
    if (!institute?.identifier) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [b, f, i, r, c, s, cred, fp] = await Promise.all([
          branchApi.findByInstituteIdentifier(institute.identifier),
          facultyApi.findByInstituteIdentifier(institute.identifier),
          inquiryApi.findByInstituteIdentifier(institute.identifier),
          reviewApi.findByInstituteIdentifier(institute.identifier),
          instituteCourseApi.findByInstituteIdentifier(institute.identifier),
          instituteSubscriptionApi.findByInstituteIdentifier(institute.identifier),
          creditsApi.getBalance(institute.identifier).catch(() => null),
          featuredPurchasesApi.getByInstitute(institute.identifier).catch((): FeaturedPurchase[] => []),
        ]);
        setBranches(ensureArray(b));
        setFaculty(ensureArray(f));
        setInquiries(ensureArray(i));
        setReviews(ensureArray(r));
        setCourses(ensureArray(c));
        setSubscriptions(ensureArray(s));
        setCredit(cred);
        setFeaturedPurchases(ensureArray(fp));
      } catch (err) {
        console.error('Dashboard load error', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [institute?.identifier]);

  const firstName = useMemo(
    () => user?.fullName?.split(' ')[0] || 'Admin',
    [user?.fullName]
  );

  const avgRating = useMemo(() => {
    const raw = institute?.averageRating;
    return typeof raw === 'string' ? parseFloat(raw) : raw || 0;
  }, [institute?.averageRating]);

  const pendingInquiries = useMemo(
    () => inquiries.filter((i) => i.status === InquiryStatus.NEW).length,
    [inquiries]
  );

  const recentInquiries = useMemo(
    () =>
      [...inquiries]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [inquiries]
  );

  const recentReviews = useMemo(
    () =>
      [...reviews]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [reviews]
  );

  const activeSubscription = useMemo(
    () => subscriptions.find((s) => s.isActive) || null,
    [subscriptions]
  );

  const subscriptionDaysLeft = useMemo(() => {
    if (!activeSubscription?.endDate) return 0;
    return Math.max(
      0,
      Math.ceil(
        (new Date(activeSubscription.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
  }, [activeSubscription, now]);

  const activeFeatured = useMemo(
    () => featuredPurchases.find((p) => p.status?.toUpperCase() === 'ACTIVE') || null,
    [featuredPurchases]
  );

  const featuredDaysLeft = useMemo(() => {
    if (!activeFeatured?.expiresAt) return 0;
    return Math.max(
      0,
      Math.ceil((new Date(activeFeatured.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
  }, [activeFeatured, now]);

  const funnelData = useMemo(
    () =>
      [
        { status: InquiryStatus.NEW, label: 'New' },
        { status: InquiryStatus.CONTACTED, label: 'Contacted' },
        { status: InquiryStatus.FOLLOW_UP, label: 'Follow Up' },
        { status: InquiryStatus.ENROLLED, label: 'Enrolled' },
        { status: InquiryStatus.NOT_INTERESTED, label: 'Not Interested' },
        { status: InquiryStatus.DROPPED, label: 'Dropped' },
      ].map((item) => ({
        ...item,
        count: inquiries.filter((i) => i.status === item.status).length,
        color: statusBarColors[item.status],
      })),
    [inquiries]
  );

  const funnelMax = useMemo(
    () => Math.max(1, ...funnelData.map((d) => d.count)),
    [funnelData]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const quickActions = [
    { label: 'Add Course', path: '/courses', icon: BookOpen },
    { label: 'Add Faculty', path: '/faculty', icon: Users },
    { label: 'Add Branch', path: '/branches', icon: MapPin },
    { label: 'Buy Credits', path: '/credits', icon: Coins },
    { label: 'Reviews', path: '/reviews', icon: MessageSquare },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's what's happening at {institute?.name || 'your institute'} today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs sm:text-sm shadow-sm self-start sm:self-auto">
          <Calendar size={14} />
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Credit Balance"
          value={credit?.balance ?? 0}
          icon={Coins}
          onClick={() => navigate('/credits')}
        />
        <StatCard title="Total Courses" value={courses.length} icon={BookOpen} />
        <StatCard title="Total Faculty" value={faculty.length} icon={Users} />
        <StatCard
          title="New Leads"
          value={pendingInquiries}
          icon={UserCheck}
          trend="Pending"
          trendUp={pendingInquiries > 0}
          onClick={() => navigate('/leads')}
        />
        <StatCard title="Avg Rating" value={avgRating.toFixed(1)} icon={Star} />
        <StatCard title="Total Reviews" value={reviews.length} icon={MessageSquare} />
        <StatCard title="Branches" value={branches.length} icon={MapPin} />
        <StatCard
          title="Total Students"
          value={institute?.totalStudentsEnrolled || 0}
          icon={TrendingUp}
        />
      </div>

      {/* Leads Banner */}
      {pendingInquiries > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3 sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">
                {pendingInquiries} New Lead{pendingInquiries > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-blue-700">Check your leads page to view student details.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/leads')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            View Leads
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              <action.icon size={16} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-5 sm:space-y-6">
          {/* Lead Funnel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader
              title="Lead Pipeline"
              actionLabel="Manage Leads"
              onAction={() => navigate('/leads')}
            />
            {inquiries.length === 0 ? (
              <EmptyState
                icon={Mail}
                title="No inquiries yet"
                description="New inquiries will appear here once students reach out."
                className="py-8"
              />
            ) : (
              <div className="p-4 sm:p-5">
                {/* Desktop / tablet chart */}
                <div className="hidden sm:block h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} margin={{ top: 8, right: 8, bottom: 24, left: -8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={0}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Mobile progress list */}
                <div className="sm:hidden space-y-3">
                  {funnelData.map((item) => (
                    <div key={item.status}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="font-semibold text-slate-900">{item.count}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round((item.count / funnelMax) * 100)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Inquiries */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader
              title="Recent Inquiries"
              actionLabel="View All"
              onAction={() => navigate('/leads')}
            />
            {recentInquiries.length === 0 ? (
              <EmptyState
                icon={Mail}
                title="No inquiries yet"
                description="New inquiries will appear here"
                className="py-8"
              />
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="text-left px-5 py-3 font-medium">Name</th>
                        <th className="text-left px-5 py-3 font-medium">Phone</th>
                        <th className="text-left px-5 py-3 font-medium">Status</th>
                        <th className="text-left px-5 py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentInquiries.map((inquiry) => (
                        <tr
                          key={inquiry.identifier}
                          className="hover:bg-slate-50 cursor-pointer"
                          onClick={() => navigate('/leads')}
                        >
                          <td className="px-5 py-3 font-medium text-slate-900">
                            {inquiry.studentName || inquiry.name || 'Unknown'}
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            {inquiry.studentPhone || inquiry.phone || 'N/A'}
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge status={inquiry.status} />
                          </td>
                          <td className="px-5 py-3 text-slate-500">
                            {formatDate(inquiry.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {recentInquiries.map((inquiry) => (
                    <MobileListCard
                      key={inquiry.identifier}
                      title={inquiry.studentName || inquiry.name || 'Unknown'}
                      subtitle={inquiry.studentPhone || inquiry.phone || 'N/A'}
                      badge={<StatusBadge status={inquiry.status} />}
                      meta={formatDate(inquiry.createdAt)}
                      onClick={() => navigate('/leads')}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5 sm:space-y-6">
          {/* Subscription Status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <CreditCard size={20} className="text-primary-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Subscription</h2>
                <p className="text-xs text-slate-500 truncate">
                  {activeSubscription ? 'Active plan' : 'No active plan'}
                </p>
              </div>
            </div>

            {activeSubscription ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Current plan</span>
                  <span className="font-semibold text-slate-900">
                    {institute?.subscriptionTier || 'Active'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Expires on</span>
                  <span className="font-medium text-slate-900">
                    {formatDate(activeSubscription.endDate)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">{subscriptionDaysLeft} days left</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        subscriptionDaysLeft > 7 ? 'bg-green-500' : 'bg-amber-500'
                      )}
                      style={{
                        width: `${Math.min(100, Math.max(5, (subscriptionDaysLeft / 30) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Upgrade to unlock lead details, featured listings, and more.
              </p>
            )}

            <button
              onClick={() => navigate('/subscription')}
              className="mt-4 w-full py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              {activeSubscription ? 'Manage Plan' : 'Upgrade Now'}
            </button>
          </div>

          {/* Featured Badge Status */}
          {activeFeatured ? (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Sparkles size={20} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-amber-900">Featured Badge</h3>
                  <p className="text-xs text-amber-700">{featuredDaysLeft} days remaining</p>
                </div>
              </div>
              <p className="text-sm text-amber-800 mb-4">
                Your institute is highlighted in search results until{' '}
                {formatDate(activeFeatured.expiresAt)}.
              </p>
              <button
                onClick={() => navigate('/credits')}
                className="w-full py-2 rounded-xl bg-amber-200 text-amber-900 text-sm font-medium hover:bg-amber-300 transition-colors"
              >
                Extend Featured
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Sparkles size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Get Featured</h3>
                  <p className="text-xs text-slate-500">Stand out in search results</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/credits')}
                className="w-full py-2 rounded-xl border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-50 transition-colors"
              >
                Buy Featured Badge
              </button>
            </div>
          )}

          {/* Recent Reviews */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader
              title="Recent Reviews"
              actionLabel="View All"
              onAction={() => navigate('/reviews')}
            />
            {recentReviews.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No reviews yet"
                description="Reviews will appear here"
                className="py-8"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentReviews.map((review) => {
                  const rating =
                    typeof review.overallRating === 'string'
                      ? parseFloat(review.overallRating)
                      : review.overallRating;
                  return (
                    <div
                      key={review.identifier}
                      className="p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {review.reviewTitle || 'Review'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {review.reviewText}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-amber-500 flex-shrink-0">
                          <Star size={14} fill="currentColor" />
                          {rating.toFixed(1)}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{formatDate(review.createdAt)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
