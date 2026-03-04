"use client";

import { PageContainer } from "@/components/layout/PageContainer";

const steps = [
  "Click the Download Extension button above to get the .zip file.",
  "Unzip the downloaded file to a folder on your computer.",
  'Open Chrome and navigate to chrome://extensions.',
  "Enable Developer mode using the toggle in the top-right corner.",
  'Click "Load unpacked" and select the unzipped folder.',
  "Pin the Hirevize extension from the Extensions puzzle-piece menu, then log in with your Hirevize account.",
];

export default function ExtensionPage() {
  return (
    <PageContainer title="Download Extension">
      <div className="space-y-8">
        {/* Download card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Hirevize Chrome Extension
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Auto-fill job applications on any job board directly from your
            Hirevize profile.
          </p>
          <a
            href="/api/v1/extension/download"
            download
            className="mt-4 inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Download Extension
          </a>
        </div>

        {/* Setup instructions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Setup Instructions
          </h2>
          <ol className="mt-4 space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-medium text-primary-700">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </PageContainer>
  );
}
