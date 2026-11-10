import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Edit3,
  Image as ImageIcon,
  LoaderCircle,
  Music2,
  RefreshCw,
  Save,
  X,
  Sparkles,
  Heart,
  MessageCircle,
  CalendarDays,
  Images,
  Feather,
  Play,
  Pause,
  Upload,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import CreateProfile from "../components/CreateProfile";

import SwarPostDetails from "../components/swar/SwarPostDetail";
import DrishyaPostDetails from "../components/drishya/DrishyaPostDetail";
import ShabdaPostDetails from "../components/shabda/ShabdaPostDetail";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const categories = [
  { value: "all", label: "All posts", icon: Images },
  { value: "vision", label: "दृश्यमञ्च", icon: Camera },
  { value: "voice", label: "स्वरमञ्च", icon: Music2 },
  { value: "art", label: "रङ्गमञ्च", icon: ImageIcon },
  { value: "words", label: "शब्दमञ्च", icon: Edit3 },
];

const getUserId = (profile) => {
  if (!profile?.user) return null;

  if (typeof profile.user === "object") {
    return profile.user._id || profile.user.id || null;
  }

  return profile.user;
};

const getAuthorName = (profile) =>
  profile?.user?.name || profile?.user?.fullName || profile?.name || "Creator";

const getMedia = (post) => {
  if (!post?.media) return null;

  if (Array.isArray(post.media)) {
    return post.media[0] || null;
  }

  return post.media;
};

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });
};

const formatTime = (seconds = 0) => {
  if (!Number.isFinite(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${String(secs).padStart(2, "0")}`;
};

/* Compact audio player used inside profile cards */
const MiniAudioPlayer = ({ src }) => {
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayback = async (event) => {
    event.stopPropagation();

    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
        setPlaying(true);
      } else {
        audio.pause();
        setPlaying(false);
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
      setPlaying(false);
    }
  };

  const handleSeek = (event) => {
    event.stopPropagation();

    const audio = audioRef.current;
    if (!audio || !duration) return;

    const nextTime = Number(event.target.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <div
      className="relative flex items-center gap-3 rounded-xl border border-[#FF4DB8]/15 bg-[#050A30]/70 p-3"
      onClick={(event) => event.stopPropagation()}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => setPlaying(false)}
      />

      <button
        type="button"
        onClick={togglePlayback}
        aria-label={playing ? "Pause audio" : "Play audio"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#FF4DB8] to-[#EC4899] text-white shadow-[0_0_18px_rgba(255,75,184,0.2)] transition hover:scale-105"
      >
        {playing ? (
          <Pause size={17} fill="currentColor" />
        ) : (
          <Play size={17} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px] tabular-nums text-[#A7B5D8]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={handleSeek}
          onClick={(event) => event.stopPropagation()}
          aria-label="Audio progress"
          className="h-1.5 w-full cursor-pointer accent-[#FF4DB8]"
        />
      </div>

      <Music2 size={17} className="shrink-0 text-[#FF4DB8]" />
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const {
    user,
    isAuthenticated,
    loading: authLoading,
    refreshProfile,
  } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");
  const [postsError, setPostsError] = useState("");

  const [activeCategory, setActiveCategory] = useState("all");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const [selectedPost, setSelectedPost] = useState(null);

  const currentUserId = user?._id || user?.id;
  const ownProfile = !userId || String(userId) === String(currentUserId);

  /* Fetch profile */
  const fetchProfile = useCallback(async () => {
    if (!API_URL) {
      throw new Error("VITE_API_URL is not configured.");
    }

    const endpoint = ownProfile
      ? `${API_URL}/api/profile/me`
      : `${API_URL}/api/profile/${userId}`;

    const response = await axios.get(endpoint, {
      withCredentials: true,
    });

    const fetchedProfile = response.data.profile || null;

    setProfile(fetchedProfile);

    if (fetchedProfile) {
      setEditForm({
        username: fetchedProfile.username || "",
        bio: fetchedProfile.bio || "",
      });
    }

    return fetchedProfile;
  }, [ownProfile, userId]);

  /* Fetch creator posts */
  const fetchPosts = useCallback(
    async (targetUserId, requestedPage = 1, append = false) => {
      if (!targetUserId) {
        setPosts([]);
        setPostsLoading(false);
        return;
      }

      if (!append) {
        setPostsLoading(true);
        setPostsError("");
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/post/user/${targetUserId}`,
          {
            params: {
              page: requestedPage,
              limit: 12,
            },
            withCredentials: true,
          },
        );

        const fetchedPosts = response.data.posts || [];
        const pagination = response.data.pagination;

        if (append) {
          setPosts((previous) => {
            const existingIds = new Set(previous.map((post) => post._id));

            return [
              ...previous,
              ...fetchedPosts.filter((post) => !existingIds.has(post._id)),
            ];
          });
        } else {
          setPosts(fetchedPosts);
        }

        setPage(requestedPage);
        setHasMore(Boolean(pagination?.hasMore));
      } catch (err) {
        console.error("Unable to fetch profile posts:", err);

        setPostsError(
          err.response?.data?.message || "Unable to load this creator's posts.",
        );
      } finally {
        setPostsLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  /* Initial profile and post loading */
  const loadProfile = useCallback(async () => {
    if (authLoading) return;

    if (ownProfile && !isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");
    setPosts([]);
    setPage(1);
    setHasMore(false);

    try {
      const fetchedProfile = await fetchProfile();

      if (!fetchedProfile) {
        setPosts([]);
        return;
      }

      const targetUserId = getUserId(fetchedProfile);

      if (!targetUserId) {
        setPostsError("Unable to identify this creator's account.");
        return;
      }

      await fetchPosts(targetUserId, 1, false);
    } catch (err) {
      console.error("Unable to load profile:", err);

      if (err.response?.status === 401 && ownProfile) {
        navigate("/login", { replace: true });
        return;
      }

      if (err.response?.status === 404) {
        setProfile(null);
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load this profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    authLoading,
    isAuthenticated,
    ownProfile,
    navigate,
    fetchProfile,
    fetchPosts,
  ]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /* Clean up image preview URLs */
  useEffect(() => {
    return () => {
      if (profileImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  /* Open profile editor */
  const handleEditClick = () => {
    setEditForm({
      username: profile?.username || "",
      bio: profile?.bio || "",
    });

    setProfileImageFile(null);
    setProfileImagePreview(profile?.profileImage || "");
    setError("");
    setShowEditProfile(true);
  };

  /* Select a new profile picture */
  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture must be smaller than 5 MB.");
      return;
    }

    setError("");
    setProfileImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setProfileImagePreview(previewUrl);
  };

  /* Update profile */
  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    if (saving) return;

    const username = editForm.username.trim().toLowerCase();
    const bio = editForm.bio.trim();

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError(
        "Username must be 3–20 characters and contain only lowercase letters, numbers, or underscores.",
      );
      return;
    }

    if (bio.length > 160) {
      setError("Your bio cannot exceed 160 characters.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let response;

      if (profileImageFile) {
        const formData = new FormData();

        formData.append("username", username);
        formData.append("bio", bio);
        formData.append("profileImage", profileImageFile);

        response = await axios.put(`${API_URL}/api/profile/update`, formData, {
          withCredentials: true,
        });
      } else {
        response = await axios.put(
          `${API_URL}/api/profile/update`,
          {
            username,
            bio,
          },
          {
            withCredentials: true,
          },
        );
      }

      const updatedProfile = response.data.profile;

      if (updatedProfile) {
        setProfile(updatedProfile);

        setEditForm({
          username: updatedProfile.username || "",
          bio: updatedProfile.bio || "",
        });

        setProfileImagePreview(updatedProfile.profileImage || "");
      } else {
        await fetchProfile();
      }

      setProfileImageFile(null);

      if (ownProfile) {
        await refreshProfile();
      }

      setShowEditProfile(false);
    } catch (err) {
      console.error("Unable to update profile:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* Load another page of posts */
  const handleLoadMore = async () => {
    if (loadingMore || postsLoading || !hasMore) return;

    const targetUserId = getUserId(profile);

    if (!targetUserId) return;

    await fetchPosts(targetUserId, page + 1, true);
  };

  /* Filter posts by Manch */
  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return posts;

    return posts.filter(
      (post) => post.category?.toLowerCase() === activeCategory,
    );
  }, [posts, activeCategory]);

  /* Refresh after profile creation */
  const handleProfileCreated = async () => {
    setShowCreateProfile(false);

    try {
      await refreshProfile();
      await loadProfile();
    } catch (err) {
      console.error("Unable to refresh profile:", err);
    }
  };

  /* Refresh a post after its detail component updates it */
  const handlePostUpdated = (updatedPost) => {
    if (!updatedPost?._id) return;

    setPosts((previous) =>
      previous.map((post) =>
        post._id === updatedPost._id ? { ...post, ...updatedPost } : post,
      ),
    );

    setSelectedPost((previous) =>
      previous?._id === updatedPost._id
        ? { ...previous, ...updatedPost }
        : previous,
    );
  };

  /* Open the correct detail component */
  const handlePostSelect = (post) => {
    setSelectedPost(post);
  };

  const handleClosePostDetails = () => {
    setSelectedPost(null);
  };

  const profileName = getAuthorName(profile);
  const profileUsername = profile?.username || "creator";
  const profileImage = profile?.profileImage || "";
  const profileBio = profile?.bio || "A creator finding their own voice.";

  const totalPosts = profile ? (profile.postCount ?? posts.length) : 0;

  const selectedCategory = selectedPost?.category?.toLowerCase();

  /* Loading screen */
  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#050A30]">
        <div className="relative flex flex-col items-center gap-4">
          <div className="absolute h-32 w-32 rounded-full bg-[#FF4DB8]/10 blur-3xl" />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#FF4DB8]/30 bg-[#0B1F6B]/50">
            <LoaderCircle size={29} className="animate-spin text-[#FF4DB8]" />
          </div>

          <p className="text-xs font-medium tracking-[0.25em] text-[#A7B5D8]">
            OPENING PROFILE
          </p>
        </div>
      </main>
    );
  }

  /* Error screen */
  if (error && !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050A30] px-5">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#FF4DB8]/20 bg-[#FF4DB8]/10 text-[#FF4DB8]">
            <Sparkles size={26} />
          </div>

          <p className="font-serif text-3xl text-[#F4F7FF]">
            Something went wrong.
          </p>

          <p className="mt-3 text-sm leading-7 text-[#A7B5D8]">{error}</p>

          <button
            type="button"
            onClick={loadProfile}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF4DB8] to-[#EC4899] px-6 py-3 text-sm font-semibold text-white transition hover:shadow-[0_0_25px_rgba(255,75,184,0.25)]"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  /* Empty profile screen */
  if (!profile) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050A30] px-5">
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-[#FF4DB8]/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-[#FF4DB8]/10 blur-[120px]" />

        <div className="relative max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#FF4DB8]/20 bg-[#0B1F6B]/40 text-[#FF4DB8] shadow-[0_0_35px_rgba(255,75,184,0.12)]">
            <Camera size={30} />
          </div>

          <h1 className="font-serif text-3xl text-[#F4F7FF] sm:text-4xl">
            {ownProfile
              ? "Your story starts here."
              : "This creator hasn't joined yet."}
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#A7B5D8]">
            {ownProfile
              ? "Create your profile and give your work a place to belong."
              : "This profile may not exist or may no longer be available."}
          </p>

          {ownProfile && (
            <button
              type="button"
              onClick={() => setShowCreateProfile(true)}
              className="mt-7 rounded-full bg-gradient-to-r from-[#FF4DB8] to-[#EC4899] px-7 py-3 text-sm font-semibold text-white transition hover:shadow-[0_0_25px_rgba(255,75,184,0.25)]"
            >
              Create your profile
            </button>
          )}

          {!ownProfile && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#FF4DB8]/20 bg-[#0B153D] px-6 py-3 text-sm font-medium text-[#FFD6EC] transition hover:border-[#FF4DB8]/60 hover:text-[#FF4DB8]"
            >
              <ArrowLeft size={16} />
              Go back
            </button>
          )}
        </div>

        {showCreateProfile && (
          <CreateProfile
            onClose={() => setShowCreateProfile(false)}
            onSuccess={handleProfileCreated}
          />
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050A30] text-[#F4F7FF]">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-48 top-20 h-[420px] w-[420px] rounded-full bg-[#FF4DB8]/[0.06] blur-[140px]" />
        <div className="absolute -right-48 top-[35%] h-[450px] w-[450px] rounded-full bg-[#FF4DB8]/[0.06] blur-[150px]" />
      </div>

      {/* Back button */}
      <div className="relative mx-auto max-w-6xl px-5 pt-5 sm:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-[#0B153D]/70 px-4 py-2.5 text-sm font-medium text-[#A7B5D8] transition hover:border-[#FF4DB8]/40 hover:text-[#FF4DB8]"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Profile header */}
      <section className="relative mt-5 border-b border-white/[0.07]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="relative inline-flex rounded-full p-[3px]">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF4DB8] via-[#BE185D] to-[#FF4DB8] opacity-90 blur-[7px]" />

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={profileName}
                    className="relative h-28 w-28 rounded-full border-[3px] border-[#080F37] object-cover sm:h-36 sm:w-36"
                  />
                ) : (
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-[#080F37] bg-gradient-to-br from-[#102B65] to-[#32175E] font-serif text-4xl text-[#FF4DB8] sm:h-36 sm:w-36">
                    {profileName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Profile information */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#FF4DB8]">
                    <Sparkles size={13} />
                    Creator profile
                  </p>

                  <h1 className="font-serif text-3xl text-[#F4F7FF] sm:text-4xl">
                    {profileName}
                  </h1>

                  <p className="mt-1.5 text-sm text-[#8194C4]">
                    @{profileUsername}
                  </p>
                </div>

                {ownProfile && (
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="inline-flex items-center gap-2 rounded-full border border-[#FF4DB8]/25 bg-[#0B1F6B]/30 px-5 py-2.5 text-sm font-medium text-[#FFD6EC] transition hover:border-[#FF4DB8]/60 hover:bg-[#FF4DB8]/10 hover:text-[#FF8BCB]"
                  >
                    <Edit3 size={15} />
                    Edit profile
                  </button>
                )}
              </div>

              <p className="mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-[#A7B5D8]">
                {profileBio}
              </p>

              {/* Profile statistics */}
              <div className="mt-7 flex flex-wrap gap-3">
                <div className="min-w-[100px] rounded-xl border border-[#FF4DB8]/10 bg-[#0B153D]/70 px-5 py-3">
                  <p className="text-xl font-semibold text-[#F4F7FF]">
                    {totalPosts}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8194C4]">
                    Posts
                  </p>
                </div>

                {typeof profile.followersCount === "number" && (
                  <div className="min-w-[100px] rounded-xl border border-[#FF4DB8]/10 bg-[#0B153D]/70 px-5 py-3">
                    <p className="text-xl font-semibold text-[#F4F7FF]">
                      {profile.followersCount}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8194C4]">
                      Followers
                    </p>
                  </div>
                )}

                {typeof profile.followingCount === "number" && (
                  <div className="min-w-[100px] rounded-xl border border-[#FF4DB8]/10 bg-[#0B153D]/70 px-5 py-3">
                    <p className="text-xl font-semibold text-[#F4F7FF]">
                      {profile.followingCount}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8194C4]">
                      Following
                    </p>
                  </div>
                )}

                {profile.createdAt && (
                  <div className="min-w-[125px] rounded-xl border border-[#FF4DB8]/10 bg-[#0B153D]/70 px-5 py-3">
                    <p className="flex items-center gap-2 text-sm font-medium text-[#F4F7FF]">
                      <CalendarDays size={14} className="text-[#FF4DB8]" />
                      {formatDate(profile.createdAt)}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8194C4]">
                      Joined
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator posts */}
      <section className="relative mx-auto max-w-6xl px-5 py-9 sm:px-8">
        <div className="mb-7">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#FF4DB8]">
            <Sparkles size={13} />
            The collection
          </p>

          <h2 className="mt-2 font-serif text-3xl text-[#F4F7FF]">
            {ownProfile ? "Your creations." : `${profileName}'s creations.`}
          </h2>

          <p className="mt-2 text-sm text-[#8194C4]">
            Every post is another piece of the story.
          </p>
        </div>

        {/* Category filters */}
        <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const active = activeCategory === category.value;
            const Icon = category.icon;

            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setActiveCategory(category.value)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition ${
                  active
                    ? "border-[#FF4DB8]/50 bg-gradient-to-r from-[#EC4899]/20 to-[#BE185D]/20 text-[#FF8BCB] shadow-[0_0_18px_rgba(255,75,184,0.08)]"
                    : "border-white/[0.08] bg-[#0B153D]/70 text-[#A7B5D8] hover:border-[#FF4DB8]/40 hover:text-[#FF8BCB]"
                }`}
              >
                <Icon size={14} />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Posts loading */}
        {postsLoading && (
          <div className="flex justify-center py-16">
            <LoaderCircle size={28} className="animate-spin text-[#FF4DB8]" />
          </div>
        )}

        {/* Posts error */}
        {!postsLoading && postsError && (
          <div className="rounded-2xl border border-[#FF4DB8]/15 bg-[#0B153D] px-5 py-8 text-center">
            <p className="text-sm text-[#A7B5D8]">{postsError}</p>

            <button
              type="button"
              onClick={() => {
                const targetUserId = getUserId(profile);
                if (targetUserId) {
                  fetchPosts(targetUserId, 1, false);
                }
              }}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#FF4DB8] transition hover:text-[#FF8BCB]"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Posts grid */}
        {!postsLoading && !postsError && filteredPosts.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
              const media = getMedia(post);
              const category = post.category?.toLowerCase();

              const categoryLabel =
                categories.find((item) => item.value === category)?.label ||
                "Creation";

              return (
                <article
                  key={post._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePostSelect(post)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handlePostSelect(post);
                    }
                  }}
                  aria-label={`Open ${post.title || "creator post"}`}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B153D]/90 transition duration-300 hover:-translate-y-1 hover:border-[#FF4DB8]/30 hover:shadow-[0_12px_35px_rgba(0,0,0,0.25)] focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/60"
                >
                  {/* Image post */}
                  {media?.type === "image" && media.url && (
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#101D4A]">
                      <img
                        src={media.url}
                        alt={post.title || "Creator photograph"}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050A30]/50 to-transparent opacity-70" />
                    </div>
                  )}

                  {/* Audio post */}
                  {media?.type === "audio" && (
                    <div className="relative flex min-h-44 flex-col justify-center gap-4 overflow-hidden bg-gradient-to-br from-[#102B65] to-[#24154F] p-5">
                      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#FF4DB8]/15 blur-3xl" />

                      <div className="relative flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#FF4DB8]/30 bg-[#FF4DB8]/10 text-[#FF4DB8]">
                          <Music2 size={19} />
                        </div>

                        <p className="min-w-0 truncate font-serif text-xl text-[#F4F7FF]">
                          {post.title || "An audio creation"}
                        </p>
                      </div>

                      {media.url && <MiniAudioPlayer src={media.url} />}
                    </div>
                  )}

                  {/* Written post */}
                  {category === "words" && (
                    <div className="relative flex min-h-44 flex-col justify-center overflow-hidden bg-gradient-to-br from-[#101D4A] to-[#15133D] p-7">
                      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#FF4DB8]/10 blur-3xl" />

                      <p className="relative mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF75BD]">
                        <Feather size={12} />
                        शब्दमञ्च
                      </p>

                      <h3 className="relative font-serif text-2xl leading-snug text-[#F4F7FF]">
                        {post.title || "Untitled writing"}
                      </h3>

                      <p className="relative mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-7 text-[#A7B5D8]">
                        {post.content || post.description}
                      </p>
                    </div>
                  )}

                  {/* Post details */}
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-[#FF4DB8]/10 bg-[#FF4DB8]/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FF8BCB]">
                        {categoryLabel}
                      </span>

                      <span className="text-xs text-[#7182B1]">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    {category !== "words" && (
                      <h3 className="font-serif text-xl text-[#F4F7FF]">
                        {post.title || "Untitled creation"}
                      </h3>
                    )}

                    {post.description && category !== "words" && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#A7B5D8]">
                        {post.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-5 border-t border-white/[0.07] pt-4 text-xs text-[#8194C4]">
                      <span className="flex items-center gap-1.5">
                        <Heart size={13} className="text-[#FF4DB8]" />
                        {post.likesCount || 0} likes
                      </span>

                      <span className="flex items-center gap-1.5">
                        <MessageCircle size={13} className="text-[#FF4DB8]" />
                        {post.commentsCount || 0} comments
                      </span>

                      <span className="ml-auto text-[10px] text-[#FF8BCB] opacity-0 transition group-hover:opacity-100">
                        View post →
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!postsLoading && !postsError && filteredPosts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#FF4DB8]/20 bg-[#0B153D]/40 px-5 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FF4DB8]/20 bg-[#FF4DB8]/[0.07] text-[#FF4DB8]">
              <Camera size={25} />
            </div>

            <h3 className="font-serif text-2xl text-[#F4F7FF]">
              {activeCategory === "all"
                ? "Nothing here just yet."
                : "No creations in this Manch."}
            </h3>

            <p className="mt-2 text-sm text-[#8194C4]">
              {ownProfile
                ? "Your next creation could be the first."
                : "This creator hasn't shared anything here yet."}
            </p>

            {ownProfile && activeCategory === "all" && (
              <button
                type="button"
                onClick={() => navigate("/explore/drishya-manch")}
                className="mt-6 rounded-full bg-gradient-to-r from-[#FF4DB8] to-[#EC4899] px-6 py-3 text-sm font-semibold text-white transition hover:shadow-[0_0_25px_rgba(255,75,184,0.2)]"
              >
                Find your stage
              </button>
            )}
          </div>
        )}

        {/* Load more */}
        {!postsLoading && !postsError && hasMore && (
          <div className="flex justify-center pt-9">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-full border border-[#FF4DB8]/20 bg-[#0B153D] px-7 py-3 text-sm font-medium text-[#FFD6EC] transition hover:border-[#FF4DB8]/50 hover:bg-[#FF4DB8]/[0.06] hover:text-[#FF4DB8] disabled:cursor-wait disabled:opacity-50"
            >
              {loadingMore && (
                <LoaderCircle size={16} className="animate-spin" />
              )}

              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </section>

      {/* Existing Manch post detail components */}
      {selectedPost && selectedCategory === "voice" && (
        <SwarPostDetails
          post={selectedPost}
          onClose={handleClosePostDetails}
          onPostUpdated={handlePostUpdated}
          currentUserId={currentUserId}
        />
      )}

      {selectedPost && selectedCategory === "vision" && (
        <DrishyaPostDetails
          post={selectedPost}
          onClose={handleClosePostDetails}
          onPostUpdated={handlePostUpdated}
          currentUserId={currentUserId}
        />
      )}

      {selectedPost && selectedCategory === "words" && (
        <ShabdaPostDetails
          post={selectedPost}
          onClose={handleClosePostDetails}
          onPostUpdated={handlePostUpdated}
          currentUserId={currentUserId}
        />
      )}

      {/* Temporary preview for Rang posts until its detail component exists */}
      {selectedPost && selectedCategory === "art" && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-[#02051B]/90 p-4 backdrop-blur-md"
          onClick={handleClosePostDetails}
        >
          <div
            className="relative my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#FF4DB8]/20 bg-[#0B153D] shadow-[0_0_60px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClosePostDetails}
              aria-label="Close post"
              className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-[#050A30]/80 p-2 text-white transition hover:border-[#FF4DB8]/50 hover:text-[#FF4DB8]"
            >
              <X size={19} />
            </button>

            {getMedia(selectedPost)?.url && (
              <img
                src={getMedia(selectedPost).url}
                alt={selectedPost.title || "Artwork"}
                className="max-h-[65vh] w-full bg-[#050A30] object-contain"
              />
            )}

            <div className="p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF4DB8]">
                रङ्गमञ्च
              </p>

              <h2 className="mt-2 font-serif text-2xl text-[#F4F7FF]">
                {selectedPost.title || "Untitled artwork"}
              </h2>

              {selectedPost.description && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#A7B5D8]">
                  {selectedPost.description}
                </p>
              )}

              <p className="mt-4 text-xs text-[#7182B1]">
                {formatDate(selectedPost.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit profile modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#02051B]/85 p-4 backdrop-blur-md">
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[#FF4DB8]/20 bg-[#0B153D] shadow-[0_0_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5 sm:px-8">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF4DB8]">
                  <Sparkles size={12} />
                  Your identity
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#F4F7FF]">
                  Edit your profile
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEditProfile(false);
                  setError("");
                }}
                className="rounded-full border border-white/[0.08] p-2 text-[#A7B5D8] transition hover:border-[#FF4DB8]/40 hover:bg-[#FF4DB8]/10 hover:text-[#FF4DB8]"
                aria-label="Close edit profile"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleUpdateProfile}
              className="space-y-5 p-6 sm:p-8"
            >
              {/* Profile picture editor */}
              <div>
                <label className="mb-3 block text-sm font-medium text-[#DCEBFF]">
                  Profile picture
                </label>

                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#FF4DB8]/50 bg-[#07102F]">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#FF4DB8]">
                        <UserRound size={30} />
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="profile-image-upload"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#FF4DB8]/30 bg-[#FF4DB8]/10 px-4 py-2.5 text-xs font-semibold text-[#FF8BCB] transition hover:border-[#FF4DB8]/60 hover:bg-[#FF4DB8]/15"
                    >
                      <Upload size={14} />
                      Change picture
                    </label>

                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />

                    <p className="mt-2 text-xs text-[#7182B1]">
                      JPG, PNG or WEBP. Maximum 5 MB.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-username"
                  className="mb-2 block text-sm font-medium text-[#DCEBFF]"
                >
                  Username
                </label>

                <div className="flex items-center rounded-xl border border-white/[0.10] bg-[#07102F] px-4 transition focus-within:border-[#FF4DB8]/60 focus-within:shadow-[0_0_15px_rgba(255,75,184,0.07)]">
                  <span className="text-sm text-[#8194C4]">@</span>

                  <input
                    id="profile-username"
                    type="text"
                    value={editForm.username}
                    onChange={(event) =>
                      setEditForm((previous) => ({
                        ...previous,
                        username: event.target.value.toLowerCase(),
                      }))
                    }
                    minLength={3}
                    maxLength={20}
                    required
                    className="w-full bg-transparent py-3.5 pl-2 text-sm text-[#F4F7FF] outline-none placeholder:text-[#65759F]"
                    placeholder="your_username"
                  />
                </div>

                <p className="mt-2 text-xs text-[#7182B1]">
                  3–20 characters. Letters, numbers and underscores only.
                </p>
              </div>

              <div>
                <label
                  htmlFor="profile-bio"
                  className="mb-2 block text-sm font-medium text-[#DCEBFF]"
                >
                  Bio
                </label>

                <textarea
                  id="profile-bio"
                  value={editForm.bio}
                  onChange={(event) =>
                    setEditForm((previous) => ({
                      ...previous,
                      bio: event.target.value,
                    }))
                  }
                  maxLength={160}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/[0.10] bg-[#07102F] px-4 py-3.5 text-sm leading-6 text-[#F4F7FF] outline-none transition placeholder:text-[#65759F] focus:border-[#FF4DB8]/60"
                  placeholder="Tell the world a little about yourself..."
                />

                <p className="mt-2 text-right text-xs text-[#7182B1]">
                  {editForm.bio.length}/160
                </p>
              </div>

              {error && (
                <p className="rounded-xl border border-[#FF4DB8]/20 bg-[#FF4DB8]/[0.08] px-4 py-3 text-sm text-[#FF8BCB]">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-white/[0.07] pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProfile(false);
                    setError("");
                  }}
                  className="rounded-full border border-white/[0.10] bg-transparent px-5 py-3 text-sm font-medium text-[#A7B5D8] transition hover:border-white/20 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF4DB8] to-[#EC4899] px-6 py-3 text-sm font-semibold text-white transition hover:shadow-[0_0_25px_rgba(255,75,184,0.2)] disabled:cursor-wait disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}

                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create profile modal */}
      {showCreateProfile && (
        <CreateProfile
          onClose={() => setShowCreateProfile(false)}
          onSuccess={handleProfileCreated}
        />
      )}
    </main>
  );
};

export default Profile;
