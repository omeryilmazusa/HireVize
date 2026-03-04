export function PageContainer({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="mx-auto max-w-7xl animate-fade-up">
      {title && (
        <h1 className="mb-6 text-2xl font-bold text-navy-900 font-display">{title}</h1>
      )}
      {children}
    </div>
  );
}
