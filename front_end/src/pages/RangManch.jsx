import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, SlidersHorizontal, ChevronDown, LoaderCircle, RefreshCw, Palette, Sparkles } from "lucide-react";
import rangHero from "../assets/rangmanch.png";
import { useAuth } from "../context/AuthContext";
import RangGrid from "../components/rang/RangGrid";
import RangUpload from "../components/rang/RangUpload";
import RangNavbar from "../components/rang/RangNavbar";
import CreateProfile from "../components/CreateProfile";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

const categories = [
  "All artwork",
  "Digital Art",
  "Paintings",
  "Sketches",
  "Illustrations",
  "Concept Art",
  "Traditional",
];

const sortOptions = [
  { label: "Latest", value: "latest" },
  { label: "Most liked", value: "most-liked" },
  { label: "Most discussed", value: "most-discussed" },
];

const RangManch = () => {
  const { user, profile, isAuthenticated, hasProfile } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All artwork");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showUpload, setShowUpload] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  const fetchArtPosts = async (targetPage = 1, append = false) => {
    try {
      if (targetPage === 1) setLoading(true);
      else setLoadingMore(true);

      setError("");

      const res = await axios.get(`${API_URL}/api/post/feed`, {
        params: {
          category: "art",
          page: targetPage,
          limit: 16,
          sort,
        },
      });

      if (res.data.success) {
        const fetched = res.data.posts || [];
        setPosts((prev) => (append ? [...prev, ...fetched] : fetched));
        setHasMore(Boolean(res.data.pagination?.hasMore));
        setPage(targetPage);
      }
    } catch (err) {
      console.error("Fetch art error:", err);
      setError("Unable to load artwork. Please check your connection.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchArtPosts(1, false);
  }, [sort]);

  const handleOpenUpload = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (!hasProfile) {
      setShowCreateProfile(true);
      return;
    }
    setShowUpload(true);
  };

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (activeCategory !== "All artwork") {
      const match = activeCategory.toLowerCase();
      result = result.filter(
        (p) =>
          p.tags?.some((t) => t.toLowerCase().includes(match)) ||
          p.title?.toLowerCase().includes(match) ||
          p.description?.toLowerCase().includes(match)
      );
    }

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.tags?.some((t) => t.toLowerCase().includes(term)) ||
          p.author?.name?.toLowerCase().includes(term) ||
          p.authorProfile?.username?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [posts, activeCategory, search]);

  return (
    <div className="min-h-screen bg-[#050A30] text-white">
      <RangNavbar onUpload={handleOpenUpload} />

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[#8A2BE2]/20 bg-gradient-to-b from-[#09113B] to-[#050A30] py-14 sm:py-20">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#8A2BE2]/10 blur-[120px] pointer-events-none" />
        <div className="absolute left-0 bottom-0 h-80 w-80 rounded-full bg-[#FF4DB8]/10 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8A2BE2]/40 bg-[#8A2BE2]/10 px-3.5 py-1 text-xs font-semibold text-[#8A2BE2] mb-4">
              <Sparkles size={14} />
              <span>THE VISUAL ARTS & CANVAS STAGE</span>
            </div>
            <h1 className="font-['Orbitron'] text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              RANG <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A2BE2] to-[#FF4DB8]">MANCH</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              A sanctuary for painters, digital illustrators, visual artists, and sketchers. Let your imagination splash onto the cosmic canvas.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <button
                type="button"
                onClick={handleOpenUpload}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8A2BE2] to-[#FF4DB8] px-6 py-3 font-['Orbitron'] text-xs font-bold text-white shadow-[0_0_25px_rgba(138,43,226,0.4)] transition hover:scale-105"
              >
                <Palette size={16} />
                <span>Exhibit Your Art</span>
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-md shrink-0">
            <div className="relative overflow-hidden rounded-3xl border border-[#8A2BE2]/30 bg-[#0B1437]/60 shadow-[0_0_40px_rgba(138,43,226,0.2)]">
              <img
                src={rangHero}
                alt="Rang Manch Showcase"
                className="h-auto w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Filters */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  activeCategory === cat
                    ? "bg-[#8A2BE2] text-white shadow-[0_0_15px_rgba(138,43,226,0.4)]"
                    : "border border-white/10 bg-[#081326] text-slate-300 hover:border-white/20 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-white/10 bg-[#081326] px-3.5 py-1.5 focus-within:border-[#8A2BE2]">
              <Search size={14} className="text-slate-400 mr-2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search artwork or artist..."
                className="w-36 bg-transparent text-xs text-white placeholder-slate-500 outline-none sm:w-48"
              />
            </div>

            <div className="relative flex items-center rounded-full border border-white/10 bg-[#081326] px-3 py-1.5">
              <SlidersHorizontal size={13} className="text-slate-400 mr-1.5" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer pr-4"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#070F2B]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchArtPosts(1)}
              className="flex items-center gap-1 font-semibold text-white underline hover:no-underline"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}

        {/* Art Grid */}
        <RangGrid
          posts={filteredPosts}
          loading={loading}
          currentUserId={user?._id}
        />

        {/* Load More */}
        {hasMore && !loading && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => fetchArtPosts(page + 1, true)}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 font-['Orbitron'] text-xs font-semibold text-white transition hover:border-[#8A2BE2] hover:bg-[#8A2BE2]/10 disabled:opacity-50"
            >
              {loadingMore ? <LoaderCircle size={15} className="animate-spin" /> : null}
              <span>{loadingMore ? "Loading..." : "Load More Artwork"}</span>
            </button>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-sm">
          <div className="min-h-screen flex items-center justify-center p-4">
            <RangUpload
              onClose={() => setShowUpload(false)}
              onCreated={(newPost) => setPosts((prev) => [newPost, ...prev])}
            />
          </div>
        </div>
      )}

      {/* Create Profile Modal */}
      {showCreateProfile && (
        <CreateProfile
          onClose={() => setShowCreateProfile(false)}
          onSuccess={() => {
            setShowCreateProfile(false);
            setShowUpload(true);
          }}
        />
      )}
    </div>
  );
};

export default RangManch;
