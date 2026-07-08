import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MobileListCardProps {
  title: string;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  badge?: React.ReactNode;
  avatar?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function MobileListCard({
  title,
  subtitle,
  meta,
  badge,
  avatar,
  actions,
  onClick,
  className,
}: MobileListCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white p-4 border-b border-slate-100 last:border-b-0',
        onClick && 'cursor-pointer active:bg-slate-50',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {avatar && <div className="flex-shrink-0">{avatar}</div>}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{title}</h3>
            {actions && <div className="flex items-center gap-1 flex-shrink-0">{actions}</div>}
          </div>
          {subtitle && <div className="text-sm text-slate-600 mt-0.5">{subtitle}</div>}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {badge && <div>{badge}</div>}
            {meta && <div className="text-xs text-slate-500">{meta}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MobileListCardFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function MobileListCardField({ label, value, className }: MobileListCardFieldProps) {
  return (
    <div className={cn('text-sm', className)}>
      <span className="text-slate-500">{label}:</span>{' '}
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
