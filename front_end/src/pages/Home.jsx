import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Music2,
  Feather,
  Palette,
  Sparkles,
  Orbit,
  Stars,
} from "lucide-react";

import heroImage from "../assets/hero.png";

const ease = [0.16, 1, 0.3, 1];

const worlds = [
  {
    number: "01",
    name: "Photography",
    category: "CAPTURE THE MOMENT",
    subtitle: "Capture the unseen.",
    description:
      "Every photograph holds a story. Share your perspective, preserve moments, and let the world see through your eyes.",
    icon: Camera,
    accent: "#FF4DB8",
    glow: "rgba(255, 77, 184, 0.18)",
  },
  {
    number: "02",
    name: "Music & Singing",
    category: "FEEL THE RHYTHM",
    subtitle: "Let your melody speak.",
    description:
      "From soulful voices to beautiful compositions, give your music a place to be heard and appreciated.",
    icon: Music2,
    accent: "#FF789A",
    glow: "rgba(255, 120, 154, 0.16)",
  },
  {
    number: "03",
    name: "Poetry & Writing",
    category: "EXPRESS THROUGH WORDS",
    subtitle: "Words have their own world.",
    description:
      "Poetry, stories, shayari, and thoughts. Turn the words within you into something the world can feel.",
    icon: Feather,
    accent: "#FF91C8",
    glow: "rgba(255, 145, 200, 0.18)",
  },
  {
    number: "04",
    name: "Painting & Art",
    category: "CREATE YOUR REALITY",
    subtitle: "Paint beyond imagination.",
    description:
      "A home for artists and dreamers. Bring your imagination to life and let your artwork find its audience.",
    icon: Palette,
    accent: "#FF4DB8",
    glow: "rgba(255, 77, 184, 0.15)",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

function SectionLabel({ children }) {
  return (
    <div className="mb-6 flex items-center gap-3 font-orbitron text-[10px] font-semibold uppercase tracking-[0.32em] text-[#FF4DB8]">
      <span className="h-px w-9 bg-gradient-to-r from-[#FF4DB8] to-[#FF91C8]" />
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#050A30] font-sans text-[#F5F7FF]">
      {/* ========================================================= */}
      {/* 01. HERO SECTION                                          */}
      {/* ========================================================= */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-[#050A30]">
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            src={heroImage}
            alt="Hero background"
            initial={{ scale: 1.15, opacity: 0, filter: "blur(8px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.6, ease }}
            className="h-full w-full object-cover object-center will-change-transform"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#050A30]/95 via-[#050A30]/70 to-[#050A30]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050A30] via-transparent to-[#050A30]/25" />
        </div>

        {/* Subtle atmosphere lights */}
        <div className="pointer-events-none absolute -left-40 top-1/4 h-[400px] w-[400px] rounded-full bg-[#FF4DB8]/15 blur-[130px]" />

        {/* Orbit decoration */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute right-[12%] top-[22%] hidden text-[#FF4DB8]/20 lg:block"
        >
          <Orbit size={150} strokeWidth={0.5} />
        </motion.div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto w-full max-w-[1800px] px-6 pb-24 pt-36 sm:px-10 lg:px-16 xl:px-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-[780px]"
          >
            <motion.div variants={fadeUp}>
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#FF4DB8]/25 bg-[#FF4DB8]/[0.07] px-5 py-2.5 backdrop-blur-md">
                <Sparkles size={14} className="text-[#FF4DB8]" />
                <span className="font-orbitron text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8D8FF]">
                  A Universe of Creativity
                </span>
              </div>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mb-2 font-orbitron text-xs font-medium uppercase tracking-[0.35em] text-[#FF4DB8] sm:text-sm"
            >
              Where creativity comes alive
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-orbitron text-[clamp(4rem,12vw,10rem)] font-bold leading-[0.95] tracking-[-0.07em] text-white"
            >
              Prativa
              <span className="text-[#FF4DB8]">.</span>
            </motion.h1>

            <motion.h2
              variants={fadeUp}
              className="mt-9 max-w-[750px] font-orbitron text-2xl font-medium leading-[1.4] tracking-tight sm:text-3xl lg:text-[45px]"
            >
              Your talent deserves
              <span className="block bg-gradient-to-r from-[#FF4DB8] via-[#FF91C8] to-[#FF789A] bg-clip-text italic text-transparent">
                its own universe.
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-[490px] text-sm leading-8 text-[#C2C9E0] sm:text-base font-light"
            >
              A creative universe for photographers, musicians, writers,
              painters, and dreamers. Share what you create, discover
              extraordinary talent, and let your creativity shine.
            </motion.p>

            {/* Buttons */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center gap-5"
            >
              <Link
                to="/explore"
                className="group inline-flex items-center gap-4 rounded-full bg-gradient-to-r from-[#FF4DB8] to-[#FF789A] px-8 py-4 font-orbitron text-xs font-bold text-white shadow-[0_0_30px_rgba(255,77,184,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,77,184,0.4)]"
              >
                Explore PRATIVA
                <ArrowUpRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>

              <Link
                to="/register"
                className="group inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/[0.04] px-8 py-4 font-orbitron text-xs font-medium text-white backdrop-blur-md transition-all hover:border-[#FF4DB8]/60 hover:bg-[#FF4DB8]/10"
              >
                Showcase Your Talent
                <ArrowRight
                  size={17}
                  className="text-[#FF4DB8] transition-transform group-hover:translate-x-1"
                />
              </Link>
            </motion.div>

            {/* Category indicators */}
            <motion.div
              variants={fadeUp}
              className="mt-16 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-white/10 pt-7"
            >
              {[
                { icon: Camera, name: "Photography" },
                { icon: Music2, name: "Music" },
                { icon: Feather, name: "Poetry" },
                { icon: Palette, name: "Art" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-2.5 text-xs text-[#B4BCD8]"
                  >
                    <Icon size={15} className="text-[#FF4DB8]" />
                    {item.name}
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 font-orbitron text-[9px] uppercase tracking-[0.3em] text-[#AAB3D0] md:flex">
          Discover the universe
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <ArrowDown size={17} className="text-[#FF4DB8]" />
          </motion.div>
        </div>

        <div className="absolute bottom-9 right-10 hidden font-orbitron text-[10px] tracking-[0.3em] text-white/40 md:block">
          01 / 04
        </div>
      </section>

      {/* ========================================================= */}
      {/* 02. FOUR CREATIVE WORLDS                                  */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-[#080F36] py-28 sm:py-32 lg:py-36">
        <div className="pointer-events-none absolute -right-48 top-20 h-[500px] w-[500px] rounded-full bg-[#FF4DB8]/10 blur-[150px]" />
        <div className="pointer-events-none absolute -left-48 bottom-0 h-[450px] w-[450px] rounded-full bg-[#FF789A]/10 blur-[150px]" />

        <div className="relative z-10 mx-auto w-full max-w-[1800px] px-6 sm:px-10 lg:px-16 xl:px-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end"
          >
            <div>
              <motion.div variants={fadeUp}>
                <SectionLabel>Explore your creative side</SectionLabel>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="font-orbitron text-4xl font-semibold leading-[1.3] tracking-tight sm:text-5xl lg:text-[65px]"
              >
                Four worlds.
                <span className="block bg-gradient-to-r from-[#FF4DB8] via-[#FF91C8] to-[#FF789A] bg-clip-text italic text-transparent">
                  One universe.
                </span>
              </motion.h2>
            </div>

            <motion.p
              variants={fadeUp}
              className="max-w-[390px] text-sm leading-8 text-[#AAB3D0]"
            >
              Every talent has a different language. Every creator has a
              different story. Find your world inside PRATIVA.
            </motion.p>
          </motion.div>

          {/* Category cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {worlds.map((world, index) => {
              const Icon = world.icon;

              return (
                <motion.article
                  key={world.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.12,
                    ease,
                  }}
                  whileHover={{ y: -9 }}
                  className="group relative flex min-h-[380px] flex-col overflow-hidden rounded-[25px] border border-white/[0.09] bg-[#0D1747] p-7 transition-all duration-500 hover:border-white/20 sm:min-h-[420px]"
                >
                  <div
                    className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-0 blur-[70px] transition-opacity duration-500 group-hover:opacity-100"
                    style={{ backgroundColor: world.glow }}
                  />

                  <div className="relative flex items-center justify-between">
                    <span className="font-orbitron text-xs tracking-[0.2em] text-[#7886B5]">
                      / {world.number}
                    </span>

                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-500 group-hover:scale-110"
                      style={{
                        color: world.accent,
                        boxShadow: `0 0 25px ${world.glow}`,
                      }}
                    >
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                  </div>

                  <div className="relative mt-auto">
                    <p
                      className="mb-4 font-orbitron text-[9px] font-semibold uppercase tracking-[0.2em]"
                      style={{ color: world.accent }}
                    >
                      {world.category}
                    </p>

                    <h3 className="font-orbitron text-xl font-semibold leading-relaxed tracking-tight text-white sm:text-[22px]">
                      {world.name}
                    </h3>

                    <p
                      className="mt-3 text-sm font-medium"
                      style={{ color: world.accent }}
                    >
                      {world.subtitle}
                    </p>

                    <p className="mt-4 text-[12px] leading-7 text-[#AAB3D0]">
                      {world.description}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <p className="mt-10 text-center text-xs tracking-wide text-[#7480A8]">
            Different expressions. One shared passion.
          </p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 03. ABOUT PRATIVA                                         */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-[#050A30] py-28 sm:py-36">
        <div className="pointer-events-none absolute left-0 top-1/2 h-[450px] w-[450px] -translate-y-1/2 rounded-full bg-[#FF4DB8]/10 blur-[140px]" />
        <div className="pointer-events-none absolute right-0 top-0 h-[350px] w-[350px] rounded-full bg-[#FF789A]/10 blur-[130px]" />

        <div className="relative z-10 mx-auto grid w-full max-w-[1600px] items-center gap-16 px-6 sm:px-10 lg:grid-cols-2 lg:gap-24 lg:px-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>More than a platform</SectionLabel>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-orbitron text-4xl font-semibold leading-[1.3] tracking-tight sm:text-5xl lg:text-[60px]"
            >
              Your talent.
              <span className="block italic text-[#FF4DB8]">
                Your identity.
              </span>
              <span className="block text-white">Your universe.</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-9 max-w-[500px] text-sm leading-8 text-[#AAB3D0] sm:text-base font-light"
            >
              We believe extraordinary talent exists everywhere. Sometimes it
              lives in a photograph, sometimes in a melody, sometimes in words
              that touch a heart, or colours that bring imagination to life.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-[500px] text-sm leading-8 text-[#AAB3D0] sm:text-base font-light"
            >
              PRATIVA brings creative people together and gives their work a
              place to be discovered, appreciated and celebrated.
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link
                to="/explore"
                className="group mt-10 inline-flex items-center gap-4 font-orbitron text-xs font-semibold text-[#FF4DB8] transition-colors hover:text-[#FF91C8]"
              >
                Discover our story
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-2"
                />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease }}
            className="relative mx-auto flex aspect-square w-full max-w-[480px] items-center justify-center select-none"
          >
            <div className="absolute inset-5 rounded-full border border-[#FF4DB8]/15" />
            <div className="absolute inset-12 rounded-full border border-dashed border-[#FF91C8]/30" />
            <div className="absolute inset-20 rounded-full border border-[#FF789A]/15" />
            <div className="absolute h-64 w-64 rounded-full bg-[#FF4DB8]/20 blur-[90px]" />

            <div className="relative z-10 text-center">
              <div className="mb-5 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FF4DB8]/30 bg-[#FF4DB8]/10 shadow-[0_0_35px_rgba(255,77,184,0.15)]">
                  <Sparkles size={31} className="text-[#FF4DB8]" />
                </div>
              </div>

              <h3 className="font-orbitron text-5xl font-bold tracking-[-0.06em] text-white sm:text-6xl">
                Prativa<span className="text-[#FF789A]">.</span>
              </h3>

              <p className="mt-4 font-orbitron text-[9px] uppercase tracking-[0.25em] text-[#AAB3D0]">
                Every talent matters
              </p>
            </div>

            {[
              {
                icon: Camera,
                position: "left-2 top-[24%]",
                color: "#FF4DB8",
              },
              {
                icon: Music2,
                position: "right-1 top-[25%]",
                color: "#FF789A",
              },
              {
                icon: Feather,
                position: "bottom-[20%] left-4",
                color: "#FF91C8",
              },
              {
                icon: Palette,
                position: "bottom-[18%] right-4",
                color: "#FF4DB8",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 3 + index,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`absolute ${item.position} z-20 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0D1747]/90 shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-lg`}
                  style={{ color: item.color }}
                >
                  <Icon size={23} strokeWidth={1.5} />
                </motion.div>
              );
            })}

            <div className="absolute right-[20%] top-[8%] text-[#FF91C8]/70">
              <Stars size={19} />
            </div>

            <div className="absolute bottom-[9%] left-[30%] text-[#FF4DB8]/60">
              <Sparkles size={17} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 04. FINAL CTA                                             */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-[#080F36] px-6 py-32 sm:py-40">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF4DB8]/15 blur-[150px]" />
        <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#FF4DB8]/50 to-transparent" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="relative z-10 mx-auto max-w-[1100px] text-center"
        >
          <motion.div variants={fadeUp} className="mb-9 flex justify-center">
            <div className="flex items-center gap-3 rounded-full border border-[#FF4DB8]/40 bg-[#FF4DB8]/10 px-5 py-2.5">
              <Sparkles size={14} className="text-[#FF91C8]" />
              <span className="font-orbitron text-[9px] font-semibold uppercase tracking-[0.2em] text-[#FFD1E9]">
                Your journey starts here
              </span>
            </div>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="font-orbitron text-4xl font-semibold leading-[1.35] tracking-tight sm:text-6xl lg:text-[75px]"
          >
            The world deserves
            <span className="block bg-gradient-to-r from-[#FF4DB8] via-[#FF91C8] to-[#FF789A] bg-clip-text italic text-transparent">
              to see your talent.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-8 max-w-[540px] text-sm leading-8 text-[#AAB3D0] sm:text-base font-light"
          >
            Don't let your creativity remain unseen. Share your work, discover
            other creators and become part of a universe that celebrates every
            form of talent.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap justify-center gap-5"
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-4 rounded-full bg-gradient-to-r from-[#FF4DB8] to-[#FF789A] px-9 py-4 font-orbitron text-xs font-bold text-white shadow-[0_0_35px_rgba(255,77,184,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_45px_rgba(255,77,184,0.4)]"
            >
              Become a Creator
              <ArrowUpRight
                size={18}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>

            <Link
              to="/explore"
              className="inline-flex items-center gap-3 rounded-full border border-white/20 px-9 py-4 font-orbitron text-xs font-medium text-white transition-all hover:border-[#FF4DB8]/60 hover:bg-[#FF4DB8]/10"
            >
              Explore Talents
              <ArrowRight size={17} className="text-[#FF4DB8]" />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
