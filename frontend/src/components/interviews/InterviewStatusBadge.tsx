const statusConfig: Record<string, { dot: string; text: string }> = {
  scheduled: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
  completed: { dot: "bg-[#00875A]", text: "text-[#00875A]" },
  cancelled: { dot: "bg-[#9CA3AF]", text: "text-[#9CA3AF]" },
  rescheduled: { dot: "bg-amber-500", text: "text-amber-600" },
};

export function InterviewStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { dot: "bg-[#9CA3AF]", text: "text-[#9CA3AF]" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}
