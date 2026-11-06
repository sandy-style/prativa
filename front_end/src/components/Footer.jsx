import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight } from "lucide-react";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "Explore", to: "/explore" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#191919] text-[#F8F7F4]">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
        {/* MAIN FOOTER */}
        <div className="grid gap-14 py-16 md:grid-cols-[1.3fr_0.7fr] md:py-20 lg:gap-24">
          {/* BRAND */}
          <div>
            <Link to="/" className="inline-block group">
              <span className="font-serif text-[38px] font-semibold tracking-[3px] transition-colors group-hover:text-[#FF5269]">
                PRATIVA
              </span>
            </Link>

            <p className="mt-3 font-serif text-[19px] italic text-[#FF5269]">
              Where talent leaves its mark.
            </p>

            <p className="mt-7 max-w-[390px] text-[13px] leading-[2] text-[#A9A39D]">
              A space for your voice, vision, art, and words. Bringing different
              forms of creativity together, one expression at a time.
            </p>

            <Link
              to="/explore"
              className="group mt-8 inline-flex items-center gap-3 border-b border-[#E5092D] pb-2 text-[11px] font-semibold uppercase tracking-[0.17em] transition-colors hover:text-[#FF5269]"
            >
              Find Your Stage
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* NAVIGATION */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-2">
            <div>
              <p className="mb-7 text-[10px] font-semibold uppercase tracking-[0.23em] text-[#FF5269]">
                Navigate
              </p>

              <ul className="space-y-5">
                {footerLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center gap-2 font-serif text-[19px] text-[#E7E2DC] transition-colors hover:text-[#FF5269]"
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

            <div>
              <p className="mb-7 text-[10px] font-semibold uppercase tracking-[0.23em] text-[#FF5269]">
                The idea
              </p>

              <p className="max-w-[190px] font-serif text-[20px] leading-[1.5] text-[#E7E2DC]">
                Different expressions.
                <span className="block italic text-[#A9A39D]">
                  One creative space.
                </span>
              </p>

              <p className="mt-5 max-w-[190px] text-[12px] leading-[1.9] text-[#8E8983]">
                Created for people who have something to express.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col gap-4 border-t border-white/15 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] tracking-[0.08em] text-[#8E8983]">
            © {new Date().getFullYear()} PRATIVA. All rights reserved.
          </p>

          <p className="font-serif text-[14px] italic text-[#A9A39D]">
            Made with creativity, from Nepal.
          </p>

          <Link
            to="/"
            className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#E7E2DC] transition-colors hover:text-[#FF5269]"
          >
            Back to beginning ↑
          </Link>
        </div>
      </div>
    </footer>
  );
}
