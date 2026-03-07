"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const navGroups = [
  {
    label: "WORKSPACE",
    items: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/jobs", label: "Jobs" },
      { href: "/resumes", label: "Resumes" },
    ],
  },
  {
    label: "RECRUITMENT",
    items: [
      { href: "/applications", label: "Applications" },
      { href: "/interviews", label: "Interviews" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { href: "/profile", label: "Profile" },
      { href: "/extension", label: "Extension" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "?";

  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-border-card bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-border-card px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-lg font-extrabold text-navy-900">HireVize</h1>
          <p className="font-mono text-[10px] uppercase tracking-wider text-navy-500">AI-Powered</p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1.5 px-3 font-mono text-[10px] font-medium uppercase tracking-wider text-navy-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-500 text-white"
                        : "text-navy-800 hover:bg-[#EEF2FF] hover:text-primary-500"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="border-t border-border-card px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-navy-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="truncate text-xs text-navy-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-navy-600 hover:bg-[#EEF2FF] hover:text-primary-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
