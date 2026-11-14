import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Ticket,
  CheckCircle2,
  LoaderCircle,
  X,
  FileText,
  Image as ImageIcon,
  Music,
  Palette,
  Upload,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

const eventTypes = [
  { id: "all", label: "All Events" },
  { id: "music", label: "Music & Voice" },
  { id: "photography", label: "Photography" },
  { id: "art", label: "Visual Art" },
  { id: "writing", label: "Literature" },
  { id: "poetry", label: "Poetry" },
  { id: "workshop", label: "Workshops" },
  { id: "showcase", label: "Showcases" },
];

const creativeCategories = [
  { id: "words", label: "Words", icon: FileText },
  { id: "voice", label: "Voice", icon: Music },
  { id: "vision", label: "Vision", icon: ImageIcon },
  { id: "art", label: "Art", icon: Palette },
];

const emptyForm = {
  fullName: "",
  email: "",
  notes: "",
  category: "words",
  title: "",
  description: "",
  content: "",
  fontStyle: "serif",
  textAlign: "left",
  tags: "",
  paymentMethod: "none",
  paymentReference: "",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#081326] px-4 py-3 text-sm text-white outline-none transition focus:border-[#FF4DB8]";

const labelClass = "mb-1.5 block text-xs font-medium text-slate-300";

const Events = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");
  const [viewTab, setViewTab] = useState("explore");

  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeringEvent, setRegisteringEvent] = useState(null);

  const [regForm, setRegForm] = useState(emptyForm);
  const [mediaFile, setMediaFile] = useState(null);
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState("");

  const isPaidEvent = Number(registeringEvent?.entryFee || 0) > 0;

  const availableCategories =
    registeringEvent?.category && registeringEvent.category !== "all"
      ? creativeCategories.filter(
          (category) => category.id === registeringEvent.category,
        )
      : creativeCategories;

  const selectedCategory = regForm.category;

  const isWordsEntry = selectedCategory === "words";
  const isVoiceEntry = selectedCategory === "voice";
  const isImageEntry =
    selectedCategory === "vision" || selectedCategory === "art";

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (activeType !== "all") {
        params.type = activeType;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await axios.get(`${API_URL}/api/events`, {
        params,
      });

      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error("Fetch events error:", err);
      setError(err.response?.data?.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [activeType]);

  const fetchMyRegistrations = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingRegistrations(true);

      const res = await axios.get(`${API_URL}/api/events/mine`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setMyRegistrations(res.data.registrations || []);
      }
    } catch (err) {
      console.error("Fetch my registrations error:", err);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  useEffect(() => {
    if (viewTab === "my_registrations") {
      fetchMyRegistrations();
    }
  }, [viewTab, isAuthenticated]);

  const updateForm = (field, value) => {
    setRegForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStartRegister = (event) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const defaultCategory =
      event.category && event.category !== "all" ? event.category : "words";

    setRegisteringEvent(event);

    setRegForm({
      ...emptyForm,
      fullName: user?.name || "",
      email: user?.email || "",
      category: defaultCategory,
      paymentMethod: Number(event.entryFee || 0) > 0 ? "esewa" : "none",
    });

    setMediaFile(null);
    setRegError("");
    setRegSuccess(false);
    setRegSuccessMessage("");
  };

  const closeRegistration = () => {
    if (submittingReg) return;

    setRegisteringEvent(null);
    setMediaFile(null);
    setRegError("");
    setRegSuccess(false);
  };

  const handleCategoryChange = (category) => {
    updateForm("category", category);
    setMediaFile(null);
    setRegError("");
  };

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setMediaFile(null);
      return;
    }

    if (isVoiceEntry && !file.type.startsWith("audio/")) {
      setRegError("Please select a valid audio file.");
      e.target.value = "";
      return;
    }

    if (isImageEntry && !file.type.startsWith("image/")) {
      setRegError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    setMediaFile(file);
    setRegError("");
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!registeringEvent) return;

    if (!regForm.fullName.trim() || !regForm.email.trim()) {
      setRegError("Please complete your participant information.");
      return;
    }

    if (!regForm.title.trim()) {
      setRegError("Please enter a title for your creative submission.");
      return;
    }

    if (!regForm.description.trim()) {
      setRegError("Please provide a description for your submission.");
      return;
    }

    if (isWordsEntry && !regForm.content.trim()) {
      setRegError("Please enter your written content.");
      return;
    }

    if (!isWordsEntry && !mediaFile) {
      setRegError(
        isVoiceEntry
          ? "Please upload your audio submission."
          : "Please upload your image submission.",
      );
      return;
    }

    if (isPaidEvent && !regForm.paymentReference.trim()) {
      setRegError("Please enter your payment transaction reference.");
      return;
    }

    if (isPaidEvent && !regForm.paymentMethod) {
      setRegError("Please select a payment method.");
      return;
    }

    try {
      setSubmittingReg(true);
      setRegError("");

      const formData = new FormData();

      // Participant information
      formData.append("fullName", regForm.fullName.trim());
      formData.append("email", regForm.email.trim());
      formData.append("notes", regForm.notes.trim());

      // Creative submission
      formData.append("category", regForm.category);
      formData.append("title", regForm.title.trim());
      formData.append("description", regForm.description.trim());
      formData.append("content", regForm.content.trim());

      formData.append("fontStyle", isWordsEntry ? regForm.fontStyle : "serif");
      formData.append("textAlign", isWordsEntry ? regForm.textAlign : "left");

      formData.append("tags", regForm.tags.trim());

      // Media upload for voice, vision and art
      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      // Payment information
      formData.append(
        "paymentMethod",
        isPaidEvent ? regForm.paymentMethod : "none",
      );

      if (isPaidEvent) {
        formData.append("paymentReference", regForm.paymentReference.trim());
      }

      const res = await axios.post(
        `${API_URL}/api/events/${registeringEvent._id}/register`,
        formData,
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        setRegSuccess(true);

        setRegSuccessMessage(
          res.data.message ||
            (isPaidEvent
              ? "Your registration and payment reference have been submitted for administrative review."
              : "Your registration and creative submission have been received."),
        );

        fetchEvents();
        fetchMyRegistrations();
      }
    } catch (err) {
      console.error("Registration error:", err);

      setRegError(
        err.response?.data?.message ||
          "Failed to complete registration. Please try again.",
      );
    } finally {
      setSubmittingReg(false);
    }
  };

  const getPaymentStatus = (status) => {
    const labels = {
      not_required: "Free Entry",
      pending_verification: "Payment Pending Verification",
      verified: "Payment Verified",
      rejected: "Payment Rejected",
      refunded: "Refunded",
    };

    return labels[status] || status || "Unknown";
  };

  const getRegistrationStatus = (status) => {
    const labels = {
      pending_review: "Under Review",
      confirmed: "Confirmed",
      rejected: "Rejected",
      waitlist: "Waitlisted",
      cancelled: "Cancelled",
    };

    return labels[status] || status || "Unknown";
  };

  const statusClass = (status) => {
    if (["verified", "not_required", "confirmed"].includes(status)) {
      return "bg-emerald-500/15 text-emerald-400";
    }

    if (["rejected", "cancelled"].includes(status)) {
      return "bg-red-500/15 text-red-400";
    }

    return "bg-amber-500/15 text-amber-400";
  };

  const getPrizeInfo = (event) => {
    return typeof event?.prizeInfo === "string" && event.prizeInfo.trim()
      ? event.prizeInfo.trim()
      : "Exclusive Rewards & Recognition";
  };

  return (
    <div className="min-h-screen bg-[#050A30] text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#09153D] to-[#050A30] py-14 sm:py-20">
        <div className="pointer-events-none absolute right-1/4 top-0 h-96 w-96 rounded-full bg-[#00D4FF]/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[#FF4DB8]/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/10 px-4 py-1 font-['Orbitron'] text-xs font-semibold text-[#00D4FF]">
            <Calendar size={14} />
            PRATIVA EVENTS & COMPETITIONS
          </div>

          <h1 className="mt-4 font-['Orbitron'] text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            WHERE TALENT{" "}
            <span className="bg-gradient-to-r from-[#00D4FF] via-[#FF4DB8] to-[#B7FF3F] bg-clip-text text-transparent">
              MEETS THE STAGE
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Participate in live showcases, creative workshops, music battles,
            photography quests, and poetry slams across all Manchs.
          </p>

          {isAuthenticated && (
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-full border border-white/10 bg-[#0B1F6B]/60 p-1">
                <button
                  type="button"
                  onClick={() => setViewTab("explore")}
                  className={`rounded-full px-5 py-2 font-['Orbitron'] text-xs font-bold transition ${
                    viewTab === "explore"
                      ? "bg-gradient-to-r from-[#FF4DB8] to-[#FF789A] text-white shadow-md"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Explore Events
                </button>

                <button
                  type="button"
                  onClick={() => setViewTab("my_registrations")}
                  className={`rounded-full px-5 py-2 font-['Orbitron'] text-xs font-bold transition ${
                    viewTab === "my_registrations"
                      ? "bg-gradient-to-r from-[#FF4DB8] to-[#FF789A] text-white shadow-md"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  My Registrations
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {viewTab === "explore" ? (
          <>
            {/* FILTERS */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setActiveType(type.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      activeType === type.id
                        ? "bg-[#00D4FF] text-[#050A30] shadow-[0_0_15px_rgba(0,212,255,0.4)]"
                        : "border border-white/10 bg-[#071333] text-slate-300 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchEvents();
                }}
                className="flex items-center rounded-full border border-white/10 bg-[#071333] px-3.5 py-2 focus-within:border-[#00D4FF]"
              >
                <Search size={14} className="mr-2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events..."
                  className="w-44 bg-transparent text-xs text-white outline-none placeholder:text-slate-500 sm:w-56"
                />
              </form>
            </div>

            {/* EVENT GRID */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <LoaderCircle
                  size={36}
                  className="animate-spin text-[#00D4FF]"
                />
                <p className="mt-4 font-['Orbitron'] text-xs uppercase tracking-widest">
                  Loading Events...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-300">
                {error}
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#071333] p-12 text-center">
                <Calendar size={48} className="mx-auto mb-3 text-slate-600" />

                <h3 className="font-['Orbitron'] text-lg font-bold">
                  No events match your criteria
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  Try another category or check back soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#071333] transition-all duration-300 hover:border-[#FF4DB8]/50 hover:shadow-[0_10px_30px_rgba(255,77,184,0.12)]"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-[#0A1640]">
                      {event.bannerImage ? (
                        <img
                          src={event.bannerImage}
                          alt={event.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-tr from-[#0B1F6B] to-[#141B4A]">
                          <Calendar size={40} className="text-[#00D4FF]/40" />
                        </div>
                      )}

                      <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                        {Number(event.entryFee || 0) === 0
                          ? "FREE"
                          : `${event.currency} ${event.entryFee}`}
                      </div>

                      <div className="absolute bottom-3 left-3 rounded-full bg-[#050A30]/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#00D4FF] backdrop-blur-md">
                        {event.type}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-['Orbitron'] text-base font-bold text-white transition group-hover:text-[#FF789A]">
                        {event.name}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-300">
                        {event.description}
                      </p>

                      {/* PRIZES & REWARDS */}
                      <div className="mt-4 rounded-xl border border-[#FFD700]/20 bg-gradient-to-r from-[#FFD700]/10 to-[#FF4DB8]/5 p-3">
                        <div className="flex items-center gap-2">
                          <Sparkles
                            size={15}
                            className="shrink-0 text-[#FFD700]"
                          />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD700]">
                            Prizes & Rewards
                          </span>
                        </div>

                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-200">
                          {getPrizeInfo(event)}
                        </p>
                      </div>

                      <div className="mt-4 space-y-2 border-t border-white/5 pt-4 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-[#FF4DB8]" />
                          {new Date(event.startDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-[#00D4FF]" />
                          <span className="truncate">
                            {event.location ||
                              (event.isOnline ? "Online" : "TBA")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users size={13} className="text-[#B7FF3F]" />
                          {event.registeredCount || 0}
                          {event.maxParticipants > 0
                            ? ` / ${event.maxParticipants}`
                            : ""}{" "}
                          Registered
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEvent(event)}
                          className="flex-1 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartRegister(event)}
                          disabled={!event.isRegistrationOpen}
                          className="flex-1 rounded-full bg-gradient-to-r from-[#FF4DB8] to-[#FF789A] px-4 py-2 font-['Orbitron'] text-xs font-bold text-white shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {event.isRegistrationOpen ? "Register" : "Closed"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* MY REGISTRATIONS */
          <div>
            <h2 className="mb-6 font-['Orbitron'] text-xl font-bold text-white">
              Your Registered Events
            </h2>

            {loadingRegistrations ? (
              <div className="flex justify-center py-16">
                <LoaderCircle
                  size={32}
                  className="animate-spin text-[#FF4DB8]"
                />
              </div>
            ) : myRegistrations.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#071333] p-12 text-center">
                <Ticket size={48} className="mx-auto mb-3 text-slate-600" />

                <h3 className="font-['Orbitron'] text-base font-bold">
                  No registrations found
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  You haven't registered for any events yet.
                </p>

                <button
                  type="button"
                  onClick={() => setViewTab("explore")}
                  className="mt-4 rounded-full bg-gradient-to-r from-[#FF4DB8] to-[#FF789A] px-5 py-2 font-['Orbitron'] text-xs font-bold text-white"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRegistrations.map((reg) => (
                  <div
                    key={reg._id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#071333] p-5 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#00D4FF]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#00D4FF]">
                          {reg.event?.type || "Event"}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusClass(
                            reg.registrationStatus,
                          )}`}
                        >
                          {getRegistrationStatus(reg.registrationStatus)}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusClass(
                            reg.paymentStatus,
                          )}`}
                        >
                          {getPaymentStatus(reg.paymentStatus)}
                        </span>
                      </div>

                      <h3 className="mt-2 font-['Orbitron'] text-base font-bold text-white">
                        {reg.event?.name || "Event"}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Registered on{" "}
                        {reg.createdAt
                          ? new Date(reg.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>

                      {reg.registrationNumber && (
                        <p className="mt-1 text-[11px] text-[#00D4FF]">
                          Registration ID: {reg.registrationNumber}
                        </p>
                      )}

                      {reg.submission?.title && (
                        <p className="mt-1 text-xs text-slate-300">
                          Submission: {reg.submission.title}
                        </p>
                      )}

                      {reg.submission?.rejectionReason && (
                        <p className="mt-2 text-xs text-red-400">
                          Review feedback: {reg.submission.rejectionReason}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (reg.event) {
                          setSelectedEvent(reg.event);
                        }
                      }}
                      disabled={!reg.event}
                      className="rounded-full border border-white/20 bg-white/5 px-4 py-2 font-['Orbitron'] text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-40"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#070F2B] p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>

            {selectedEvent.bannerImage && (
              <div className="mb-6 h-64 w-full overflow-hidden rounded-xl bg-black/40">
                <img
                  src={selectedEvent.bannerImage}
                  alt={selectedEvent.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#00D4FF]/20 px-3 py-0.5 text-[10px] font-bold uppercase text-[#00D4FF]">
                {selectedEvent.type}
              </span>

              <span className="rounded-full bg-[#FF4DB8]/20 px-3 py-0.5 text-[10px] font-bold uppercase text-[#FF789A]">
                {Number(selectedEvent.entryFee || 0) === 0
                  ? "Free Entry"
                  : `${selectedEvent.currency} ${selectedEvent.entryFee}`}
              </span>
            </div>

            <h2 className="font-['Orbitron'] text-2xl font-bold text-white">
              {selectedEvent.name}
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 border-y border-white/10 py-4 text-xs text-slate-300 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-slate-500">Date & Time</span>
                <span className="font-semibold text-white">
                  {new Date(selectedEvent.startDate).toLocaleString()} –{" "}
                  {new Date(selectedEvent.endDate).toLocaleString()}
                </span>
              </div>

              <div>
                <span className="mb-1 block text-slate-500">
                  Registration Deadline
                </span>
                <span className="font-semibold text-white">
                  {new Date(
                    selectedEvent.registrationEndDate,
                  ).toLocaleDateString()}
                </span>
              </div>

              <div>
                <span className="mb-1 block text-slate-500">Location</span>
                <span className="font-semibold text-white">
                  {selectedEvent.location ||
                    (selectedEvent.isOnline ? "Online" : "TBA")}
                </span>
              </div>

              <div>
                <span className="mb-1 block text-slate-500">
                  Eligible Manch
                </span>
                <span className="font-semibold capitalize text-white">
                  {selectedEvent.category || "All"}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs leading-relaxed text-slate-300">
              <div>
                <h4 className="mb-1 font-bold text-white">About the Event</h4>
                <p>{selectedEvent.description}</p>
              </div>

              <div>
                <h4 className="mb-1 font-bold text-[#FFD700]">
                  Prizes & Recognition
                </h4>
                <p>{getPrizeInfo(selectedEvent)}</p>
              </div>

              {selectedEvent.eligibilityRequirements && (
                <div>
                  <h4 className="mb-1 font-bold text-white">Eligibility</h4>
                  <p>{selectedEvent.eligibilityRequirements}</p>
                </div>
              )}

              {selectedEvent.rules && (
                <div>
                  <h4 className="mb-1 font-bold text-white">
                    Rules & Guidelines
                  </h4>
                  <p className="whitespace-pre-line">{selectedEvent.rules}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-full border border-white/10 px-5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const event = selectedEvent;
                  setSelectedEvent(null);
                  handleStartRegister(event);
                }}
                disabled={!selectedEvent.isRegistrationOpen}
                className="rounded-full bg-gradient-to-r from-[#FF4DB8] to-[#FF789A] px-6 py-2 font-['Orbitron'] text-xs font-bold text-white shadow-lg disabled:opacity-40"
              >
                {selectedEvent.isRegistrationOpen
                  ? "Register Now"
                  : "Registration Closed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {registeringEvent && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-4">
          <div className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#070F2B] p-5 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={closeRegistration}
              disabled={submittingReg}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <X size={18} />
            </button>

            {regSuccess ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 size={58} className="mb-4 text-emerald-400" />

                <h3 className="font-['Orbitron'] text-xl font-bold text-white">
                  Registration Submitted!
                </h3>

                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
                  {regSuccessMessage}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  You can track your registration and review status under My
                  Registrations.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setRegisteringEvent(null);
                    setRegSuccess(false);
                    setViewTab("my_registrations");
                  }}
                  className="mt-6 rounded-full bg-gradient-to-r from-[#FF4DB8] to-[#FF789A] px-6 py-3 font-['Orbitron'] text-xs font-bold text-white"
                >
                  View My Registrations
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 pr-8">
                  <div className="flex items-center gap-2 text-[#00D4FF]">
                    <Sparkles size={16} />
                    <span className="font-['Orbitron'] text-[10px] font-bold uppercase tracking-widest">
                      PRATIVA EVENT ENTRY
                    </span>
                  </div>

                  <h3 className="mt-2 font-['Orbitron'] text-xl font-bold text-white">
                    Register for Event
                  </h3>

                  <p className="mt-1 truncate text-sm text-[#FF789A]">
                    {registeringEvent.name}
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-7">
                  {/* PARTICIPANT INFORMATION */}
                  <section className="space-y-4">
                    <div className="border-b border-white/10 pb-2">
                      <h4 className="font-['Orbitron'] text-sm font-bold text-[#00D4FF]">
                        01. Participant Information
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Tell us who is participating.
                      </p>
                    </div>

                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <input
                        type="text"
                        value={regForm.fullName}
                        onChange={(e) => updateForm("fullName", e.target.value)}
                        required
                        className={inputClass}
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Email Address *</label>
                      <input
                        type="email"
                        value={regForm.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        required
                        className={inputClass}
                        placeholder="you@example.com"
                      />
                    </div>
                  </section>

                  {/* CREATIVE SUBMISSION */}
                  <section className="space-y-4">
                    <div className="border-b border-white/10 pb-2">
                      <h4 className="font-['Orbitron'] text-sm font-bold text-[#FF789A]">
                        02. Creative Submission
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Submit the creative work you want to enter into this
                        event.
                      </p>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Submission Category *
                      </label>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {availableCategories.map((category) => {
                          const Icon = category.icon;
                          const active = selectedCategory === category.id;

                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => handleCategoryChange(category.id)}
                              className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                                active
                                  ? "border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]"
                                  : "border-white/10 bg-[#081326] text-slate-400 hover:border-white/30"
                              }`}
                            >
                              <Icon size={20} />
                              {category.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Submission Title *</label>
                      <input
                        type="text"
                        value={regForm.title}
                        onChange={(e) => updateForm("title", e.target.value)}
                        required
                        maxLength={150}
                        className={inputClass}
                        placeholder="Give your creative work a title"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Short Description *</label>
                      <textarea
                        value={regForm.description}
                        onChange={(e) =>
                          updateForm("description", e.target.value)
                        }
                        required
                        rows={3}
                        maxLength={2000}
                        className={`${inputClass} resize-y`}
                        placeholder="Describe your creative submission..."
                      />
                    </div>

                    {isWordsEntry && (
                      <>
                        <div>
                          <label className={labelClass}>
                            Your Written Work *
                          </label>
                          <textarea
                            value={regForm.content}
                            onChange={(e) =>
                              updateForm("content", e.target.value)
                            }
                            required
                            rows={9}
                            className={`${inputClass} resize-y`}
                            placeholder="Write your poem, story, essay or other creative work here..."
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className={labelClass}>Font Style</label>
                            <select
                              value={regForm.fontStyle}
                              onChange={(e) =>
                                updateForm("fontStyle", e.target.value)
                              }
                              className={inputClass}
                            >
                              <option value="serif">Serif</option>
                              <option value="sans">Sans</option>
                              <option value="devanagari">Devanagari</option>
                              <option value="handwritten">Handwritten</option>
                            </select>
                          </div>

                          <div>
                            <label className={labelClass}>Text Alignment</label>
                            <select
                              value={regForm.textAlign}
                              onChange={(e) =>
                                updateForm("textAlign", e.target.value)
                              }
                              className={inputClass}
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {!isWordsEntry && (
                      <div>
                        <label className={labelClass}>
                          {isVoiceEntry
                            ? "Upload Audio Submission *"
                            : "Upload Image Submission *"}
                        </label>

                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#00D4FF]/40 bg-[#00D4FF]/5 px-5 py-8 text-center transition hover:border-[#FF4DB8] hover:bg-[#FF4DB8]/5">
                          {isVoiceEntry ? (
                            <Music size={30} className="mb-3 text-[#00D4FF]" />
                          ) : (
                            <Upload size={30} className="mb-3 text-[#00D4FF]" />
                          )}

                          <span className="text-sm font-semibold text-white">
                            {mediaFile
                              ? mediaFile.name
                              : isVoiceEntry
                                ? "Choose your audio file"
                                : "Choose your image file"}
                          </span>

                          <span className="mt-2 text-[11px] text-slate-400">
                            {isVoiceEntry
                              ? "Audio formats supported by your browser"
                              : "Select an image from your device"}
                          </span>

                          <input
                            type="file"
                            accept={isVoiceEntry ? "audio/*" : "image/*"}
                            onChange={handleMediaChange}
                            className="hidden"
                          />
                        </label>

                        {mediaFile && (
                          <div className="mt-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                            <span className="truncate text-xs text-slate-300">
                              {mediaFile.name}
                            </span>

                            <button
                              type="button"
                              onClick={() => setMediaFile(null)}
                              className="ml-3 text-red-400 hover:text-red-300"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className={labelClass}>Tags</label>
                      <input
                        type="text"
                        value={regForm.tags}
                        onChange={(e) => updateForm("tags", e.target.value)}
                        className={inputClass}
                        placeholder="poetry, creativity, nepali (comma separated)"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Additional Notes</label>
                      <textarea
                        value={regForm.notes}
                        onChange={(e) => updateForm("notes", e.target.value)}
                        rows={2}
                        className={`${inputClass} resize-y`}
                        placeholder="Anything else you want the organizers to know..."
                      />
                    </div>
                  </section>

                  {/* PAYMENT */}
                  {isPaidEvent && (
                    <section className="space-y-4">
                      <div className="border-b border-white/10 pb-2">
                        <h4 className="font-['Orbitron'] text-sm font-bold text-[#FFD700]">
                          03. Entry Payment
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Complete your payment and provide its transaction
                          reference.
                        </p>
                      </div>

                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">
                            Event Entry Fee
                          </span>

                          <span className="text-lg font-bold text-[#FFD700]">
                            {registeringEvent.currency}{" "}
                            {registeringEvent.entryFee}
                          </span>
                        </div>

                        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                          Pay the entry fee using the payment method selected
                          below. Your registration will remain subject to manual
                          payment verification by the PRATIVA administration
                          team.
                        </p>
                      </div>

                      <div>
                        <label className={labelClass}>Payment Method *</label>

                        <select
                          value={regForm.paymentMethod}
                          onChange={(e) =>
                            updateForm("paymentMethod", e.target.value)
                          }
                          required
                          className={inputClass}
                        >
                          <option value="esewa">eSewa</option>
                          <option value="khalti">Khalti</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="card_gateway">Card Gateway</option>
                          <option value="cash">Cash</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Transaction Reference / Voucher ID *
                        </label>

                        <input
                          type="text"
                          value={regForm.paymentReference}
                          onChange={(e) =>
                            updateForm("paymentReference", e.target.value)
                          }
                          required
                          maxLength={150}
                          className={inputClass}
                          placeholder="Enter your payment transaction ID"
                        />

                        <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
                          Enter the transaction ID shown in your payment
                          application or bank receipt. Submitting this ID does
                          not automatically confirm your payment.
                        </p>
                      </div>
                    </section>
                  )}

                  {/* FREE EVENT NOTICE */}
                  {!isPaidEvent && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="text-xs font-semibold text-emerald-400">
                        Free Event — No Payment Required
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Your creative submission will be reviewed by the PRATIVA
                        team before confirmation.
                      </p>
                    </div>
                  )}

                  {regError && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                      {regError}
                    </div>
                  )}

                  {/* SUBMIT */}
                  <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeRegistration}
                      disabled={submittingReg}
                      className="rounded-full border border-white/10 px-5 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submittingReg}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF4DB8] to-[#FF789A] px-7 py-3 font-['Orbitron'] text-xs font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingReg && (
                        <LoaderCircle size={15} className="animate-spin" />
                      )}

                      {submittingReg ? "Submitting..." : "Submit Event Entry"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
