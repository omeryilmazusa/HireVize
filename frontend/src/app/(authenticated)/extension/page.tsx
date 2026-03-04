"use client";

import { PageContainer } from "@/components/layout/PageContainer";

// TODO: Replace with your actual Chrome Web Store URL after publishing
const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/hirevize-auto-fill/EXTENSION_ID";

const steps = [
  'Click "Add to Chrome" above to install the extension from the Chrome Web Store.',
  'Click "Add extension" in the confirmation dialog.',
  "Pin the Hirevize extension by clicking the puzzle-piece icon in your toolbar.",
  "Click the Hirevize icon and log in with your Hirevize account.",
  "Navigate to any job application page — the auto-fill button will appear automatically.",
  "Click the floating Hirevize button to auto-fill the application with your profile data.",
];

function ChromeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2a10 10 0 0 0-8.66 5h5.66a5 5 0 0 1 6 0h4.34A10 10 0 0 0 12 2Zm0 15a5 5 0 0 1-4.33-2.5L4.34 9A10 10 0 0 0 12 22a10 10 0 0 0 7.66-3.5l-3.33-5.75A5 5 0 0 1 12 17Zm5-5a5 5 0 0 1-.67 2.5l3.33 5.75A10 10 0 0 0 22 12a10 10 0 0 0-2.34-6.5h-6.32A5 5 0 0 1 17 12Zm-5-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
      />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558"
      />
    </svg>
  );
}

function CursorClickIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
      />
    </svg>
  );
}

function ClipboardCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
      />
    </svg>
  );
}

const features = [
  {
    title: "Smart Auto-Fill",
    description:
      "Automatically fills out job applications using data from your Hirevize profile — name, experience, education, and more.",
    icon: SparklesIcon,
  },
  {
    title: "Multi-Platform Support",
    description:
      "Works on LinkedIn, Indeed, Greenhouse, Lever, Workday, and dozens of other job boards and ATS platforms.",
    icon: GlobeIcon,
  },
  {
    title: "One-Click Apply",
    description:
      "Submit applications in seconds instead of minutes. Just click the Hirevize icon and let the extension do the rest.",
    icon: CursorClickIcon,
  },
];

export default function ExtensionPage() {
  return (
    <PageContainer title="Chrome Extension">
      <div className="space-y-8">
        {/* Hero download card */}
        <div className="rounded-card bg-gradient-to-r from-primary-500 to-primary-700 p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Hirevize Chrome Extension
            </h2>
            <p className="mt-1 text-sm text-primary-100">
              Auto-fill job applications on any job board directly from your
              Hirevize profile.
            </p>
          </div>
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors sm:mt-0 sm:shrink-0"
          >
            <ChromeIcon className="h-4 w-4" />
            Add to Chrome
          </a>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-card border border-border-card bg-white p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                <feature.icon className="h-5 w-5 text-primary-500" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-navy-900">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-navy-800">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Setup instructions */}
        <div className="rounded-card border border-border-card bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
            <ClipboardCheckIcon className="h-5 w-5 text-primary-500" />
            Setup Instructions
          </h2>
          <ol className="mt-6 space-y-4">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-navy-800">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-medium text-primary-700">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Compatibility note */}
        <p className="text-center text-xs text-navy-500">
          Compatible with Chrome, Edge, Brave, and other Chromium-based
          browsers.
        </p>
      </div>
    </PageContainer>
  );
}
