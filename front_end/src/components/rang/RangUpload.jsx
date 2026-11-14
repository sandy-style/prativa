import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ImagePlus, X, Upload, LoaderCircle, Palette, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const RangUpload = ({ onClose, onCreated }) => {
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("Artwork image size cannot exceed 15 MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError("Please select an artwork to upload.");
      return;
    }

    if (!title.trim()) {
      setError("Please give your artwork a title.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("category", "art");
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("tags", tags);
      formData.append("media", image);

      const response = await axios.post(`${API_URL}/api/post/create`, formData, {
        withCredentials: true,
      });

      if (response.data.success) {
        if (onCreated) onCreated(response.data.post);
        onClose();
      }
    } catch (err) {
      console.error("Upload art error:", err);
      setError(err.response?.data?.message || "Failed to publish artwork. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto my-8 w-full max-w-xl rounded-2xl border border-[#8A2BE2]/30 bg-[#070F2B] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
      >
        <X size={18} />
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#8A2BE2] to-[#FF4DB8] text-white shadow-[0_0_15px_rgba(138,43,226,0.4)]">
          <Palette size={20} />
        </div>
        <div>
          <h2 className="font-['Orbitron'] text-lg font-bold text-white">Share Your Artwork</h2>
          <p className="text-xs text-slate-400">Publish your paintings, illustrations, digital art & sketches on Rang Manch</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropzone */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-300">Artwork Image *</label>
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <img src={preview} alt="Artwork preview" className="max-h-80 w-full object-contain" />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setPreview("");
                }}
                className="absolute right-3 top-3 rounded-full bg-red-600/80 p-2 text-white backdrop-blur transition hover:bg-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#8A2BE2]/40 bg-[#0B1437]/50 p-8 text-center transition hover:border-[#FF4DB8]/60 hover:bg-[#8A2BE2]/5"
            >
              <ImagePlus size={36} className="mb-2 text-[#8A2BE2]" />
              <p className="text-sm font-medium text-white">Click or drag image here</p>
              <p className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP up to 15 MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Title */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-300">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Celestial Symphony in Oils"
            maxLength={100}
            required
            className="w-full rounded-xl border border-white/10 bg-[#081326] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#8A2BE2]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share the medium, inspiration, technique, or story behind this piece..."
            rows={3}
            maxLength={2000}
            className="w-full rounded-xl border border-white/10 bg-[#081326] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#8A2BE2]"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-300">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="digital, painting, oil, surreal, portrait"
            className="w-full rounded-xl border border-white/10 bg-[#081326] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-[#8A2BE2]"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8A2BE2] to-[#FF4DB8] px-6 py-2.5 font-['Orbitron'] text-xs font-bold text-white shadow-[0_0_20px_rgba(138,43,226,0.3)] transition hover:scale-105 disabled:opacity-50"
          >
            {loading ? <LoaderCircle size={15} className="animate-spin" /> : <Upload size={15} />}
            <span>{loading ? "Publishing..." : "Publish Artwork"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RangUpload;
