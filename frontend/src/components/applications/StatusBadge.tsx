const statusConfig: Record<string, { dot: string; text: string; label?: string }> = {
  // Application statuses
  added: { dot: "bg-[#00875A]", text: "text-[#00875A]" },
  applying: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
  applied: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
  phone_call: { dot: "bg-[#7C3AED]", text: "text-[#7C3AED]", label: "Phone Call" },
  video_call: { dot: "bg-[#7C3AED]", text: "text-[#7C3AED]", label: "Video Call" },
  "1st_round": { dot: "bg-[#7C3AED]", text: "text-[#7C3AED]", label: "1st Round" },
  "2nd_round": { dot: "bg-[#7C3AED]", text: "text-[#7C3AED]", label: "2nd Round" },
  "3rd_round": { dot: "bg-[#7C3AED]", text: "text-[#7C3AED]", label: "3rd Round" },
  final_interview: { dot: "bg-[#7C3AED]", text: "text-[#7C3AED]", label: "Final Interview" },
  offered: { dot: "bg-[#00875A]", text: "text-[#00875A]" },
  accepted: { dot: "bg-[#00875A]", text: "text-[#00875A]" },
  rejected: { dot: "bg-[#9CA3AF]", text: "text-[#9CA3AF]" },
  withdrawn: { dot: "bg-[#9CA3AF]", text: "text-[#9CA3AF]" },
  // Scrape statuses
  pending: { dot: "bg-amber-400", text: "text-amber-700" },
  scraping: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
  completed: { dot: "bg-[#00875A]", text: "text-[#00875A]", label: "added" },
  failed: { dot: "bg-red-500", text: "text-red-600" },
  // Tailoring statuses
  generating: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
  submitting: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
  submitted: { dot: "bg-[#00875A]", text: "text-[#00875A]" },
  draft: { dot: "bg-[#9CA3AF]", text: "text-[#9CA3AF]" },
  approved: { dot: "bg-[#00875A]", text: "text-[#00875A]" },
  ready: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { dot: "bg-[#9CA3AF]", text: "text-[#9CA3AF]" };
  const label = config.label || status.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
}
