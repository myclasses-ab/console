import { useEffect, useState } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import { instituteSubscriptionApi, branchApi, instituteCourseApi, facultyApi, mediaApi } from '@/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { CreditCard, Check, AlertCircle } from 'lucide-react';
import type { InstituteSubscription } from '@/types';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const { institute } = useInstitute();
  const [subscription, setSubscription] = useState<InstituteSubscription | null>(null);
  const [usage, setUsage] = useState({ branches: 0, courses: 0, faculty: 0, media: 0 });
  const [limits, setLimits] = useState({ maxBranches: 0, maxCourses: 0, maxFaculty: 0, maxMedia: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [subs, branches, courses, faculty, media] = await Promise.all([
        instituteSubscriptionApi.findByInstituteIdentifier(institute.identifier),
        branchApi.findByInstituteIdentifier(institute.identifier),
        instituteCourseApi.findByInstituteIdentifier(institute.identifier),
        facultyApi.findByInstituteIdentifier(institute.identifier),
        mediaApi.findByInstituteIdentifier(institute.identifier),
      ]);

      if (subs.length > 0) {
        setSubscription(subs[0]);
        // Mock limits based on plan - in reality this would come from SubscriptionPlan
        setLimits({ maxBranches: 5, maxCourses: 20, maxFaculty: 50, maxMedia: 100 });
      }
      setUsage({
        branches: branches.length,
        courses: courses.length,
        faculty: faculty.length,
        media: media.length,
      });
    } catch (err) {
      console.error('Failed to load subscription', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institute?.identifier]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Subscription</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your institute subscription</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={CreditCard}
            title="No active subscription"
            description="Subscribe to unlock premium features"
            action={
              <button className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">
                View Plans
              </button>
            }
          />
        </div>
      </div>
    );
  }

  const usageItems = [
    { label: 'Branches', used: usage.branches, max: limits.maxBranches },
    { label: 'Courses', used: usage.courses, max: limits.maxCourses },
    { label: 'Faculty', used: usage.faculty, max: limits.maxFaculty },
    { label: 'Media', used: usage.media, max: limits.maxMedia },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Subscription</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your institute subscription</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <CreditCard size={24} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Current Plan</h2>
              <p className="text-sm text-slate-500">{institute?.subscriptionTier || 'FREE'} Plan</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Start Date</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(subscription.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Expiry Date</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(subscription.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              'Respond to Reviews',
              'View Lead Details',
              'Feature Results',
              'Priority in Search',
              'Verified Badge',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <Check size={18} className="text-green-600" />
                <span className="text-sm text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Usage</h2>
          <div className="space-y-5">
            {usageItems.map((item) => {
              const percentage = Math.min((item.used / item.max) * 100, 100);
              const isNearLimit = percentage > 80;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <span className={`text-sm font-medium ${isNearLimit ? 'text-red-600' : 'text-slate-900'}`}>
                      {item.used} / {item.max}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isNearLimit ? 'bg-red-500' : 'bg-primary-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {isNearLimit && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> Approaching limit
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button className="w-full mt-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}
