import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Sparkles } from "lucide-react";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "Explore", to: "/explore" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "community guidelines", to: "/community-guidelines" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#00D4FF]/15 bg-[#050A30] text-[#F5F7FF]">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[350px] w-[350px] rounded-full bg-[#8A2BE2]/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[350px] w-[350px] rounded-full bg-[#00D4FF]/10 blur-[130px]" />

      {/* Subtle top glow */}
      <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00D4FF]/60 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16 xl:px-20">
        {/* MAIN FOOTER */}
        <div className="grid gap-16 py-16 md:grid-cols-[1.3fr_0.7fr] md:py-20 lg:gap-28">
          {/* BRAND */}
          <div>
            <Link to="/" className="group inline-block">
              <span className="font-['Orbitron'] text-[32px] font-bold tracking-[0.12em] text-white transition-colors duration-300 group-hover:text-[#00D4FF] sm:text-[40px]">
                PRATIVA<span className="text-[#B7FF3F]">.</span>
              </span>
            </Link>

            <div className="mt-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#00D4FF]" />
              <p className="font-['Orbitron'] text-[9px] uppercase tracking-[0.24em] text-[#00D4FF]">
                Where talent leaves its mark
              </p>
            </div>

            <p className="mt-7 max-w-[420px] text-[13px] leading-[2] text-[#AAB3D0] sm:text-sm">
              A universe for your voice, vision, art, and words. Bringing
              different forms of creativity together, one expression at a time.
            </p>

            <Link
              to="/explore"
              className="group mt-9 inline-flex items-center gap-3 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/[0.06] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#00D4FF] transition-all duration-300 hover:-translate-y-1 hover:border-[#00D4FF] hover:bg-[#00D4FF]/10 hover:shadow-[0_0_25px_rgba(0,212,255,0.12)]"
            >
              Explore the universe
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* NAVIGATION */}
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            {/* LINKS */}
            <div>
              <div className="mb-8 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#00D4FF] shadow-[0_0_10px_#00D4FF]" />
                <p className="font-['Orbitron'] text-[9px] font-semibold uppercase tracking-[0.2em] text-[#00D4FF]">
                  Navigate
                </p>
              </div>

              <ul className="space-y-5">
                {footerLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center gap-2 text-[14px] text-[#C2C9E0] transition-colors duration-300 hover:text-[#00D4FF]"
                    >
                      {link.label}
                      <ArrowUpRight
                        size={13}
                        className="opacity-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* BRAND MESSAGE */}
            <div>
              <div className="mb-8 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#B7FF3F] shadow-[0_0_10px_#B7FF3F]" />
                <p className="font-['Orbitron'] text-[9px] font-semibold uppercase tracking-[0.2em] text-[#B7FF3F]">
                  Our vision
                </p>
              </div>

              <div className="max-w-[210px]">
                <Sparkles size={20} className="mb-5 text-[#BD91FF]" />

                <p className="font-['Orbitron'] text-[15px] leading-[1.8] text-white">
                  Different expressions.
                  <span className="block text-[#00D4FF]">One universe.</span>
                </p>

                <p className="mt-5 text-[12px] leading-[1.9] text-[#8995BA]">
                  Created for people who have something extraordinary to
                  express.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col gap-5 border-t border-white/[0.09] py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] tracking-[0.08em] text-[#7480A8]">
            © {new Date().getFullYear()} PRATIVA. All rights reserved.
          </p>

          <p className="font-['Orbitron'] text-[9px] uppercase tracking-[0.15em] text-[#8995BA]">
            Made with creativity, from Nepal.
          </p>

          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#AAB3D0] transition-colors hover:text-[#00D4FF]"
          >
            Back to beginning
            <ArrowUpRight
              size={13}
              className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
