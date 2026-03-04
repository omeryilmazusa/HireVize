import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  if (cookieStore.get("access_token")) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-surface-page text-navy-800">
      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="shrink-0"
          >
            <rect width="32" height="32" rx="8" fill="#1E6FFF" />
            <path
              d="M10 16.5L14 20.5L22 12.5"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-display text-xl font-bold text-navy-900">
            Hirevize
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="px-4 py-2 text-sm font-medium text-navy-800 hover:text-primary-500 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 text-sm font-semibold text-white bg-primary-500 rounded-card hover:bg-primary-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-8 pt-20 pb-28 max-w-7xl mx-auto text-center">
        {/* decorative blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-[120px]"
        />

        <h1 className="relative font-display text-5xl md:text-6xl font-extrabold leading-tight text-navy-900">
          Track Every Interview.
          <br />
          Land the Right Job.
        </h1>
        <p className="relative mt-6 max-w-2xl mx-auto text-lg text-navy-600 leading-relaxed">
          Hirevize helps you organize applications, manage your interview
          pipeline, and gain smart insights — so you can focus on what matters
          most: getting hired.
        </p>

        <div className="relative mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-7 py-3 text-base font-semibold text-white bg-primary-500 rounded-card hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
          >
            Get Started — It&apos;s Free
          </Link>
          <Link
            href="/signin"
            className="px-7 py-3 text-base font-semibold text-navy-800 bg-white border border-border-card rounded-card hover:bg-surface-hover transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className="px-8 py-20 max-w-7xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-center text-navy-900">
          Everything you need to manage your job search
        </h2>
        <p className="mt-3 text-center text-navy-600 max-w-xl mx-auto">
          Powerful tools designed to keep your applications organized and your
          interviews on track.
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card: Application Tracking */}
          <div className="bg-white border border-border-card rounded-card p-8 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-50">
              <svg
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                className="text-primary-500"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 12h8M8 8h8M8 16h4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-navy-900">
              Application Tracking
            </h3>
            <p className="mt-2 text-sm text-navy-600 leading-relaxed">
              Keep every application in one place — status, company, role, and
              deadlines at a glance.
            </p>
          </div>

          {/* Card: Interview Pipeline */}
          <div className="bg-white border border-border-card rounded-card p-8 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-50">
              <svg
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                className="text-primary-500"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="9" cy="6" r="1.5" fill="currentColor" />
                <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                <circle cx="11" cy="18" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-navy-900">
              Interview Pipeline
            </h3>
            <p className="mt-2 text-sm text-navy-600 leading-relaxed">
              Visualize every stage — from phone screen to final round — and
              never miss a follow-up.
            </p>
          </div>

          {/* Card: Smart Analytics */}
          <div className="bg-white border border-border-card rounded-card p-8 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-50">
              <svg
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                className="text-primary-500"
              >
                <path
                  d="M4 20V10M10 20V4M16 20v-8M22 20v-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-navy-900">
              Smart Analytics
            </h3>
            <p className="mt-2 text-sm text-navy-600 leading-relaxed">
              Understand response rates, time-to-offer, and where to focus your
              energy with actionable charts.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-center text-navy-900">
          How It Works
        </h2>

        <div className="mt-14 grid gap-10 sm:grid-cols-3 text-center">
          {[
            {
              step: "1",
              title: "Add Applications",
              desc: "Quickly log every job you apply to with key details.",
            },
            {
              step: "2",
              title: "Track Interviews",
              desc: "Move applications through interview stages as you progress.",
            },
            {
              step: "3",
              title: "Get Results",
              desc: "Review insights and analytics to refine your strategy.",
            },
          ].map((item) => (
            <div key={item.step}>
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary-500 text-white font-bold text-lg">
                {item.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-navy-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-navy-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────── */}
      <section className="px-8 py-16 max-w-7xl mx-auto">
        <div className="rounded-card bg-navy-900 text-center px-8 py-16">
          <h2 className="font-display text-3xl font-bold text-white">
            Ready to take control of your job search?
          </h2>
          <p className="mt-3 text-navy-500 max-w-lg mx-auto">
            Join Hirevize today and start tracking your applications with
            confidence.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block px-8 py-3 text-base font-semibold text-navy-900 bg-white rounded-card hover:bg-surface-page transition-colors"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="px-8 py-10 text-center text-sm text-navy-600">
        &copy; {new Date().getFullYear()} Hirevize. All rights reserved.
      </footer>
    </div>
  );
}
