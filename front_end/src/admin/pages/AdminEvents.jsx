import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Users,
  Download,
  LoaderCircle,
  X,
  Upload,
  CheckCircle,
  MapPin,
  Trophy,
  IndianRupee,
  Globe,
  CalendarDays,
  AlertCircle,
  FileText,
  UserCheck,
  CreditCard,
  Eye,
  RefreshCw,
  Check,
  Ban,
  Image as ImageIcon,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const STATUS_STYLES = {
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
  completed: "border-blue-200 bg-blue-50 text-blue-700",
};

const PAYMENT_STYLES = {
  not_required: "bg-slate-100 text-slate-700",
  pending_verification: "bg-amber-50 text-amber-700",
  verified: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  refunded: "bg-purple-50 text-purple-700",
};

const REGISTRATION_STYLES = {
  pending_review: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  waitlist: "bg-blue-50 text-blue-700",
  cancelled: "bg-slate-100 text-slate-700",
};

const SUBMISSION_STYLES = {
  pending_review: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  scheduled: "bg-blue-50 text-blue-700",
  published: "bg-purple-50 text-purple-700",
  rejected: "bg-red-50 text-red-700",
  withdrawn: "bg-slate-100 text-slate-700",
};

const EMPTY_EVENT_FORM = {
  name: "",
  description: "",
  type: "community",
  category: "all",
  location: "Online",
  isOnline: true,

  participationMode: "registration",
  winningCriteria: "none",
  likeThreshold: 1000,

  startDate: "",
  endDate: "",
  registrationStartDate: "",
  registrationEndDate: "",

  entryFee: 0,
  currency: "NPR",
  maxParticipants: 0,

  prizeAmount: 0,
  prizeCurrency: "NPR",
  prizeInfo: "",

  eligibilityRequirements: "Open to all creators",
  rules: "",
  contactInfo: "",
  status: "published",
};

const formatStatus = (value) =>
  String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const StatusBadge = ({ value, styles = {} }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
      styles[value] || "bg-slate-100 text-slate-600"
    }`}
  >
    {formatStatus(value)}
  </span>
);

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Event form
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM);
  const [bannerFile, setBannerFile] = useState(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [formError, setFormError] = useState("");

  // Participant and review modal
  const [viewingParticipantsEvent, setViewingParticipantsEvent] =
    useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState("");

  // Review actions
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // ------------------------------------------
  // FETCH EVENTS
  // ------------------------------------------

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setFetchError("");

      const res = await axios.get(`${API_URL}/api/events?status=all`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error("Fetch admin events error:", err);
      setFetchError(err.response?.data?.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ------------------------------------------
  // DATE HELPERS
  // ------------------------------------------

  const formatDateInput = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "";

    return [
      parsed.getFullYear(),
      String(parsed.getMonth() + 1).padStart(2, "0"),
      String(parsed.getDate()).padStart(2, "0"),
    ].join("-");
  };

  const formatDate = (date) => {
    if (!date) return "Not set";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Not set";

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ------------------------------------------
  // EVENT FORM
  // ------------------------------------------

  const handleOpenCreate = () => {
    const today = new Date();

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const fiveDaysLater = new Date(today);
    fiveDaysLater.setDate(today.getDate() + 5);

    setEditingEventId(null);
    setBannerFile(null);

    setEventForm({
      ...EMPTY_EVENT_FORM,
      startDate: formatDateInput(tomorrow),
      endDate: formatDateInput(nextWeek),
      registrationStartDate: formatDateInput(today),
      registrationEndDate: formatDateInput(fiveDaysLater),
    });

    setFormError("");
    setShowEventModal(true);
  };

  const handleOpenEdit = (event) => {
    setEditingEventId(event._id);
    setBannerFile(null);

    setEventForm({
      ...EMPTY_EVENT_FORM,

      name: event.name || "",
      description: event.description || "",
      type: event.type || "community",
      category: event.category || "all",
      location: event.location || "Online",
      isOnline: Boolean(event.isOnline),

      participationMode: event.participationMode || "registration",
      winningCriteria: event.winningCriteria || "none",
      likeThreshold: event.likeThreshold ?? 1000,

      startDate: formatDateInput(event.startDate),
      endDate: formatDateInput(event.endDate),
      registrationStartDate: formatDateInput(event.registrationStartDate),
      registrationEndDate: formatDateInput(event.registrationEndDate),

      entryFee: event.entryFee ?? 0,
      currency: event.currency || "NPR",
      maxParticipants: event.maxParticipants ?? 0,

      prizeAmount: event.prizeAmount ?? 0,
      prizeCurrency: event.prizeCurrency || "NPR",
      prizeInfo: event.prizeInfo || "",

      eligibilityRequirements:
        event.eligibilityRequirements || "Open to all creators",
      rules: event.rules || "",
      contactInfo: event.contactInfo || "",
      status: event.status || "published",
    });

    setFormError("");
    setShowEventModal(true);
  };

  const updateForm = (key, value) => {
    setEventForm((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };

      if (key === "participationMode" && value === "automatic") {
        next.entryFee = 0;
        next.maxParticipants = 0;

        if (next.winningCriteria === "highest_likes") {
          next.winningCriteria = "first_to_likes";
        }
      }

      if (key === "participationMode" && value === "registration") {
        if (next.winningCriteria === "first_to_likes") {
          next.winningCriteria = "highest_likes";
        }
      }

      if (key === "winningCriteria" && value === "first_to_likes") {
        next.participationMode = "automatic";
        next.entryFee = 0;
        next.maxParticipants = 0;
      }

      return next;
    });
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();

    try {
      setSavingEvent(true);
      setFormError("");

      if (new Date(eventForm.endDate) <= new Date(eventForm.startDate)) {
        setFormError("Event end date must be after the start date.");
        return;
      }

      if (
        eventForm.participationMode === "registration" &&
        eventForm.registrationStartDate &&
        eventForm.registrationEndDate &&
        new Date(eventForm.registrationEndDate) <
          new Date(eventForm.registrationStartDate)
      ) {
        setFormError(
          "Registration deadline cannot be before registration opens.",
        );
        return;
      }

      if (
        eventForm.winningCriteria === "first_to_likes" &&
        eventForm.participationMode !== "automatic"
      ) {
        setFormError("First-to-likes events must use automatic participation.");
        return;
      }

      if (
        eventForm.participationMode === "automatic" &&
        Number(eventForm.entryFee) !== 0
      ) {
        setFormError("Automatic participation events must be free.");
        return;
      }

      const formData = new FormData();

      Object.entries(eventForm).forEach(([key, value]) => {
        formData.append(
          key,
          typeof value === "boolean" ? String(value) : (value ?? ""),
        );
      });

      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      if (editingEventId) {
        await axios.put(`${API_URL}/api/events/${editingEventId}`, formData, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${API_URL}/api/events`, formData, {
          withCredentials: true,
        });
      }

      setShowEventModal(false);
      await fetchEvents();
    } catch (err) {
      console.error("Save event error:", err);
      setFormError(err.response?.data?.message || "Failed to save event.");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (
      !window.confirm(
        "Delete this event and its associated registrations? Payment ledger records are retained.",
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/events/${id}`, {
        withCredentials: true,
      });

      await fetchEvents();
    } catch (err) {
      console.error("Delete event error:", err);
      window.alert(err.response?.data?.message || "Failed to delete event.");
    }
  };

  // ------------------------------------------
  // FETCH PARTICIPANTS FOR REVIEW
  // ------------------------------------------

  const handleViewParticipants = async (event) => {
    setViewingParticipantsEvent(event);
    setParticipants([]);
    setParticipantsError("");
    setReviewError("");
    setReviewSuccess("");

    await fetchParticipants(event);
  };

  const fetchParticipants = async (event) => {
    if (!event?._id) return;

    try {
      setLoadingParticipants(true);
      setParticipantsError("");

      const res = await axios.get(`${API_URL}/api/events/admin/registrations`, {
        params: {
          eventId: event._id,
          limit: 100,
          page: 1,
        },
        withCredentials: true,
      });

      if (res.data.success) {
        setParticipants(res.data.registrations || []);
      }
    } catch (err) {
      console.error("Fetch event registrations error:", err);

      setParticipantsError(
        err.response?.data?.message || "Unable to load event registrations.",
      );
    } finally {
      setLoadingParticipants(false);
    }
  };

  // ------------------------------------------
  // PAYMENT REVIEW
  // ------------------------------------------

  const handleReviewPayment = async (registration, decision) => {
    if (!registration?._id) return;

    let rejectionReason = "";

    if (decision === "reject") {
      rejectionReason = window.prompt(
        "Enter the reason for rejecting this payment:",
      );

      if (rejectionReason === null) return;

      if (!rejectionReason.trim()) {
        window.alert("A rejection reason is required.");
        return;
      }
    }

    const actionText =
      decision === "verify" ? "approve this payment" : "reject this payment";

    if (!window.confirm(`Are you sure you want to ${actionText}?`)) {
      return;
    }

    try {
      setReviewingId(registration._id);
      setReviewError("");
      setReviewSuccess("");

      const response = await axios.patch(
        `${API_URL}/api/events/admin/registrations/${registration._id}/payment`,
        {
          decision,
          rejectionReason,
        },
        { withCredentials: true },
      );

      setReviewSuccess(
        response.data.message ||
          (decision === "verify"
            ? "Payment verified successfully."
            : "Payment rejected successfully."),
      );

      await fetchParticipants(viewingParticipantsEvent);
    } catch (err) {
      console.error("Payment review error:", err);

      setReviewError(
        err.response?.data?.message || "Unable to review payment.",
      );
    } finally {
      setReviewingId(null);
    }
  };

  // ------------------------------------------
  // CREATIVE SUBMISSION REVIEW
  // ------------------------------------------

  const handleReviewSubmission = async (registration, decision) => {
    const submission = registration?.submission;

    if (!submission?._id) {
      window.alert("No creative submission was found for this registration.");
      return;
    }

    let rejectionReason = "";

    if (decision === "reject") {
      rejectionReason = window.prompt(
        "Enter the reason for rejecting this creative submission:",
      );

      if (rejectionReason === null) return;

      if (!rejectionReason.trim()) {
        window.alert("A rejection reason is required.");
        return;
      }
    }

    const actionText =
      decision === "approve"
        ? "approve this creative submission"
        : "reject this creative submission";

    if (!window.confirm(`Are you sure you want to ${actionText}?`)) {
      return;
    }

    try {
      setReviewingId(submission._id);
      setReviewError("");
      setReviewSuccess("");

      const response = await axios.patch(
        `${API_URL}/api/events/admin/submissions/${submission._id}/review`,
        {
          decision,
          rejectionReason,
        },
        { withCredentials: true },
      );

      setReviewSuccess(response.data.message || "Submission review completed.");

      await fetchParticipants(viewingParticipantsEvent);
    } catch (err) {
      console.error("Submission review error:", err);

      setReviewError(
        err.response?.data?.message || "Unable to review creative submission.",
      );
    } finally {
      setReviewingId(null);
    }
  };

  // ------------------------------------------
  // CSV EXPORT
  // ------------------------------------------

  const escapeCSV = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const handleExportCSV = () => {
    if (!participants.length) return;

    const headers = [
      "Full Name",
      "Email",
      "Phone",
      "Payment Status",
      "Payment Method",
      "Payment Reference",
      "Amount Due",
      "Amount Paid",
      "Registration Status",
      "Submission Title",
      "Submission Status",
      "Registration Date",
    ];

    const rows = participants.map((p) => {
      const submission = p.submission || {};

      return [
        p.fullName,
        p.email,
        p.phone,
        p.paymentStatus,
        p.paymentMethod,
        p.paymentReference,
        p.amountDue,
        p.amountPaid,
        p.registrationStatus,
        submission.title,
        submission.status,
        p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
      ]
        .map(escapeCSV)
        .join(",");
    });

    const csv = [headers.map(escapeCSV).join(","), ...rows].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `participants-${viewingParticipantsEvent?.slug || "event"}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  // ------------------------------------------
  // OVERVIEW
  // ------------------------------------------

  const registrationEvents = events.filter(
    (event) => event.participationMode !== "automatic",
  );

  const totalRegistrations = registrationEvents.reduce(
    (total, event) => total + (Number(event.registeredCount) || 0),
    0,
  );

  const publishedEvents = events.filter(
    (event) => event.status === "published",
  ).length;

  const freeEvents = events.filter(
    (event) => Number(event.entryFee) === 0,
  ).length;

  const automaticEvents = events.filter(
    (event) => event.participationMode === "automatic",
  ).length;

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  return (
    <div className="space-y-7 pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#991B35]">
            <Calendar size={14} />
            Event Administration
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#242124] sm:text-3xl">
            Event Management
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#77716F]">
            Create events, configure participation and rewards, and review
            participant payments and creative submissions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#991B35] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7F172D] active:scale-[0.98]"
        >
          <Plus size={17} />
          Create New Event
        </button>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Events",
            value: events.length,
            icon: Calendar,
            color: "text-[#991B35]",
            background: "bg-[#991B35]/10",
          },
          {
            label: "Published Events",
            value: publishedEvents,
            icon: CheckCircle,
            color: "text-emerald-700",
            background: "bg-emerald-50",
          },
          {
            label: "Total Registrations",
            value: totalRegistrations.toLocaleString(),
            icon: Users,
            color: "text-blue-700",
            background: "bg-blue-50",
          },
          {
            label: "Automatic Events",
            value: automaticEvents,
            icon: Trophy,
            color: "text-purple-700",
            background: "bg-purple-50",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-[#EBE8E5] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#88817E]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-[#242124]">
                    {item.value}
                  </p>
                </div>

                <div
                  className={`rounded-xl ${item.background} p-3 ${item.color}`}
                >
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EVENTS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#EBE8E5] bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[#F0EEEC] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-bold text-[#242124]">All Events</h2>
            <p className="mt-1 text-xs text-[#88817E]">
              Manage events, participation, rewards, and publication status.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#F8F5F3] px-3 py-1.5 text-xs font-semibold text-[#6E6663]">
              {events.length} Total
            </span>

            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              {freeEvents} Free
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoaderCircle size={30} className="animate-spin text-[#991B35]" />
            <p className="mt-3 text-sm text-[#88817E]">Loading events...</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="rounded-2xl bg-red-50 p-4 text-red-600">
              <AlertCircle size={26} />
            </div>

            <p className="mt-3 text-sm font-semibold text-[#292426]">
              Unable to load events
            </p>

            <p className="mt-1 text-xs text-[#88817E]">{fetchError}</p>

            <button
              type="button"
              onClick={fetchEvents}
              className="mt-4 rounded-xl bg-[#991B35] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7F172D]"
            >
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
            <div className="rounded-2xl bg-[#F8F5F3] p-4 text-[#991B35]">
              <Calendar size={30} />
            </div>

            <h3 className="mt-4 text-base font-bold text-[#242124]">
              No events created yet
            </h3>

            <p className="mt-2 max-w-sm text-sm text-[#88817E]">
              Create your first event and bring the PRATIVA creative community
              together.
            </p>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#991B35] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7F172D]"
            >
              <Plus size={16} />
              Create First Event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="border-b border-[#EBE8E5] bg-[#FAF9F7]">
                <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#88817E]">
                  <th className="px-6 py-4">Event</th>
                  <th className="px-4 py-4">Participation</th>
                  <th className="px-4 py-4">Entry Fee</th>
                  <th className="px-4 py-4">Reward</th>
                  <th className="px-4 py-4">Registrations</th>
                  <th className="px-4 py-4">Event Dates</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F0EEEC]">
                {events.map((event) => {
                  const automatic = event.participationMode === "automatic";

                  return (
                    <tr
                      key={event._id}
                      className="transition hover:bg-[#FCFAF9]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-xl bg-[#991B35]/10 p-2.5 text-[#991B35]">
                            <Calendar size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate text-sm font-semibold text-[#292426]">
                              {event.name}
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-[10px] text-[#99918D]">
                              <MapPin size={11} />
                              {event.isOnline
                                ? "Online"
                                : event.location || "Location not set"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold ${
                            automatic
                              ? "bg-purple-50 text-purple-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {automatic ? "Automatic" : "Registration"}
                        </span>

                        <p className="mt-1 text-[10px] text-[#99918D]">
                          {formatStatus(event.winningCriteria)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {automatic || Number(event.entryFee) === 0 ? (
                          <span className="font-semibold text-emerald-700">
                            Free
                          </span>
                        ) : (
                          <span className="font-semibold text-[#292426]">
                            {event.currency || "NPR"}{" "}
                            {Number(event.entryFee).toLocaleString()}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {Number(event.prizeAmount) > 0 ? (
                          <span className="font-semibold text-[#292426]">
                            {event.prizeCurrency || "NPR"}{" "}
                            {Number(event.prizeAmount).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs text-[#88817E]">
                            {event.prizeInfo || "Exclusive rewards"}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {automatic ? (
                          <span className="text-xs text-[#99918D]">
                            Not required
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleViewParticipants(event)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#EBE8E5] bg-white px-3 py-1.5 text-xs font-semibold text-[#625B58] transition hover:border-[#991B35]/30 hover:bg-[#991B35]/5 hover:text-[#991B35]"
                          >
                            <Users size={13} />
                            {event.registeredCount || 0}
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-xs font-medium text-[#48413E]">
                          {formatDate(event.startDate)}
                        </p>

                        <p className="mt-1 text-[10px] text-[#99918D]">
                          to {formatDate(event.endDate)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          value={event.status}
                          styles={STATUS_STYLES}
                        />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(event)}
                            className="rounded-lg border border-[#EBE8E5] bg-white p-2 text-[#77716F] transition hover:border-[#991B35]/30 hover:bg-[#991B35]/5 hover:text-[#991B35]"
                            title="Edit event"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(event._id)}
                            className="rounded-lg border border-[#EBE8E5] bg-white p-2 text-red-600 transition hover:border-red-200 hover:bg-red-50"
                            title="Delete event"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------ */}
      {/* CREATE / EDIT EVENT MODAL */}
      {/* ------------------------------------ */}

      {showEventModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171315]/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !savingEvent) {
              setShowEventModal(false);
            }
          }}
        >
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#EBE8E5] bg-white shadow-2xl">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#F0EEEC] bg-white px-6 py-5 sm:px-8">
              <div>
                <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#991B35]">
                  <Calendar size={13} />
                  Event Configuration
                </div>

                <h3 className="text-lg font-bold text-[#242124]">
                  {editingEventId ? "Edit Event" : "Create New Event"}
                </h3>

                <p className="mt-1 text-xs text-[#88817E]">
                  Configure event details, participation, pricing, and rewards.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                disabled={savingEvent}
                className="rounded-xl border border-[#EBE8E5] p-2 text-[#77716F] transition hover:bg-[#F8F5F3] hover:text-[#991B35] disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-7 p-6 sm:p-8">
              {/* BASIC INFORMATION */}
              <section className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-[#292426]">
                    Basic Information
                  </h4>
                  <p className="mt-1 text-[11px] text-[#99918D]">
                    Give your event a name and describe what creators can
                    expect.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                    Event Name *
                  </label>

                  <input
                    type="text"
                    value={eventForm.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="Enter event name"
                    required
                    className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm text-[#292426] outline-none transition placeholder:text-[#B0A9A5] focus:border-[#991B35] focus:ring-2 focus:ring-[#991B35]/10"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                      Event Type
                    </label>

                    <select
                      value={eventForm.type}
                      onChange={(e) => updateForm("type", e.target.value)}
                      className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm text-[#292426] outline-none focus:border-[#991B35]"
                    >
                      <option value="music">Music Competition</option>
                      <option value="photography">Photography Quest</option>
                      <option value="art">Art Showcase</option>
                      <option value="writing">Writing Contest</option>
                      <option value="poetry">Poetry Slam</option>
                      <option value="workshop">Creative Workshop</option>
                      <option value="live">Live Showcase</option>
                      <option value="community">Community Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                      Associated Manch
                    </label>

                    <select
                      value={eventForm.category}
                      onChange={(e) => updateForm("category", e.target.value)}
                      className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm text-[#292426] outline-none focus:border-[#991B35]"
                    >
                      <option value="all">All Manchs</option>
                      <option value="voice">Swar Manch (Voice)</option>
                      <option value="vision">Drishya Manch (Vision)</option>
                      <option value="art">Rang Manch (Art)</option>
                      <option value="words">Shabda Manch (Words)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                    Description *
                  </label>

                  <textarea
                    value={eventForm.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    rows={4}
                    placeholder="Describe your event..."
                    required
                    className="w-full resize-y rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm text-[#292426] outline-none placeholder:text-[#B0A9A5] focus:border-[#991B35] focus:ring-2 focus:ring-[#991B35]/10"
                  />
                </div>
              </section>

              <div className="border-t border-[#F0EEEC]" />

              {/* PARTICIPATION AND WINNING */}
              <section className="space-y-4">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-[#292426]">
                    <Trophy size={16} className="text-[#991B35]" />
                    Participation & Winning Rules
                  </h4>

                  <p className="mt-1 text-[11px] text-[#99918D]">
                    Choose whether creators register or participate
                    automatically.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateForm("participationMode", "registration")
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      eventForm.participationMode === "registration"
                        ? "border-[#991B35]/40 bg-[#991B35]/5"
                        : "border-[#EBE8E5] hover:bg-[#FAF9F7]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-[#991B35]" />
                      <span className="text-sm font-bold text-[#292426]">
                        Registration Required
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] leading-relaxed text-[#88817E]">
                      Creators register, submit their work, and wait for review.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateForm("participationMode", "automatic")}
                    className={`rounded-xl border p-4 text-left transition ${
                      eventForm.participationMode === "automatic"
                        ? "border-[#991B35]/40 bg-[#991B35]/5"
                        : "border-[#EBE8E5] hover:bg-[#FAF9F7]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={18} className="text-[#991B35]" />
                      <span className="text-sm font-bold text-[#292426]">
                        Automatic Participation
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] leading-relaxed text-[#88817E]">
                      Eligible posts automatically participate during the event.
                    </p>
                  </button>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                    Winning Criteria
                  </label>

                  <select
                    value={eventForm.winningCriteria}
                    onChange={(e) =>
                      updateForm("winningCriteria", e.target.value)
                    }
                    className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm text-[#292426] outline-none focus:border-[#991B35]"
                  >
                    <option value="none">No automatic winner</option>
                    <option value="highest_likes">
                      Highest Likes at Event Deadline
                    </option>
                    {eventForm.participationMode === "automatic" && (
                      <option value="first_to_likes">
                        First Post to Reach Like Threshold
                      </option>
                    )}
                    <option value="admin_selected">Admin Selects Winner</option>
                  </select>
                </div>

                {eventForm.winningCriteria === "first_to_likes" && (
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                    <h5 className="text-xs font-bold text-purple-900">
                      First-to-Likes Challenge
                    </h5>

                    <p className="mt-1 text-[11px] leading-relaxed text-purple-800">
                      Individual eligible posts compete separately. The first
                      qualifying post to reach the threshold wins.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-purple-900">
                          Like Threshold
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={eventForm.likeThreshold}
                          onChange={(e) =>
                            updateForm("likeThreshold", e.target.value)
                          }
                          required
                          className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-purple-900">
                          Winner's Prize
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={eventForm.prizeAmount}
                          onChange={(e) =>
                            updateForm("prizeAmount", e.target.value)
                          }
                          className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {eventForm.winningCriteria === "highest_likes" && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <h5 className="text-xs font-bold text-blue-900">
                      Highest Likes at Deadline
                    </h5>

                    <p className="mt-1 text-[11px] leading-relaxed text-blue-800">
                      Eligible published entries are ranked by qualifying likes
                      at the end of the event.
                    </p>

                    <div className="mt-3">
                      <label className="mb-2 block text-xs font-semibold text-blue-900">
                        Winner's Prize
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={eventForm.prizeAmount}
                        onChange={(e) =>
                          updateForm("prizeAmount", e.target.value)
                        }
                        className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {eventForm.winningCriteria === "admin_selected" && (
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                      Winner's Prize
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={eventForm.prizeAmount}
                      onChange={(e) =>
                        updateForm("prizeAmount", e.target.value)
                      }
                      className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm outline-none focus:border-[#991B35]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                      Prize Currency
                    </label>

                    <input
                      type="text"
                      value={eventForm.prizeCurrency}
                      onChange={(e) =>
                        updateForm(
                          "prizeCurrency",
                          e.target.value.toUpperCase(),
                        )
                      }
                      maxLength={5}
                      className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm outline-none focus:border-[#991B35]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                      Additional Prize Information
                    </label>

                    <input
                      type="text"
                      value={eventForm.prizeInfo}
                      onChange={(e) => updateForm("prizeInfo", e.target.value)}
                      placeholder="Badges, certificates, exclusive rewards..."
                      className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm outline-none focus:border-[#991B35]"
                    />
                  </div>
                </div>

                {eventForm.participationMode === "automatic" && (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
                    Automatic events do not create registrations or charge entry
                    fees. Registration dates and participant capacity do not
                    apply.
                  </p>
                )}
              </section>

              <div className="border-t border-[#F0EEEC]" />

              {/* LOCATION */}
              <section className="space-y-4">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-[#292426]">
                    <MapPin size={16} className="text-[#991B35]" />
                    Event Location
                  </h4>

                  <p className="mt-1 text-[11px] text-[#99918D]">
                    Choose whether this event takes place online or in person.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateForm("isOnline", true);
                      updateForm("location", "Online");
                    }}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                      eventForm.isOnline
                        ? "border-[#991B35]/30 bg-[#991B35]/5"
                        : "border-[#EBE8E5] hover:bg-[#FAF9F7]"
                    }`}
                  >
                    <Globe size={18} className="text-[#991B35]" />
                    <div>
                      <p className="text-xs font-semibold text-[#292426]">
                        Online
                      </p>
                      <p className="text-[10px] text-[#99918D]">
                        Virtual event
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateForm("isOnline", false);

                      if (eventForm.location === "Online") {
                        updateForm("location", "");
                      }
                    }}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                      !eventForm.isOnline
                        ? "border-[#991B35]/30 bg-[#991B35]/5"
                        : "border-[#EBE8E5] hover:bg-[#FAF9F7]"
                    }`}
                  >
                    <MapPin size={18} className="text-[#991B35]" />
                    <div>
                      <p className="text-xs font-semibold text-[#292426]">
                        In Person
                      </p>
                      <p className="text-[10px] text-[#99918D]">
                        Physical location
                      </p>
                    </div>
                  </button>
                </div>

                {!eventForm.isOnline && (
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                      Venue / Location
                    </label>

                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => updateForm("location", e.target.value)}
                      placeholder="Enter event venue or address"
                      className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm outline-none focus:border-[#991B35]"
                    />
                  </div>
                )}
              </section>

              <div className="border-t border-[#F0EEEC]" />

              {/* DATES */}
              <section className="space-y-4">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-[#292426]">
                    <CalendarDays size={16} className="text-[#991B35]" />
                    Event Dates
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                      Event Start Date *
                    </label>

                    <input
                      type="date"
                      value={eventForm.startDate}
                      onChange={(e) => updateForm("startDate", e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm outline-none focus:border-[#991B35]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                      Event End Date *
                    </label>

                    <input
                      type="date"
                      value={eventForm.endDate}
                      min={eventForm.startDate || undefined}
                      onChange={(e) => updateForm("endDate", e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm outline-none focus:border-[#991B35]"
                    />
                  </div>
                </div>

                {eventForm.participationMode === "registration" && (
                  <div className="rounded-xl border border-[#EBE8E5] bg-[#FCFBFA] p-4">
                    <h5 className="mb-3 text-xs font-bold text-[#48413E]">
                      Registration Period
                    </h5>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                          Registration Opens
                        </label>

                        <input
                          type="date"
                          value={eventForm.registrationStartDate}
                          onChange={(e) =>
                            updateForm("registrationStartDate", e.target.value)
                          }
                          className="w-full rounded-xl border border-[#E7E2DF] bg-white px-4 py-3 text-sm outline-none focus:border-[#991B35]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                          Registration Deadline *
                        </label>

                        <input
                          type="date"
                          value={eventForm.registrationEndDate}
                          min={eventForm.registrationStartDate || undefined}
                          onChange={(e) =>
                            updateForm("registrationEndDate", e.target.value)
                          }
                          required
                          className="w-full rounded-xl border border-[#E7E2DF] bg-white px-4 py-3 text-sm outline-none focus:border-[#991B35]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <div className="border-t border-[#F0EEEC]" />

              {/* PRICING */}
              <section className="space-y-4">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-[#292426]">
                    <IndianRupee size={16} className="text-[#991B35]" />
                    Pricing & Capacity
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                      Entry Fee
                    </label>

                    <input
                      type="number"
                      value={
                        eventForm.participationMode === "automatic"
                          ? 0
                          : eventForm.entryFee
                      }
                      onChange={(e) => updateForm("entryFee", e.target.value)}
                      min={0}
                      disabled={eventForm.participationMode === "automatic"}
                      className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm outline-none focus:border-[#991B35] disabled:opacity-60"
                    />

                    <p className="mt-1 text-[10px] text-[#99918D]">
                      {eventForm.participationMode === "automatic"
                        ? "Automatic events are free"
                        : "0 means free"}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                      Currency
                    </label>

                    <input
                      type="text"
                      value={eventForm.currency}
                      onChange={(e) =>
                        updateForm("currency", e.target.value.toUpperCase())
                      }
                      maxLength={5}
                      className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm outline-none focus:border-[#991B35]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                      Max Participants
                    </label>

                    <input
                      type="number"
                      value={
                        eventForm.participationMode === "automatic"
                          ? 0
                          : eventForm.maxParticipants
                      }
                      onChange={(e) =>
                        updateForm("maxParticipants", e.target.value)
                      }
                      min={0}
                      disabled={eventForm.participationMode === "automatic"}
                      className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm outline-none focus:border-[#991B35] disabled:opacity-60"
                    />

                    <p className="mt-1 text-[10px] text-[#99918D]">
                      0 means unlimited
                    </p>
                  </div>
                </div>
              </section>

              <div className="border-t border-[#F0EEEC]" />

              {/* RULES */}
              <section className="space-y-4">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-[#292426]">
                    <FileText size={16} className="text-[#991B35]" />
                    Rules & Eligibility
                  </h4>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                    Eligibility Requirements
                  </label>

                  <input
                    type="text"
                    value={eventForm.eligibilityRequirements}
                    onChange={(e) =>
                      updateForm("eligibilityRequirements", e.target.value)
                    }
                    placeholder="Open to all creators"
                    className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm outline-none focus:border-[#991B35]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                    Rules & Guidelines
                  </label>

                  <textarea
                    value={eventForm.rules}
                    onChange={(e) => updateForm("rules", e.target.value)}
                    rows={3}
                    placeholder="Submission rules, originality requirements, and other guidelines..."
                    className="w-full resize-y rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm outline-none focus:border-[#991B35]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                    Event Contact Information
                  </label>

                  <input
                    type="text"
                    value={eventForm.contactInfo}
                    onChange={(e) => updateForm("contactInfo", e.target.value)}
                    placeholder="Optional event contact details"
                    className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm outline-none focus:border-[#991B35]"
                  />
                </div>
              </section>

              <div className="border-t border-[#F0EEEC]" />

              {/* BANNER AND STATUS */}
              <section className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-[#292426]">
                    Event Appearance & Publishing
                  </h4>

                  <p className="mt-1 text-[11px] text-[#99918D]">
                    Upload a cover image and choose the publication status.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                    Banner Cover Image
                  </label>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E7E2DF] bg-[#FCFBFA] px-5 py-7 text-center transition hover:border-[#991B35]/40 hover:bg-[#991B35]/5">
                    <div className="rounded-xl bg-[#991B35]/10 p-3 text-[#991B35]">
                      {bannerFile ? (
                        <CheckCircle size={22} />
                      ) : (
                        <Upload size={22} />
                      )}
                    </div>

                    <p className="mt-3 text-xs font-semibold text-[#48413E]">
                      {bannerFile ? bannerFile.name : "Choose an event banner"}
                    </p>

                    <p className="mt-1 text-[10px] text-[#99918D]">
                      Select an image from your device
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setBannerFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#48413E]">
                    Publication Status
                  </label>

                  <select
                    value={eventForm.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                    className="w-full rounded-xl border border-[#E7E2DF] bg-[#FCFBFA] px-4 py-3 text-sm outline-none focus:border-[#991B35]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </section>

              {formError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col-reverse gap-3 border-t border-[#F0EEEC] bg-white px-6 py-4 sm:-mx-8 sm:-mb-8 sm:flex-row sm:justify-end sm:px-8">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  disabled={savingEvent}
                  className="rounded-xl border border-[#E7E2DF] px-5 py-2.5 text-sm font-semibold text-[#625B58] transition hover:bg-[#F8F5F3] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEvent || !eventForm.name.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#991B35] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7F172D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingEvent ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Saving Event...
                    </>
                  ) : (
                    <>
                      {editingEventId ? (
                        <CheckCircle size={16} />
                      ) : (
                        <Plus size={16} />
                      )}

                      {editingEventId ? "Save Changes" : "Create Event"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------ */}
      {/* PARTICIPANTS AND REVIEW MODAL */}
      {/* ------------------------------------ */}

      {viewingParticipantsEvent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171315]/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !loadingParticipants &&
              !reviewingId
            ) {
              setViewingParticipantsEvent(null);
            }
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[#EBE8E5] bg-white shadow-2xl">
            {/* PARTICIPANTS HEADER */}
            <div className="sticky top-0 z-20 flex flex-col gap-4 border-b border-[#F0EEEC] bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#991B35]">
                  <Users size={13} />
                  Registration & Review Management
                </div>

                <h3 className="text-base font-bold text-[#242124]">
                  Event Participants
                </h3>

                <p className="mt-1 truncate text-xs text-[#88817E]">
                  {viewingParticipantsEvent.name}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchParticipants(viewingParticipantsEvent)}
                  disabled={loadingParticipants || Boolean(reviewingId)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#EBE8E5] px-3 py-2.5 text-xs font-semibold text-[#625B58] hover:bg-[#F8F5F3] disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={loadingParticipants ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                {participants.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#991B35]/20 bg-[#991B35]/5 px-4 py-2.5 text-xs font-semibold text-[#991B35] transition hover:bg-[#991B35]/10"
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewingParticipantsEvent(null)}
                  disabled={Boolean(reviewingId)}
                  className="rounded-xl border border-[#EBE8E5] p-2 text-[#77716F] transition hover:bg-[#F8F5F3] disabled:opacity-50"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* SUMMARY */}
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-[#EBE8E5] bg-[#FCFBFA] p-4">
                  <p className="text-[10px] font-medium text-[#88817E]">
                    Total Registrations
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#242124]">
                    {participants.length}
                  </p>
                </div>

                <div className="rounded-xl border border-[#EBE8E5] bg-[#FCFBFA] p-4">
                  <p className="text-[10px] font-medium text-[#88817E]">
                    Pending Payments
                  </p>
                  <p className="mt-1 text-2xl font-bold text-amber-600">
                    {
                      participants.filter(
                        (p) => p.paymentStatus === "pending_verification",
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-[#EBE8E5] bg-[#FCFBFA] p-4">
                  <p className="text-[10px] font-medium text-[#88817E]">
                    Confirmed
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    {
                      participants.filter(
                        (p) => p.registrationStatus === "confirmed",
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-[#EBE8E5] bg-[#FCFBFA] p-4">
                  <p className="text-[10px] font-medium text-[#88817E]">
                    Entry Fee
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#242124]">
                    {Number(viewingParticipantsEvent.entryFee) === 0
                      ? "Free"
                      : `${viewingParticipantsEvent.currency || "NPR"} ${Number(
                          viewingParticipantsEvent.entryFee,
                        ).toLocaleString()}`}
                  </p>
                </div>
              </div>

              {reviewError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <p>{reviewError}</p>
                </div>
              )}

              {reviewSuccess && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                  <CheckCircle size={15} className="mt-0.5 shrink-0" />
                  <p>{reviewSuccess}</p>
                </div>
              )}

              {loadingParticipants ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <LoaderCircle
                    size={28}
                    className="animate-spin text-[#991B35]"
                  />
                  <p className="mt-3 text-xs text-[#88817E]">
                    Loading registrations...
                  </p>
                </div>
              ) : participantsError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                  <AlertCircle size={22} className="mx-auto text-red-600" />

                  <p className="mt-2 text-xs font-semibold text-red-700">
                    {participantsError}
                  </p>

                  <button
                    type="button"
                    onClick={() => fetchParticipants(viewingParticipantsEvent)}
                    className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : participants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="rounded-2xl bg-[#F8F5F3] p-4 text-[#991B35]">
                    <Users size={27} />
                  </div>

                  <h4 className="mt-4 text-sm font-bold text-[#292426]">
                    No participants yet
                  </h4>

                  <p className="mt-1 text-xs text-[#88817E]">
                    Registrations for this event will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {participants.map((p) => {
                    const submission = p.submission || {};

                    const paymentPending =
                      p.paymentStatus === "pending_verification";

                    const submissionPending =
                      submission.status === "pending_review";

                    const isPaymentReviewing = reviewingId === p._id;

                    const isSubmissionReviewing =
                      reviewingId === submission._id;

                    const hasPaymentReference = Boolean(p.paymentReference);

                    return (
                      <div
                        key={p._id}
                        className="overflow-hidden rounded-xl border border-[#EBE8E5] bg-white"
                      >
                        {/* PARTICIPANT HEADER */}
                        <div className="flex flex-col gap-3 bg-[#FCFBFA] p-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="rounded-lg bg-[#991B35]/10 p-2 text-[#991B35]">
                                <UserCheck size={15} />
                              </div>

                              <p className="text-sm font-semibold text-[#292426]">
                                {p.fullName || "Unnamed Participant"}
                              </p>
                            </div>

                            <p className="mt-2 break-all text-xs text-[#77716F]">
                              {p.email || p.user?.email || "No email"}
                            </p>

                            <p className="mt-1 text-[11px] text-[#99918D]">
                              {p.phone || "No phone"}
                            </p>

                            <p className="mt-1 text-[10px] text-[#99918D]">
                              Registration: {p.registrationNumber || p._id}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <StatusBadge
                              value={p.paymentStatus}
                              styles={PAYMENT_STYLES}
                            />

                            <StatusBadge
                              value={p.registrationStatus}
                              styles={REGISTRATION_STYLES}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
                          {/* PAYMENT REVIEW */}
                          <div className="rounded-xl border border-[#EBE8E5] p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <CreditCard
                                size={16}
                                className="text-[#991B35]"
                              />

                              <h5 className="text-xs font-bold text-[#292426]">
                                Payment Verification
                              </h5>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between gap-3">
                                <span className="text-[#88817E]">
                                  Payment method
                                </span>

                                <span className="font-semibold capitalize text-[#48413E]">
                                  {formatStatus(p.paymentMethod || "none")}
                                </span>
                              </div>

                              <div className="flex justify-between gap-3">
                                <span className="text-[#88817E]">
                                  Amount due
                                </span>

                                <span className="font-semibold text-[#48413E]">
                                  {p.currency ||
                                    viewingParticipantsEvent.currency ||
                                    "NPR"}{" "}
                                  {Number(
                                    p.amountDue ??
                                      viewingParticipantsEvent.entryFee ??
                                      0,
                                  ).toLocaleString()}
                                </span>
                              </div>

                              <div className="flex justify-between gap-3">
                                <span className="text-[#88817E]">
                                  Amount paid
                                </span>

                                <span className="font-semibold text-[#48413E]">
                                  {p.currency ||
                                    viewingParticipantsEvent.currency ||
                                    "NPR"}{" "}
                                  {Number(p.amountPaid || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {hasPaymentReference ? (
                              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
                                  Submitted Transaction ID
                                </p>

                                <p className="mt-1 break-all text-xs font-semibold text-amber-900">
                                  {p.paymentReference}
                                </p>
                              </div>
                            ) : (
                              <p className="mt-3 rounded-lg bg-[#F8F5F3] p-3 text-[11px] text-[#88817E]">
                                No payment reference submitted.
                              </p>
                            )}

                            {p.paymentRejectionReason && (
                              <div className="mt-3 rounded-lg bg-red-50 p-3">
                                <p className="text-[10px] font-bold text-red-800">
                                  Previous rejection reason
                                </p>

                                <p className="mt-1 text-[11px] text-red-700">
                                  {p.paymentRejectionReason}
                                </p>
                              </div>
                            )}

                            {p.paymentStatus === "verified" && (
                              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-[11px] font-medium text-emerald-700">
                                <CheckCircle size={14} />
                                Payment successfully verified
                              </div>
                            )}

                            {paymentPending && hasPaymentReference && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled={
                                    Boolean(reviewingId) || !hasPaymentReference
                                  }
                                  onClick={() =>
                                    handleReviewPayment(p, "verify")
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  {isPaymentReviewing ? (
                                    <LoaderCircle
                                      size={13}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Check size={13} />
                                  )}
                                  Approve Payment
                                </button>

                                <button
                                  type="button"
                                  disabled={Boolean(reviewingId)}
                                  onClick={() =>
                                    handleReviewPayment(p, "reject")
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                >
                                  <Ban size={13} />
                                  Reject Payment
                                </button>
                              </div>
                            )}

                            {p.paymentStatus === "not_required" && (
                              <p className="mt-3 text-[11px] text-emerald-700">
                                No payment required for this registration.
                              </p>
                            )}
                          </div>

                          {/* CREATIVE SUBMISSION REVIEW */}
                          <div className="rounded-xl border border-[#EBE8E5] p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <ImageIcon size={16} className="text-[#991B35]" />

                              <h5 className="text-xs font-bold text-[#292426]">
                                Creative Submission
                              </h5>
                            </div>

                            {submission._id ? (
                              <>
                                <p className="text-sm font-semibold text-[#292426]">
                                  {submission.title || "Untitled submission"}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="rounded-full bg-[#F8F5F3] px-2.5 py-1 text-[10px] font-semibold text-[#625B58]">
                                    {formatStatus(submission.category)}
                                  </span>

                                  <StatusBadge
                                    value={submission.status}
                                    styles={SUBMISSION_STYLES}
                                  />
                                </div>

                                {submission.description && (
                                  <p className="mt-3 line-clamp-3 text-[11px] leading-relaxed text-[#77716F]">
                                    {submission.description}
                                  </p>
                                )}

                                {submission.content && (
                                  <div className="mt-3 max-h-32 overflow-y-auto rounded-lg bg-[#FCFBFA] p-3">
                                    <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-[#625B58]">
                                      {submission.content}
                                    </p>
                                  </div>
                                )}

                                {submission.media?.url && (
                                  <a
                                    href={submission.media.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#991B35] hover:underline"
                                  >
                                    <Eye size={13} />
                                    View submitted media
                                  </a>
                                )}

                                {submission.rejectionReason && (
                                  <div className="mt-3 rounded-lg bg-red-50 p-3">
                                    <p className="text-[10px] font-bold text-red-800">
                                      Previous rejection reason
                                    </p>

                                    <p className="mt-1 text-[11px] text-red-700">
                                      {submission.rejectionReason}
                                    </p>
                                  </div>
                                )}

                                {submissionPending && (
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      disabled={Boolean(reviewingId)}
                                      onClick={() =>
                                        handleReviewSubmission(p, "approve")
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                      {isSubmissionReviewing ? (
                                        <LoaderCircle
                                          size={13}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Check size={13} />
                                      )}
                                      Approve Submission
                                    </button>

                                    <button
                                      type="button"
                                      disabled={Boolean(reviewingId)}
                                      onClick={() =>
                                        handleReviewSubmission(p, "reject")
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                    >
                                      <Ban size={13} />
                                      Reject Submission
                                    </button>
                                  </div>
                                )}

                                {submission.status === "approved" ||
                                submission.status === "scheduled" ||
                                submission.status === "published" ? (
                                  <p className="mt-3 text-[11px] font-medium text-emerald-700">
                                    Creative submission approved.
                                  </p>
                                ) : null}
                              </>
                            ) : (
                              <p className="rounded-lg bg-[#F8F5F3] p-3 text-[11px] text-[#88817E]">
                                No creative submission information is available.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* REGISTRATION STATUS FOOTER */}
                        <div className="flex flex-col gap-2 border-t border-[#F0EEEC] bg-[#FCFBFA] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-[10px] text-[#88817E]">
                            Registered {formatDate(p.createdAt)}
                          </p>

                          <div className="text-[10px] font-semibold text-[#625B58]">
                            Registration:{" "}
                            <span
                              className={
                                p.registrationStatus === "confirmed"
                                  ? "text-emerald-700"
                                  : "text-amber-700"
                              }
                            >
                              {formatStatus(p.registrationStatus)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
