import React, { useEffect, useRef, useState } from "react";
import { Upload, Music2, X, LoaderCircle, FileAudio } from "lucide-react";

import SwarAudioPlayer from "./SwarAudioPlayer";

const ALLOWED_EXTENSIONS = ["mp3", "wav", "m4a"];
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const CATEGORIES = [
  { value: "vocals", label: "Vocals" },
  { value: "instrumentals", label: "Instrumentals" },
  { value: "original-music", label: "Original Music" },
  { value: "spoken-word", label: "Spoken Word" },
];

const SwarUpload = ({ onUpload, onCancel }) => {
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const submittingRef = useRef(false);

  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("vocals");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create and clean up audio preview.
  useEffect(() => {
    if (!audioFile) {
      setAudioPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(audioFile);

    previewUrlRef.current = previewUrl;
    setAudioPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);

      if (previewUrlRef.current === previewUrl) {
        previewUrlRef.current = null;
      }
    };
  }, [audioFile]);

  // Validate and select audio.
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setAudioFile(null);
      event.target.value = "";

      setError("Only MP3, WAV and M4A files are supported.");
      return;
    }

    const allowedMimeTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/wave",
      "audio/x-pn-wav",
      "audio/mp4",
      "audio/x-m4a",
      "application/octet-stream",
    ];

    if (file.type && !allowedMimeTypes.includes(file.type.toLowerCase())) {
      setAudioFile(null);
      event.target.value = "";

      setError("Please select a valid MP3, WAV or M4A audio file.");
      return;
    }

    if (file.size === 0) {
      setAudioFile(null);
      event.target.value = "";

      setError("The selected audio file is empty.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setAudioFile(null);
      event.target.value = "";

      setError("Your audio file must not exceed 25 MB.");
      return;
    }

    setAudioFile(file);
  };

  // Remove selected audio.
  const removeAudio = () => {
    if (loading) return;

    setAudioFile(null);
    setAudioPreview("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Reset form after successful upload.
  const resetForm = () => {
    setAudioFile(null);
    setAudioPreview("");
    setTitle("");
    setDescription("");
    setCategory("vocals");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit performance.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current) return;

    setError("");

    if (!audioFile) {
      setError("Please select an audio file.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title for your performance.");
      return;
    }

    if (title.trim().length > 100) {
      setError("Title cannot exceed 100 characters.");
      return;
    }

    if (description.trim().length > 500) {
      setError("Caption cannot exceed 500 characters.");
      return;
    }

    if (typeof onUpload !== "function") {
      setError("Upload handler is not connected.");
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      await onUpload({
        file: audioFile,
        title: title.trim(),
        description: description.trim(),
        category,
      });

      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to upload your performance. Please try again.",
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl rounded-2xl border border-[#EAE6E0] bg-white p-5 shadow-sm sm:p-7"
    >
      {/* Header */}
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#202020]">
            Share your performance
          </h2>

          <p className="mt-1 text-sm text-[#99918B]">
            Let your sound find its audience.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full p-2 text-[#88817B] transition hover:bg-[#F8F7F4] hover:text-[#E5092D] disabled:opacity-50"
            aria-label="Close upload"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Audio selection */}
      {!audioFile ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex min-h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E5092D]/25 bg-[#F8F7F4] px-5 text-center transition hover:border-[#E5092D] hover:bg-[#E5092D]/[0.03] disabled:opacity-50"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E5092D]/[0.08] text-[#E5092D]">
            <Upload size={25} strokeWidth={1.8} />
          </div>

          <span className="font-semibold text-[#202020]">
            Choose an audio file
          </span>

          <span className="mt-2 text-xs text-[#99918B]">
            MP3, WAV or M4A · Maximum 25 MB
          </span>
        </button>
      ) : (
        <div className="rounded-xl border border-[#EAE6E0] bg-[#F8F7F4] p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E5092D]/[0.08] text-[#E5092D]">
              <FileAudio size={23} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#202020]">
                {audioFile.name}
              </p>

              <p className="mt-1 text-xs text-[#99918B]">
                {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <button
              type="button"
              onClick={removeAudio}
              disabled={loading}
              className="rounded-full p-2 text-[#99918B] transition hover:bg-red-50 hover:text-[#E5092D] disabled:opacity-50"
              aria-label="Remove audio"
            >
              <X size={19} />
            </button>
          </div>

          {audioPreview && (
            <SwarAudioPlayer key={audioPreview} src={audioPreview} compact />
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4"
        onChange={handleFileChange}
        disabled={loading}
        className="hidden"
      />

      {/* Title */}
      <div className="mt-6">
        <label
          htmlFor="swar-title"
          className="mb-2 block text-sm font-medium text-[#202020]"
        >
          Performance title
        </label>

        <input
          id="swar-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Give your performance a name..."
          maxLength={100}
          required
          disabled={loading}
          className="w-full rounded-xl border border-[#EAE6E0] bg-white px-4 py-3 text-sm text-[#202020] outline-none transition placeholder:text-[#AAA39D] focus:border-[#E5092D] disabled:opacity-60"
        />
      </div>

      {/* Category */}
      <div className="mt-5">
        <label
          htmlFor="swar-category"
          className="mb-2 block text-sm font-medium text-[#202020]"
        >
          Category
        </label>

        <select
          id="swar-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          disabled={loading}
          className="w-full rounded-xl border border-[#EAE6E0] bg-white px-4 py-3 text-sm text-[#202020] outline-none transition focus:border-[#E5092D] disabled:opacity-60"
        >
          {CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="swar-description"
            className="text-sm font-medium text-[#202020]"
          >
            Caption
          </label>

          <span className="text-xs text-[#AAA39D]">
            {description.length}/500
          </span>
        </div>

        <textarea
          id="swar-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Tell us something about your performance..."
          maxLength={500}
          rows={4}
          disabled={loading}
          className="w-full resize-none rounded-xl border border-[#EAE6E0] bg-white px-4 py-3 text-sm text-[#202020] outline-none transition placeholder:text-[#AAA39D] focus:border-[#E5092D] disabled:opacity-60"
        />
      </div>

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !audioFile || !title.trim()}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E5092D] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#C90024] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <LoaderCircle size={18} className="animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Music2 size={18} />
            Share performance
          </>
        )}
      </button>
    </form>
  );
};

export default SwarUpload;
