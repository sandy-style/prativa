import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  X,
  Camera,
  ImagePlus,
  UserRound,
  AtSign,
  FileText,
  LoaderCircle,
  Trash2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const CreateProfile = ({ onClose, onSuccess }) => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Escape key closes the modal.
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
        onCloseRef.current?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [loading]);

  // Clean up preview URL.
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleClose = () => {
    if (!loading) {
      onCloseRef.current?.();
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a JPG, PNG or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Profile picture must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedBio = bio.trim();

    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      setError(
        "Username must be 3–20 characters and contain only letters, numbers and underscores.",
      );
      return;
    }

    if (normalizedBio.length > 160) {
      setError("Bio cannot exceed 160 characters.");
      return;
    }

    if (!API_URL) {
      setError("Server configuration is missing.");
      return;
    }

    const formData = new FormData();
    formData.append("username", normalizedUsername);
    formData.append("bio", normalizedBio);

    if (image) {
      formData.append("profileImage", image);
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/api/profile/create`,
        formData,
        { withCredentials: true },
      );

      if (!response.data?.success || !response.data?.profile) {
        throw new Error(
          response.data?.message || "Unable to create your profile.",
        );
      }

      await onSuccess?.(response.data.profile);
    } catch (err) {
      console.error("Create profile error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-profile-title"
        onClick={(event) => event.stopPropagation()}
        className="relative my-auto w-full max-w-[490px] overflow-hidden rounded-2xl border border-black/5 bg-[#F8F7F4] shadow-2xl"
      >
        <div className="h-1.5 w-full bg-[#E5092D]" />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          aria-label="Close profile creation"
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#77716F] transition-colors hover:bg-black/5 hover:text-[#191919] disabled:opacity-40"
        >
          <X size={20} />
        </button>

        <div className="px-6 pb-7 pt-8 sm:px-9 sm:pb-9">
          <div className="mb-7">
            <span className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[2px] text-[#E5092D]">
              <span className="h-[1px] w-6 bg-[#E5092D]" />
              Your journey begins here
            </span>

            <h2
              id="create-profile-title"
              className="font-serif text-3xl font-semibold tracking-tight text-[#191919] sm:text-4xl"
            >
              Create your profile<span className="text-[#E5092D]">.</span>
            </h2>

            <p className="mt-3 max-w-[360px] text-sm leading-6 text-[#77716F]">
              Give your creativity a name. Let people discover the person behind
              the talent.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile picture */}
            <div className="flex items-center gap-5">
              <div className="relative h-[88px] w-[88px] shrink-0">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-black/10 bg-[#EEECE6]">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={34} className="text-[#A39D94]" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  aria-label="Choose profile picture"
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#F8F7F4] bg-[#E5092D] text-white shadow-sm"
                >
                  <Camera size={15} />
                </button>
              </div>

              <div className="min-w-0">
                <p className="font-serif text-base font-semibold text-[#191919]">
                  Profile picture
                </p>

                <p className="mt-1 text-xs leading-5 text-[#77716F]">
                  JPG, PNG or WEBP, maximum 5MB.
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5092D]"
                  >
                    <ImagePlus size={14} />
                    {image ? "Change photo" : "Upload photo"}
                  </button>

                  {image && (
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={loading}
                      className="inline-flex items-center gap-1 text-xs text-[#77716F] hover:text-red-600"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={loading}
                className="hidden"
              />
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="profile-username"
                className="mb-2 block text-xs font-semibold uppercase tracking-[1px] text-[#514C48]"
              >
                Username
              </label>

              <div className="flex items-center rounded-xl border border-[#DEDAD3] bg-white focus-within:border-[#E5092D] focus-within:ring-2 focus-within:ring-[#E5092D]/10">
                <span className="pl-4 text-[#A39D94]">
                  <AtSign size={18} />
                </span>

                <input
                  id="profile-username"
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(
                      event.target.value.toLowerCase().replace(/\s/g, ""),
                    );
                    setError("");
                  }}
                  placeholder="your_username"
                  maxLength={20}
                  autoComplete="username"
                  required
                  disabled={loading}
                  className="w-full rounded-xl bg-transparent px-3 py-3.5 text-sm text-[#191919] outline-none placeholder:text-[#B4AEA5]"
                />
              </div>

              <p className="mt-2 text-[11px] text-[#969087]">
                3–20 characters. Letters, numbers and underscores only.
              </p>
            </div>

            {/* Bio */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="profile-bio"
                  className="text-xs font-semibold uppercase tracking-[1px] text-[#514C48]"
                >
                  About you
                </label>

                <span className="text-[11px] tabular-nums text-[#969087]">
                  {bio.length}/160
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-4 text-[#A39D94]">
                  <FileText size={17} />
                </span>

                <textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(event) => {
                    setBio(event.target.value);
                    setError("");
                  }}
                  placeholder="Tell the world a little about yourself..."
                  maxLength={160}
                  rows={3}
                  disabled={loading}
                  className="w-full resize-none rounded-xl border border-[#DEDAD3] bg-white py-3.5 pl-11 pr-4 text-sm leading-6 text-[#191919] outline-none placeholder:text-[#B4AEA5] focus:border-[#E5092D] focus:ring-2 focus:ring-[#E5092D]/10"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E5092D] px-5 py-4 font-serif text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#C90024] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Creating your profile...
                </>
              ) : (
                "Create My Profile"
              )}
            </button>

            <p className="text-center text-[11px] leading-5 text-[#969087]">
              Your creative journey on PRATIVA starts with a profile.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
