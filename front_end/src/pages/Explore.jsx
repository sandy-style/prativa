import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  Music2,
  Camera,
  Palette,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";

// ================= ANIMATION VARIANTS =================

const fadeInUp = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

// ================= STAGES DATA =================

const stages = [
  {
    id: "swar-manch",
    path: "/explore/swar-manch",
    number: "01",
    nepali: "स्वरमञ्च",
    name: "Swar Manch",
    category: "VOICE",
    description:
      "Every voice carries a story. From melodies and music to spoken performances, this is where sound finds its audience.",
    examples: "Singing · Instrumentals · Music · Spoken Word",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "Singer performing under stage lights",
    icon: Music2,
    accent: "#C90024",
    background: "#F5E8E8",
    imageSide: "right",
  },
  {
    id: "drishya-manch",
    path: "/explore/drishya-manch",
    number: "02",
    nepali: "दृश्यमञ्च",
    name: "Drishya Manch",
    category: "VISION",
    description:
      "Some stories are better seen than told. A home for photographs and the moments that deserve to be remembered.",
    examples: "Photography · Visual Storytelling · Cinematography",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "Cinematic mountain landscape",
    icon: Camera,
    accent: "#526D86",
    background: "#E9EDF0",
    imageSide: "left",
  },
  {
    id: "rang-manch",
    path: "/explore/rang-manch",
    number: "03",
    nepali: "रङ्गमञ्च",
    name: "Rang Manch",
    category: "ART",
    description:
      "An idea becomes a sketch, a feeling becomes a colour. A space for imagination to take shape through art.",
    examples: "Painting · Drawing · Illustration · Digital Art",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "Artist working on a colourful painting",
    icon: Palette,
    accent: "#A66A35",
    background: "#F1E9DF",
    imageSide: "right",
  },
  {
    id: "shabda-manch",
    path: "/explore/shabda-manch",
    number: "04",
    nepali: "शब्दमञ्च",
    name: "Shabda Manch",
    category: "WORDS",
    description:
      "For thoughts that need a page and feelings that need words. A place for poetry, stories and everything in between.",
    examples: "Poetry · Writing · Literature · Storytelling",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "Notebook and pen on a writer's desk",
    icon: BookOpen,
    accent: "#75618C",
    background: "#ECE8F1",
    imageSide: "left",
  },
];

// ================= STAGE SECTION =================

const StageSection = ({ stage }) => {
  const Icon = stage.icon;
  const imageFirst = stage.imageSide === "left";

  return (
    <section
      id={stage.id}
      className="scroll-mt-24 overflow-hidden border-b border-[#E5E0D8]"
      style={{ backgroundColor: stage.background }}
    >
      <div
        className={`mx-auto grid max-w-[1440px] lg:min-h-[590px] lg:grid-cols-2 ${
          imageFirst ? "" : "lg:[&>div:first-child]:order-2"
        }`}
      >
        {/* Stage Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="group relative min-h-[360px] overflow-hidden sm:min-h-[460px] lg:min-h-[590px]"
        >
          <img
            src={stage.image}
            alt={stage.imageAlt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/20" />

          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 0.85, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute left-7 top-7 font-serif text-5xl font-light text-white sm:left-10 sm:top-10 lg:text-6xl"
          >
            {stage.number}
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 0.95, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute bottom-8 left-8 font-serif text-xl tracking-wider text-white sm:bottom-10 sm:left-10"
          >
            {stage.nepali}
          </motion.span>
        </motion.div>

        {/* Stage Details */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="flex flex-col justify-center px-7 py-16 sm:px-12 sm:py-20 lg:px-16 xl:px-24"
        >
          {/* Category */}
          <motion.div variants={fadeInUp} className="flex items-center gap-3">
            <motion.span
              whileHover={{ scale: 1.12, rotate: 6 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex h-11 w-11 items-center justify-center rounded-full shadow-sm"
              style={{
                color: stage.accent,
                backgroundColor: `${stage.accent}18`,
              }}
            >
              <Icon size={20} strokeWidth={1.8} />
            </motion.span>

            <span
              className="font-sans text-[11px] font-bold tracking-[0.25em]"
              style={{ color: stage.accent }}
            >
              {stage.category} / THE CREATIVE STAGES
            </span>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            className="mt-8 font-serif text-lg italic text-[#77716F]"
          >
            {stage.nepali}
          </motion.p>

          <motion.h2
            variants={fadeInUp}
            className="mt-2 font-serif text-5xl font-medium leading-[1.08] tracking-tight text-[#191919] sm:text-6xl xl:text-7xl"
          >
            {stage.name}

            <span
              className="mt-3 block text-2xl font-normal italic sm:text-3xl"
              style={{ color: stage.accent }}
            >
              {stage.category === "VOICE" && "Let your voice be heard."}
              {stage.category === "VISION" && "Show the world how you see."}
              {stage.category === "ART" && "Give imagination a form."}
              {stage.category === "WORDS" && "Let your words find a home."}
            </span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-7 max-w-[470px] font-sans text-[15px] leading-[1.9] text-[#625D58]"
          >
            {stage.description}
          </motion.p>

          {/* Examples */}
          <motion.div
            variants={fadeInUp}
            className="mt-6 flex flex-wrap items-center gap-2"
          >
            {stage.examples.split(" · ").map((example) => (
              <span
                key={example}
                className="rounded-full px-3 py-1 font-sans text-[11px] font-medium tracking-wide"
                style={{
                  backgroundColor: `${stage.accent}14`,
                  color: stage.accent,
                }}
              >
                {example}
              </span>
            ))}
          </motion.div>

          {/* Navigate to the corresponding Manch page */}
          <motion.div variants={fadeInUp} className="mt-10">
            <Link
              to={stage.path}
              className="group inline-flex w-fit items-center gap-3 border-b-2 border-black/25 pb-1.5 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-[#191919] transition-all duration-300 hover:border-[#E5092D] hover:text-[#E5092D]"
            >
              Enter {stage.name}
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ================= MAIN EXPLORE PAGE =================

const Explore = () => {
  return (
    <main className="min-h-screen bg-[#F8F7F4]">
      {/* Explore Introduction */}
      <section className="relative overflow-hidden px-6 pb-16 pt-20 sm:px-10 sm:pb-20 sm:pt-28 lg:px-16">
        {/* Animated Background Rings */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-24 -top-20 h-[380px] w-[380px] rounded-full border-2 border-[#E5092D]"
        />

        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.08, 0.18, 0.08] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="pointer-events-none absolute -right-12 -top-8 h-[270px] w-[270px] rounded-full border border-[#E5092D]"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-[1300px]"
        >
          <motion.p
            variants={fadeInUp}
            className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E5092D]"
          >
            THE CREATIVE COLLECTION
          </motion.p>

          <motion.h1
            variants={fadeInUp}
            className="mt-7 max-w-[850px] font-serif text-[54px] leading-[1.05] tracking-tight text-[#191919] sm:text-7xl lg:text-[92px]"
          >
            Every talent
            <span className="block italic text-[#E5092D]">
              deserves a stage.
            </span>
          </motion.h1>

          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"
          >
            <p className="max-w-[480px] font-sans text-[15px] leading-[1.9] text-[#77716F]">
              From melodies to photographs, from colours to words. Explore the
              many ways people express what lives inside them.
            </p>

            <a
              href="#stages"
              className="group inline-flex w-fit items-center gap-3.5 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[#191919]"
            >
              Discover the stages
              <motion.span
                whileHover={{ y: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#191919]/20 transition-all duration-300 group-hover:border-[#E5092D] group-hover:bg-[#E5092D] group-hover:text-white group-hover:shadow-md"
              >
                <ArrowDown
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-y-0.5"
                />
              </motion.span>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Four Creative Stages */}
      <div id="stages" className="scroll-mt-20">
        {stages.map((stage) => (
          <StageSection key={stage.id} stage={stage} />
        ))}
      </div>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-[#191919] px-6 py-24 text-center sm:px-10 sm:py-32">
        {/* Ambient Rings */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -left-24 -top-28 h-[380px] w-[380px] rounded-full border border-white"
        />

        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.05, 0.12, 0.05] }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="pointer-events-none absolute -bottom-32 -right-20 h-[380px] w-[380px] rounded-full border border-white"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative mx-auto max-w-[800px]"
        >
          <motion.p
            variants={fadeInUp}
            className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[#FF526B]"
          >
            YOUR TURN TO BE SEEN
          </motion.p>

          <motion.h2
            variants={fadeInUp}
            className="mt-7 font-serif text-5xl leading-[1.1] text-[#F8F7F4] sm:text-7xl"
          >
            You have something
            <span className="block italic text-[#FF526B]">worth sharing.</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-7 max-w-[440px] font-sans text-[15px] leading-[1.9] text-white/60"
          >
            Whatever your expression, there is a place for it here. Come find
            your stage.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-10 flex justify-center">
            <motion.div
              whileHover={{ scale: 1.06, rotate: 0 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="inline-block"
            >
              <Link
                to="/register"
                className="group relative inline-flex -rotate-2 items-center justify-center px-11 py-5 font-serif text-base font-semibold text-white transition-all duration-300 hover:rotate-0 hover:shadow-2xl hover:shadow-red-500/20"
              >
                <svg
                  viewBox="0 0 260 76"
                  className="absolute inset-0 -z-10 h-full w-full overflow-visible transition-transform duration-300 group-hover:scale-105"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 18 C45 7 80 13 120 9 C165 6 213 12 245 16 C256 23 247 34 252 43 C249 57 229 61 205 59 C155 65 101 59 61 64 C27 65 7 59 10 47 C3 37 5 25 12 18Z"
                    fill="#E5092D"
                    className="transition-colors duration-300 group-hover:fill-[#C90024]"
                  />
                </svg>

                <span>Join the stage!</span>

                <ArrowUpRight
                  size={18}
                  className="ml-2.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
};

export default Explore;
