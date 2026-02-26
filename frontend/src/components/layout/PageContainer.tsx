export function PageContainer({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="mx-auto max-w-7xl">
      {title && (
        <h1 className="mb-6 text-2xl font-bold text-gray-900">{title}</h1>
      )}
      {children}
    </div>
  );
}
