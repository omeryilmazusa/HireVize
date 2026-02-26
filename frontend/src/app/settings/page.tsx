"use client";

import { PageContainer } from "@/components/layout/PageContainer";

export default function SettingsPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Profile</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input placeholder="Full Name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input placeholder="Email" type="email" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input placeholder="Phone" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input placeholder="LinkedIn URL" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input placeholder="Portfolio URL" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <button className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Save Profile
          </button>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">API Keys</h3>
          <div className="space-y-4">
            <input placeholder="OpenAI API Key" type="password" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input placeholder="Anthropic API Key" type="password" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <button className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Save Keys
          </button>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Preferences</h3>
          <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="claude-sonnet-4-20250514">Claude Sonnet</option>
            <option value="gpt-4o">GPT-4o</option>
          </select>
        </section>
      </div>
    </PageContainer>
  );
}
