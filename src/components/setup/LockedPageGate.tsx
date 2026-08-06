import { useNavigate } from 'react-router-dom';
import { useSetupStatus, type SetupStep } from '@/hooks/useSetupStatus';
import { Lock, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface LockedPageGateProps {
  requiredStep: SetupStep;
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

const stepTitles: Record<SetupStep, string> = {
  profile: 'Institute Profile',
  branches: 'Branches',
  courses: 'Courses',
  faculty: 'Faculty',
};

export default function LockedPageGate({
  requiredStep,
  children,
  loadingFallback,
}: LockedPageGateProps) {
  const navigate = useNavigate();
  const { isLoading, isStepUnlocked, getLockReason, getLockedActionPath } = useSetupStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        {loadingFallback || <LoadingSpinner size="lg" />}
      </div>
    );
  }

  if (isStepUnlocked(requiredStep)) {
    return <>{children}</>;
  }

  const reason = getLockReason(requiredStep);
  const actionPath = getLockedActionPath(requiredStep);
  const actionLabel = `Go to ${stepTitles[actionPath.replace('/', '') as SetupStep] || 'previous step'}`;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-lg w-full text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
          <Lock size={32} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {stepTitles[requiredStep]} is locked
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          {reason || 'Complete the previous setup step to unlock this page.'}
        </p>
        <button
          onClick={() => navigate(actionPath)}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          {actionLabel}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
