import { cn } from '../../lib/cn';

export const ProgressBar = ({
  value,
  max,
  warningAt = 80,
}: {
  value: number;
  max: number;
  warningAt?: number;
}) => {
  const percent = Math.min((value / max) * 100, 100);
  const isWarning = percent >= warningAt;

  return (
    <div className="space-y-2">
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-radsafe-surface">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 relative',
            isWarning
              ? 'bg-gradient-to-r from-radsafe-warning to-orange-500'
              : 'bg-gradient-to-r from-radsafe-primary to-radsafe-accent'
          )}
          style={{ width: `${percent}%` }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-white/30 blur-sm" />
        </div>
      </div>
      <div className="flex justify-between font-mono text-xs text-radsafe-textDim">
        <span>{value} dk</span>
        <span>{max} dk</span>
      </div>
    </div>
  );
};
