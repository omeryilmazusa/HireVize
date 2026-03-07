"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageContainer } from "@/components/layout/PageContainer";
import type { TeamMember, TeamInvite } from "@/types/team";

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const loadData = async () => {
    try {
      const [m, i] = await Promise.all([
        api.get<TeamMember[]>("/api/v1/teams/my/members"),
        api.get<TeamInvite[]>("/api/v1/teams/my/invites"),
      ]);
      setMembers(m);
      setInvites(i);
    } catch (err: any) {
      setError(err.detail || "Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError("");
    try {
      await api.post("/api/v1/teams/my/invites", { email: inviteEmail.trim() });
      setInviteEmail("");
      await loadData();
    } catch (err: any) {
      setInviteError(err.detail || "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Remove this member from the team?")) return;
    try {
      await api.delete(`/api/v1/teams/my/members/${userId}`);
      await loadData();
    } catch (err: any) {
      alert(err.detail || "Failed to remove member");
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await api.delete(`/api/v1/teams/my/invites/${inviteId}`);
      await loadData();
    } catch (err: any) {
      alert(err.detail || "Failed to cancel invite");
    }
  };

  if (loading) {
    return (
      <PageContainer title="Team Members">
        <p className="text-navy-500">Loading...</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Team Members">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Team Members">
      {/* Members list */}
      <div className="mb-8 rounded-xl border border-border-card bg-white">
        <div className="border-b border-border-card px-6 py-4">
          <h3 className="font-semibold text-navy-900">Current Members</h3>
        </div>
        <div className="divide-y divide-border-card">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-navy-900">
                  {m.first_name} {m.last_name}
                </p>
                <p className="text-sm text-navy-500">{m.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                  {m.role}
                </span>
                {m.role !== "manager" && (
                  <button
                    onClick={() => handleRemoveMember(m.user_id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <p className="px-6 py-8 text-center text-navy-500">No members yet</p>
          )}
        </div>
      </div>

      {/* Invite form */}
      <div className="mb-8 rounded-xl border border-border-card bg-white p-6">
        <h3 className="mb-4 font-semibold text-navy-900">Invite Member</h3>
        <form onSubmit={handleInvite} className="flex gap-3">
          <input
            type="email"
            placeholder="Enter email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 rounded-lg border border-border-card px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            required
          />
          <button
            type="submit"
            disabled={inviting}
            className="rounded-lg bg-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {inviting ? "Sending..." : "Send Invite"}
          </button>
        </form>
        {inviteError && (
          <p className="mt-2 text-sm text-red-500">{inviteError}</p>
        )}
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="rounded-xl border border-border-card bg-white">
          <div className="border-b border-border-card px-6 py-4">
            <h3 className="font-semibold text-navy-900">Pending Invites</h3>
          </div>
          <div className="divide-y divide-border-card">
            {invites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-navy-900">{inv.email}</p>
                  <p className="text-xs text-navy-500">
                    Expires {new Date(inv.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleCancelInvite(inv.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
