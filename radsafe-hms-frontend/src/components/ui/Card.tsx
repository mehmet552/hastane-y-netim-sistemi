import { cn } from '../../lib/cn';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  glow?: 'primary' | 'accent' | 'danger' | 'none';
};

export const Card = ({ children, className, glow = 'none' }: CardProps) => (
  <div
    className={cn(
      'glass-card p-6',
      glow === 'primary' && 'border-radsafe-primary/20',
      glow === 'accent' && 'border-radsafe-accent/20',
      glow === 'danger' && 'border-radsafe-danger/20',
      className
    )}
  >
    <div className="relative z-10">{children}</div>
  </div>
);
