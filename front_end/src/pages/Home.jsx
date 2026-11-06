import { Link } from "react-router-dom";
import { ArrowRight, Camera, Users, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";

import heroImage from "../assets/hero.png";
import sectionImage from "../assets/section.png";

// ================= ANIMATION VARIANTS =================

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
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
      delayChildren: 0.1,
    },
  },
};

// ================= PAINT DECORATION =================

const PaintSplash = ({
  className = "",
  variant = 1,
  float = false,
  floatDuration = 7,
}) => {
  const paths = [
    <>
      <path d="M15 155 C115 75 205 185 310 92 S480 30 575 65" />
      <path d="M5 180 C115 110 195 205 320 125 S470 65 590 95" />
      <path d="M35 205 C145 140 210 220 330 150" />
    </>,
    <>
      <path d="M15 100 C120 150 170 20 285 90 S440 175 575 65" />
      <path d="M20 130 C120 180 180 55 295 115 S450 200 590 95" />
      <path d="M65 160 C160 205 210 105 330 145" />
    </>,
  ];

  return (
    <motion.svg
      viewBox="0 0 600 240"
      fill="none"
      className={`pointer-events-none absolute ${className}`}
      aria-hidden="true"
      {...(float
        ? {
            animate: {
              y: [-6, 6, -6],
              rotate: [-2, 2, -2],
            },
            transition: {
              duration: floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }
        : {})}
    >
      <g
        stroke="#FF1744"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".9"
      >
        {paths[(variant - 1) % 2]}
      </g>

      <g fill="#FF1744">
        <circle cx="75" cy="45" r="5" />
        <circle cx="115" cy="28" r="2.5" />
        <circle cx="175" cy="210" r="4" />
        <circle cx="225" cy="35" r="3" />
        <circle cx="400" cy="205" r="5" />
        <circle cx="455" cy="25" r="2.5" />
        <circle cx="525" cy="175" r="4" />
        <circle cx="560" cy="145" r="2" />
      </g>
    </motion.svg>
  );
};

// ================= FEATURES =================

const features = [
  {
    icon: Camera,
    title: "Showcase Talent",
    description:
      "Share your photographs, artwork, and creativity with the world.",
  },
  {
    icon: Users,
    title: "Discover Creators",
    description: "Find extraordinary artists, photographers, and storytellers.",
  },
  {
    icon: Sparkles,
    title: "Get Inspired",
    description:
      "Explore fresh ideas, creative journeys, and new perspectives.",
  },
  {
    icon: Heart,
    title: "Be Part of Prativa",
    description: "Join a community that celebrates creativity in every form.",
  },
];

// ================= HOME PAGE =================

const Home = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F7F4] text-[#191919]">
      {/* ================= HERO SECTION ================= */}

      <section className="relative isolate flex min-h-screen items-center overflow-hidden">
        {/* Cinematic hero background entry */}
        <motion.img
          src={heroImage}
          alt="Prativa artistic creative collage"
          fetchPriority="high"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[62%_center] md:object-center"
        />

        {/* Soft overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#F8F7F4] via-[#F8F7F4]/90 to-transparent md:via-[#F8F7F4]/70"
        />

        <div className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-32 sm:px-10 lg:px-14">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-[620px]"
          >
            {/* Brand introduction */}
            <motion.div
              variants={fadeInUp}
              className="mb-8 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#77716F]"
            >
              <span className="h-[1px] w-9 bg-[#FF1744]" />
              Voice <span className="text-[#FF1744]">/</span>
              Vision <span className="text-[#FF1744]">/</span>
              Art <span className="text-[#FF1744]">/</span>
              Words
            </motion.div>

            {/* Brand name */}
            <motion.h1
              variants={fadeInUp}
              className="font-serif text-[76px] font-semibold leading-[0.95] tracking-[-4px] text-[#191919] sm:text-[100px] lg:text-[120px]"
            >
              PRATIVA
            </motion.h1>

            {/* Brand tagline */}
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#E5092D]"
            >
              Where talent leaves its mark.
            </motion.p>

            {/* Main heading */}
            <motion.h2
              variants={fadeInUp}
              className="mt-9 max-w-[570px] font-serif text-[37px] leading-[1.12] tracking-[-1.5px] text-[#202020] sm:text-[47px] lg:text-[55px]"
            >
              A space for your{" "}
              <span className="block italic text-[#E5092D]">
                voice, vision, art,
              </span>
              and words.
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="mt-7 max-w-[440px] text-[15px] leading-[1.9] text-[#514C48] sm:text-base"
            >
              From melodies and photographs to poetry and paintings, bring your
              creativity into a space where every expression has room to be
              seen, heard, and appreciated.
            </motion.p>

            {/* Actions */}
            <motion.div variants={fadeInUp} className="mt-12 flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  to="/explore"
                  className="group relative inline-flex items-center justify-center px-12 py-7 text-white"
                >
                  <svg
                    viewBox="0 0 320 100"
                    preserveAspectRatio="none"
                    className="absolute -inset-[5%] h-[110%] w-[110%] overflow-visible transition-transform duration-300 group-hover:scale-105"
                  >
                    <g transform="rotate(-3 160 50)">
                      {/* Main irregular brush stroke */}
                      <path
                        d="M12 27
               C35 17 57 23 83 17
               C122 10 151 19 190 13
               C230 10 273 16 305 25
               L296 38
               C309 45 301 54 289 60
               L306 76
               C269 83 236 75 199 84
               C157 91 119 80 83 87
               C52 92 26 83 10 78
               C18 65 4 57 13 47
               C4 39 6 33 12 27Z"
                        fill="#E5092D"
                      />

                      {/* Dry brush edges */}
                      <path
                        d="M19 24 C66 14 105 22 148 16 S246 17 292 24"
                        fill="none"
                        stroke="#FF5269"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        opacity="0.65"
                      />

                      <path
                        d="M20 81 C64 88 106 78 151 85 S245 77 292 73"
                        fill="none"
                        stroke="#A90020"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        opacity="0.5"
                      />

                      {/* Fine brush streaks */}
                      <path
                        d="M30 18 L65 15 M255 19 L287 23 M28 85 L58 89 M270 78 L300 73"
                        fill="none"
                        stroke="#E5092D"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                  </svg>

                  <span className="relative z-10 whitespace-nowrap text-[15px] font-semibold tracking-wide">
                    Find Your Stage
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Expanding bottom accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          style={{ originX: 0 }}
          className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#FF1744] via-[#FF1744]/30 to-transparent"
        />
      </section>

      {/* ================= FEATURES SECTION ================= */}

      <section className="relative isolate overflow-hidden border-b border-black/[0.07] bg-[#F8F7F4] px-6 py-14 sm:px-10 lg:px-14 lg:py-16">
        <PaintSplash
          variant={1}
          float
          floatDuration={8}
          className="-left-24 top-[-65px] w-[360px] -rotate-12 opacity-[0.12]"
        />

        <PaintSplash
          variant={2}
          float
          floatDuration={9}
          className="-right-28 bottom-[-100px] w-[420px] rotate-12 opacity-[0.13]"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative mx-auto grid max-w-[1350px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className={`group relative flex flex-col items-center px-6 py-7 text-center transition-shadow lg:py-3 ${
                  index !== 3 ? "lg:border-r lg:border-black/15" : ""
                }`}
              >
                <PaintSplash
                  variant={(index % 2) + 1}
                  className="-top-5 left-1/2 w-[125px] -translate-x-1/2 opacity-0 transition-all duration-300 group-hover:scale-110 group-hover:opacity-30"
                />

                <motion.div
                  whileHover={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.4 }}
                  className="relative mb-5 flex h-12 w-12 items-center justify-center"
                >
                  <div className="absolute inset-0 rounded-full bg-[#FF1744]/0 transition-colors duration-300 group-hover:bg-[#FF1744]/10" />

                  <Icon
                    size={30}
                    strokeWidth={1.35}
                    className="relative transition-colors duration-300 group-hover:text-[#FF1744]"
                  />
                </motion.div>

                <h3 className="font-serif text-[21px] tracking-tight">
                  {feature.title}
                </h3>

                <p className="mt-2 max-w-[230px] text-[13px] leading-6 text-[#77716F]">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ================= CREATIVE COLLECTIVE ================= */}

      <section className="relative isolate flex min-h-[590px] items-center overflow-hidden lg:min-h-[650px]">
        <motion.img
          src={sectionImage}
          alt="Creative photography collage with camera and sketchbook"
          loading="lazy"
          initial={{ scale: 1.06 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#F8F7F4] via-[#F8F7F4]/90 to-transparent md:via-[#F8F7F4]/65" />

        <PaintSplash
          variant={2}
          float
          floatDuration={8}
          className="-right-24 top-4 w-[420px] rotate-12 opacity-40"
        />

        <PaintSplash
          variant={1}
          float
          floatDuration={10}
          className="-bottom-20 right-10 w-[370px] -rotate-12 opacity-35"
        />

        <div className="relative mx-auto w-full max-w-[1440px] px-6 py-24 sm:px-10 lg:px-14">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-[440px]"
          >
            <motion.div
              variants={fadeInUp}
              className="mb-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-[#B20B28]"
            >
              More than a platform
              <span className="h-px w-10 bg-[#FF1744]" />
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="font-serif text-[54px] leading-[0.98] tracking-[-2px] sm:text-[68px]"
            >
              A Creative
              <span className="block italic text-[#E5092D]">Collective.</span>
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="mt-7 text-[15px] leading-7 text-[#45413F] sm:text-base"
            >
              Prativa is a home for dreamers, creators, and storytellers. A
              space where art, ideas, and imagination come together to inspire
              something extraordinary.
            </motion.p>

            <motion.div variants={fadeInUp}>
              <Link
                to="/about"
                className="group mt-9 inline-flex items-center gap-4 rounded-full border border-[#242424] px-6 py-3 text-sm transition-all duration-300 hover:border-[#E5092D] hover:bg-[#E5092D] hover:text-white hover:shadow-lg hover:shadow-red-500/10 active:scale-95"
              >
                Learn More
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1.5"
                />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= JOIN PRATIVA SECTION ================= */}

      <section className="relative isolate overflow-hidden border-y border-black/[0.05] bg-[#EEECE8] px-6 py-24 sm:px-10 lg:px-14 lg:py-32">
        <PaintSplash
          variant={1}
          float
          floatDuration={10}
          className="-right-36 -top-20 w-[650px] rotate-12 opacity-30"
        />

        <PaintSplash
          variant={2}
          float
          floatDuration={9}
          className="-bottom-24 -left-28 w-[480px] -rotate-12 opacity-20"
        />

        {/* Ambient pulsing rings */}
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-20 -top-40 h-[400px] w-[400px] rounded-full border border-[#FF1744]/25"
        />

        <motion.div
          animate={{ scale: [1, 1.09, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="pointer-events-none absolute -right-10 -top-32 h-[320px] w-[320px] rounded-full border border-[#FF1744]/20"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative mx-auto flex max-w-[1350px] flex-col items-start justify-between gap-12 lg:flex-row lg:items-center"
        >
          <div className="max-w-[700px]">
            <motion.p
              variants={fadeInUp}
              className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-[#B20B28]"
            >
              Your creativity deserves a stage
            </motion.p>

            <motion.h2
              variants={fadeInUp}
              className="font-serif text-[52px] leading-[1.02] tracking-[-2px] sm:text-[68px] lg:text-[78px]"
            >
              Share Your Art
              <span className="block italic text-[#E5092D]">
                with the World.
              </span>
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="mt-7 max-w-[490px] text-[15px] leading-7 text-[#625D59]"
            >
              Every creator has a story worth telling. Create your space,
              showcase your work, and let the world discover what makes you
              different.
            </motion.p>
          </div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-start gap-5 lg:items-end"
          >
            <motion.div
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                to="/register"
                className="group inline-flex items-center gap-5 rounded-full bg-[#E5092D] px-8 py-5 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#C90024] hover:shadow-xl hover:shadow-red-500/25"
              >
                Join Prativa
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1.5"
                />
              </Link>
            </motion.div>

            <span className="font-serif text-sm italic text-[#77716F]">
              Your journey starts here.
            </span>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
};

export default Home;
