"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { InterviewTypeBadge } from "@/components/interviews/InterviewTypeBadge";
import { InterviewStatusBadge } from "@/components/interviews/InterviewStatusBadge";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/types/application";
import type { Interview } from "@/types/interview";

const STAT_COLORS = ["#1E6FFF", "#7C3AED", "#F59E0B", "#00875A"];

interface PipelineGroup {
  key: string;
  label: string;
  interviews: Interview[];
  accentColor: string;
  muted: boolean;
  showNextStep: boolean;
}

function groupInterviews(interviews: Interview[]): PipelineGroup[] {
  const now = new Date();

  const upcoming = interviews.filter(
    (i) => i.status === "scheduled" && new Date(i.scheduled_at) >= now
  );
  const awaitingResult = interviews.filter(
    (i) => i.status === "completed" && (!i.result || i.result === "pending")
  );
  const passed = interviews.filter((i) => i.result === "passed");
  const failed = interviews.filter((i) => i.result === "failed");
  const cancelled = interviews.filter((i) => i.status === "cancelled");

  return [
    {
      key: "upcoming",
      label: "Upcoming",
      interviews: upcoming.sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      ),
      accentColor: "#1E6FFF",
      muted: false,
      showNextStep: false,
    },
    {
      key: "awaiting",
      label: "Awaiting Result",
      interviews: awaitingResult.sort(
        (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
      ),
      accentColor: "#F59E0B",
      muted: false,
      showNextStep: false,
    },
    {
      key: "passed",
      label: "Passed",
      interviews: passed.sort(
        (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
      ),
      accentColor: "#00875A",
      muted: false,
      showNextStep: true,
    },
    {
      key: "failed",
      label: "Failed",
      interviews: failed.sort(
        (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
      ),
      accentColor: "#EF4444",
      muted: true,
      showNextStep: false,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      interviews: cancelled.sort(
        (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
      ),
      accentColor: "#9CA3AF",
      muted: true,
      showNextStep: false,
    },
  ];
}

function findNextStep(
  interview: Interview,
  allInterviews: Interview[]
): Interview | null {
  const candidates = allInterviews.filter(
    (i) =>
      i.application_id === interview.application_id &&
      i.id !== interview.id &&
      i.status === "scheduled" &&
      new Date(i.scheduled_at) > new Date(interview.scheduled_at)
  );
  if (candidates.length === 0) return null;
  candidates.sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  );
  return candidates[0];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, iv] = await Promise.all([
          api.get<DashboardStats>("/api/v1/dashboard/stats"),
          api.get<Interview[]>("/api/v1/interviews"),
        ]);
        setStats(s);
        setInterviews(iv);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <p className="text-center text-navy-500">Loading dashboard...</p>
      </PageContainer>
    );
  }

  const awaiting = stats
    ? (stats.by_status["pending"] || 0) + (stats.by_status["submitted"] || 0)
    : 0;

  const statCards = [
    { label: "Total Applied", value: String(stats?.total_applications ?? 0) },
    { label: "This Week", value: String(stats?.this_week ?? 0) },
    { label: "Awaiting Response", value: String(awaiting) },
    { label: "Response Rate", value: `${stats?.response_rate ?? 0}%` },
  ];

  const groups = groupInterviews(interviews);

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            color={STAT_COLORS[idx]}
          />
        ))}
      </div>

      {/* Interview Pipeline */}
      <div className="mt-8 space-y-8">
        {groups.map((group) => {
          if (group.interviews.length === 0) return null;
          return (
            <div key={group.key}>
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: group.accentColor }}
                />
                <h3 className="font-display text-lg font-bold text-navy-900">
                  {group.label}
                </h3>
                <span
                  className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
                  style={{ backgroundColor: group.accentColor }}
                >
                  {group.interviews.length}
                </span>
              </div>
              <div className="space-y-3">
                {group.interviews.map((iv) => (
                  <InterviewCard
                    key={iv.id}
                    interview={iv}
                    nextStep={
                      group.showNextStep
                        ? findNextStep(iv, interviews)
                        : undefined
                    }
                    showNextStep={group.showNextStep}
                    muted={group.muted}
                    accentColor={group.accentColor}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {interviews.length === 0 && (
          <div className="rounded-card border border-border-card bg-white p-8 text-center text-navy-500">
            No interviews yet. Schedule your first interview from an application.
          </div>
        )}
      </div>
    </PageContainer>
  );
}

/* ── InterviewCard ─────────────────────────────────────────────── */

function InterviewCard({
  interview,
  nextStep,
  showNextStep,
  muted,
  accentColor,
}: {
  interview: Interview;
  nextStep?: Interview | null;
  showNextStep?: boolean;
  muted?: boolean;
  accentColor?: string;
}) {
  const date = new Date(interview.scheduled_at);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className={`relative overflow-hidden rounded-card border border-border-card bg-white transition-colors ${
        muted ? "opacity-60" : "hover:bg-surface-hover"
      }`}
    >
      {/* Accent left border */}
      {accentColor && (
        <div
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ backgroundColor: accentColor }}
        />
      )}

      <div className="p-4 pl-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-navy-900 truncate">
                {interview.company_name || "Unknown Company"}
              </span>
              <InterviewTypeBadge type={interview.interview_type} />
              <InterviewStatusBadge status={interview.status} />
              {interview.result && (
                <ResultIndicator result={interview.result} />
              )}
            </div>
            <div className="mt-1 font-mono text-xs text-navy-500">
              {interview.job_title && <span>{interview.job_title} &middot; </span>}
              <span>{dateStr} at {timeStr}</span>
              <span> &middot; {interview.duration_minutes} min</span>
              {interview.location && <span> &middot; {interview.location}</span>}
              {interview.interviewer_name && (
                <span> &middot; with {interview.interviewer_name}</span>
              )}
            </div>
          </div>
          <Link
            href={`/interviews/${interview.id}`}
            className="ml-4 text-sm font-medium text-primary-500 hover:text-primary-700"
          >
            View
          </Link>
        </div>

        {/* Next step row (for passed interviews) */}
        {showNextStep && (
          <div className="mt-3 border-t border-border-card pt-3">
            {nextStep ? (
              <Link
                href={`/interviews/${nextStep.id}`}
                className="inline-flex items-center gap-2 text-xs font-medium text-[#00875A] hover:underline"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Next: {nextStep.interview_type.charAt(0).toUpperCase() + nextStep.interview_type.slice(1)} on{" "}
                {new Date(nextStep.scheduled_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Awaiting next step scheduling
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ResultIndicator ───────────────────────────────────────────── */

function ResultIndicator({ result }: { result: string }) {
  const config: Record<string, { dot: string; text: string }> = {
    passed: { dot: "bg-[#00875A]", text: "text-[#00875A]" },
    failed: { dot: "bg-red-500", text: "text-red-500" },
    pending: { dot: "bg-amber-500", text: "text-amber-600" },
  };
  const c = config[result] || { dot: "bg-[#9CA3AF]", text: "text-[#9CA3AF]" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {result}
    </span>
  );
}

/* ── StatCard ──────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-card border border-border-card bg-white p-6">
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: color }}
      />
      <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-navy-500">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold text-navy-900">{value}</p>
    </div>
  );
}
