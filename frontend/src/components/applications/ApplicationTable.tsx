"use client";

import { useMemo, useState } from "react";
import { useApplications } from "@/hooks/useApplications";
import { ApplicationRow } from "./ApplicationRow";

const STATUS_FILTERS = [
  "all",
  "pending",
  "applying",
  "draft",
  "submitted",
  "interviewing",
  "offered",
  "accepted",
  "rejected",
  "withdrawn",
  "failed",
];

export function ApplicationTable() {
  const { applications, isLoading, mutate } = useApplications();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    if (!applications) return [];
    return applications.filter((app) => {
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const company = (app.company_name || "").toLowerCase();
        const title = (app.job_title || "").toLowerCase();
        if (!company.includes(q) && !title.includes(q)) return false;
      }
      return true;
    });
  }, [applications, search, statusFilter]);

  if (isLoading) {
    return <div className="text-center text-navy-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:min-w-[350px] flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or position..."
            className="w-full rounded-lg border border-border-card bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-primary-500 text-white"
                  : "bg-surface-subtle text-navy-600 hover:bg-[#EEF2FF]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {!applications || applications.length === 0 ? (
        <div className="rounded-card border border-border-card bg-white p-8 text-center text-navy-500">
          No applications yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-card border border-border-card bg-white p-8 text-center text-navy-500">
          No applications match your filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border-card bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-card bg-surface-subtle">
              <tr>
                <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-navy-500">Company</th>
                <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-navy-500">Position</th>
                <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-navy-500">Status</th>
                <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-navy-500">Date</th>
                <th className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-navy-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((app) => (
                <ApplicationRow key={app.id} application={app} onMutate={mutate} />
              ))}
            </tbody>
          </table>
          <div className="border-t border-border-card bg-surface-subtle px-4 py-2 text-xs text-navy-500">
            Showing {filtered.length} of {applications.length} application{applications.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
