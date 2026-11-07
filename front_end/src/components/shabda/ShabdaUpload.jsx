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

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

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

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#191919]/60 p-0 backdrop-blur-md sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden bg-[#F8F7F4] shadow-2xl sm:h-[min(92vh,900px)] sm:rounded-2xl">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-[#EAE6E0] bg-white px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FCEAED] text-[#E5092D]">
              <Feather size={19} />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E5092D]">
                Prativa
              </p>
              <h2 className="text-sm font-semibold text-[#191919]">
                Create on ShabdaManch
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={publishing}
            aria-label="Close upload"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#77716F] transition hover:bg-[#FCEAED] hover:text-[#E5092D] disabled:opacity-40"
          >
            <X size={19} />
          </button>
        </header>

        {/* Main */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Editor */}
          <form
            onSubmit={handlePublish}
            className="min-h-0 overflow-y-auto px-5 py-7 sm:px-9 sm:py-9"
          >
            <div className="mx-auto max-w-2xl">
              {/* Introduction */}
              <div className="mb-8">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#99918B]">
                  <Sparkles size={13} className="text-[#E5092D]" />
                  Your space of expression
                </div>

                <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#191919] sm:text-4xl">
                  Give your thoughts
                  <br />
                  <span className="font-serif font-normal italic text-[#E5092D]">
                    a place to live.
                  </span>
                </h1>

                <p className="mt-3 max-w-md text-sm leading-7 text-[#77716F]">
                  A poem, a story, a passing thought, or something you have been
                  meaning to say. Put it into words.
                </p>
              </div>

              {/* Title */}
              <div className="mb-6">
                <label
                  htmlFor="shabda-title"
                  className="mb-2 block text-xs font-semibold text-[#34302E]"
                >
                  Title
                  <span className="ml-2 font-normal text-[#99918B]">
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
                  className="w-full rounded-xl border border-[#EAE6E0] bg-white px-4 py-3.5 text-sm text-[#191919] outline-none transition placeholder:text-[#B0A9A4] focus:border-[#E5092D] focus:ring-2 focus:ring-[#E5092D]/10"
                />

                <p className="mt-1.5 text-right text-[10px] text-[#99918B]">
                  {title.length}/{MAX_TITLE_LENGTH}
                </p>
              </div>

              {/* Content */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="shabda-content"
                    className="text-xs font-semibold text-[#34302E]"
                  >
                    Your writing
                  </label>

                  <span className="text-[10px] text-[#99918B]">
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
                  className="min-h-[280px] w-full resize-y rounded-xl border border-[#EAE6E0] bg-white px-5 py-5 text-[15px] leading-[2] text-[#34302E] outline-none transition placeholder:text-[#B0A9A4] focus:border-[#E5092D] focus:ring-2 focus:ring-[#E5092D]/10"
                  style={{
                    fontFamily: selectedFont.fontFamily,
                    textAlign,
                  }}
                />

                <p className="mt-2 text-[10px] leading-5 text-[#99918B]">
                  Your line breaks and paragraph spacing will be preserved.
                </p>
              </div>

              {/* Description */}
              <div className="mb-7">
                <label
                  htmlFor="shabda-description"
                  className="mb-2 block text-xs font-semibold text-[#34302E]"
                >
                  A little context
                  <span className="ml-2 font-normal text-[#99918B]">
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
                  className="w-full resize-y rounded-xl border border-[#EAE6E0] bg-white px-4 py-3 text-sm leading-6 text-[#34302E] outline-none transition placeholder:text-[#B0A9A4] focus:border-[#E5092D] focus:ring-2 focus:ring-[#E5092D]/10"
                />

                <p className="mt-1 text-right text-[10px] text-[#99918B]">
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </p>
              </div>

              {/* Typography */}
              <div className="mb-7">
                <div className="mb-3 flex items-center gap-2">
                  <Type size={15} className="text-[#E5092D]" />
                  <h3 className="text-xs font-semibold text-[#34302E]">
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
                            ? "border-[#E5092D] bg-[#FCEAED] ring-1 ring-[#E5092D]/10"
                            : "border-[#EAE6E0] bg-white hover:border-[#E9A0AC] hover:bg-[#FFFAFA]"
                        }`}
                      >
                        <span
                          className="block text-lg text-[#191919]"
                          style={{ fontFamily: font.fontFamily }}
                        >
                          Aa
                        </span>

                        <span className="mt-2 block text-[11px] font-semibold text-[#34302E]">
                          {font.label}
                        </span>

                        <span className="mt-1 block text-[9px] leading-4 text-[#99918B]">
                          {font.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alignment */}
              <div className="mb-7">
                <div className="mb-3 flex items-center gap-2">
                  <AlignLeft size={15} className="text-[#E5092D]" />
                  <h3 className="text-xs font-semibold text-[#34302E]">
                    Text alignment
                  </h3>
                </div>

                <div className="inline-flex rounded-xl border border-[#EAE6E0] bg-white p-1">
                  {ALIGNMENTS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTextAlign(value)}
                      aria-label={`${label} alignment`}
                      aria-pressed={textAlign === value}
                      className={`flex h-9 w-12 items-center justify-center rounded-lg transition ${
                        textAlign === value
                          ? "bg-[#E5092D] text-white"
                          : "text-[#77716F] hover:bg-[#FCEAED] hover:text-[#E5092D]"
                      }`}
                    >
                      <Icon size={17} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-7">
                <div className="mb-2 flex items-center gap-2">
                  <Tag size={15} className="text-[#E5092D]" />
                  <label
                    htmlFor="shabda-tags"
                    className="text-xs font-semibold text-[#34302E]"
                  >
                    Tags
                  </label>

                  <span className="text-[10px] text-[#99918B]">
                    Optional · Up to 10
                  </span>
                </div>

                <input
                  id="shabda-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(event) => setTagsInput(event.target.value)}
                  placeholder="poetry, love, life, nepali..."
                  className="w-full rounded-xl border border-[#EAE6E0] bg-white px-4 py-3 text-sm text-[#191919] outline-none transition placeholder:text-[#B0A9A4] focus:border-[#E5092D] focus:ring-2 focus:ring-[#E5092D]/10"
                />

                <p className="mt-1.5 text-[10px] text-[#99918B]">
                  Separate tags with commas.
                </p>

                {parsedTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {parsedTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#FCEAED] px-3 py-1 text-[10px] font-medium text-[#E5092D]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Error / Success */}
              {error && (
                <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs leading-5 text-green-700">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <p>{success}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#EAE6E0] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setShowPreview((previous) => !previous)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#EAE6E0] px-5 py-3 text-xs font-semibold text-[#77716F] transition hover:border-[#E9A0AC] hover:bg-[#FCEAED] hover:text-[#E5092D]"
                >
                  <Eye size={15} />
                  {showPreview ? "Hide preview" : "Preview writing"}
                </button>

                <button
                  type="submit"
                  disabled={!canPublish}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#E5092D] px-7 py-3 text-xs font-semibold text-white transition hover:bg-[#C90024] disabled:cursor-not-allowed disabled:opacity-45"
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

          {/* Desktop preview */}
          <aside className="hidden min-h-0 flex-col border-l border-[#EAE6E0] bg-white lg:flex">
            <div className="border-b border-[#EAE6E0] px-6 py-5">
              <div className="flex items-center gap-2 text-[#E5092D]">
                <Eye size={15} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Live preview
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#F8F7F4] p-6">
              <article className="rounded-xl border border-[#EAE6E0] bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-2 text-[#99918B]">
                  <Feather size={13} />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                    ShabdaManch
                  </span>
                </div>

                <h3 className="mb-5 break-words text-2xl font-semibold leading-tight text-[#191919]">
                  {title || "Your title will appear here"}
                </h3>

                <div
                  className="min-h-32 whitespace-pre-wrap break-words text-[15px] leading-[2] text-[#57504D]"
                  style={{
                    fontFamily: selectedFont.fontFamily,
                    textAlign,
                    overflowWrap: "anywhere",
                  }}
                >
                  {content || "Your words will appear here as you write..."}
                </div>

                {description && (
                  <p className="mt-6 border-l-2 border-[#E5092D] pl-3 text-xs leading-6 text-[#77716F]">
                    {description}
                  </p>
                )}

                {parsedTags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {parsedTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#FCEAED] px-3 py-1 text-[10px] text-[#E5092D]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>

              <div className="mt-5 flex items-start gap-2 px-1 text-[10px] leading-5 text-[#99918B]">
                <BookOpen size={14} className="mt-0.5 shrink-0" />
                <p>
                  This is an approximate preview of how your writing will appear
                  in the ShabdaManch feed.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile preview */}
        {showPreview && (
          <div className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-[#F8F7F4] lg:hidden">
            <div className="flex shrink-0 items-center justify-between border-b border-[#EAE6E0] bg-white px-5 py-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E5092D]">
                <Eye size={16} />
                Preview
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                aria-label="Back to editor"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#77716F] transition hover:bg-[#FCEAED] hover:text-[#E5092D]"
              >
                <ArrowLeft size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-8">
              <article className="mx-auto max-w-xl rounded-xl border border-[#EAE6E0] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7 flex items-center gap-2 text-[#99918B]">
                  <Feather size={13} />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                    ShabdaManch
                  </span>
                </div>

                <h3 className="mb-6 break-words text-3xl font-semibold leading-tight text-[#191919]">
                  {title || "Your title will appear here"}
                </h3>

                <div
                  className="min-h-40 whitespace-pre-wrap break-words text-[17px] leading-[2.1] text-[#57504D]"
                  style={{
                    fontFamily: selectedFont.fontFamily,
                    textAlign,
                    overflowWrap: "anywhere",
                  }}
                >
                  {content || "Your words will appear here as you write..."}
                </div>

                {description && (
                  <p className="mt-8 border-l-2 border-[#E5092D] pl-3 text-sm leading-7 text-[#77716F]">
                    {description}
                  </p>
                )}

                {parsedTags.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {parsedTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#FCEAED] px-3 py-1 text-[10px] text-[#E5092D]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ShabdaUpload;
