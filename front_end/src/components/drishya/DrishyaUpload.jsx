import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  ImagePlus,
  X,
  Upload,
  LoaderCircle,
  Camera,
  Trash2,
  Sparkles,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const DrishyaUpload = ({ onClose, onCreated }) => {
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10 MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!image) {
      setError("Please select a photograph first.");
      return;
    }

    if (!title.trim()) {
      setError("Please give your photograph a title.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("category", "vision");
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("tags", tags);
      formData.append("media", image);

      const { data } = await axios.post(
        `${API_URL}/api/post/create`,
        formData,
        {
          withCredentials: true,
        },
      );

      setSuccess("Your photograph has been published!");

      if (onCreated) {
        onCreated(data.post || data);
      }

      setTitle("");
      setDescription("");
      setTags("");
      removeImage();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while publishing your photograph.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full rounded-xl border border-[#00D4FF]/15
    bg-[#071629]/80 px-4 py-3
    text-sm text-white outline-none
    transition-all duration-300
    placeholder:text-white/30
    hover:border-[#00D4FF]/30
    focus:border-[#00D4FF]/70
    focus:ring-2 focus:ring-[#00D4FF]/10
  `;

  const labelClass = "mb-2 block text-sm font-medium text-white/90";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030A17] px-4 py-8 text-white sm:px-6 sm:py-12">
      {/* BACKGROUND ATMOSPHERE */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-[#00D4FF]/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-[#8A2BE2]/10 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-3xl">
        {/* HEADER */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#00D4FF]">
              <Camera size={16} />
              <span>Drishya Manch</span>
              <Sparkles size={13} />
            </div>

            <h1 className="font-orbitron text-2xl font-bold uppercase leading-tight tracking-tight sm:text-4xl">
              Share your{" "}
              <span className="text-[#00D4FF] drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]">
                vision.
              </span>
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">
              Every photograph has a story. Capture your perspective and let the
              world experience it.
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close upload"
              className="
                shrink-0 rounded-full border border-white/10
                bg-white/5 p-2.5 text-white/70
                transition-all duration-300
                hover:border-[#00D4FF]/50
                hover:bg-[#00D4FF]/10 hover:text-[#00D4FF]
              "
            >
              <X size={19} />
            </button>
          )}
        </div>

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="
            space-y-6 rounded-2xl
            border border-[#00D4FF]/15
            bg-[#071629]/80 p-4
            shadow-[0_20px_80px_rgba(0,0,0,0.3)]
            backdrop-blur-xl
            sm:p-7
          "
        >
          {/* IMAGE UPLOAD */}
          <div>
            <label className={labelClass}>Your photograph</label>

            {preview ? (
              <div className="group relative overflow-hidden rounded-xl border border-[#00D4FF]/20 bg-[#030A17]">
                <img
                  src={preview}
                  alt="Selected photograph preview"
                  className="max-h-[550px] w-full object-contain"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#030A17]/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <button
                  type="button"
                  onClick={removeImage}
                  className="
                    absolute right-3 top-3
                    flex items-center gap-2 rounded-full
                    border border-white/10 bg-[#030A17]/90
                    px-3 py-2 text-xs font-medium text-white
                    transition hover:border-red-400/50
                    hover:bg-red-500/20 hover:text-red-400
                  "
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="
                  flex min-h-[260px] w-full flex-col
                  items-center justify-center rounded-xl
                  border-2 border-dashed border-[#00D4FF]/25
                  bg-[#030A17]/70 px-5 text-center
                  transition-all duration-300
                  hover:border-[#00D4FF]/70
                  hover:bg-[#00D4FF]/[0.04]
                  hover:shadow-[inset_0_0_30px_rgba(0,212,255,0.04)]
                "
              >
                <div
                  className="
                  mb-5 rounded-2xl border border-[#00D4FF]/20
                  bg-[#00D4FF]/10 p-5 text-[#00D4FF]
                  shadow-[0_0_25px_rgba(0,212,255,0.12)]
                "
                >
                  <ImagePlus size={30} />
                </div>

                <span className="text-sm font-semibold text-white">
                  Choose a photograph
                </span>

                <span className="mt-2 text-xs text-white/40">
                  Drag your creativity here or browse files
                </span>

                <span className="mt-4 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/40">
                  JPG · PNG · WEBP · MAX 10 MB
                </span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            {preview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-xs font-medium text-[#00D4FF] transition hover:text-white"
              >
                Change photograph →
              </button>
            )}
          </div>

          {/* TITLE */}
          <div>
            <label htmlFor="drishya-title" className={labelClass}>
              Photograph title
            </label>

            <input
              id="drishya-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your photograph a name..."
              maxLength={100}
              required
              className={inputClass}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label htmlFor="drishya-description" className={labelClass}>
              Your story
              <span className="ml-2 text-xs font-normal text-white/35">
                (Optional)
              </span>
            </label>

            <textarea
              id="drishya-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what was happening behind this photograph..."
              maxLength={2000}
              rows={5}
              className={`${inputClass} resize-y`}
            />

            <p className="mt-2 text-right text-xs text-white/30">
              {description.length}/2000
            </p>
          </div>

          {/* TAGS */}
          <div>
            <label htmlFor="drishya-tags" className={labelClass}>
              Categories / Tags
            </label>

            <input
              id="drishya-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="nature, travel, architecture..."
              className={inputClass}
            />

            <p className="mt-2 text-xs text-white/35">
              Separate tags with commas. Example: nature, wildlife, photography.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="rounded-xl border border-[#00D4FF]/20 bg-[#00D4FF]/10 px-4 py-3 text-sm text-[#8DEFFF]">
              {success}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="
              group flex w-full items-center justify-center gap-3
              rounded-xl border border-[#00D4FF]
              bg-[#00D4FF] px-6 py-4
              text-sm font-bold text-[#030A17]
              shadow-[0_0_25px_rgba(0,212,255,0.15)]
              transition-all duration-300
              hover:bg-[#5BE5F8]
              hover:shadow-[0_0_35px_rgba(0,212,255,0.3)]
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Upload size={18} />
                Publish photograph
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-white/30">
            By publishing, your photograph will be shared on Drishya Manch.
          </p>
        </form>
      </div>
    </div>
  );
};

export default DrishyaUpload;
