"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { CalendarGrid } from "@/components/interviews/CalendarGrid";
import { InterviewList } from "@/components/interviews/InterviewList";
import { InterviewFormModal } from "@/components/interviews/InterviewFormModal";
import { useInterviews } from "@/hooks/useInterviews";
import { api } from "@/lib/api";
import type { Interview, InterviewCreate, InterviewUpdate } from "@/types/interview";

export default function InterviewsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const { interviews, isLoading, mutate } = useInterviews(monthStr);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    );
  };

  const handleCreate = () => {
    setEditingInterview(null);
    setModalOpen(true);
  };

  const handleEdit = (interview: Interview) => {
    setEditingInterview(interview);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this interview?")) return;
    await api.delete(`/api/v1/interviews/${id}`);
    mutate();
  };

  const handleSubmit = async (data: InterviewCreate | InterviewUpdate) => {
    if (editingInterview) {
      await api.put(`/api/v1/interviews/${editingInterview.id}`, data);
    } else {
      await api.post("/api/v1/interviews", data);
    }
    mutate();
  };

  const monthName = new Date(year, month).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header with month navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-2xl font-bold text-navy-900">Interviews</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="rounded-lg border border-border-card px-3 py-1.5 text-sm font-medium text-navy-800 hover:bg-surface-hover transition-colors"
              >
                &larr;
              </button>
              <span className="min-w-[160px] text-center text-sm font-semibold text-navy-800">
                {monthName}
              </span>
              <button
                onClick={nextMonth}
                className="rounded-lg border border-border-card px-3 py-1.5 text-sm font-medium text-navy-800 hover:bg-surface-hover transition-colors"
              >
                &rarr;
              </button>
              <button
                onClick={goToToday}
                className="rounded-lg border border-border-card px-3 py-1.5 text-xs font-medium text-navy-600 hover:bg-surface-hover transition-colors"
              >
                Today
              </button>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Schedule Interview
          </button>
        </div>

        {/* Calendar */}
        {isLoading ? (
          <div className="text-center text-navy-500 py-12">Loading...</div>
        ) : (
          <CalendarGrid
            year={year}
            month={month}
            interviews={interviews || []}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}

        {/* Interview list for selected date */}
        <div>
          <h2 className="mb-3 font-display text-lg font-bold text-navy-900">
            {selectedDate
              ? `Interviews on ${new Date(selectedDate + "T00:00").toLocaleDateString("default", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}`
              : "All interviews this month"}
          </h2>
          <InterviewList
            interviews={interviews || []}
            selectedDate={selectedDate}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <InterviewFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        interview={editingInterview}
      />
    </PageContainer>
  );
}
