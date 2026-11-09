import React, { useState } from "react";
import axios from "axios";
import {
  X,
  Feather,
  BookOpen,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Tag,
  Eye,
  PenLine,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const FONT_STYLES = [
  {
    value: "serif",
    label: "Serif",
    description: "Classic and literary",
    fontFamily: '"Cormorant Garamond", Georgia, serif',
  },
  {
    value: "sans",
    label: "Sans",
    description: "Clean and modern",
    fontFamily: '"Plus Jakarta Sans", Arial, sans-serif',
  },
  {
    value: "devanagari",
    label: "Devanagari",
    description: "For Nepali writing",
    fontFamily: '"Noto Serif Devanagari", serif',
  },
  {
    value: "handwritten",
    label: "Handwritten",
    description: "Personal and expressive",
    fontFamily: '"Segoe Print", "Comic Sans MS", cursive',
  },
];

const ALIGNMENTS = [
  { value: "left", label: "Left", Icon: AlignLeft },
  { value: "center", label: "Center", Icon: AlignCenter },
  { value: "right", label: "Right", Icon: AlignRight },
];

const MAX_CONTENT_LENGTH = 10000;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;

const ShabdaUpload = ({ onClose, onPostCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const [fontStyle, setFontStyle] = useState("serif");
  const [textAlign, setTextAlign] = useState("left");

  const [showPreview, setShowPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedFont =
    FONT_STYLES.find((font) => font.value === fontStyle) || FONT_STYLES[0];

  const parsedTags = [
    ...new Set(
      tagsInput
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .map((tag) => tag.slice(0, 30)),
    ),
  ].slice(0, 10);

  const canPublish =
    content.trim().length > 0 &&
    content.length <= MAX_CONTENT_LENGTH &&
    title.length <= MAX_TITLE_LENGTH &&
    description.length <= MAX_DESCRIPTION_LENGTH &&
    !publishing;

  const handlePublish = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!content.trim()) {
      setError("Please write something before publishing.");
      return;
    }

    if (title.length > MAX_TITLE_LENGTH) {
      setError("Title cannot exceed 100 characters.");
      return;
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setError("Description cannot exceed 2000 characters.");
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      setError("Your writing cannot exceed 10000 characters.");
      return;
    }

    const payload = {
      category: "words",
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      fontStyle,
      textAlign,
      tags: parsedTags,
    };

    setPublishing(true);

    try {
      const response = await axios.post(`${API_URL}/api/post/create`, payload, {
        withCredentials: true,
      });

      const createdPost =
        response?.data?.post ||
        response?.data?.data?.post ||
        response?.data?.data;

      if (!response?.data?.success || !createdPost?._id) {
        throw new Error(
          response?.data?.message || "Your writing could not be published.",
        );
      }

      setSuccess("Your words have found their place.");
      onPostCreated?.(createdPost);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while publishing. Please try again.",
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleClose = () => {
    if (publishing) return;
    onClose?.();
  };

  // ==========================================
  // REUSABLE PREVIEW CONTENT
  // ==========================================

  const renderPreview = (mobile = false) => (
    <article
      className={`relative overflow-hidden rounded-xl border border-[#F97316]/15 bg-[#1D140D] ${
        mobile ? "p-6 sm:p-8" : "p-6"
      }`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#F97316]/[0.06] blur-[75px]" />

      <div className="relative">
        <div className="mb-7 flex items-center gap-2 text-[#FB923C]">
          <Feather size={13} />
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
            Shabda Manch
          </span>
        </div>

        <h3
          className={`mb-6 break-words font-semibold leading-tight text-[#FFF3E8] ${
            mobile ? "text-3xl" : "text-2xl"
          }`}
        >
          {title || "Your title will appear here"}
        </h3>

        <div
          className={`whitespace-pre-wrap break-words text-[#E0CDBB] ${
            mobile
              ? "min-h-40 text-[17px] leading-[2.1]"
              : "min-h-32 text-[15px] leading-[2]"
          }`}
          style={{
            fontFamily: selectedFont.fontFamily,
            textAlign,
            overflowWrap: "anywhere",
          }}
        >
          {content || "Your words will appear here as you write..."}
        </div>

        {description && (
          <p className="mt-8 border-l-2 border-[#F97316]/60 pl-3 text-sm leading-7 text-[#B9A18D]">
            {description}
          </p>
        )}

        {parsedTags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {parsedTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#F97316]/15 bg-[#F97316]/[0.08] px-3 py-1 text-[10px] text-[#FDBA74]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#080503]/85 p-0 backdrop-blur-md sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden border border-[#F97316]/20 bg-[#17100B] shadow-[0_25px_90px_rgba(0,0,0,0.65),0_0_35px_rgba(249,115,22,0.07)] sm:h-[min(92vh,900px)] sm:rounded-2xl">
        {/* HEADER */}
        <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-[#F97316]/15 bg-[#1D140D] px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F97316]/25 bg-[#2A1B11] text-[#FB923C]">
              <Feather size={19} />
            </div>

            <div>
              <p className="font-[Orbitron] text-[11px] font-bold uppercase tracking-[0.2em] text-[#FB923C]">
                PRATIVA
              </p>

              <h2 className="text-sm font-semibold text-[#FFF3E8]">
                Create on Shabda Manch
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={publishing}
            aria-label="Close upload"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#A9917C] transition hover:bg-[#F97316]/10 hover:text-[#FB923C] disabled:opacity-40"
          >
            <X size={19} />
          </button>
        </header>

        {/* MAIN */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* EDITOR */}
          <form
            onSubmit={handlePublish}
            className="min-h-0 overflow-y-auto bg-[#17100B] px-5 py-7 sm:px-9 sm:py-9"
          >
            <div className="mx-auto max-w-2xl">
              {/* INTRODUCTION */}
              <div className="mb-8">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A9917C]">
                  <Sparkles size={13} className="text-[#FB923C]" />
                  Your space of expression
                </div>

                <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#FFF3E8] sm:text-4xl">
                  Give your thoughts
                  <br />
                  <span className="font-serif font-normal italic text-[#FB923C]">
                    a place to live.
                  </span>
                </h1>

                <p className="mt-3 max-w-md text-sm leading-7 text-[#B9A18D]">
                  A poem, a story, a passing thought, or something you have been
                  meaning to say. Put it into words.
                </p>
              </div>

              {/* TITLE */}
              <div className="mb-6">
                <label
                  htmlFor="shabda-title"
                  className="mb-2 block text-xs font-semibold text-[#EBD5C2]"
                >
                  Title
                  <span className="ml-2 font-normal text-[#8F7A68]">
                    Optional
                  </span>
                </label>

                <input
                  id="shabda-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value.slice(0, MAX_TITLE_LENGTH))
                  }
                  placeholder="Give your writing a title..."
                  maxLength={MAX_TITLE_LENGTH}
                  className="w-full rounded-xl border border-[#F97316]/15 bg-[#24180F] px-4 py-3.5 text-sm text-[#FFF3E8] outline-none transition placeholder:text-[#8F7A68] focus:border-[#FB923C]/60 focus:ring-2 focus:ring-[#F97316]/10"
                />

                <p className="mt-1.5 text-right text-[10px] text-[#8F7A68]">
                  {title.length}/{MAX_TITLE_LENGTH}
                </p>
              </div>

              {/* CONTENT */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="shabda-content"
                    className="text-xs font-semibold text-[#EBD5C2]"
                  >
                    Your writing
                  </label>

                  <span className="text-[10px] text-[#8F7A68]">
                    {content.length.toLocaleString()}/10,000
                  </span>
                </div>

                <textarea
                  id="shabda-content"
                  value={content}
                  onChange={(event) =>
                    setContent(event.target.value.slice(0, MAX_CONTENT_LENGTH))
                  }
                  placeholder={
                    "Begin wherever your thoughts take you...\n\nLet the words flow."
                  }
                  maxLength={MAX_CONTENT_LENGTH}
                  rows={12}
                  required
                  className="min-h-[280px] w-full resize-y rounded-xl border border-[#F97316]/15 bg-[#24180F] px-5 py-5 text-[15px] leading-[2] text-[#E0CDBB] outline-none transition placeholder:text-[#8F7A68] focus:border-[#FB923C]/60 focus:ring-2 focus:ring-[#F97316]/10"
                  style={{
                    fontFamily: selectedFont.fontFamily,
                    textAlign,
                  }}
                />

                <p className="mt-2 text-[10px] leading-5 text-[#8F7A68]">
                  Your line breaks and paragraph spacing will be preserved.
                </p>
              </div>

              {/* DESCRIPTION */}
              <div className="mb-7">
                <label
                  htmlFor="shabda-description"
                  className="mb-2 block text-xs font-semibold text-[#EBD5C2]"
                >
                  A little context
                  <span className="ml-2 font-normal text-[#8F7A68]">
                    Optional
                  </span>
                </label>

                <textarea
                  id="shabda-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value.slice(0, MAX_DESCRIPTION_LENGTH),
                    )
                  }
                  placeholder="Add a short description about your writing..."
                  rows={3}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  className="w-full resize-y rounded-xl border border-[#F97316]/15 bg-[#24180F] px-4 py-3 text-sm leading-6 text-[#E0CDBB] outline-none transition placeholder:text-[#8F7A68] focus:border-[#FB923C]/60 focus:ring-2 focus:ring-[#F97316]/10"
                />

                <p className="mt-1 text-right text-[10px] text-[#8F7A68]">
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </p>
              </div>

              {/* TYPOGRAPHY */}
              <div className="mb-7">
                <div className="mb-3 flex items-center gap-2">
                  <Type size={15} className="text-[#FB923C]" />
                  <h3 className="text-xs font-semibold text-[#EBD5C2]">
                    Typography
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {FONT_STYLES.map((font) => {
                    const selected = fontStyle === font.value;

                    return (
                      <button
                        key={font.value}
                        type="button"
                        onClick={() => setFontStyle(font.value)}
                        aria-pressed={selected}
                        className={`rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-[#FB923C]/70 bg-[#F97316]/[0.10] ring-1 ring-[#F97316]/15"
                            : "border-[#F97316]/15 bg-[#24180F] hover:border-[#FB923C]/40 hover:bg-[#2A1B11]"
                        }`}
                      >
                        <span
                          className="block text-lg text-[#FFF3E8]"
                          style={{ fontFamily: font.fontFamily }}
                        >
                          Aa
                        </span>

                        <span className="mt-2 block text-[11px] font-semibold text-[#EBD5C2]">
                          {font.label}
                        </span>

                        <span className="mt-1 block text-[9px] leading-4 text-[#8F7A68]">
                          {font.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ALIGNMENT */}
              <div className="mb-7">
                <div className="mb-3 flex items-center gap-2">
                  <AlignLeft size={15} className="text-[#FB923C]" />
                  <h3 className="text-xs font-semibold text-[#EBD5C2]">
                    Text alignment
                  </h3>
                </div>

                <div className="inline-flex rounded-xl border border-[#F97316]/15 bg-[#24180F] p-1">
                  {ALIGNMENTS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTextAlign(value)}
                      aria-label={`${label} alignment`}
                      aria-pressed={textAlign === value}
                      className={`flex h-9 w-12 items-center justify-center rounded-lg transition ${
                        textAlign === value
                          ? "bg-[#F97316] text-white shadow-[0_0_12px_rgba(249,115,22,0.2)]"
                          : "text-[#A9917C] hover:bg-[#F97316]/10 hover:text-[#FB923C]"
                      }`}
                    >
                      <Icon size={17} />
                    </button>
                  ))}
                </div>
              </div>

              {/* TAGS */}
              <div className="mb-7">
                <div className="mb-2 flex items-center gap-2">
                  <Tag size={15} className="text-[#FB923C]" />

                  <label
                    htmlFor="shabda-tags"
                    className="text-xs font-semibold text-[#EBD5C2]"
                  >
                    Tags
                  </label>

                  <span className="text-[10px] text-[#8F7A68]">
                    Optional · Up to 10
                  </span>
                </div>

                <input
                  id="shabda-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(event) => setTagsInput(event.target.value)}
                  placeholder="poetry, love, life, nepali..."
                  className="w-full rounded-xl border border-[#F97316]/15 bg-[#24180F] px-4 py-3 text-sm text-[#FFF3E8] outline-none transition placeholder:text-[#8F7A68] focus:border-[#FB923C]/60 focus:ring-2 focus:ring-[#F97316]/10"
                />

                <p className="mt-1.5 text-[10px] text-[#8F7A68]">
                  Separate tags with commas.
                </p>

                {parsedTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {parsedTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#F97316]/15 bg-[#F97316]/[0.08] px-3 py-1 text-[10px] font-medium text-[#FDBA74]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ERROR */}
              {error && (
                <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-xs leading-5 text-red-300">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="mb-5 flex items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/[0.08] px-4 py-3 text-xs leading-5 text-green-300">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <p>{success}</p>
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#F97316]/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setShowPreview((previous) => !previous)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#F97316]/20 px-5 py-3 text-xs font-semibold text-[#B9A18D] transition hover:border-[#FB923C]/50 hover:bg-[#F97316]/[0.07] hover:text-[#FB923C]"
                >
                  <Eye size={15} />
                  {showPreview ? "Hide preview" : "Preview writing"}
                </button>

                <button
                  type="submit"
                  disabled={!canPublish}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-7 py-3 text-xs font-semibold text-white shadow-[0_4px_18px_rgba(249,115,22,0.16)] transition hover:bg-[#EA650F] hover:shadow-[0_5px_22px_rgba(249,115,22,0.25)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {publishing ? (
                    <>
                      <LoaderCircle size={15} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <PenLine size={15} />
                      Publish writing
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* DESKTOP PREVIEW */}
          <aside className="hidden min-h-0 flex-col border-l border-[#F97316]/15 bg-[#1D140D] lg:flex">
            <div className="border-b border-[#F97316]/15 px-6 py-5">
              <div className="flex items-center gap-2 text-[#FB923C]">
                <Eye size={15} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Live preview
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#17100B] p-6">
              {renderPreview()}

              <div className="mt-5 flex items-start gap-2 px-1 text-[10px] leading-5 text-[#8F7A68]">
                <BookOpen
                  size={14}
                  className="mt-0.5 shrink-0 text-[#FB923C]"
                />
                <p>
                  This is an approximate preview of how your writing will appear
                  in the Shabda Manch feed.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* MOBILE PREVIEW */}
        {showPreview && (
          <div className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-[#17100B] lg:hidden">
            <div className="flex shrink-0 items-center justify-between border-b border-[#F97316]/15 bg-[#1D140D] px-5 py-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FB923C]">
                <Eye size={16} />
                Preview
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                aria-label="Back to editor"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#A9917C] transition hover:bg-[#F97316]/10 hover:text-[#FB923C]"
              >
                <ArrowLeft size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-8">
              <div className="mx-auto max-w-xl">{renderPreview(true)}</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ShabdaUpload;
