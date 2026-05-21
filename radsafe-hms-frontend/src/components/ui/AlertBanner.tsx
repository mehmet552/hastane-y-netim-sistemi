import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/cn';

export const AlertBanner = ({
  title,
  description,
  variant = 'danger',
}: {
  title: string;
  description?: string;
  variant?: 'danger' | 'warning';
}) => (
  <div
    className={cn(
      'mb-6 flex items-start gap-4 rounded-2xl border p-5 animate-fade-in',
      variant === 'danger'
        ? 'border-radsafe-danger/35 bg-radsafe-danger/10'
        : 'border-radsafe-warning/35 bg-radsafe-warning/10'
    )}
  >
    <AlertTriangle
      className={cn(
        'h-8 w-8 shrink-0',
        variant === 'danger' ? 'text-radsafe-danger' : 'text-radsafe-warning'
      )}
    />
    <div>
      <p
        className={cn(
          'font-bold text-base',
          variant === 'danger' ? 'text-radsafe-danger' : 'text-radsafe-warning'
        )}
      >
        {title}
      </p>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
    </div>
  </div>
);
