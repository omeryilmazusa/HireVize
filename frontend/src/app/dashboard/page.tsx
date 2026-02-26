import { PageContainer } from "@/components/layout/PageContainer";

export default function DashboardPage() {
  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Applied" value="0" />
        <StatCard label="This Week" value="0" />
        <StatCard label="Awaiting Response" value="0" />
        <StatCard label="Response Rate" value="0%" />
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold">Recent Applications</h3>
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No applications yet. Paste a job URL to get started.
        </div>
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
