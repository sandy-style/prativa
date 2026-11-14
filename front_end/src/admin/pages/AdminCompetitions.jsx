import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Trophy,
  Plus,
  Edit3,
  LoaderCircle,
  X,
  Crown,
  CheckCircle,
  CalendarDays,
  Heart,
  Layers3,
  Medal,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const MANCH_OPTIONS = [
  { id: "voice", label: "Swar", subtitle: "Voice" },
  { id: "vision", label: "Drishya", subtitle: "Vision" },
  { id: "art", label: "Rang", subtitle: "Art" },
  { id: "words", label: "Shabda", subtitle: "Words" },
];

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const AdminCompetitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    likeThreshold: 1000,
    startDate: "",
    endDate: "",
    eligibleManchs: ["voice", "vision", "art", "words"],
    status: "active",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCompetitions = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/api/leaderboard/competitions`);

      if (res.data.success) {
        setCompetitions(res.data.competitions || []);
      }
    } catch (err) {
      console.error("Fetch competitions err:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);

    setForm({
      title: "",
      description: "",
      likeThreshold: 1000,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      eligibleManchs: ["voice", "vision", "art", "words"],
      status: "active",
    });

    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (comp) => {
    setEditingId(comp._id);

    setForm({
      title: comp.title || "",
      description: comp.description || "",
      likeThreshold: comp.likeThreshold || 1000,
      startDate: comp.startDate
        ? new Date(comp.startDate).toISOString().split("T")[0]
        : "",
      endDate: comp.endDate
        ? new Date(comp.endDate).toISOString().split("T")[0]
        : "",
      eligibleManchs: comp.eligibleManchs || [
        "voice",
        "vision",
        "art",
        "words",
      ],
      status: comp.status || "active",
    });

    setError("");
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await axios.put(
          `${API_URL}/api/leaderboard/competitions/${editingId}`,
          form,
          { withCredentials: true },
        );
      } else {
        await axios.post(`${API_URL}/api/leaderboard/competitions`, form, {
          withCredentials: true,
        });
      }

      setShowModal(false);
      fetchCompetitions();
    } catch (err) {
      console.error("Save competition err:", err);
      setError(err.response?.data?.message || "Failed to save competition.");
    } finally {
      setSaving(false);
    }
  };

  const toggleManch = (manch) => {
    setForm((prev) => {
      const exists = prev.eligibleManchs.includes(manch);

      const updated = exists
        ? prev.eligibleManchs.filter((m) => m !== manch)
        : [...prev.eligibleManchs, manch];

      return {
        ...prev,
        eligibleManchs: updated.length ? updated : [manch],
      };
    });
  };

  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const activeCount = competitions.filter(
    (competition) => competition.status === "active",
  ).length;

  const completedCount = competitions.filter(
    (competition) => competition.status === "completed",
  ).length;

  return (
    <div className="space-y-7 pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#991B35]">
            <Trophy size={14} />
            Competition Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#242124] sm:text-3xl">
            Competitions & Crown Races
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#77716F]">
            Configure like thresholds, eligible Manchs, and competition settings
            to manage the journey toward becoming a champion.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#991B35] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7F172D] active:scale-[0.98]"
        >
          <Plus size={17} />
          New Competition
        </button>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#EBE8E5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#88817E]">
                Total Competitions
              </p>
              <p className="mt-2 text-3xl font-bold text-[#242124]">
                {competitions.length}
              </p>
            </div>

            <div className="rounded-xl bg-[#991B35]/10 p-3 text-[#991B35]">
              <Trophy size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EBE8E5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#88817E]">
                Active Competitions
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {activeCount}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <Sparkles size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EBE8E5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#88817E]">Completed</p>
              <p className="mt-2 text-3xl font-bold text-blue-700">
                {completedCount}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Medal size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* COMPETITION TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#EBE8E5] bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[#F0EEEC] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-bold text-[#242124]">
              All Competitions
            </h2>
            <p className="mt-1 text-xs text-[#88817E]">
              View and manage your competition configurations.
            </p>
          </div>

          <span className="w-fit rounded-full bg-[#F8F5F3] px-3 py-1.5 text-xs font-semibold text-[#6E6663]">
            {competitions.length} Total
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoaderCircle size={30} className="animate-spin text-[#991B35]" />
            <p className="mt-3 text-sm text-[#88817E]">
              Loading competitions...
            </p>
          </div>
        ) : competitions.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
            <div className="rounded-2xl bg-[#F8F5F3] p-4 text-[#991B35]">
              <Trophy size={30} />
            </div>

            <h3 className="mt-4 text-base font-bold text-[#242124]">
              No competitions yet
            </h3>

            <p className="mt-2 max-w-sm text-sm text-[#88817E]">
              Create your first competition to start organizing crown races and
              rewarding outstanding creators.
            </p>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#991B35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7F172D]"
            >
              <Plus size={16} />
              Create Competition
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-[#EBE8E5] bg-[#FAF9F7]">
                <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#88817E]">
                  <th className="px-6 py-4">Competition</th>
                  <th className="px-4 py-4">Like Threshold</th>
                  <th className="px-4 py-4">Eligible Manchs</th>
                  <th className="px-4 py-4">Winner</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F0EEEC]">
                {competitions.map((c) => (
                  <tr key={c._id} className="transition hover:bg-[#FCFAF9]">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl bg-[#991B35]/10 p-2.5 text-[#991B35]">
                          <Trophy size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-[#292426]">
                            {c.title}
                          </p>

                          <p className="mt-1 text-[11px] text-[#99918D]">
                            Slug: {c.slug || "Not available"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Heart size={15} className="text-[#991B35]" />
                        <span className="font-bold tabular-nums text-[#292426]">
                          {c.likeThreshold?.toLocaleString() || 0}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-[#99918D]">
                        Required likes
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex max-w-[180px] flex-wrap gap-1.5">
                        {(c.eligibleManchs || []).length > 0 ? (
                          c.eligibleManchs.map((manch) => (
                            <span
                              key={manch}
                              className="rounded-md border border-[#EBE8E5] bg-[#FAF9F7] px-2 py-1 text-[10px] font-medium capitalize text-[#625B58]"
                            >
                              {manch}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#88817E]">
                            All Manchs
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {c.isWinnerLocked ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                          <Crown size={12} />
                          Declared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#88817E]">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          In Progress
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${
                          STATUS_STYLES[c.status] ||
                          "border-[#EBE8E5] bg-[#F8F5F3] text-[#77716F]"
                        }`}
                      >
                        {c.status || "Unknown"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        title="Edit competition"
                        className="inline-flex items-center justify-center rounded-lg border border-[#EBE8E5] bg-white p-2 text-[#77716F] transition hover:border-[#991B35]/30 hover:bg-[#991B35]/5 hover:text-[#991B35]"
                      >
                        <Edit3 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171315]/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setShowModal(false);
            }
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#EBE8E5] bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#F0EEEC] bg-white px-6 py-5">
              <div>
                <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#991B35]">
                  <Trophy size={13} />
                  Competition Settings
                </div>

                <h3 className="text-lg font-bold text-[#242124]">
                  {editingId ? "Edit Competition" : "Create Competition"}
                </h3>

                <p className="mt-1 text-xs text-[#88817E]">
                  Set up the rules and eligibility for this competition.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="rounded-xl border border-[#EBE8E5] p-2 text-[#77716F] transition hover:bg-[#F8F5F3] hover:text-[#991B35] disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL FORM */}
            <form onSubmit={handleSave} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                  Competition Title <span className="text-[#991B35]">*</span>
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Monthly Crown Race"
                  required
                  className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm text-[#292426] outline-none transition placeholder:text-[#B0A9A5] focus:border-[#991B35] focus:ring-2 focus:ring-[#991B35]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe the competition and its purpose..."
                  className="w-full resize-y rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm text-[#292426] outline-none transition placeholder:text-[#B0A9A5] focus:border-[#991B35] focus:ring-2 focus:ring-[#991B35]/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#48413E]">
                    <Heart size={14} className="text-[#991B35]" />
                    Like Threshold <span className="text-[#991B35]">*</span>
                  </label>

                  <input
                    type="number"
                    value={form.likeThreshold}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        likeThreshold: Number(e.target.value),
                      })
                    }
                    min={1}
                    required
                    className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm text-[#292426] outline-none transition focus:border-[#991B35] focus:ring-2 focus:ring-[#991B35]/10"
                  />

                  <p className="mt-1.5 text-[10px] text-[#99918D]">
                    Default threshold: 1,000 likes
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                    Competition Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm text-[#292426] outline-none transition focus:border-[#991B35] focus:ring-2 focus:ring-[#991B35]/10"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* DATE FIELDS */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#48413E]">
                    <CalendarDays size={14} className="text-[#991B35]" />
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm text-[#292426] outline-none transition focus:border-[#991B35] focus:ring-2 focus:ring-[#991B35]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#48413E]">
                    <CalendarDays size={14} className="text-[#991B35]" />
                    End Date
                  </label>

                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    min={form.startDate || undefined}
                    className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm text-[#292426] outline-none transition focus:border-[#991B35] focus:ring-2 focus:ring-[#991B35]/10"
                  />
                </div>
              </div>

              {/* ELIGIBLE MANCHS */}
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#48413E]">
                    <Layers3 size={14} className="text-[#991B35]" />
                    Eligible Manchs
                  </label>

                  <span className="text-[10px] text-[#99918D]">
                    Select at least one
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {MANCH_OPTIONS.map((manch) => {
                    const selected = form.eligibleManchs.includes(manch.id);

                    return (
                      <button
                        key={manch.id}
                        type="button"
                        onClick={() => toggleManch(manch.id)}
                        className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-[#991B35]/30 bg-[#991B35]/5"
                            : "border-[#EBE8E5] bg-white hover:border-[#D8CECA] hover:bg-[#FAF9F7]"
                        }`}
                      >
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              selected ? "text-[#991B35]" : "text-[#48413E]"
                            }`}
                          >
                            {manch.label}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#99918D]">
                            {manch.subtitle}
                          </p>
                        </div>

                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            selected
                              ? "border-[#991B35] bg-[#991B35] text-white"
                              : "border-[#D8D2CF] bg-white text-transparent"
                          }`}
                        >
                          <CheckCircle size={13} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* MODAL FOOTER */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#F0EEEC] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="rounded-xl border border-[#E7E2DF] px-5 py-2.5 text-sm font-semibold text-[#625B58] transition hover:bg-[#F8F5F3] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !form.title.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#991B35] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7F172D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingId ? (
                        <CheckCircle size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                      {editingId ? "Update Competition" : "Create Competition"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompetitions;
