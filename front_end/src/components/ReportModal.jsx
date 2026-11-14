import React, { useState } from "react";
import axios from "axios";
import { Flag, X, LoaderCircle, CheckCircle2, ShieldAlert } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const reasons = [
  { value: "inappropriate_content", label: "Inappropriate Content" },
  { value: "harassment", label: "Harassment or Bullying" },
  { value: "hate_speech", label: "Hate Speech" },
  { value: "copyright_violation", label: "Copyright Violation / Stolen Work" },
  { value: "spam", label: "Spam or Scam" },
  { value: "impersonation", label: "Impersonation" },
  { value: "violence", label: "Violence or Dangerous Content" },
  { value: "privacy_violation", label: "Privacy Violation" },
  { value: "other", label: "Other Policy Violation" },
];

const ReportModal = ({ targetType = "post", targetId, targetTitle = "", onClose }) => {
  const [reason, setReason] = useState("inappropriate_content");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetId) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/api/reports`,
        {
          targetType,
          targetId,
          reason,
          description: description.trim(),
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err) {
      console.error("Report submit error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit report. Please log in or try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#070F2B] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 size={48} className="mb-3 text-emerald-400" />
            <h3 className="font-['Orbitron'] text-lg font-bold text-white">Report Submitted</h3>
            <p className="mt-2 text-xs text-slate-300">
              Thank you for keeping PRATIVA safe and respectful. Our moderation team will review this shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="font-['Orbitron'] text-base font-bold text-white">
                  Report {targetType === "post" ? "Post" : "Creator"}
                </h3>
                {targetTitle && (
                  <p className="max-w-[260px] truncate text-xs text-slate-400">"{targetTitle}"</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Select Reason *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#081326] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#FF4DB8]"
                >
                  {reasons.map((r) => (
                    <option key={r.value} value={r.value} className="bg-[#070F2B]">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context or links to help our moderation team evaluate..."
                  rows={3}
                  maxLength={1000}
                  className="w-full rounded-xl border border-white/10 bg-[#081326] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#FF4DB8]"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-400">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 font-['Orbitron'] text-xs font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
                >
                  {loading && <LoaderCircle size={14} className="animate-spin" />}
                  <span>{loading ? "Submitting..." : "Submit Report"}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
