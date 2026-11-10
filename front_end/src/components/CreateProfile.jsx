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
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
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
  const previewRef = useRef("");

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

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

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

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

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const previewUrl = URL.createObjectURL(file);

    previewRef.current = previewUrl;
    setImage(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = "";
    }

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
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#02051B]/85 px-4 py-6 backdrop-blur-md sm:py-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Ambient pink glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF4DB8]/[0.07] blur-[130px]"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-profile-title"
        onClick={(event) => event.stopPropagation()}
        className="relative my-auto w-full max-w-[480px] overflow-hidden rounded-2xl border border-[#FF4DB8]/20 bg-[#0B153D] shadow-[0_20px_90px_rgba(0,0,0,0.6)]"
      >
        {/* Pink accent line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#FF4DB8] via-[#F472B6] to-[#FB7185]" />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          aria-label="Close profile creation"
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[#A7B5D8] transition-all duration-200 hover:border-[#FF4DB8]/40 hover:bg-[#FF4DB8]/10 hover:text-[#FF4DB8] disabled:opacity-40"
        >
          <X size={18} />
        </button>

        <div className="px-6 pb-7 pt-8 sm:px-8 sm:pb-8">
          {/* Heading */}
          <div className="mb-7">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FF4DB8]/20 bg-[#FF4DB8]/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[1.8px] text-[#FF75C8]">
              <Sparkles size={12} />
              Your journey begins here
            </span>

            <h2
              id="create-profile-title"
              className="font-serif text-3xl font-semibold tracking-tight text-[#F4F7FF] sm:text-[34px]"
            >
              Create your profile
              <span className="text-[#FF4DB8]">.</span>
            </h2>

            <p className="mt-2.5 max-w-[350px] text-sm leading-6 text-[#A7B5D8]">
              Give your creativity a name. Let people discover the person behind
              the talent.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile picture */}
            <div className="flex items-center gap-5">
              <div className="relative h-[88px] w-[88px] shrink-0">
                <div className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-[#FF4DB8] via-[#F472B6] to-[#FB7185] opacity-80 blur-[5px]" />

                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-[#0B153D] bg-gradient-to-br from-[#251638] to-[#35152E]">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={34} className="text-[#FF8BCB]" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  aria-label="Choose profile picture"
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0B153D] bg-[#FF4DB8] text-white shadow-[0_3px_15px_rgba(255,77,184,0.35)] transition-all duration-200 hover:scale-110 hover:bg-[#F472B6] disabled:opacity-40"
                >
                  <Camera size={15} />
                </button>
              </div>

              <div className="min-w-0">
                <p className="font-serif text-base font-semibold text-[#F4F7FF]">
                  Profile picture
                </p>

                <p className="mt-1 text-xs leading-5 text-[#8194C4]">
                  JPG, PNG or WEBP, maximum 5MB.
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF75C8] transition hover:text-[#FFB0DE] disabled:opacity-40"
                  >
                    <ImagePlus size={14} />
                    {image ? "Change photo" : "Upload photo"}
                  </button>

                  {image && (
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={loading}
                      className="inline-flex items-center gap-1 text-xs text-[#8194C4] transition hover:text-[#FF75C8] disabled:opacity-40"
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
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#C9D8F7]"
              >
                Username
              </label>

              <div className="flex items-center rounded-xl border border-white/[0.10] bg-[#07102F] transition-all duration-200 focus-within:border-[#FF4DB8]/60 focus-within:ring-2 focus-within:ring-[#FF4DB8]/10">
                <span className="pl-4 text-[#FF75C8]">
                  <AtSign size={17} />
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
                  className="w-full rounded-xl bg-transparent px-3 py-3.5 text-sm text-[#F4F7FF] outline-none placeholder:text-[#65759F]"
                />
              </div>

              <p className="mt-2 text-[11px] text-[#7182B1]">
                3–20 characters. Letters, numbers and underscores only.
              </p>
            </div>

            {/* Bio */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="profile-bio"
                  className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#C9D8F7]"
                >
                  About you
                </label>

                <span
                  className={`text-[11px] tabular-nums ${
                    bio.length >= 150 ? "text-[#FF75C8]" : "text-[#7182B1]"
                  }`}
                >
                  {bio.length}/160
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-4 text-[#FF75C8]">
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
                  className="w-full resize-none rounded-xl border border-white/[0.10] bg-[#07102F] py-3.5 pl-11 pr-4 text-sm leading-6 text-[#F4F7FF] outline-none transition placeholder:text-[#65759F] focus:border-[#FF4DB8]/60 focus:ring-2 focus:ring-[#FF4DB8]/10"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-[#FF4DB8]/25 bg-[#FF4DB8]/[0.08] px-4 py-3 text-sm leading-5 text-[#FF8BCB]"
              >
                <X size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#FF4DB8] px-5 py-4 font-serif text-base font-semibold text-white shadow-[0_5px_25px_rgba(255,77,184,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F472B6] hover:shadow-[0_8px_30px_rgba(255,77,184,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Creating your profile...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Create My Profile
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-center text-[11px] leading-5 text-[#7182B1]">
              <CheckCircle2 size={12} className="text-[#FF75C8]" />
              Your creative journey on PRATIVA starts with a profile.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
