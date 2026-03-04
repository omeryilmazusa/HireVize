const statusConfig: Record<string, { dot: string; text: string }> = {
  pending: { dot: "bg-amber-400", text: "text-amber-700" },
  ready: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
  applying: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
  scraping: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
  generating: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
  submitting: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
  completed: { dot: "bg-[#00875A]", text: "text-[#00875A]" },
  submitted: { dot: "bg-[#00875A]", text: "text-[#00875A]" },
  approved: { dot: "bg-[#00875A]", text: "text-[#00875A]" },
  draft: { dot: "bg-[#9CA3AF]", text: "text-[#9CA3AF]" },
  failed: { dot: "bg-red-500", text: "text-red-600" },
  rejected: { dot: "bg-[#9CA3AF]", text: "text-[#9CA3AF]" },
  withdrawn: { dot: "bg-[#9CA3AF]", text: "text-[#9CA3AF]" },
  interviewing: { dot: "bg-[#7C3AED]", text: "text-[#7C3AED]" },
  offered: { dot: "bg-[#00875A]", text: "text-[#00875A]" },
  accepted: { dot: "bg-[#00875A]", text: "text-[#00875A]" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { dot: "bg-[#9CA3AF]", text: "text-[#9CA3AF]" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}
