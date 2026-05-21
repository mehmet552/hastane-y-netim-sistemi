export const PageHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
    <div>
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">{title}</h1>
      {description && (
        <p className="mt-1.5 text-sm text-radsafe-textMuted max-w-xl">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
