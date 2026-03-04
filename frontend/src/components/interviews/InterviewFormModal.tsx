"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { useApplications } from "@/hooks/useApplications";
import { INTERVIEW_TYPES, INTERVIEW_STATUSES, INTERVIEW_RESULTS } from "@/lib/constants";
import type { Interview, InterviewCreate, InterviewUpdate } from "@/types/interview";

interface InterviewFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InterviewCreate | InterviewUpdate) => Promise<void>;
  interview?: Interview | null;
}

export function InterviewFormModal({
  open,
  onClose,
  onSubmit,
  interview,
}: InterviewFormModalProps) {
  const { applications } = useApplications();
  const isEdit = !!interview;

  const [applicationId, setApplicationId] = useState("");
  const [interviewType, setInterviewType] = useState("phone");
  const [status, setStatus] = useState("scheduled");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [location, setLocation] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (interview) {
      setApplicationId(interview.application_id);
      setInterviewType(interview.interview_type);
      setStatus(interview.status);
      setScheduledAt(interview.scheduled_at.slice(0, 16));
      setDurationMinutes(String(interview.duration_minutes));
      setLocation(interview.location || "");
      setInterviewerName(interview.interviewer_name || "");
      setNotes(interview.notes || "");
      setFeedback(interview.feedback || "");
      setResult(interview.result || "");
    } else {
      setApplicationId("");
      setInterviewType("phone");
      setStatus("scheduled");
      setScheduledAt("");
      setDurationMinutes("60");
      setLocation("");
      setInterviewerName("");
      setNotes("");
      setFeedback("");
      setResult("");
    }
    setError(null);
  }, [interview, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        const data: InterviewUpdate = {
          interview_type: interviewType,
          status,
          scheduled_at: new Date(scheduledAt).toISOString(),
          duration_minutes: parseInt(durationMinutes),
          location: location || undefined,
          interviewer_name: interviewerName || undefined,
          notes: notes || undefined,
          feedback: feedback || undefined,
          result: result || undefined,
        };
        await onSubmit(data);
      } else {
        const data: InterviewCreate = {
          application_id: applicationId,
          interview_type: interviewType,
          scheduled_at: new Date(scheduledAt).toISOString(),
          duration_minutes: parseInt(durationMinutes),
          location: location || undefined,
          interviewer_name: interviewerName || undefined,
          notes: notes || undefined,
        };
        await onSubmit(data);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border-card bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";
  const labelClass = "block text-sm font-medium text-navy-800 mb-1";

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Interview" : "Schedule Interview"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && (
          <div>
            <label className={labelClass}>Application</label>
            <select
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select an application...</option>
              {applications?.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company_name || "Unknown"} - {app.job_title || "Untitled"}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Type</label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className={inputClass}
            >
              {INTERVIEW_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {isEdit && (
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                {INTERVIEW_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Duration (minutes)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              min="15"
              max="480"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Office, Zoom link, etc."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Interviewer</label>
            <input
              type="text"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              placeholder="Name of interviewer"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Preparation notes, topics to discuss..."
            className={inputClass}
          />
        </div>

        {isEdit && (
          <>
            <div>
              <label className={labelClass}>Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
                placeholder="Post-interview feedback..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Result</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className={inputClass}
              >
                <option value="">Not set</option>
                {INTERVIEW_RESULTS.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-border-card px-4 py-2 text-sm font-medium text-navy-800 hover:bg-surface-hover disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary-500 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Schedule"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
