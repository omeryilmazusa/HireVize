export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-border-card bg-white p-8 text-center">
      <p className="text-navy-500">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
