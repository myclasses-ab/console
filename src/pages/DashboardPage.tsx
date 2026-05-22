import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitute } from '@/context/InstituteContext';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/shared/StatCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import {
  branchApi,
  facultyApi,
  inquiryApi,
  reviewApi,
  instituteCourseApi,
  instituteSubscriptionApi,
  leadDistributionApi,
} from '@/api';
import type { Branch, Faculty, Inquiry, Review, InstituteCourse, InstituteSubscription, LeadDistribution } from '@/types';
import { toast } from 'sonner';
import {
  BookOpen,
  Calendar,
  Users,
  Mail,
  Star,
  MessageSquare,
  Plus,
  CreditCard,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { institute } = useInstitute();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [courses, setCourses] = useState<InstituteCourse[]>([]);
  const [subscriptions, setSubscriptions] = useState<InstituteSubscription[]>([]);
  const [leadDistributions, setLeadDistributions] = useState<LeadDistribution[]>([]);

  useEffect(() => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      try {
        const [b, f, i, r, c, s, l] = await Promise.all([
          branchApi.findByInstituteIdentifier(institute.identifier),
          facultyApi.findByInstituteIdentifier(institute.identifier),
          inquiryApi.findByInstituteIdentifier(institute.identifier),
          reviewApi.findByInstituteIdentifier(institute.identifier),
          instituteCourseApi.findByInstituteIdentifier(institute.identifier),
          instituteSubscriptionApi.findByInstituteIdentifier(institute.identifier),
          leadDistributionApi.getByInstitute(institute.identifier),
        ]);
        setBranches(b ?? []);
        setFaculty(f ?? []);
        setInquiries(i ?? []);
        setReviews(r ?? []);
        setCourses(c ?? []);
        setSubscriptions(s ?? []);
        setLeadDistributions(l ?? []);
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [institute?.identifier]);

  const pendingInquiries = inquiries.filter((i) => i.status === 'NEW').length;
  const newLeads = leadDistributions.filter((l) => l.status === 'PENDING').length;
  const avgRating = typeof institute?.averageRating === 'string'
    ? parseFloat(institute.averageRating)
    : (institute?.averageRating || 0);

  const recentInquiries = [...inquiries].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const recentLeads = [...leadDistributions].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const recentReviews = [...reviews].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}!
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here's what's happening at {institute?.name || 'your institute'} today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Courses" value={courses.length} icon={BookOpen} />
        <StatCard title="Total Faculty" value={faculty.length} icon={Users} />
        <StatCard title="Pending Inquiries" value={pendingInquiries} icon={Mail} trend="NEW" trendUp={pendingInquiries > 0} />
        <StatCard title="New Leads" value={newLeads} icon={UserCheck} trend="ADMIN" trendUp={newLeads > 0} onClick={() => navigate('/leads')} />
        <StatCard title="Avg Rating" value={avgRating.toFixed(1)} icon={Star} />
        <StatCard title="Total Reviews" value={reviews.length} icon={MessageSquare} />
        <StatCard title="Branches" value={branches.length} icon={TrendingUp} />
        <StatCard title="Total Students" value={institute?.totalStudentsEnrolled || 0} icon={Users} />
      </div>

      {/* Leads Banner */}
      {newLeads > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">{newLeads} New Lead{newLeads > 1 ? 's' : ''} from Admin</h3>
              <p className="text-sm text-blue-700">Check your leads page to view student details.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/leads')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            View Leads
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Add Course', path: '/courses', icon: Plus },
            { label: 'Add Faculty', path: '/faculty', icon: Plus },
            { label: 'Upload Media', path: '/media', icon: Plus },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              <action.icon size={16} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Recent Inquiries</h2>
            <button
              onClick={() => navigate('/inquiries')}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View All
            </button>
          </div>
          {recentInquiries.length === 0 ? (
            <EmptyState icon={Mail} title="No inquiries yet" description="New inquiries will appear here" />
          ) : (
            <div className="overflow-x-auto">
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
                    <tr key={inquiry.identifier} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-900">{inquiry.name}</td>
                      <td className="px-5 py-3 text-slate-600">{inquiry.phone}</td>
                      <td className="px-5 py-3">
                        <span className={
                          inquiry.status === 'NEW'
                            ? 'px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700'
                            : inquiry.status === 'ENROLLED'
                            ? 'px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700'
                            : 'px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600'
                        }>
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Subscription Status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <CreditCard size={20} className="text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Subscription</h2>
                <p className="text-xs text-slate-500">
                  {subscriptions.length > 0 ? 'Active Plan' : 'No active plan'}
                </p>
              </div>
            </div>
            {subscriptions.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-700">
                  Expires: {new Date(subscriptions[0].endDate).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Upgrade to unlock more features</p>
            )}
            <button
              onClick={() => navigate('/subscription')}
              className="mt-4 w-full py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              {subscriptions.length > 0 ? 'Manage Plan' : 'Upgrade Now'}
            </button>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Recent Reviews</h2>
              <button
                onClick={() => navigate('/reviews')}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                View All
              </button>
            </div>
            {recentReviews.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No reviews yet" description="Reviews will appear here" className="py-6" />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentReviews.map((review) => (
                  <div key={review.identifier} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">
                        {review.reviewTitle || 'Review'}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                        <Star size={14} fill="currentColor" />
                        {typeof review.overallRating === 'string'
                          ? parseFloat(review.overallRating).toFixed(1)
                          : review.overallRating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{review.reviewText}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
