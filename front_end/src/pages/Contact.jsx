import { useState } from "react";
import { ArrowUpRight, Mail, Send, MapPin, Sparkles } from "lucide-react";

const CONTACT_EMAIL = "tasbirgunj@gmail.com";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General enquiry",
    message: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(`Prativa Contact: ${form.subject}`);

    const body = encodeURIComponent(
      `Hello Prativa,\n\n${form.message}\n\nRegards,\n${form.name}\nEmail: ${form.email}`,
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen bg-[#F8F7F4] pt-[76px]">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-16 pt-20 sm:px-10 sm:pb-20 sm:pt-28 lg:px-16">
        <div className="pointer-events-none absolute -right-28 -top-20 h-[380px] w-[380px] rounded-full border border-[#E5092D]/10" />
        <div className="pointer-events-none absolute -right-12 top-0 h-[260px] w-[260px] rounded-full border border-[#E5092D]/10" />

        <div className="relative mx-auto max-w-[1300px]">
          <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E5092D]">
            <span className="h-px w-8 bg-[#E5092D]" />
            GET IN TOUCH
          </p>

          <h1 className="mt-8 max-w-[900px] font-serif text-[55px] leading-[1.04] tracking-tight text-[#191919] sm:text-7xl lg:text-[96px]">
            Every story
            <span className="block italic text-[#E5092D]">
              starts with hello.
            </span>
          </h1>

          <div className="mt-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-[490px] text-[14px] leading-[2] text-[#77716F] sm:text-[15px]">
              Have a question, an idea, or something you'd like to share? We'd
              love to hear from you. Whether it's feedback or simply a hello,
              our inbox is open.
            </p>

            <span className="font-serif text-lg italic text-[#918A83]">
              Let's start a conversation.
            </span>
          </div>
        </div>
      </section>

      {/* CONTACT CONTENT */}
      <section className="px-6 pb-24 sm:px-10 lg:px-16 lg:pb-32">
        <div className="mx-auto grid max-w-[1300px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* LEFT SIDE */}
          <div className="flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#E5092D]">
              A LITTLE HELLO GOES A LONG WAY
            </p>

            <h2 className="mt-6 max-w-[420px] font-serif text-4xl leading-[1.15] text-[#191919] sm:text-5xl">
              We'd like to
              <span className="block italic text-[#E5092D]">
                hear from you.
              </span>
            </h2>

            <p className="mt-6 max-w-[400px] text-[14px] leading-[2] text-[#77716F]">
              Prativa is a space built around creative expression. Your
              thoughts, suggestions and feedback help it grow into something
              better.
            </p>

            {/* EMAIL CARD */}
            <div className="mt-12 border-y border-[#DED9D1] py-7">
              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F1E5E5] text-[#E5092D]">
                  <Mail size={20} strokeWidth={1.6} />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#918A83]">
                    WRITE TO US
                  </p>

                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="mt-2 inline-flex items-center gap-2 break-all font-serif text-lg text-[#191919] transition-colors hover:text-[#E5092D] sm:text-xl"
                  >
                    {CONTACT_EMAIL}
                    <ArrowUpRight size={17} className="shrink-0" />
                  </a>

                  <p className="mt-2 text-[12px] text-[#918A83]">
                    For questions, feedback and collaborations.
                  </p>
                </div>
              </div>
            </div>

            {/* LOCATION CARD */}
            <div className="flex items-start gap-5 border-b border-[#DED9D1] py-7">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EEECE6] text-[#625D58]">
                <MapPin size={20} strokeWidth={1.6} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#918A83]">
                  OUR ROOTS
                </p>

                <p className="mt-2 font-serif text-xl text-[#191919]">
                  Made with creativity in Nepal.
                </p>

                <p className="mt-2 text-[12px] text-[#918A83]">
                  Connecting creative minds, everywhere.
                </p>
              </div>
            </div>

            {/* SMALL BRAND MESSAGE */}
            <div className="mt-auto pt-12">
              <Sparkles size={20} className="text-[#E5092D]" />

              <p className="mt-5 max-w-[340px] font-serif text-2xl italic leading-relaxed text-[#514C48]">
                "Every great connection begins with someone reaching out."
              </p>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#918A83]">
                PRATIVA · WHERE TALENT LEAVES ITS MARK
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - CONTACT FORM */}
          <div className="relative overflow-hidden bg-[#EFEDE7] px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-[#E5092D]/10" />

            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#E5092D]">
                SEND A MESSAGE
              </p>

              <h2 className="mt-5 font-serif text-4xl text-[#191919] sm:text-5xl">
                Let's talk.
              </h2>

              <p className="mt-4 text-[13px] leading-[1.9] text-[#77716F]">
                Fill in the details below. Your email application will open with
                your message ready to send.
              </p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-7">
                {/* NAME */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#514C48]"
                  >
                    Your name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={80}
                    value={form.name}
                    onChange={handleChange}
                    placeholder="What should we call you?"
                    className="w-full border-b border-[#CFC9BF] bg-transparent px-0 py-3 text-[14px] text-[#191919] outline-none transition-colors placeholder:text-[#AAA39A] focus:border-[#E5092D]"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#514C48]"
                  >
                    Your email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={120}
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Where can we reach you?"
                    className="w-full border-b border-[#CFC9BF] bg-transparent px-0 py-3 text-[14px] text-[#191919] outline-none transition-colors placeholder:text-[#AAA39A] focus:border-[#E5092D]"
                  />
                </div>

                {/* SUBJECT */}
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#514C48]"
                  >
                    What is this about?
                  </label>

                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full appearance-none border-b border-[#CFC9BF] bg-transparent px-0 py-3 text-[14px] text-[#514C48] outline-none transition-colors focus:border-[#E5092D]"
                  >
                    <option>General enquiry</option>
                    <option>Feedback & suggestions</option>
                    <option>Technical support</option>
                    <option>Collaboration</option>
                    <option>Something else</option>
                  </select>
                </div>

                {/* MESSAGE */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#514C48]"
                  >
                    Your message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    maxLength={3000}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us what's on your mind..."
                    className="w-full resize-y border-b border-[#CFC9BF] bg-transparent px-0 py-3 text-[14px] leading-[1.8] text-[#191919] outline-none transition-colors placeholder:text-[#AAA39A] focus:border-[#E5092D]"
                  />
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  className="group relative isolate inline-flex items-center justify-center gap-3 px-10 py-5 font-serif text-[15px] font-semibold text-white transition-transform duration-300 hover:scale-105 active:scale-95"
                >
                  <svg
                    viewBox="0 0 250 76"
                    className="absolute inset-0 -z-10 h-full w-full"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 18 C40 9 78 13 112 9 C160 5 212 12 237 16 C249 20 241 33 246 42 C244 56 225 62 199 59 C151 65 96 59 59 64 C28 65 7 59 10 47 C3 36 5 25 12 18Z"
                      fill="#E5092D"
                      className="transition-colors duration-300 group-hover:fill-[#C90024]"
                    />
                    <path
                      d="M18 14 C65 9 102 13 145 10 C185 9 218 13 238 16"
                      fill="none"
                      stroke="#FF526B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.4"
                    />
                  </svg>
                  Send your message
                  <Send
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </button>

                <p className="text-[11px] leading-relaxed text-[#918A83]">
                  This will open your default email application. You can review
                  your message before sending it.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING STRIP */}
      <section className="border-t border-[#E5E0D8] px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1300px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-lg italic text-[#77716F]">
            Where talent leaves its mark.
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#514C48] transition-colors hover:text-[#E5092D]"
          >
            Say hello
            <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
    </main>
  );
};

export default Contact;
