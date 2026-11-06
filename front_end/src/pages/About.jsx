import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Camera,
  Music2,
  Palette,
  PenLine,
  Quote,
  Eye,
  Heart,
  Layers3,
} from "lucide-react";

const disciplines = [
  {
    number: "01",
    title: "Voice",
    description: "Music, singing, spoken word and the sounds people create.",
    icon: Music2,
  },
  {
    number: "02",
    title: "Vision",
    description: "Photography, filmmaking and visual storytelling.",
    icon: Camera,
  },
  {
    number: "03",
    title: "Art",
    description: "Painting, drawing, illustration and visual expression.",
    icon: Palette,
  },
  {
    number: "04",
    title: "Words",
    description: "Poetry, writing, stories and ideas worth sharing.",
    icon: PenLine,
  },
];

const principles = [
  {
    icon: Eye,
    title: "Expression over popularity",
    description:
      "Creative work deserves attention for what it is, not simply for how many people engage with it.",
  },
  {
    icon: Heart,
    title: "Room for every creator",
    description:
      "You don't need a professional title or an established audience to have something worth sharing.",
  },
  {
    icon: Layers3,
    title: "Different forms, one space",
    description:
      "Prativa brings different creative disciplines together without making them compete for attention.",
  },
];

export default function About() {
  return (
    <main className="overflow-hidden bg-[#F8F7F4] text-[#191919]">
      {/* INTRODUCTION */}
      <section className="relative px-6 pb-24 pt-36 sm:px-10 lg:px-16 lg:pb-32 lg:pt-44">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-[2px] w-9 bg-[#E5092D]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#77716F]">
              A little about us
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <h1 className="max-w-[800px] font-serif text-[54px] leading-[1.04] tracking-[-2px] sm:text-[72px] lg:text-[88px]">
                Creativity deserves
                <span className="block italic text-[#E5092D]">
                  its own space.
                </span>
              </h1>
            </div>

            <div className="max-w-[430px] lg:pb-2 lg:pl-8">
              <p className="text-[16px] leading-[1.9] text-[#625D58]">
                Prativa is a creative platform built to bring different forms of
                talent together. A place where people can share what they make,
                explore what others create, and let their work speak for itself.
              </p>

              <div className="mt-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E5092D]">
                <span>Our purpose</span>
                <ArrowDown size={15} />
              </div>
            </div>
          </div>

          <div className="mt-16 border-y border-[#DCD8D1] py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="font-serif text-[19px] italic text-[#514C48]">
                Where talent leaves its mark.
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#918A83]">
                Independent creative platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS PRATIVA */}
      <section className="bg-[#EFEDE7] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E5092D]">
              01 / The idea
            </p>

            <h2 className="mt-6 max-w-[430px] font-serif text-[42px] leading-[1.12] tracking-[-1px] sm:text-[52px]">
              So, what exactly is Prativa?
            </h2>
          </div>

          <div className="max-w-[690px]">
            <p className="font-serif text-[26px] leading-[1.45] text-[#252321] sm:text-[32px]">
              It is a space for creative work to exist beyond the boundaries of
              a single discipline.
            </p>

            <p className="mt-8 text-[15px] leading-[2] text-[#625D58]">
              A photographer and a poet may see the world differently. A
              musician and a painter may express themselves in completely
              different ways. But they share one thing: the need to create and
              the desire to be heard or seen.
            </p>

            <p className="mt-5 text-[15px] leading-[2] text-[#625D58]">
              Prativa brings these expressions into one place. Members can
              publish their work, discover creations from other disciplines, and
              find an audience that appreciates creativity in its many forms.
            </p>

            <p className="mt-5 text-[15px] leading-[2] text-[#625D58]">
              It is not limited to professionals. Beginners, independent
              artists, hobbyists and experienced creators all have a place here.
            </p>
          </div>
        </div>
      </section>

      {/* WHY IT EXISTS */}
      <section className="px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E5092D]">
              02 / Why it exists
            </p>

            <h2 className="mt-6 max-w-[540px] font-serif text-[43px] leading-[1.12] tracking-[-1px] sm:text-[56px]">
              Not every creation should have to fight for attention.
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="text-[15px] leading-[2] text-[#625D58]">
              Creative people often share their work across scattered platforms,
              where different kinds of expression can get lost among trends,
              algorithms and the pressure to constantly gain attention.
            </p>

            <p className="mt-6 text-[15px] leading-[2] text-[#625D58]">
              Prativa exists to offer a more focused alternative: a shared
              creative space where the work itself matters. Not everyone creates
              for fame. Sometimes, people simply want to express something,
              improve their craft or connect with others who appreciate what
              they do.
            </p>

            <div className="mt-10 border-l-[3px] border-[#E5092D] py-2 pl-6">
              <p className="font-serif text-[25px] italic leading-[1.4] text-[#292522]">
                The value of creativity shouldn't be measured only by numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CREATIVE DISCIPLINES */}
      <section className="bg-[#191919] px-6 py-24 text-[#F8F7F4] sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF5269]">
                03 / What belongs here
              </p>
              <h2 className="mt-6 max-w-[650px] font-serif text-[44px] leading-[1.1] sm:text-[60px]">
                Many ways to create.
                <span className="block italic text-[#FF5269]">
                  One place to share.
                </span>
              </h2>
            </div>

            <p className="max-w-[350px] text-[14px] leading-[1.9] text-[#B8B2AC]">
              Creativity doesn't follow one format. Prativa welcomes different
              disciplines and the people behind them.
            </p>
          </div>

          <div className="mt-16 grid border-t border-white/20 sm:grid-cols-2">
            {disciplines.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.number}
                  className="group border-b border-white/20 py-9 sm:pr-10 lg:py-12"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <span className="text-[11px] tracking-widest text-[#FF5269]">
                        {item.number}
                      </span>
                      <h3 className="font-serif text-[34px] sm:text-[40px]">
                        {item.title}
                      </h3>
                    </div>

                    <Icon
                      size={25}
                      strokeWidth={1.4}
                      className="mt-2 text-[#FF5269] transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110"
                    />
                  </div>

                  <p className="mt-5 max-w-[390px] pl-10 text-[14px] leading-[1.9] text-[#B8B2AC]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-[650px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E5092D]">
              04 / What we believe
            </p>
            <h2 className="mt-6 font-serif text-[43px] leading-[1.12] sm:text-[56px]">
              The thinking behind the platform.
            </h2>
          </div>

          <div className="mt-16 grid gap-12 border-t border-[#DCD8D1] pt-10 md:grid-cols-3 md:gap-10">
            {principles.map((item, index) => {
              const Icon = item.icon;

              return (
                <article key={item.title}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-widest text-[#E5092D]">
                      0{index + 1}
                    </span>
                    <Icon
                      size={22}
                      strokeWidth={1.4}
                      className="text-[#E5092D]"
                    />
                  </div>

                  <h3 className="mt-8 font-serif text-[27px] leading-tight">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-[14px] leading-[1.9] text-[#77716F]">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* THE CREATOR */}

      <section className="bg-[#EFEDE7] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          {/* PROFILE */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E5092D]">
              05 / Behind Prativa
            </p>

            <div className="relative mt-8 flex max-w-[380px] justify-center lg:justify-start">
              <div className="absolute left-4 top-4 h-[280px] w-[280px] rounded-full  sm:h-[340px] sm:w-[340px]" />

              <div className="relative h-[280px] w-[280px] overflow-hidden rounded-full bg-[#DCD8D1] sm:h-[340px] sm:w-[340px]">
                <img
                  src="https://avatars.githubusercontent.com/u/281124027?v=4"
                  alt="sandyway"
                  className="h-full w-full rounded-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="flex flex-col justify-center">
            <h2 className="font-serif text-[48px] leading-[1.1] sm:text-[64px]">
              An idea built
              <span className="block italic text-[#E5092D]">by sandyway.</span>
            </h2>

            <div className="mt-9 max-w-[570px]">
              <p className="text-[15px] leading-[2] text-[#625D58]">
                I'm sandyway, an independent developer from Nepal and the person
                behind Prativa.
              </p>

              <p className="mt-6 text-[15px] leading-[2] text-[#625D58]">
                I built Prativa with a simple intention: to create a space where
                creativity isn't confined to one form. Whether it's music,
                photography, art or writing, every expression deserves a place
                to exist and be appreciated.
              </p>

              <p className="mt-6 text-[15px] leading-[2] text-[#625D58]">
                Prativa is my attempt to bring those different worlds together.
              </p>
            </div>

            <div className="mt-10 border-t border-[#D4CFC6] pt-6">
              <p className="font-serif text-[21px] italic text-[#514C48]">
                Where talent leaves its mark.
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#918A83]">
                sandyway · Founder of Prativa
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="px-6 py-24 sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1320px] border-y border-[#DCD8D1] py-16 text-center sm:py-20">
          <Quote
            size={25}
            strokeWidth={1.2}
            className="mx-auto text-[#E5092D]"
          />

          <h2 className="mx-auto mt-7 max-w-[760px] font-serif text-[39px] leading-[1.2] sm:text-[54px]">
            Your work has a place here.
          </h2>

          <p className="mx-auto mt-5 max-w-[470px] text-[14px] leading-[1.9] text-[#77716F]">
            Explore different expressions of creativity and find the work that
            speaks to you.
          </p>

          <Link
            to="/explore"
            className="group mt-9 inline-flex items-center gap-3 border-b border-[#E5092D] pb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#191919] transition-colors hover:text-[#E5092D]"
          >
            Explore Prativa
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
    </main>
  );
}
