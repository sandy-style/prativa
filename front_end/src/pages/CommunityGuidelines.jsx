import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  Heart,
  Copyright,
  Eye,
  MessageCircle,
  Ban,
  Flag,
  Users,
  Scale,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";

const guidelines = [
  {
    id: "respect",
    number: "01",
    title: "Respect Every Creator",
    subtitle: "A creative community begins with mutual respect.",
    icon: Heart,
    color: "pink",
    rules: [
      "Treat every creator with kindness and consideration.",
      "Do not harass, bully, threaten, or intimidate other members.",
      "Do not publish hateful, discriminatory, or degrading content.",
      "Respect different perspectives, backgrounds, and creative expressions.",
      "Do not use comments or interactions to deliberately humiliate others.",
    ],
    note: "Different perspectives make a creative community stronger. Harassment does not.",
  },
  {
    id: "originality",
    number: "02",
    title: "Respect Creative Ownership",
    subtitle: "Every creation has a creator. Give credit where it belongs.",
    icon: Copyright,
    color: "purple",
    rules: [
      "Share work that you created or have permission to publish.",
      "Do not claim another person's artwork, photography, music, or writing as your own.",
      "Give proper credit when using or referencing another creator's work.",
      "Do not upload copyrighted material without the necessary rights or permission.",
      "Respect intellectual property and legitimate copyright claims.",
    ],
    note: "PRATIVA celebrates originality. Plagiarism has no place in our community.",
  },
  {
    id: "appropriate",
    number: "03",
    title: "Keep Content Appropriate",
    subtitle: "Creative freedom comes with responsibility.",
    icon: Eye,
    color: "orange",
    rules: [
      "Do not publish sexually explicit or exploitative content.",
      "Do not share content promoting violence, abuse, or harm.",
      "Never upload content that exploits, endangers, or targets minors.",
      "Do not publish graphic material intended to shock, threaten, or harass others.",
      "Do not use creative submissions to promote illegal activities.",
    ],
    note: "Content that threatens community safety may be removed.",
  },
  {
    id: "spam",
    number: "04",
    title: "No Spam or Manipulation",
    subtitle: "Keep PRATIVA authentic and meaningful.",
    icon: Ban,
    color: "pink",
    rules: [
      "Do not flood the platform with repetitive or irrelevant content.",
      "Do not use fake accounts to manipulate likes, comments, or engagement.",
      "Do not impersonate other creators, public figures, or organizations.",
      "Do not share scams, deceptive promotions, or malicious links.",
      "Do not exploit platform features to disrupt other people's experience.",
    ],
    note: "Real creativity deserves real appreciation. Keep engagement genuine.",
  },
  {
    id: "privacy",
    number: "05",
    title: "Respect Privacy",
    subtitle: "A person's privacy matters as much as their creativity.",
    icon: ShieldCheck,
    color: "purple",
    rules: [
      "Do not publish another person's private information without permission.",
      "Do not share private photographs, recordings, or conversations without consent.",
      "Do not expose personal contact details or sensitive information.",
      "Respect the boundaries and privacy of other community members.",
      "Do not use PRATIVA to stalk, threaten, or target individuals.",
    ],
    note: "Think before you share. Protect your privacy and the privacy of others.",
  },
  {
    id: "reporting",
    number: "06",
    title: "Report Responsibly",
    subtitle: "Help us keep the community safe.",
    icon: Flag,
    color: "orange",
    rules: [
      "Report content or accounts that genuinely violate these guidelines.",
      "Choose the most appropriate report reason.",
      "Provide additional information when it helps moderators understand the issue.",
      "Do not submit false or intentionally misleading reports.",
      "Do not retaliate against someone for reporting a concern.",
    ],
    note: "Reports help us identify problems. Please use this feature responsibly.",
  },
  {
    id: "moderation",
    number: "07",
    title: "Moderation and Enforcement",
    subtitle: "Protecting the community is a shared responsibility.",
    icon: Scale,
    color: "pink",
    rules: [
      "PRATIVA may review content and accounts reported for guideline violations.",
      "Violating content may be removed or restricted.",
      "Accounts may receive warnings, temporary restrictions, or suspension depending on the severity of the violation.",
      "Repeated or serious violations may result in permanent account suspension.",
      "Moderation decisions may consider the context, severity, and history of violations.",
    ],
    note: "Our goal is not to limit creativity. It is to protect the people who make this community worth being part of.",
  },
];

const colorStyles = {
  pink: {
    icon: "text-[#FF75C8]",
    border: "border-[#FF4DB8]/20",
    glow: "bg-[#FF4DB8]/[0.06]",
    number: "text-[#FF75C8]",
    bullet: "bg-[#FF4DB8]",
  },
  purple: {
    icon: "text-[#C4A5FF]",
    border: "border-[#8A2BE2]/20",
    glow: "bg-[#8A2BE2]/[0.06]",
    number: "text-[#C4A5FF]",
    bullet: "bg-[#A78BFA]",
  },
  orange: {
    icon: "text-[#FDBA74]",
    border: "border-[#F97316]/20",
    glow: "bg-[#F97316]/[0.06]",
    number: "text-[#FDBA74]",
    bullet: "bg-[#F97316]",
  },
};

const CommunityGuidelines = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setMobileMenuOpen(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050A30] text-[#F4F7FF]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[450px] w-[450px] rounded-full bg-[#8A2BE2]/[0.09] blur-[150px]" />
        <div className="absolute -right-40 top-[500px] h-[450px] w-[450px] rounded-full bg-[#FF4DB8]/[0.07] blur-[150px]" />
        <div className="absolute left-1/2 top-[1300px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#0B1F6B]/30 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:34px_34px] opacity-30" />
      </div>

      {/* Navbar */}
      <header className="relative z-30 border-b border-white/[0.07] bg-[#050A30]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#FF4DB8]/30 bg-[#FF4DB8]/10 text-[#FF75C8] transition group-hover:bg-[#FF4DB8]/20">
              <Sparkles size={19} />
            </div>

            <div>
              <span className="font-serif text-xl font-bold tracking-[2px] text-white">
                PRATIVA
              </span>
              <span className="ml-2 hidden text-[9px] font-semibold uppercase tracking-[2px] text-[#FF75C8] sm:inline">
                Creative Universe
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <Link
              to="/"
              className="text-xs font-medium text-[#A7B5D8] transition hover:text-white"
            >
              Explore
            </Link>
            <a
              href="#guidelines"
              className="text-xs font-semibold text-[#FF75C8]"
            >
              Community Guidelines
            </a>
            <a
              href="#reporting"
              className="text-xs font-medium text-[#A7B5D8] transition hover:text-white"
            >
              Safety
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-[#FF75C8] md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>

          <Link
            to="/"
            className="hidden items-center gap-2 rounded-lg border border-[#FF4DB8]/30 px-4 py-2 text-xs font-semibold text-[#FF75C8] transition hover:bg-[#FF4DB8]/10 sm:flex"
          >
            <ArrowLeft size={14} />
            Back to PRATIVA
          </Link>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/[0.07] bg-[#080F36] px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-sm">
              <Link to="/" className="text-[#A7B5D8]">
                Explore
              </Link>
              <a
                href="#guidelines"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#FF75C8]"
              >
                Community Guidelines
              </a>
              <a
                href="#reporting"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#A7B5D8]"
              >
                Safety
              </a>
              <Link to="/" className="text-[#A7B5D8]">
                Back to PRATIVA
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-[1440px] px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#FF4DB8]/25 bg-[#FF4DB8]/[0.07] px-4 py-2 text-[10px] font-semibold uppercase tracking-[2.5px] text-[#FF75C8]">
            <ShieldCheck size={14} />
            Our Community · Our Responsibility
          </div>

          <h1 className="font-serif text-4xl font-semibold leading-[1.15] tracking-tight text-white sm:text-6xl lg:text-[76px]">
            Create Freely.
            <br />
            <span className="bg-gradient-to-r from-[#FF4DB8] via-[#FF8BCB] to-[#C4A5FF] bg-clip-text text-transparent">
              Respect Always.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[#A7B5D8] sm:text-base sm:leading-8">
            PRATIVA is a space where creativity finds its voice. These
            guidelines help us build a community where every creator feels
            respected, every idea has room to grow, and every expression
            matters.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollToSection("guidelines")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF4DB8] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_5px_25px_rgba(255,77,184,0.2)] transition hover:-translate-y-0.5 hover:bg-[#F472B6] hover:shadow-[0_8px_30px_rgba(255,77,184,0.3)]"
            >
              Explore Guidelines
              <ArrowUpRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("reporting")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-[#D5DEF4] transition hover:border-[#FF4DB8]/40 hover:bg-[#FF4DB8]/[0.07] hover:text-[#FF75C8]"
            >
              <Flag size={15} />
              Reporting & Safety
            </button>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-white/[0.07] pt-7">
            <div className="flex items-center gap-2 text-xs text-[#8194C4]">
              <Heart size={15} className="text-[#FF75C8]" />
              Respect
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8194C4]">
              <Copyright size={15} className="text-[#C4A5FF]" />
              Originality
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8194C4]">
              <ShieldCheck size={15} className="text-[#FDBA74]" />
              Safety
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8194C4]">
              <Users size={15} className="text-[#FF75C8]" />
              Community
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section
        id="guidelines"
        className="relative z-10 mx-auto max-w-[1440px] scroll-mt-8 px-5 pb-20 sm:px-8 lg:px-12"
      >
        <div className="mb-12 border-b border-white/[0.08] pb-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#FF75C8]">
            The foundation of our community
          </p>
          <h2 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
            Community Standards
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8194C4]">
            These standards apply to everyone using PRATIVA, across all creative
            spaces, interactions, and contributions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
          {/* Sidebar */}
          <aside className="h-fit lg:sticky lg:top-8">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0B153D]/80 p-5">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-white">
                  On this page
                </h3>
                <Menu size={15} className="text-[#FF75C8]" />
              </div>

              <nav className="space-y-1">
                {guidelines.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className="group flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition hover:bg-[#FF4DB8]/[0.08]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-[#FF75C8]">
                        {item.number}
                      </span>
                      <span className="text-xs text-[#A7B5D8] transition group-hover:text-white">
                        {item.title}
                      </span>
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-[#53648F] transition group-hover:translate-x-1 group-hover:text-[#FF75C8]"
                    />
                  </button>
                ))}
              </nav>

              <div className="mt-5 rounded-xl border border-[#FF4DB8]/15 bg-[#FF4DB8]/[0.05] p-4">
                <Sparkles size={18} className="mb-3 text-[#FF75C8]" />
                <p className="text-xs font-semibold text-white">
                  Be part of something creative.
                </p>
                <p className="mt-2 text-[11px] leading-5 text-[#8194C4]">
                  Your actions help shape the community we build together.
                </p>
              </div>
            </div>
          </aside>

          {/* Guideline cards */}
          <div className="space-y-5">
            {guidelines.map((item) => {
              const Icon = item.icon;
              const style = colorStyles[item.color];

              return (
                <article
                  key={item.id}
                  id={item.id}
                  className={`scroll-mt-8 overflow-hidden rounded-2xl border ${style.border} bg-[#0B153D]/75 transition duration-300 hover:border-[#FF4DB8]/30 hover:bg-[#0D1947]`}
                >
                  <div className="p-5 sm:p-7">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.glow} ${style.icon}`}
                      >
                        <Icon size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`font-mono text-[10px] font-semibold tracking-[2px] ${style.number}`}
                          >
                            {item.number}
                          </span>
                          <span className="h-px w-6 bg-white/15" />
                          <span className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#7182B1]">
                            PRATIVA STANDARDS
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-semibold text-white sm:text-2xl">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-xs leading-6 text-[#8194C4] sm:text-sm">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="my-6 h-px bg-white/[0.07]" />

                    <ul className="space-y-3.5 pl-1">
                      {item.rules.map((rule, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-xs leading-6 text-[#C1CDE7] sm:text-sm"
                        >
                          <span
                            className={`mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full ${style.bullet}`}
                          />
                          {rule}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3.5">
                      <Sparkles
                        size={15}
                        className={`mt-0.5 shrink-0 ${style.icon}`}
                      />
                      <p className="text-xs leading-6 text-[#A7B5D8]">
                        {item.note}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reporting CTA */}
      <section
        id="reporting"
        className="relative z-10 scroll-mt-8 px-5 pb-20 sm:px-8 lg:px-12"
      >
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-3xl border border-[#FF4DB8]/25 bg-[#0B153D]">
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#FF4DB8]/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-[#8A2BE2]/10 blur-[100px]" />

          <div className="relative grid items-center gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:p-14">
            <div className="max-w-2xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FF4DB8]/25 bg-[#FF4DB8]/10 text-[#FF75C8]">
                <Flag size={22} />
              </div>

              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[2.5px] text-[#FF75C8]">
                Your voice matters
              </p>

              <h2 className="font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
                See something that
                <br />
                <span className="text-[#FF75C8]">doesn't belong?</span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#A7B5D8]">
                If you encounter content or behavior that violates our
                guidelines, help us by reporting it. Our moderation process is
                designed to review concerns and take appropriate action.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:min-w-[220px]">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF4DB8] px-6 py-4 text-sm font-semibold text-white shadow-[0_5px_25px_rgba(255,77,184,0.2)] transition hover:-translate-y-0.5 hover:bg-[#F472B6]"
              >
                Explore PRATIVA
                <ArrowUpRight size={16} />
              </Link>

              <p className="text-center text-[10px] leading-5 text-[#7182B1]">
                Reporting tools will be available within posts and user
                profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing statement */}
      <section className="relative z-10 border-t border-white/[0.07] bg-[#030824]/70 px-5 py-16 text-center sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#FF4DB8]/20 bg-[#FF4DB8]/[0.07] text-[#FF75C8]">
            <Heart size={20} />
          </div>

          <h2 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
            Creativity connects us.
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#8194C4]">
            Let's make PRATIVA a place where ideas are celebrated, creators are
            respected, and everyone has the freedom to express themselves
            responsibly.
          </p>

          <p className="mt-7 font-serif text-lg italic text-[#FF75C8]">
            Create. Express. Inspire.
          </p>
        </div>

        <div className="mx-auto mt-14 flex max-w-[1200px] flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-7 sm:flex-row">
          <Link
            to="/"
            className="font-serif text-lg font-bold tracking-[2px] text-white"
          >
            PRATIVA<span className="text-[#FF4DB8]">.</span>
          </Link>

          <p className="text-[10px] tracking-wide text-[#65759F]">
            © {new Date().getFullYear()} PRATIVA. A universe of creativity.
          </p>

          <Link
            to="/"
            className="text-xs text-[#8194C4] transition hover:text-[#FF75C8]"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
};

export default CommunityGuidelines;
