"use client";

import type { Interview } from "@/types/interview";

const typeColors: Record<string, string> = {
  phone: "bg-blue-100 text-[#1E6FFF]",
  video: "bg-purple-100 text-[#7C3AED]",
  onsite: "bg-amber-100 text-amber-700",
  technical: "bg-blue-100 text-[#1E6FFF]",
  panel: "bg-emerald-100 text-emerald-700",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface CalendarGridProps {
  year: number;
  month: number;
  interviews: Interview[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function CalendarGrid({
  year,
  month,
  interviews,
  selectedDate,
  onSelectDate,
}: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const today = new Date();
  const todayStr =
    today.getFullYear() === year && today.getMonth() === month
      ? String(today.getDate())
      : null;

  // Group interviews by day
  const interviewsByDay: Record<number, Interview[]> = {};
  for (const iv of interviews) {
    const d = new Date(iv.scheduled_at);
    const day = d.getDate();
    if (!interviewsByDay[day]) interviewsByDay[day] = [];
    interviewsByDay[day].push(iv);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="overflow-hidden rounded-card border border-border-card bg-white">
      <div className="grid grid-cols-7 border-b border-border-card bg-surface-subtle">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center font-mono text-xs font-medium uppercase tracking-wider text-navy-500"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="border-b border-r border-border-subtle p-2 min-h-[80px]" />;
          }
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = String(day) === todayStr;
          const isSelected = dateStr === selectedDate;
          const dayInterviews = interviewsByDay[day] || [];

          return (
            <div
              key={day}
              onClick={() => onSelectDate(dateStr)}
              className={`cursor-pointer border-b border-r border-border-subtle p-2 min-h-[80px] transition-colors ${
                isSelected
                  ? "bg-surface-selected"
                  : "hover:bg-surface-hover"
              }`}
            >
              <div
                className={`mb-1 text-sm font-medium ${
                  isToday
                    ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white"
                    : "text-navy-800"
                }`}
              >
                {day}
              </div>
              <div className="space-y-1">
                {dayInterviews.slice(0, 2).map((iv) => {
                  const time = new Date(iv.scheduled_at).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  });
                  const colors = typeColors[iv.interview_type] || "bg-surface-subtle text-navy-900";
                  return (
                    <div
                      key={iv.id}
                      className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${colors}`}
                      title={`${iv.company_name || "Interview"} - ${time}`}
                    >
                      {time} {iv.company_name || "Interview"}
                    </div>
                  );
                })}
                {dayInterviews.length > 2 && (
                  <div className="text-[10px] text-navy-500">
                    +{dayInterviews.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
