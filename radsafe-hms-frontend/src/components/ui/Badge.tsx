import { cn } from '../../lib/cn';

const variants = {
  success: 'bg-radsafe-success/10 text-radsafe-success border-radsafe-success/25',
  warning: 'bg-radsafe-warning/10 text-radsafe-warning border-radsafe-warning/25',
  danger: 'bg-radsafe-danger/10 text-radsafe-danger border-radsafe-danger/25',
  primary: 'bg-radsafe-primary/10 text-radsafe-primaryLight border-radsafe-primary/25',
  neutral: 'bg-slate-800/50 text-slate-400 border-slate-700/50',
  accent: 'bg-radsafe-accent/10 text-radsafe-accent border-radsafe-accent/25',
};

export const Badge = ({
  children,
  variant = 'neutral',
  className,
  pulse,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
  pulse?: boolean;
}) => (
  <span
    className={cn(
      'badge border',
      variants[variant],
      pulse && 'animate-pulse-slow',
      className
    )}
  >
    {children}
  </span>
);
