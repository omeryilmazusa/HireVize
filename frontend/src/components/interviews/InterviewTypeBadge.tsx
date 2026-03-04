const typeConfig: Record<string, { dot: string; text: string }> = {
  phone: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
  video: { dot: "bg-[#7C3AED]", text: "text-[#7C3AED]" },
  onsite: { dot: "bg-amber-500", text: "text-amber-600" },
  technical: { dot: "bg-[#1E6FFF]", text: "text-[#1E6FFF]" },
  panel: { dot: "bg-emerald-500", text: "text-emerald-600" },
};

const typeLabels: Record<string, string> = {
  phone: "Phone",
  video: "Video",
  onsite: "On-site",
  technical: "Technical",
  panel: "Panel",
};

export function InterviewTypeBadge({ type }: { type: string }) {
  const config = typeConfig[type] || { dot: "bg-[#9CA3AF]", text: "text-[#9CA3AF]" };
  const label = typeLabels[type] || type;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
}
