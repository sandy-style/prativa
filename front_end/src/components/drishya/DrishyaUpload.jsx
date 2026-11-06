import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  ImagePlus,
  X,
  Upload,
  LoaderCircle,
  Camera,
  Trash2,
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

      // Backend upload middleware expects the field name "media".
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

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] px-4 py-8 text-[#202020] sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E5092D]">
              <Camera size={15} />
              Drishya Manch
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl">
              Share your vision.
            </h1>

            <p className="mt-2 text-sm text-[#77716F]">
              Every photograph has a story. Let yours be seen.
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#E8E3DD] p-2 transition hover:bg-[#EEEAE4]"
              aria-label="Close upload"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image upload */}
          <div>
            <label className="mb-3 block text-sm font-semibold">
              Your photograph
            </label>

            {preview ? (
              <div className="relative overflow-hidden rounded-2xl border border-[#E8E3DD] bg-white">
                <img
                  src={preview}
                  alt="Selected photograph preview"
                  className="max-h-[550px] w-full object-contain"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs text-white transition hover:bg-[#E5092D]"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8D1C8] bg-white px-5 text-center transition hover:border-[#E5092D] hover:bg-[#FDFCFB]"
              >
                <div className="mb-4 rounded-full bg-[#FCE9EC] p-4 text-[#E5092D]">
                  <ImagePlus size={28} />
                </div>

                <span className="font-medium">Choose a photograph</span>

                <span className="mt-2 text-xs text-[#8A8580]">
                  JPG, PNG, WEBP · Maximum 10 MB
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
                className="mt-3 text-sm font-medium text-[#E5092D] hover:underline"
              >
                Choose a different photograph
              </button>
            )}
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="drishya-title"
              className="mb-2 block text-sm font-semibold"
            >
              Title
            </label>

            <input
              id="drishya-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your photograph a name..."
              maxLength={100}
              required
              className="w-full rounded-xl border border-[#E5E0D9] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#AAA39B] focus:border-[#E5092D]"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="drishya-description"
              className="mb-2 block text-sm font-semibold"
            >
              Your story
              <span className="ml-2 font-normal text-[#99918A]">
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
              className="w-full resize-y rounded-xl border border-[#E5E0D9] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#AAA39B] focus:border-[#E5092D]"
            />

            <p className="mt-1 text-right text-xs text-[#99918A]">
              {description.length}/2000
            </p>
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="drishya-tags"
              className="mb-2 block text-sm font-semibold"
            >
              Categories / Tags
            </label>

            <input
              id="drishya-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="nature, travel, architecture..."
              className="w-full rounded-xl border border-[#E5E0D9] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#AAA39B] focus:border-[#E5092D]"
            />

            <p className="mt-2 text-xs text-[#99918A]">
              Separate tags with commas. For example: nature, wildlife,
              photography.
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#E5092D] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#C90024] disabled:cursor-not-allowed disabled:opacity-60"
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

          <p className="text-center text-xs text-[#99918A]">
            By publishing, your photograph will be shared on Drishya Manch.
          </p>
        </form>
      </div>
    </div>
  );
};

export default DrishyaUpload;
