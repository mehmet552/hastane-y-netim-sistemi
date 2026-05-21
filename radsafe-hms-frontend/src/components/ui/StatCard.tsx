import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Card } from './Card';

const iconBox = {
  default: 'border-radsafe-primary/25 bg-radsafe-primary/10 text-radsafe-primaryLight',
  danger: 'border-radsafe-danger/25 bg-radsafe-danger/10 text-radsafe-danger',
  warning: 'border-radsafe-warning/25 bg-radsafe-warning/10 text-radsafe-warning',
};

const glow = {
  default: 'from-radsafe-primary/25',
  danger: 'from-radsafe-danger/25',
  warning: 'from-radsafe-warning/25',
};

export const StatCard = ({
  title,
  value,
  suffix,
  icon: Icon,
  variant = 'default',
}: {
  title: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'warning';
}) => (
  <Card className="overflow-hidden group hover:border-white/12 transition-colors">
    <div
      className={cn(
        'absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br to-transparent opacity-50 blur-2xl',
        glow[variant]
      )}
    />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-radsafe-textDim mb-2">
          {title}
        </p>
        <p className="text-3xl font-display font-bold text-white tabular-nums">
          {value}
          {suffix && <span className="text-lg font-medium text-slate-500 ml-1">{suffix}</span>}
        </p>
      </div>
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl border', iconBox[variant])}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </Card>
);
