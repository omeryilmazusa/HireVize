const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  ready: "bg-blue-100 text-blue-800",
  applying: "bg-indigo-100 text-indigo-800",
  scraping: "bg-blue-100 text-blue-800",
  generating: "bg-blue-100 text-blue-800",
  submitting: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  submitted: "bg-green-100 text-green-800",
  approved: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
  failed: "bg-red-100 text-red-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800",
  interviewing: "bg-purple-100 text-purple-800",
  offered: "bg-emerald-100 text-emerald-800",
  accepted: "bg-emerald-100 text-emerald-800",
};

export function StatusBadge({ status }: { status: string }) {
  const colors = statusColors[status] || "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colors}`}
    >
      {status}
    </span>
  );
}
