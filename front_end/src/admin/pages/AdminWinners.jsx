import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Crown,
  Trophy,
  ShieldCheck,
  Download,
  LoaderCircle,
  ExternalLink,
  CheckCircle,
  XCircle,
  Edit2,
  X,
  RefreshCw,
  AlertCircle,
  Medal,
  Users,
  Calendar,
  Mail,
  Heart,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const AdminWinners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [selectedWinner, setSelectedWinner] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("verified");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState(false);

  const fetchWinners = async () => {
    try {
      setLoading(true);
      setFetchError("");

      const res = await axios.get(`${API_URL}/api/leaderboard/admin/winners`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setWinners(res.data.winners || []);
      }
    } catch (err) {
      console.error("Fetch winners error:", err);
      setFetchError(
        err.response?.data?.message || "Unable to load the winners registry.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const handleUpdateWinner = async () => {
    if (!selectedWinner) return;

    try {
      setUpdating(true);
      setActionMessage("");
      setActionError(false);

      const res = await axios.patch(
        `${API_URL}/api/leaderboard/admin/winners/${selectedWinner._id}`,
        {
          verificationStatus,
          adminNotes: adminNotes.trim(),
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        setActionMessage("Winner verification updated successfully.");

        const updatedWinner = {
          ...selectedWinner,
          verificationStatus,
          adminNotes: adminNotes.trim(),
        };

        setWinners((prev) =>
          prev.map((winner) =>
            winner._id === selectedWinner._id ? updatedWinner : winner,
          ),
        );

        setSelectedWinner(updatedWinner);
      }
    } catch (err) {
      console.error("Update winner error:", err);
      setActionError(true);
      setActionMessage(
        err.response?.data?.message || "Failed to update winner verification.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const escapeCSV = (value) => {
    const safeValue = value == null ? "" : String(value);
    return `"${safeValue.replace(/"/g, '""')}"`;
  };

  const handleExportWinners = () => {
    if (!winners.length) return;

    const headers = [
      "Winner ID",
      "User Name",
      "Username",
      "Database User ID",
      "Email",
      "Competition",
      "Qualifying Likes",
      "Threshold",
      "Reached At",
      "Verification Status",
      "Notes",
    ];

    const rows = winners.map((w) => [
      w._id,
      w.userName,
      w.username,
      w.userId,
      w.userEmail,
      w.competitionName,
      w.totalQualifyingLikes,
      w.thresholdRequired,
      w.reachedAt ? new Date(w.reachedAt).toISOString() : "",
      w.verificationStatus,
      w.adminNotes,
    ]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `prativa-champions-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const openWinner = (winner) => {
    setSelectedWinner(winner);
    setVerificationStatus(winner.verificationStatus || "pending");
    setAdminNotes(winner.adminNotes || "");
    setActionMessage("");
    setActionError(false);
  };

  const getVerificationStyle = (status) => {
    switch (status) {
      case "verified":
        return "border-emerald-100 bg-emerald-50 text-emerald-700";
      case "rejected":
        return "border-red-100 bg-red-50 text-red-700";
      default:
        return "border-amber-100 bg-amber-50 text-amber-700";
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const verifiedCount = winners.filter(
    (w) => w.verificationStatus === "verified",
  ).length;

  const pendingCount = winners.filter(
    (w) => w.verificationStatus === "pending",
  ).length;

  const rejectedCount = winners.filter(
    (w) => w.verificationStatus === "rejected",
  ).length;

  return (
    <div className="space-y-6 text-[#242124]">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#991B35]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#991B35]" />
            Recognition & Achievement
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#242124] sm:text-3xl">
            Championship Winners
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#77716F]">
            Inspect milestone winners, review verification records, and maintain
            the official champions registry.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchWinners}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#EBE8E5] bg-white px-4 py-2.5 text-xs font-semibold text-[#6F6864] shadow-sm transition hover:bg-[#FAF9F7] hover:text-[#991B35] disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {winners.length > 0 && (
            <button
              type="button"
              onClick={handleExportWinners}
              className="inline-flex items-center gap-2 rounded-xl bg-[#991B35] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#7D172C]"
            >
              <Download size={14} />
              Export Registry
            </button>
          )}
        </div>
      </div>

      {/* SUMMARY */}
      {!loading && !fetchError && winners.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-[#EBE8E5] bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F9EAED] text-[#991B35]">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#96908C]">
                Total Champions
              </p>
              <p className="mt-1 text-xl font-bold text-[#242124]">
                {winners.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[#EBE8E5] bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#96908C]">
                Verified
              </p>
              <p className="mt-1 text-xl font-bold text-[#242124]">
                {verifiedCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[#EBE8E5] bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#96908C]">
                Pending Audit
              </p>
              <p className="mt-1 text-xl font-bold text-[#242124]">
                {pendingCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REJECTED SUMMARY */}
      {!loading && !fetchError && rejectedCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
          <XCircle size={15} />
          {rejectedCount} winner record{rejectedCount !== 1 ? "s" : ""} marked
          as rejected.
        </div>
      )}

      {/* WINNERS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#EBE8E5] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F0EDEA] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-sm font-bold text-[#242124]">
              Official Winners Registry
            </h2>
            <p className="mt-1 text-[11px] text-[#96908C]">
              Winner records and verification information
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F9EAED] text-[#991B35]">
            <Crown size={18} />
          </div>
        </div>

        {fetchError && (
          <div className="m-5 flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-red-700">
              <AlertCircle size={16} />
              {fetchError}
            </div>

            <button
              type="button"
              onClick={fetchWinners}
              className="shrink-0 text-xs font-semibold text-red-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoaderCircle size={30} className="animate-spin text-[#991B35]" />
            <p className="mt-3 text-xs text-[#96908C]">
              Loading champions registry...
            </p>
          </div>
        ) : winners.length === 0 && !fetchError ? (
          <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F9EAED] text-[#991B35]">
              <Crown size={30} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#242124]">
              No winners recorded yet
            </h3>

            <p className="mt-2 max-w-md text-xs leading-relaxed text-[#96908C]">
              Winner records will appear here when a creator achieves the
              qualifying milestone defined by the competition system.
            </p>
          </div>
        ) : winners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-xs">
              <thead className="border-b border-[#EBE8E5] bg-[#FAF9F7] text-[10px] font-bold uppercase tracking-wider text-[#918984]">
                <tr>
                  <th className="py-4 pl-6 pr-3">Winner Profile</th>
                  <th className="px-3 py-4">Database User ID</th>
                  <th className="px-3 py-4">Competition</th>
                  <th className="px-3 py-4">Qualifying Likes</th>
                  <th className="px-3 py-4">Achieved At</th>
                  <th className="px-3 py-4">Verification</th>
                  <th className="py-4 pl-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F0EDEA]">
                {winners.map((w) => (
                  <tr key={w._id} className="transition hover:bg-[#FCFBFA]">
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#EBE8E5] bg-[#F9EAED]">
                          {w.profileImage ? (
                            <img
                              src={w.profileImage}
                              alt={w.userName || "Winner"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#991B35]">
                              {w.userName?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate font-semibold text-[#302B29]">
                            {w.userName || "Unknown Creator"}
                          </p>
                          <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-[#96908C]">
                            @{w.username || "unknown"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className="font-mono text-[10px] text-[#77716F]"
                        title={w.userId}
                      >
                        {w.userId}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <span className="font-semibold text-[#514A46]">
                        {w.competitionName || "—"}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-[#991B35]">
                        <Heart size={13} />
                        {Number(w.totalQualifyingLikes || 0).toLocaleString()}
                        <span className="font-normal text-[#96908C]">
                          / {Number(w.thresholdRequired || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-4 text-[#77716F]">
                      {formatDate(w.reachedAt)}
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${getVerificationStyle(
                          w.verificationStatus,
                        )}`}
                      >
                        {w.verificationStatus === "verified" ? (
                          <CheckCircle size={11} />
                        ) : w.verificationStatus === "rejected" ? (
                          <XCircle size={11} />
                        ) : (
                          <ShieldCheck size={11} />
                        )}
                        {w.verificationStatus || "pending"}
                      </span>
                    </td>

                    <td className="py-4 pl-3 pr-6 text-right">
                      <button
                        type="button"
                        onClick={() => openWinner(w)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBE8E5] bg-white px-3 py-2 text-[10px] font-bold text-[#6F6864] transition hover:border-[#991B35]/30 hover:bg-[#F9EAED] hover:text-[#991B35]"
                      >
                        <Edit2 size={12} />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* WINNER INSPECTION MODAL */}
      {selectedWinner && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171416]/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !updating) {
              setSelectedWinner(null);
            }
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#EBE8E5] bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#F0EDEA] bg-white px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F9EAED] text-[#991B35]">
                  <Crown size={21} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#991B35]">
                    Champion Registry
                  </p>
                  <h3 className="mt-1 text-base font-bold text-[#242124]">
                    Winner Inspection
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedWinner(null)}
                disabled={updating}
                className="rounded-xl p-2 text-[#918984] transition hover:bg-[#FAF9F7] hover:text-[#991B35] disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {/* Winner Identity */}
              <div className="flex items-center gap-4 rounded-xl border border-[#EBE8E5] bg-[#FAF9F7] p-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#EBE8E5] bg-[#F9EAED]">
                  {selectedWinner.profileImage ? (
                    <img
                      src={selectedWinner.profileImage}
                      alt={selectedWinner.userName || "Winner"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#991B35]">
                      {selectedWinner.userName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="truncate text-base font-bold text-[#302B29]">
                    {selectedWinner.userName || "Unknown Creator"}
                  </h4>

                  <p className="mt-1 text-xs text-[#918984]">
                    @{selectedWinner.username || "unknown"}
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-[#991B35]">
                    {selectedWinner.competitionName || "Competition"}
                  </p>
                </div>
              </div>

              {/* Winner Details */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#77716F]">
                  Achievement Details
                </h4>

                <div className="overflow-hidden rounded-xl border border-[#EBE8E5]">
                  <div className="flex items-center justify-between gap-4 border-b border-[#F0EDEA] p-3.5">
                    <span className="text-xs text-[#918984]">Creator Name</span>
                    <span className="text-right text-xs font-semibold text-[#403A37]">
                      {selectedWinner.userName || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-b border-[#F0EDEA] p-3.5">
                    <span className="text-xs text-[#918984]">
                      Database User ID
                    </span>
                    <span className="max-w-[65%] break-all text-right font-mono text-[10px] text-[#77716F]">
                      {selectedWinner.userId || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-b border-[#F0EDEA] p-3.5">
                    <span className="text-xs text-[#918984]">Email</span>
                    <span className="max-w-[65%] break-all text-right text-xs font-semibold text-[#403A37]">
                      {selectedWinner.userEmail || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-b border-[#F0EDEA] p-3.5">
                    <span className="text-xs text-[#918984]">
                      Qualifying Likes
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#991B35]">
                      <Heart size={13} />
                      {Number(
                        selectedWinner.totalQualifyingLikes || 0,
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-b border-[#F0EDEA] p-3.5">
                    <span className="text-xs text-[#918984]">
                      Required Threshold
                    </span>
                    <span className="text-xs font-semibold text-[#403A37]">
                      {Number(
                        selectedWinner.thresholdRequired || 0,
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-3.5">
                    <span className="text-xs text-[#918984]">
                      Achievement Timestamp
                    </span>
                    <span className="text-right text-xs font-semibold text-[#403A37]">
                      {selectedWinner.reachedAt
                        ? new Date(selectedWinner.reachedAt).toUTCString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Form */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#77716F]">
                  Verification & Audit
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#514A46]">
                      Verification Status
                    </label>

                    <select
                      value={verificationStatus}
                      onChange={(e) => setVerificationStatus(e.target.value)}
                      disabled={updating}
                      className="w-full rounded-xl border border-[#EAE6E3] bg-[#FAF9F7] px-3.5 py-3 text-xs text-[#302B29] outline-none transition focus:border-[#991B35]/50 focus:bg-white disabled:opacity-50"
                    >
                      <option value="verified">Verified Champion</option>
                      <option value="pending">Pending Audit</option>
                      <option value="rejected">Rejected / Disqualified</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#514A46]">
                      Admin Audit Notes
                    </label>

                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      maxLength={2000}
                      disabled={updating}
                      placeholder="Record verification notes, prize delivery details, or audit information..."
                      className="w-full resize-y rounded-xl border border-[#EAE6E3] bg-[#FAF9F7] px-3.5 py-3 text-xs leading-relaxed text-[#242124] outline-none transition placeholder:text-[#A8A19D] focus:border-[#991B35]/50 focus:bg-white disabled:opacity-50"
                    />

                    <p className="mt-1 text-right text-[10px] text-[#A8A19D]">
                      {adminNotes.length}/2000 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {actionMessage && (
                <div
                  className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
                    actionError
                      ? "border-red-100 bg-red-50 text-red-700"
                      : "border-emerald-100 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {actionError ? (
                    <XCircle size={15} className="mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle size={15} className="mt-0.5 shrink-0" />
                  )}
                  {actionMessage}
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex flex-col gap-3 border-t border-[#F0EDEA] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to={`/profile/${selectedWinner.userId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#991B35] transition hover:underline"
                >
                  Open Public Profile
                  <ExternalLink size={13} />
                </Link>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedWinner(null)}
                    disabled={updating}
                    className="rounded-xl border border-[#EBE8E5] px-4 py-2.5 text-xs font-semibold text-[#6F6864] transition hover:bg-[#FAF9F7] disabled:opacity-50"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={handleUpdateWinner}
                    disabled={updating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#991B35] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#7D172C] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updating ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        Save Verification
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWinners;
