"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { api } from "@/lib/api";
import type { DashboardStats, RecentApplication } from "@/types/application";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, r] = await Promise.all([
          api.get<DashboardStats>("/api/v1/dashboard/stats"),
          api.get<RecentApplication[]>("/api/v1/dashboard/recent"),
        ]);
        setStats(s);
        setRecent(r);
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
        <p className="text-center text-gray-500">Loading dashboard...</p>
      </PageContainer>
    );
  }

  const awaiting = stats
    ? (stats.by_status["pending"] || 0) + (stats.by_status["submitted"] || 0)
    : 0;

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Applied" value={String(stats?.total_applications ?? 0)} />
        <StatCard label="This Week" value={String(stats?.this_week ?? 0)} />
        <StatCard label="Awaiting Response" value={String(awaiting)} />
        <StatCard label="Response Rate" value={`${stats?.response_rate ?? 0}%`} />
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold">Recent Applications</h3>
        {recent.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
            No applications yet. Paste a job URL to get started.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Company</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Position</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {app.company_name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <Link
                        href={`/applications/${app.id}`}
                        className="text-primary-600 hover:underline"
                      >
                        {app.job_title || "Untitled"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
