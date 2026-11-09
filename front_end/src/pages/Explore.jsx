import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Music2,
  Feather,
  Palette,
  Orbit,
  MoveUpRight,
  CircleDot,
} from "lucide-react";

import swarManch from "../assets/swarmanch.png";
import drishyaManch from "../assets/drishyamanch.png";
import rangManch from "../assets/rangmanch.png";
import shabdaManch from "../assets/shabdamanch.png";

// ==========================================
// CREATIVE DIMENSIONS
// ==========================================

const stages = [
  {
    id: "swar",
    number: "01",
    name: "Swar Manch",
    nepali: "स्वरमञ्च",
    category: "MUSIC & SINGING",
    tagline: "Let your voice be heard.",
    description:
      "Every voice carries a frequency of the soul. From acoustic melodies and classical ragas to modern compositions, share your sound with the world.",
    image: swarManch,
    path: "/explore/swar-manch",
    icon: Music2,
    accent: "#FF4DB8",
    glow: "rgba(255,77,184,0.17)",
    label: "01 / THE FREQUENCY",
    symbol: "SOUND",
  },
  {
    id: "drishya",
    number: "02",
    name: "Drishya Manch",
    nepali: "दृश्यमञ्च",
    category: "PHOTOGRAPHY",
    tagline: "Show the world how you see.",
    description:
      "A solitary shutter click, a thousand untold perspectives. Preserve landscapes, street candids, and visual memoirs.",
    image: drishyaManch,
    path: "/explore/drishya-manch",
    icon: Camera,
    accent: "#FF789A",
    glow: "rgba(255,120,154,0.17)",
    label: "02 / THE PERSPECTIVE",
    symbol: "VISION",
  },
  {
    id: "rang",
    number: "03",
    name: "Rang Manch",
    nepali: "रङ्गमञ्च",
    category: "PAINTING & ART",
    tagline: "Give imagination a form.",
    description:
      "From raw charcoal studies to sacred Paubha and layered oils. Bring texture to emotion and give form to what words cannot contain.",
    image: rangManch,
    path: "/explore/rang-manch",
    icon: Palette,
    accent: "#FF91C8",
    glow: "rgba(255,145,200,0.17)",
    label: "03 / THE EXPRESSION",
    symbol: "COLOR",
  },
  {
    id: "shabda",
    number: "04",
    name: "Shabda Manch",
    nepali: "शब्दमञ्च",
    category: "POETRY & WRITING",
    tagline: "Let your words find a home.",
    description:
      "Poetry, ghazals, reflective essays, and timeless verses. Give your thoughts a home where they resonate with living hearts.",
    image: shabdaManch,
    path: "/explore/shabda-manch",
    icon: Feather,
    accent: "#FF4DB8",
    glow: "rgba(255,77,184,0.17)",
    label: "04 / THE IMAGINATION",
    symbol: "WORDS",
  },
];

const ease = [0.22, 1, 0.36, 1];

// ==========================================
// ANIMATION VARIANTS
// ==========================================

const slideVariants = {
  initial: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 75 : -75,
    filter: "blur(8px)",
  }),

  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease,
    },
  },

  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -75 : 75,
    filter: "blur(6px)",
    transition: {
      duration: 0.3,
      ease,
    },
  }),
};

// ==========================================
// EXPLORE PAGE
// ==========================================

export default function Explore() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const mainRef = useRef(null);
  const wheelLock = useRef(false);
  const wheelTimer = useRef(null);
  const touchStart = useRef(null);
  const activeIndexRef = useRef(0);

  const activeStage = stages[activeIndex];

  // Keep the current index accessible to stable event listeners.
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // ========================================
  // CHANGE DIMENSION
  // ========================================

  const changeStage = (newIndex) => {
    if (newIndex < 0 || newIndex >= stages.length) return;
    if (newIndex === activeIndex) return;

    setDirection(newIndex > activeIndex ? 1 : -1);
    setActiveIndex(newIndex);
  };

  const nextStage = () => {
    changeStage(Math.min(activeIndex + 1, stages.length - 1));
  };

  const previousStage = () => {
    changeStage(Math.max(activeIndex - 1, 0));
  };

  // ========================================
  // KEYBOARD NAVIGATION
  // ========================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        ["INPUT", "TEXTAREA"].includes(e.target.tagName) ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === "ArrowRight") nextStage();
      if (e.key === "ArrowLeft") previousStage();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex]);

  // ========================================
  // MOUSE WHEEL NAVIGATION
  // ========================================

  useEffect(() => {
    const main = mainRef.current;

    if (!main) return;

    const handleWheel = (e) => {
      const currentIndex = activeIndexRef.current;

      const movement =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

      if (Math.abs(movement) < 25) return;

      // Allow normal scrolling at boundaries.
      if (movement > 0 && currentIndex === stages.length - 1) return;
      if (movement < 0 && currentIndex === 0) return;

      e.preventDefault();

      if (wheelLock.current) return;

      wheelLock.current = true;

      if (movement > 0) {
        setDirection(1);
        setActiveIndex((previous) => Math.min(previous + 1, stages.length - 1));
      } else {
        setDirection(-1);
        setActiveIndex((previous) => Math.max(previous - 1, 0));
      }

      clearTimeout(wheelTimer.current);

      wheelTimer.current = setTimeout(() => {
        wheelLock.current = false;
      }, 750);
    };

    main.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      main.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // ========================================
  // CLEANUP WHEEL TIMER
  // ========================================

  useEffect(() => {
    return () => {
      clearTimeout(wheelTimer.current);
    };
  }, []);

  // ========================================
  // TOUCH / SWIPE NAVIGATION
  // ========================================

  const handleTouchStart = (e) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;

    const diffX = touchStart.current.x - e.changedTouches[0].clientX;
    const diffY = touchStart.current.y - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > 55 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) nextStage();
      else previousStage();
    }

    touchStart.current = null;
  };

  // ========================================
  // COMPONENT
  // ========================================

  return (
    <main
      ref={mainRef}
      className="relative min-h-screen overflow-hidden bg-[#050A30] font-sans text-[#F5F7FF]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ====================================
          01. COSMIC BACKGROUND
      ==================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#080F36] via-[#050A30] to-[#080720]" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(
                  ellipse at 68% 45%,
                  ${activeStage.glow},
                  transparent 55%
                )
              `,
            }}
          />
        </AnimatePresence>

        <div className="absolute -left-48 top-[20%] h-[450px] w-[450px] rounded-full bg-[#FF4DB8]/[0.07] blur-[150px]" />

        <div className="absolute -bottom-48 right-0 h-[450px] w-[450px] rounded-full bg-[#FF789A]/[0.07] blur-[150px]" />

        {/* Stars */}

        <div className="absolute left-[12%] top-[24%] h-1 w-1 rounded-full bg-white/70 shadow-[0_0_12px_white]" />

        <div className="absolute left-[35%] top-[14%] h-1.5 w-1.5 rounded-full bg-[#FF91C8] shadow-[0_0_15px_#FF91C8]" />

        <div className="absolute bottom-[22%] right-[15%] h-1 w-1 rounded-full bg-[#FF4DB8] shadow-[0_0_12px_#FF4DB8]" />

        <div className="absolute right-[30%] top-[30%] h-1 w-1 rounded-full bg-white/50" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.45)_100%)]" />
      </div>

      {/* ====================================
          02. TOP HEADER
      ==================================== */}

      <header className="relative z-30 mx-auto flex w-full justify-center px-6 pb-5 pt-28 sm:px-10 lg:px-16 xl:px-20">
        <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 backdrop-blur-lg sm:flex">
          <Orbit size={15} className="text-[#FF789A]" />

          <span className="font-['Orbitron'] text-[9px] uppercase tracking-[0.18em] text-white/60">
            Enter the creative universe
          </span>
        </div>
      </header>

      {/* ====================================
          03. MAIN DIMENSION EXPERIENCE
      ==================================== */}

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-180px)] w-full max-w-[1900px] items-center px-5 pb-12 pt-5 sm:px-10 lg:px-16 xl:px-20">
        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-[90px_minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10 xl:gap-16">
          {/* LEFT DIMENSION SELECTOR */}

          <aside className="order-2 flex items-center justify-center gap-4 lg:order-1 lg:flex-col lg:items-start lg:gap-7">
            <div className="hidden pb-3 lg:block">
              <p className="font-['Orbitron'] text-[9px] uppercase tracking-[0.25em] text-white/35">
                Dimensions
              </p>
            </div>

            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isActive = index === activeIndex;

              return (
                <button
                  key={stage.id}
                  onClick={() => changeStage(index)}
                  aria-label={`Explore ${stage.name}`}
                  aria-current={isActive ? "step" : undefined}
                  className="group flex items-center gap-3 lg:w-full"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1 : 0.85,
                      borderColor: isActive
                        ? stage.accent
                        : "rgba(255,255,255,0.12)",
                      backgroundColor: isActive
                        ? `${stage.accent}15`
                        : "rgba(255,255,255,0.03)",
                    }}
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300"
                  >
                    <Icon
                      size={18}
                      style={{
                        color: isActive ? stage.accent : "#8490B3",
                      }}
                    />

                    {isActive && (
                      <motion.span
                        layoutId="activeDimension"
                        className="absolute -right-[5px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full"
                        style={{
                          backgroundColor: stage.accent,
                          boxShadow: `0 0 12px ${stage.accent}`,
                        }}
                      />
                    )}
                  </motion.div>

                  <span
                    className={`hidden font-['Orbitron'] text-[9px] font-medium uppercase tracking-[0.16em] transition-colors lg:block ${
                      isActive
                        ? "text-white"
                        : "text-white/30 group-hover:text-white/70"
                    }`}
                  >
                    {stage.number}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* CENTER ARTWORK */}

          <div className="relative order-1 flex min-h-[330px] items-center justify-center sm:min-h-[450px] lg:order-2 lg:min-h-[580px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeStage.id}
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative flex h-full w-full items-center justify-center"
              >
                {/* Artwork orbit */}

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 70,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-[75%] w-[75%] rounded-full border border-dashed border-white/[0.08]"
                />

                <div
                  className="absolute h-[68%] w-[68%] rounded-full blur-[90px]"
                  style={{ backgroundColor: activeStage.glow }}
                />

                {/* Floating orbit decoration */}

                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 45,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-[88%] w-[88%] rounded-full border border-white/[0.05]"
                >
                  <span
                    className="absolute left-[10%] top-[25%] h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: activeStage.accent,
                      boxShadow: `0 0 20px ${activeStage.accent}`,
                    }}
                  />
                </motion.div>

                {/* Image ground glow */}

                <div
                  className="absolute bottom-[10%] h-8 w-[55%] rounded-full blur-2xl"
                  style={{ backgroundColor: activeStage.glow }}
                />

                {/* CLICKABLE ARTWORK */}

                <Link
                  to={activeStage.path}
                  aria-label={`Enter ${activeStage.name}`}
                  title={`Explore ${activeStage.name}`}
                  className="group relative z-10 flex h-full w-full cursor-pointer items-center justify-center outline-none"
                >
                  <motion.img
                    src={activeStage.image}
                    alt={`Explore ${activeStage.name}`}
                    draggable="false"
                    animate={{
                      y: [0, -13, 0],
                      rotate: [-1, 1, -1],
                    }}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.3 },
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative z-10 h-[340px] w-full select-none object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.5)] sm:h-[440px] lg:h-[550px]"
                  />

                  <span className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-full border border-white/15 bg-[#050A30]/80 px-4 py-2 font-['Orbitron'] text-[9px] uppercase tracking-[0.16em] text-white/80 opacity-0 backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    Click to explore
                    <MoveUpRight
                      size={12}
                      className="ml-2 inline text-[#FF4DB8]"
                    />
                  </span>
                </Link>

                {/* Artwork index */}

                <div className="absolute left-1 top-4 hidden sm:block">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-white/30">
                    DIMENSION_{activeStage.number}
                  </p>
                </div>

                {/* Artwork category badge */}

                <div className="absolute bottom-5 right-0 hidden items-center gap-2 rounded-full border border-white/10 bg-[#080F36]/65 px-4 py-2 backdrop-blur-xl sm:flex">
                  <CircleDot size={11} style={{ color: activeStage.accent }} />

                  <span className="font-['Orbitron'] text-[9px] uppercase tracking-[0.18em] text-white/65">
                    {activeStage.symbol}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT CONTENT PANEL */}

          <div className="order-3 relative flex flex-col justify-center lg:pl-5">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeStage.id}
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                {/* Category label */}

                <div className="mb-7 flex items-center gap-3">
                  <span
                    className="h-[2px] w-10 rounded-full"
                    style={{
                      backgroundColor: activeStage.accent,
                      boxShadow: `0 0 10px ${activeStage.accent}`,
                    }}
                  />

                  <p
                    className="font-['Orbitron'] text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: activeStage.accent }}
                  >
                    {activeStage.category}
                  </p>
                </div>

                {/* Nepali typography */}

                <p className="mb-3 font-serif text-xl tracking-widest text-white/45 sm:text-2xl">
                  {activeStage.nepali}
                </p>

                {/* Main title */}

                <h1 className="font-['Orbitron'] text-[clamp(2.6rem,5vw,5rem)] font-bold leading-[1.1] tracking-[-0.045em] text-white">
                  {activeStage.name.split(" ")[0]}

                  <span
                    className="block"
                    style={{
                      color: activeStage.accent,
                      textShadow: `0 0 35px ${activeStage.glow}`,
                    }}
                  >
                    {activeStage.name.split(" ")[1]}
                    <span className="text-white/60">.</span>
                  </span>
                </h1>

                {/* Tagline */}

                <h2 className="mt-8 max-w-[440px] font-['Orbitron'] text-base font-medium leading-relaxed text-white/80 sm:text-lg">
                  {activeStage.tagline}
                </h2>

                {/* Description */}

                <p className="mt-5 max-w-[430px] text-[13px] leading-8 text-[#AAB3D0] sm:text-sm">
                  {activeStage.description}
                </p>

                {/* CTA */}

                <div className="mt-9 flex flex-wrap items-center gap-5">
                  <Link
                    to={activeStage.path}
                    className="group inline-flex items-center gap-4 rounded-full px-7 py-4 font-['Orbitron'] text-[10px] font-bold uppercase tracking-wider text-[#050A30] transition-all duration-300 hover:-translate-y-1"
                    style={{
                      backgroundColor: activeStage.accent,
                      boxShadow: `0 0 30px ${activeStage.glow}`,
                    }}
                  >
                    Enter this dimension
                    <MoveUpRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </Link>

                  <span className="font-['Orbitron'] text-[9px] uppercase tracking-[0.16em] text-white/35">
                    Explore the world
                  </span>
                </div>

                {/* Bottom metadata */}

                <div className="mt-12 flex items-center gap-5 border-t border-white/10 pt-6">
                  <div>
                    <p className="font-['Orbitron'] text-[9px] uppercase tracking-[0.2em] text-white/35">
                      Dimension
                    </p>

                    <p
                      className="mt-1 font-mono text-sm"
                      style={{ color: activeStage.accent }}
                    >
                      {activeStage.number} / 04
                    </p>
                  </div>

                  <div className="h-8 w-px bg-white/10" />

                  <div>
                    <p className="font-['Orbitron'] text-[9px] uppercase tracking-[0.2em] text-white/35">
                      Destination
                    </p>

                    <p className="mt-1 text-xs text-white/75">
                      {activeStage.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Desktop navigation arrows */}

            <div className="mt-10 hidden items-center gap-3 lg:flex">
              <button
                onClick={previousStage}
                disabled={activeIndex === 0}
                aria-label="Previous dimension"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/60 transition-all hover:border-[#FF4DB8]/60 hover:bg-[#FF4DB8]/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
              >
                <ArrowLeft size={19} />
              </button>

              <button
                onClick={nextStage}
                disabled={activeIndex === stages.length - 1}
                aria-label="Next dimension"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/60 transition-all hover:border-[#FF789A]/60 hover:bg-[#FF789A]/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
              >
                <ArrowRight size={19} />
              </button>

              <span className="ml-3 font-['Orbitron'] text-[9px] uppercase tracking-[0.2em] text-white/30">
                Navigate dimensions
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================
          04. BOTTOM DIMENSION NAVIGATION
      ==================================== */}

      <footer className="relative z-30 mx-auto flex w-full max-w-[1900px] flex-col gap-5 border-t border-white/[0.08] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16 xl:px-20">
        <div className="flex items-center gap-3">
          <span className="font-['Orbitron'] text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
            PRATIVA
          </span>

          <span className="text-white/15">/</span>

          <span className="font-['Orbitron'] text-[9px] uppercase tracking-[0.15em] text-white/45">
            Explore the extraordinary
          </span>
        </div>

        {/* Dimension progress */}

        <div className="flex items-center justify-between gap-3 sm:gap-5">
          {stages.map((stage, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={stage.id}
                onClick={() => changeStage(index)}
                aria-label={`Select ${stage.name}`}
                aria-current={isActive ? "step" : undefined}
                className="group flex items-center gap-2"
              >
                <span
                  className="font-mono text-[9px] transition-colors"
                  style={{
                    color: isActive ? stage.accent : "#68739B",
                  }}
                >
                  {stage.number}
                </span>

                <motion.span
                  animate={{
                    width: isActive ? 42 : 13,
                    opacity: isActive ? 1 : 0.35,
                  }}
                  className="h-[3px] rounded-full transition-colors"
                  style={{
                    backgroundColor: stage.accent,
                    boxShadow: isActive ? `0 0 10px ${stage.accent}` : "none",
                  }}
                />
              </button>
            );
          })}
        </div>

        <p className="hidden font-['Orbitron'] text-[9px] uppercase tracking-[0.18em] text-white/30 md:block">
          Create · Express · Inspire
        </p>
      </footer>
    </main>
  );
}
