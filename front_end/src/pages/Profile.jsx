import React, { useCallback, useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import CreateProfile from "../components/CreateProfile";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

const categories = [
  { value: "all", label: "All posts" },
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

const getAuthorName = (profile) => {
  return (
    profile?.user?.name || profile?.user?.fullName || profile?.name || "Creator"
  );
};

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

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const {
    user,
    profile: contextProfile,
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

  const currentUserId = user?._id || user?.id;
  const ownProfile = !userId || String(userId) === String(currentUserId);

  // Fetch profile.
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

  // Fetch posts belonging to the profile.
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

  // Initial profile and post loading.
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

  // Open profile editing.
  const handleEditClick = () => {
    setEditForm({
      username: profile?.username || "",
      bio: profile?.bio || "",
    });

    setShowEditProfile(true);
  };

  // Update profile.
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
      const response = await axios.put(
        `${API_URL}/api/profile/update`,
        {
          username,
          bio,
        },
        {
          withCredentials: true,
        },
      );

      const updatedProfile = response.data.profile;

      if (updatedProfile) {
        setProfile(updatedProfile);

        setEditForm({
          username: updatedProfile.username || "",
          bio: updatedProfile.bio || "",
        });
      } else {
        await fetchProfile();
      }

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

  // Load another page of posts.
  const handleLoadMore = async () => {
    if (loadingMore || postsLoading || !hasMore) return;

    const targetUserId = getUserId(profile);

    if (!targetUserId) return;

    await fetchPosts(targetUserId, page + 1, true);
  };

  // Filter posts by Manch.
  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return posts;

    return posts.filter(
      (post) => post.category?.toLowerCase() === activeCategory,
    );
  }, [posts, activeCategory]);

  const handleProfileCreated = async () => {
    setShowCreateProfile(false);

    try {
      await refreshProfile();
      await loadProfile();
    } catch (err) {
      console.error("Unable to refresh profile:", err);
    }
  };

  const profileName = getAuthorName(profile);
  const profileUsername = profile?.username || "creator";
  const profileImage = profile?.profileImage || "";
  const profileBio = profile?.bio || "A creator finding their own voice.";

  const totalPosts = profile ? (profile.postCount ?? posts.length) : 0;

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F7F4]">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle size={30} className="animate-spin text-[#E5092D]" />
          <p className="text-sm text-[#77716F]">Opening profile...</p>
        </div>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-5">
        <div className="max-w-md text-center">
          <p className="font-serif text-2xl text-[#191919]">
            Something went wrong.
          </p>

          <p className="mt-3 text-sm text-[#77716F]">{error}</p>

          <button
            type="button"
            onClick={loadProfile}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E5092D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C90024]"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-5">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#E5092D]">
            <Camera size={27} />
          </div>

          <h1 className="font-serif text-3xl text-[#191919]">
            {ownProfile
              ? "Your story starts here."
              : "This creator hasn't joined yet."}
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#77716F]">
            {ownProfile
              ? "Create your profile and give your work a place to belong."
              : "This profile may not exist or may no longer be available."}
          </p>

          {ownProfile && (
            <button
              type="button"
              onClick={() => setShowCreateProfile(true)}
              className="mt-6 rounded-full bg-[#E5092D] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#C90024]"
            >
              Create your profile
            </button>
          )}

          {!ownProfile && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#EAE6E0] bg-white px-6 py-3 text-sm font-medium text-[#514C48] transition hover:border-[#E5092D] hover:text-[#E5092D]"
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
    <main className="min-h-screen bg-[#F8F7F4]">
      {/* Back button */}
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full  bg-transparent px-4 py-2.5 text-sm font-medium text-[#514C48] transition hover:border-[#E5092D] hover:text-[#E5092D]"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Profile header */}
      {/* Profile header */}
      <section className="border-b border-[#EAE6E0]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="shrink-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={profileName}
                  className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-sm sm:h-36 sm:w-36"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-[#EDE9E2] font-serif text-4xl text-[#E5092D] shadow-sm sm:h-36 sm:w-36">
                  {profileName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile information */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E5092D]">
                    Creator profile
                  </p>

                  <h1 className="font-serif text-3xl text-[#191919] sm:text-4xl">
                    {profileName}
                  </h1>

                  <p className="mt-1 text-sm text-[#99918B]">
                    @{profileUsername}
                  </p>
                </div>

                {ownProfile && (
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="inline-flex items-center gap-2 rounded-full border border-[#EAE6E0] bg-white px-5 py-2.5 text-sm font-medium text-[#514C48] transition hover:border-[#E5092D] hover:text-[#E5092D]"
                  >
                    <Edit3 size={15} />
                    Edit profile
                  </button>
                )}
              </div>

              <p className="mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-[#77716F]">
                {profileBio}
              </p>

              {/* Profile statistics */}
              <div className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
                <div>
                  <p className="text-xl font-semibold text-[#191919]">
                    {totalPosts}
                  </p>
                  <p className="mt-1 text-xs text-[#99918B]">Posts</p>
                </div>

                {typeof profile.followersCount === "number" && (
                  <div>
                    <p className="text-xl font-semibold text-[#191919]">
                      {profile.followersCount}
                    </p>
                    <p className="mt-1 text-xs text-[#99918B]">Followers</p>
                  </div>
                )}

                {typeof profile.followingCount === "number" && (
                  <div>
                    <p className="text-xl font-semibold text-[#191919]">
                      {profile.followingCount}
                    </p>
                    <p className="mt-1 text-xs text-[#99918B]">Following</p>
                  </div>
                )}

                {profile.createdAt && (
                  <div>
                    <p className="text-sm font-medium text-[#514C48]">
                      {formatDate(profile.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-[#99918B]">Joined</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator posts */}
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E5092D]">
            The collection
          </p>

          <h2 className="mt-2 font-serif text-3xl text-[#191919]">
            {ownProfile ? "Your creations." : `${profileName}'s creations.`}
          </h2>

          <p className="mt-2 text-sm text-[#99918B]">
            Every post is another piece of the story.
          </p>
        </div>

        {/* Category filters */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const active = activeCategory === category.value;
            const Icon = category.icon;

            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setActiveCategory(category.value)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition ${
                  active
                    ? "border-[#E5092D] bg-[#E5092D] text-white"
                    : "border-[#EAE6E0] bg-white text-[#77716F] hover:border-[#E5092D] hover:text-[#E5092D]"
                }`}
              >
                {Icon && <Icon size={15} />}
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Posts loading */}
        {postsLoading && (
          <div className="flex justify-center py-16">
            <LoaderCircle size={28} className="animate-spin text-[#E5092D]" />
          </div>
        )}

        {/* Posts error */}
        {!postsLoading && postsError && (
          <div className="rounded-xl border border-[#EAE6E0] bg-white px-5 py-8 text-center">
            <p className="text-sm text-[#77716F]">{postsError}</p>

            <button
              type="button"
              onClick={() => {
                const targetUserId = getUserId(profile);
                if (targetUserId) {
                  fetchPosts(targetUserId, 1, false);
                }
              }}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#E5092D]"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Posts grid */}
        {!postsLoading && !postsError && filteredPosts.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
              const media = getMedia(post);
              const category = post.category?.toLowerCase();

              return (
                <article
                  key={post._id}
                  className="overflow-hidden rounded-2xl border border-[#EAE6E0] bg-white transition hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Image */}
                  {media?.type === "image" && media.url && (
                    <div className="aspect-[4/3] overflow-hidden bg-[#F0EDE7]">
                      <img
                        src={media.url}
                        alt={post.title || "Creator photograph"}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Audio */}
                  {media?.type === "audio" && (
                    <div className="flex min-h-44 flex-col justify-center gap-4 bg-[#F1EDE7] p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5092D] text-white">
                        <Music2 size={22} />
                      </div>

                      <p className="font-serif text-xl text-[#191919]">
                        {post.title || "An audio creation"}
                      </p>

                      {media.url && (
                        <audio
                          controls
                          preload="none"
                          src={media.url}
                          className="w-full"
                        />
                      )}
                    </div>
                  )}

                  {/* Written post */}
                  {category === "words" && (
                    <div className="flex min-h-44 flex-col justify-center bg-[#F4F0E9] p-7">
                      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E5092D]">
                        शब्दमञ्च
                      </p>

                      <h3 className="font-serif text-2xl leading-snug text-[#191919]">
                        {post.title || "Untitled writing"}
                      </h3>

                      <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-7 text-[#77716F]">
                        {post.content || post.description}
                      </p>
                    </div>
                  )}

                  {/* Post details */}
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[#F8F7F4] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#77716F]">
                        {categories.find((item) => item.value === category)
                          ?.label || "Creation"}
                      </span>

                      <span className="text-xs text-[#AAA39D]">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    {category !== "words" && (
                      <h3 className="font-serif text-xl text-[#191919]">
                        {post.title || "Untitled creation"}
                      </h3>
                    )}

                    {post.description && category !== "words" && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#77716F]">
                        {post.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-4 border-t border-[#F0EDE7] pt-4 text-xs text-[#99918B]">
                      <span>{post.likesCount || 0} likes</span>
                      <span>{post.commentsCount || 0} comments</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!postsLoading && !postsError && filteredPosts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#DDD7CF] px-5 py-16 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#E5092D]">
              <Camera size={23} />
            </div>

            <h3 className="font-serif text-2xl text-[#191919]">
              {activeCategory === "all"
                ? "Nothing here just yet."
                : "No creations in this Manch."}
            </h3>

            <p className="mt-2 text-sm text-[#99918B]">
              {ownProfile
                ? "Your next creation could be the first."
                : "This creator hasn't shared anything here yet."}
            </p>

            {ownProfile && activeCategory === "all" && (
              <button
                type="button"
                onClick={() => navigate("/explore/drishyamanch")}
                className="mt-6 rounded-full bg-[#E5092D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C90024]"
              >
                Find your stage
              </button>
            )}
          </div>
        )}

        {/* Load more */}
        {!postsLoading && !postsError && hasMore && (
          <div className="flex justify-center pt-10">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-full border border-[#EAE6E0] bg-white px-7 py-3 text-sm font-medium text-[#514C48] transition hover:border-[#E5092D] hover:text-[#E5092D] disabled:opacity-50"
            >
              {loadingMore && (
                <LoaderCircle size={16} className="animate-spin" />
              )}

              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </section>

      {/* Edit profile modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-[#F8F7F4] p-6 shadow-2xl sm:p-8">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E5092D]">
                  Your identity
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#191919]">
                  Edit your profile
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEditProfile(false);
                  setError("");
                }}
                className="rounded-full p-2 text-[#77716F] transition hover:bg-white hover:text-[#E5092D]"
                aria-label="Close edit profile"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label
                  htmlFor="profile-username"
                  className="mb-2 block text-sm font-medium text-[#514C48]"
                >
                  Username
                </label>

                <div className="flex items-center rounded-xl border border-[#EAE6E0] bg-white px-4 focus-within:border-[#E5092D]">
                  <span className="text-sm text-[#99918B]">@</span>

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
                    className="w-full bg-transparent py-3.5 pl-2 text-sm text-[#191919] outline-none"
                    placeholder="your_username"
                  />
                </div>

                <p className="mt-2 text-xs text-[#99918B]">
                  3–20 characters. Letters, numbers and underscores only.
                </p>
              </div>

              <div>
                <label
                  htmlFor="profile-bio"
                  className="mb-2 block text-sm font-medium text-[#514C48]"
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
                  className="w-full resize-none rounded-xl border border-[#EAE6E0] bg-white px-4 py-3.5 text-sm text-[#191919] outline-none transition placeholder:text-[#AAA39D] focus:border-[#E5092D]"
                  placeholder="Tell the world a little about yourself..."
                />

                <p className="mt-2 text-right text-xs text-[#99918B]">
                  {editForm.bio.length}/160
                </p>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProfile(false);
                    setError("");
                  }}
                  className="rounded-full border border-[#EAE6E0] bg-white px-5 py-3 text-sm font-medium text-[#514C48] transition hover:border-[#99918B]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E5092D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C90024] disabled:cursor-wait disabled:opacity-60"
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
