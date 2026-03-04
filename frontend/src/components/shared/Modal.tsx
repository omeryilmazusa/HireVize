"use client";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-card border border-border-card bg-white p-6 shadow-xl my-auto">
        <h3 className="mb-4 font-display text-lg font-bold text-navy-900">{title}</h3>
        {children}
      </div>
    </div>
  );
}
