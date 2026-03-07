"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageContainer } from "@/components/layout/PageContainer";
import type { TeamDashboardStats } from "@/types/team";

export default function TeamDashboardPage() {
  const [stats, setStats] = useState<TeamDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<TeamDashboardStats>("/api/v1/teams/my/dashboard")
      .then(setStats)
      .catch((err) => setError(err.detail || "Failed to load team dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer title="Team Dashboard">
        <p className="text-navy-500">Loading...</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Team Dashboard">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </PageContainer>
    );
  }

  if (!stats) return null;

  return (
    <PageContainer title="Team Dashboard">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-navy-900">{stats.team_name}</h2>
        <p className="text-sm text-navy-500">{stats.member_count} members</p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border-card bg-white p-5">
          <p className="text-sm font-medium text-navy-500">Total Applications</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{stats.total_applications}</p>
        </div>
        <div className="rounded-xl border border-border-card bg-white p-5">
          <p className="text-sm font-medium text-navy-500">This Week</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{stats.this_week}</p>
        </div>
        <div className="rounded-xl border border-border-card bg-white p-5">
          <p className="text-sm font-medium text-navy-500">Response Rate</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{stats.response_rate}%</p>
        </div>
      </div>

      {/* Per-member breakdown */}
      <div className="rounded-xl border border-border-card bg-white">
        <div className="border-b border-border-card px-6 py-4">
          <h3 className="font-semibold text-navy-900">Member Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-card text-navy-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Total Apps</th>
                <th className="px-6 py-3 font-medium">This Week</th>
                <th className="px-6 py-3 font-medium">Response Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.per_member.map((m) => (
                <tr key={m.user_id} className="border-b border-border-card last:border-0">
                  <td className="px-6 py-3 font-medium text-navy-900">
                    {m.first_name} {m.last_name}
                  </td>
                  <td className="px-6 py-3 text-navy-700">{m.total_applications}</td>
                  <td className="px-6 py-3 text-navy-700">{m.this_week}</td>
                  <td className="px-6 py-3 text-navy-700">{m.response_rate}%</td>
                </tr>
              ))}
              {stats.per_member.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-navy-500">
                    No members yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
