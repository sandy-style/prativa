import React, { useEffect, useRef, useState } from "react";
import {
  Upload,
  Music2,
  X,
  LoaderCircle,
  FileAudio,
  AudioLines,
  Sparkles,
} from "lucide-react";

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

  const inputClasses =
    "w-full rounded-xl border border-white/10 bg-[#08081D] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#8B5CF6]/70 focus:ring-2 focus:ring-[#8B5CF6]/10 disabled:opacity-50";

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#8B5CF6]/20 bg-[#08081D] shadow-[0_20px_80px_rgba(0,0,0,0.4)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#A78BFA]">
            <AudioLines size={23} />
          </div>

          <div>
            <p className="font-orbitron text-base font-bold tracking-wide text-white sm:text-lg">
              SHARE YOUR SOUND
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Let your sound find its audience.
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
            aria-label="Close upload"
          >
            <X size={19} />
          </button>
        )}
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        {/* Audio selection */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-200">
              Your audio
            </label>
            <span className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
              Required
            </span>
          </div>

          {!audioFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="group flex min-h-48 w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#8B5CF6]/35 bg-[#8B5CF6]/[0.04] px-5 text-center transition duration-300 hover:border-[#A78BFA] hover:bg-[#8B5CF6]/[0.09] disabled:opacity-50"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#A78BFA] transition duration-300 group-hover:scale-105 group-hover:bg-[#8B5CF6]/20">
                <Upload size={25} strokeWidth={1.8} />
              </div>

              <span className="text-sm font-semibold text-white">
                Drop your sound into the universe
              </span>

              <span className="mt-2 text-xs text-gray-500">
                Click to browse your files
              </span>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["MP3", "WAV", "M4A"].map((format) => (
                  <span
                    key={format}
                    className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium tracking-wider text-gray-400"
                  >
                    {format}
                  </span>
                ))}
                <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-gray-500">
                  MAX 25 MB
                </span>
              </div>
            </button>
          ) : (
            <div className="rounded-xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/[0.06] p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#A78BFA]">
                  <FileAudio size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {audioFile.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    <span className="mx-2 text-gray-700">•</span>
                    <span className="text-[#A78BFA]">Ready to upload</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeAudio}
                  disabled={loading}
                  className="rounded-full p-2 text-gray-500 transition hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
                  aria-label="Remove audio"
                >
                  <X size={19} />
                </button>
              </div>

              {audioPreview && (
                <SwarAudioPlayer
                  key={audioPreview}
                  src={audioPreview}
                  compact
                />
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
        </div>

        {/* Title */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="swar-title"
              className="text-sm font-semibold text-gray-200"
            >
              Performance title
            </label>
            <span className="text-[10px] text-gray-600">
              {title.length}/100
            </span>
          </div>

          <input
            id="swar-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give your performance a name..."
            maxLength={100}
            required
            disabled={loading}
            className={inputClasses}
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="swar-category"
            className="mb-2 block text-sm font-semibold text-gray-200"
          >
            Performance category
          </label>

          <select
            id="swar-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={loading}
            className={`${inputClasses} appearance-none cursor-pointer`}
          >
            {CATEGORIES.map((item) => (
              <option
                key={item.value}
                value={item.value}
                className="bg-[#08081D] text-white"
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="swar-description"
              className="text-sm font-semibold text-gray-200"
            >
              Caption
              <span className="ml-2 font-normal text-gray-500">(Optional)</span>
            </label>

            <span className="text-[10px] text-gray-600">
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
            className={`${inputClasses} resize-none`}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="border-t border-white/[0.07] pt-5">
          <button
            type="submit"
            disabled={loading || !audioFile || !title.trim()}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-5 py-3.5 text-sm font-bold text-white shadow-[0_5px_25px_rgba(139,92,246,0.18)] transition duration-300 hover:shadow-[0_5px_30px_rgba(139,92,246,0.35)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Uploading your performance...
              </>
            ) : (
              <>
                <Music2 size={18} />
                Share performance
                <Sparkles
                  size={15}
                  className="transition-transform group-hover:rotate-12"
                />
              </>
            )}
          </button>

          <p className="mt-3 text-center text-[10px] tracking-wide text-gray-600">
            YOUR VOICE. YOUR MUSIC. YOUR MOMENT.
          </p>
        </div>
      </div>
    </form>
  );
};

export default SwarUpload;
