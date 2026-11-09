import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Music2,
  Palette,
  PenLine,
  Eye,
  Heart,
  Layers3,
  Sparkles,
  Orbit,
  Quote,
  MoveUpRight,
  GitBranch,
  Stars,
} from "lucide-react";

const disciplines = [
  {
    number: "01",
    title: "Voice",
    nepali: "स्वर",
    description: "Music, singing, spoken word and the sounds people create.",
    icon: Music2,
    accent: "#B7FF3F",
    glow: "rgba(183,255,63,0.12)",
    symbol: "SOUND",
  },
  {
    number: "02",
    title: "Vision",
    nepali: "दृष्टि",
    description: "Photography, filmmaking and visual storytelling.",
    icon: Camera,
    accent: "#00D4FF",
    glow: "rgba(0,212,255,0.13)",
    symbol: "PERSPECTIVE",
  },
  {
    number: "03",
    title: "Art",
    nepali: "कला",
    description: "Painting, drawing, illustration and visual expression.",
    icon: Palette,
    accent: "#FF91C8",
    glow: "rgba(255,145,200,0.13)",
    symbol: "EXPRESSION",
  },
  {
    number: "04",
    title: "Words",
    nepali: "शब्द",
    description: "Poetry, writing, stories and ideas worth sharing.",
    icon: PenLine,
    accent: "#BD91FF",
    glow: "rgba(189,145,255,0.13)",
    symbol: "IMAGINATION",
  },
];

const principles = [
  {
    number: "01",
    icon: Eye,
    title: "Expression over popularity",
    description:
      "Creative work deserves attention for what it is, not simply for how many people engage with it.",
    accent: "#00D4FF",
  },
  {
    number: "02",
    icon: Heart,
    title: "Room for every creator",
    description:
      "You don't need a professional title or an established audience to have something worth sharing.",
    accent: "#FF91C8",
  },
  {
    number: "03",
    icon: Layers3,
    title: "Different forms, one space",
    description:
      "Prativa brings different creative disciplines together without making them compete for attention.",
    accent: "#B7FF3F",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.13,
    },
  },
};

function SectionLabel({ number, children }) {
  return (
    <div className="mb-7 flex items-center gap-3">
      <span className="font-mono text-[10px] text-[#00D4FF]">{number}</span>
      <span className="h-px w-8 bg-[#00D4FF]/60" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.27em] text-white/45">
        {children}
      </p>
    </div>
  );
}

export default function About() {
  return (
    <main className="relative overflow-hidden bg-[#050A30] text-[#F5F7FF]">
      {/* =====================================
          GLOBAL BACKGROUND
      ===================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 top-40 h-[600px] w-[600px] rounded-full bg-[#6936D8]/10 blur-[160px]" />

        <div className="absolute right-[-200px] top-[35%] h-[600px] w-[600px] rounded-full bg-[#00D4FF]/10 blur-[160px]" />

        <div className="absolute bottom-0 left-[20%] h-[500px] w-[500px] rounded-full bg-[#B7FF3F]/[0.04] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "65px 65px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
      </div>

      {/* =====================================
          01. HERO / MANIFESTO
      ===================================== */}

      <section className="relative flex min-h-[85vh] items-center px-6 pb-24 pt-36 sm:px-10 lg:min-h-[780px] lg:px-16 xl:px-24">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-16 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="relative z-10"
          >
            <motion.div variants={fadeUp}>
              <div className="mb-9 inline-flex items-center gap-3 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/[0.06] px-5 py-2.5">
                <Sparkles size={14} className="text-[#00D4FF]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B5C6E7]">
                  THE STORY OF PRATIVA
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-serif text-[clamp(4rem,9vw,9rem)] leading-[0.88] tracking-[-0.075em]"
            >
              Creativity
              <span className="block italic text-[#00D4FF]">has no</span>
              <span className="block">
                boundaries<span className="text-[#B7FF3F]">.</span>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-10 max-w-[570px] text-sm leading-8 text-[#AAB3D0] sm:text-base"
            >
              Prativa is a creative platform built to bring different forms of
              talent together. A place where people can share what they make,
              explore what others create, and let their work speak for itself.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center gap-7"
            >
              <Link
                to="/explore"
                className="group inline-flex items-center gap-4 rounded-full bg-[#B7FF3F] px-8 py-4 text-xs font-bold text-[#050A30] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(183,255,63,0.25)]"
              >
                Discover Prativa
                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>

              <span className="font-serif text-sm italic text-white/40">
                Where talent leaves its mark.
              </span>
            </motion.div>
          </motion.div>

          {/* HERO ORBIT */}

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="relative mx-auto flex aspect-square w-full max-w-[490px] items-center justify-center"
          >
            <div className="absolute inset-[8%] rounded-full border border-white/[0.08]" />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 65,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-[1%] rounded-full border border-dashed border-[#00D4FF]/20"
            >
              <span className="absolute left-[15%] top-[15%] h-3 w-3 rounded-full bg-[#00D4FF] shadow-[0_0_20px_#00D4FF]" />
            </motion.div>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{
                duration: 45,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-[20%] rounded-full border border-[#B7FF3F]/20"
            >
              <span className="absolute bottom-[10%] right-[15%] h-2.5 w-2.5 rounded-full bg-[#B7FF3F] shadow-[0_0_20px_#B7FF3F]" />
            </motion.div>

            <div className="absolute inset-[22%] rounded-full bg-[#6936D8]/20 blur-[70px]" />

            <div className="relative z-10 text-center">
              <Orbit
                size={52}
                strokeWidth={0.8}
                className="mx-auto mb-7 text-[#00D4FF]"
              />

              <p className="font-serif text-[clamp(3.5rem,7vw,6rem)] leading-none tracking-[-0.08em]">
                Prativa<span className="text-[#B7FF3F]">.</span>
              </p>

              <p className="mt-5 text-[9px] uppercase tracking-[0.38em] text-white/45">
                प्रतिभा
              </p>

              <p className="mt-9 font-serif text-sm italic text-[#AAB3D0]">
                Every talent matters.
              </p>
            </div>

            <div className="absolute left-0 top-[25%] rounded-full border border-white/10 bg-[#080F36]/80 px-4 py-2 backdrop-blur-xl">
              <Music2 size={16} className="text-[#B7FF3F]" />
            </div>

            <div className="absolute right-0 top-[35%] rounded-full border border-white/10 bg-[#080F36]/80 px-4 py-2 backdrop-blur-xl">
              <Camera size={16} className="text-[#00D4FF]" />
            </div>

            <div className="absolute bottom-[15%] left-[10%] rounded-full border border-white/10 bg-[#080F36]/80 px-4 py-2 backdrop-blur-xl">
              <Palette size={16} className="text-[#FF91C8]" />
            </div>

            <div className="absolute bottom-[12%] right-[12%] rounded-full border border-white/10 bg-[#080F36]/80 px-4 py-2 backdrop-blur-xl">
              <PenLine size={16} className="text-[#BD91FF]" />
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-6 right-6 mx-auto flex max-w-[1600px] items-center justify-between border-t border-white/10 py-6 sm:left-10 sm:right-10 lg:left-16 lg:right-16 xl:left-24 xl:right-24">
          <p className="text-[9px] uppercase tracking-[0.24em] text-white/35">
            An independent creative platform
          </p>

          <p className="font-serif text-sm italic text-white/45">
            Voice · Vision · Art · Words
          </p>
        </div>
      </section>

      {/* =====================================
          02. THE IDEA
      ===================================== */}

      <section className="relative px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
        <div className="mx-auto grid max-w-[1450px] gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <SectionLabel number="01">THE IDEA</SectionLabel>

            <h2 className="max-w-[560px] font-serif text-5xl leading-[1.08] tracking-tight sm:text-7xl">
              One space.
              <span className="block italic text-[#00D4FF]">Endless</span>
              expressions.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex flex-col justify-center"
          >
            <p className="font-serif text-2xl leading-relaxed text-white/90 sm:text-3xl">
              It is a space for creative work to exist beyond the boundaries of
              a single discipline.
            </p>

            <p className="mt-8 text-sm leading-8 text-[#AAB3D0]">
              A photographer and a poet may see the world differently. A
              musician and a painter may express themselves in completely
              different ways. But they share one thing: the need to create and
              the desire to be heard or seen.
            </p>

            <p className="mt-5 text-sm leading-8 text-[#AAB3D0]">
              Prativa brings these expressions into one place. Members can
              publish their work, discover creations from other disciplines, and
              find an audience that appreciates creativity in its many forms.
            </p>

            <p className="mt-5 text-sm leading-8 text-[#AAB3D0]">
              It is not limited to professionals. Beginners, independent
              artists, hobbyists and experienced creators all have a place here.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =====================================
          03. WHY PRATIVA
      ===================================== */}

      <section className="relative overflow-hidden border-y border-white/[0.08] bg-[#080F36]/80 px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
        <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#6936D8]/10 blur-[130px]" />

        <div className="relative mx-auto grid max-w-[1450px] gap-16 lg:grid-cols-2 lg:gap-28">
          <div>
            <SectionLabel number="02">WHY IT EXISTS</SectionLabel>

            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="max-w-[600px] font-serif text-5xl leading-[1.08] sm:text-7xl"
            >
              Not everything is about
              <span className="block italic text-[#B7FF3F]">
                being noticed.
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex flex-col justify-center"
          >
            <p className="text-sm leading-8 text-[#AAB3D0]">
              Creative people often share their work across scattered platforms,
              where different kinds of expression can get lost among trends,
              algorithms and the pressure to constantly gain attention.
            </p>

            <p className="mt-6 text-sm leading-8 text-[#AAB3D0]">
              Prativa exists to offer a more focused alternative: a shared
              creative space where the work itself matters. Not everyone creates
              for fame. Sometimes, people simply want to express something,
              improve their craft or connect with others who appreciate what
              they do.
            </p>

            <div className="mt-12 rounded-2xl border border-[#B7FF3F]/20 bg-[#B7FF3F]/[0.04] p-7 sm:p-9">
              <Quote size={25} className="mb-5 text-[#B7FF3F]" />

              <p className="font-serif text-2xl italic leading-relaxed text-white sm:text-3xl">
                The value of creativity shouldn't be measured only by numbers.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================
          04. FOUR DISCIPLINES
      ===================================== */}

      <section className="relative px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
        <div className="mx-auto max-w-[1450px]">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <SectionLabel number="03">THE CREATIVE WORLDS</SectionLabel>

              <h2 className="font-serif text-5xl leading-[1.08] sm:text-7xl">
                Four ways to
                <span className="block italic text-[#00D4FF]">
                  leave a mark.
                </span>
              </h2>
            </div>

            <p className="max-w-[390px] text-sm leading-8 text-[#AAB3D0]">
              Creativity doesn't follow one format. Prativa welcomes different
              disciplines and the people behind them.
            </p>
          </div>

          <div className="mt-20 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {disciplines.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.article
                  key={item.number}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.65,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -9 }}
                  className="group relative min-h-[340px] overflow-hidden rounded-2xl border border-white/10 bg-[#080F36]/70 p-7 transition-colors duration-500 hover:border-white/20 sm:p-8"
                >
                  <div
                    className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-0 blur-[70px] transition-opacity duration-500 group-hover:opacity-100"
                    style={{ backgroundColor: item.glow }}
                  />

                  <div className="relative flex items-center justify-between">
                    <span className="font-mono text-xs text-white/35">
                      / {item.number}
                    </span>

                    <Icon
                      size={24}
                      strokeWidth={1.3}
                      style={{ color: item.accent }}
                    />
                  </div>

                  <div className="relative mt-20">
                    <p
                      className="font-serif text-lg italic"
                      style={{ color: item.accent }}
                    >
                      {item.nepali}
                    </p>

                    <h3 className="mt-2 font-serif text-4xl tracking-tight text-white">
                      {item.title}
                    </h3>

                    <p className="mt-5 text-xs leading-7 text-[#AAB3D0]">
                      {item.description}
                    </p>
                  </div>

                  <div className="absolute bottom-7 right-7">
                    <span
                      className="text-[8px] font-semibold uppercase tracking-[0.2em]"
                      style={{ color: item.accent }}
                    >
                      {item.symbol}
                    </span>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <div className="mt-10 flex justify-end">
            <Link
              to="/explore"
              className="group inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#00D4FF] transition-colors hover:text-white"
            >
              Explore all dimensions
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================
          05. PRINCIPLES
      ===================================== */}

      <section className="relative bg-[#080F36]/75 px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
        <div className="mx-auto max-w-[1450px]">
          <SectionLabel number="04">WHAT WE BELIEVE</SectionLabel>

          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <h2 className="max-w-[750px] font-serif text-5xl leading-[1.08] sm:text-7xl">
              Built around
              <span className="block italic text-[#BD91FF]">what matters.</span>
            </h2>

            <p className="max-w-[330px] text-sm leading-7 text-[#AAB3D0]">
              The thinking behind a platform that puts creativity before
              competition.
            </p>
          </div>

          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {principles.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.article
                  key={item.number}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: index * 0.12 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 transition-all duration-300 hover:bg-white/[0.05] sm:p-10"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-white/35">
                      {item.number}
                    </span>

                    <Icon
                      size={25}
                      strokeWidth={1.3}
                      style={{ color: item.accent }}
                    />
                  </div>

                  <h3 className="mt-12 font-serif text-3xl leading-tight">
                    {item.title}
                  </h3>

                  <p className="mt-5 text-sm leading-8 text-[#AAB3D0]">
                    {item.description}
                  </p>

                  <div
                    className="mt-9 h-[2px] w-10 rounded-full"
                    style={{ backgroundColor: item.accent }}
                  />
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================
          06. THE FOUNDER
      ===================================== */}

      <section className="relative overflow-hidden px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
        <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#00D4FF]/[0.07] blur-[140px]" />

        <div className="relative mx-auto grid max-w-[1350px] items-center gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          {/* PROFILE IMAGE */}

          {/* PROFILE IMAGE */}

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto flex w-full max-w-[430px] items-center justify-center"
          >
            {/* Outer decorative ring */}
            <div className="absolute h-[340px] w-[340px] rounded-full border border-[#00D4FF]/20 rotate-12 sm:h-[410px] sm:w-[410px]" />

            {/* Glowing background */}
            <div className="absolute h-[300px] w-[300px] rounded-full bg-[#00D4FF]/10 blur-[90px] sm:h-[360px] sm:w-[360px]" />

            {/* Circular profile image */}
            <div className="relative h-[280px] w-[280px] overflow-hidden rounded-full border-2 border-[#00D4FF]/40 bg-[#080F36] shadow-[0_0_45px_rgba(0,212,255,0.15)] sm:h-[340px] sm:w-[340px]">
              <img
                src="https://avatars.githubusercontent.com/u/281124027?v=4"
                alt="sandyway"
                loading="lazy"
                className="h-full w-full rounded-full object-cover object-center transition-transform duration-700 hover:scale-110"
              />

              {/* Subtle image overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-[#050A30]/60 via-transparent to-transparent" />
            </div>

            {/* Floating founder label */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#00D4FF]/25 bg-[#080F36] px-6 py-3 shadow-xl backdrop-blur-xl">
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#00D4FF]">
                THE MIND BEHIND PRATIVA
              </p>
            </div>

            {/* Floating decorative icon */}
            <div className="absolute right-2 top-8 rounded-2xl border border-white/10 bg-[#080F36] p-4 shadow-2xl sm:right-0">
              <Stars size={23} className="text-[#B7FF3F]" />
            </div>
          </motion.div>

          {/* FOUNDER STORY */}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel number="05">BEHIND THE UNIVERSE</SectionLabel>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-serif text-5xl leading-[1.08] tracking-tight sm:text-7xl"
            >
              An idea brought
              <span className="block italic text-[#00D4FF]">to life.</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-9 text-sm leading-8 text-[#AAB3D0]"
            >
              I'm sandyway, an independent developer from Nepal and the person
              behind Prativa.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-5 text-sm leading-8 text-[#AAB3D0]"
            >
              I built Prativa with a simple intention: to create a space where
              creativity isn't confined to one form. Whether it's music,
              photography, art or writing, every expression deserves a place to
              exist and be appreciated.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-5 text-sm leading-8 text-[#AAB3D0]"
            >
              Prativa is my attempt to bring those different worlds together.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center gap-5"
            >
              <a
                href="https://github.com/sandyway"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3 text-xs font-semibold text-white/80 transition-all hover:border-[#00D4FF]/50 hover:text-[#00D4FF]"
              >
                <GitBranch size={17} />
                Find me on GitHub
                <MoveUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-12 border-t border-white/10 pt-7"
            >
              <p className="font-serif text-xl italic text-white/75">
                "Where talent leaves its mark."
              </p>

              <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.23em] text-[#00D4FF]">
                sandyway · Founder of Prativa
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =====================================
          07. FINAL CALL TO ACTION
      ===================================== */}

      <section className="relative overflow-hidden px-6 py-28 sm:px-10 lg:px-16 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-[#101C52] via-[#080F36] to-[#100B38]" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D4FF]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-[1100px] text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              className="mb-9 flex items-center justify-center gap-3"
            >
              <span className="h-px w-9 bg-[#B7FF3F]/60" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B7FF3F]">
                YOUR JOURNEY STARTS HERE
              </span>

              <span className="h-px w-9 bg-[#B7FF3F]/60" />
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-serif text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.95] tracking-[-0.06em]"
            >
              Your talent
              <span className="block italic text-[#00D4FF]">belongs here.</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-[540px] text-sm leading-8 text-[#AAB3D0]"
            >
              Explore different expressions of creativity, discover inspiring
              creators, and find a place for your own work.
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link
                to="/explore"
                className="group mt-12 inline-flex items-center gap-5 rounded-full bg-[#B7FF3F] px-9 py-5 text-xs font-bold text-[#050A30] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(183,255,63,0.25)]"
              >
                Explore Prativa
                <ArrowUpRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </motion.div>
          </motion.div>

          <div className="mt-24 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-8 text-[9px] uppercase tracking-[0.2em] text-white/35 sm:flex-row">
            <span>PRATIVA © 2026</span>

            <span>Ordinary becomes extraordinary.</span>

            <span>Made with creativity in Nepal.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
