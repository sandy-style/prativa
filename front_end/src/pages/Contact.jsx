import { useState } from "react";
import {
  ArrowUpRight,
  Mail,
  Send,
  MapPin,
  Sparkles,
  Stars,
} from "lucide-react";

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

  const inputClass =
    "w-full border-b border-white/15 bg-transparent px-0 py-4 text-[14px] text-white outline-none transition-all placeholder:text-white/25 focus:border-[#00D4FF]";

  const labelClass =
    "mb-3 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050A30] pt-[76px] text-white">
      {/* BACKGROUND ATMOSPHERE */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#8A2BE2]/10 blur-[130px]" />
        <div className="absolute -left-40 top-[650px] h-[450px] w-[450px] rounded-full bg-[#00D4FF]/10 blur-[130px]" />
        <div className="absolute right-[15%] top-[900px] h-[300px] w-[300px] rounded-full bg-[#FF4DB8]/5 blur-[120px]" />

        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#00D4FF_0.7px,transparent_0.7px)] [background-size:35px_35px]" />
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-20 pt-20 sm:px-10 sm:pb-24 sm:pt-28 lg:px-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full border border-[#00D4FF]/10" />
        <div className="pointer-events-none absolute -right-8 top-0 h-[290px] w-[290px] rounded-full border border-[#8A2BE2]/20" />

        <div className="relative mx-auto max-w-[1300px]">
          <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#00D4FF]">
            <span className="h-px w-9 bg-[#00D4FF]" />
            GET IN TOUCH
          </p>

          <h1 className="mt-8 max-w-[950px] font-serif text-[54px] leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-[100px]">
            Every story
            <span className="block bg-gradient-to-r from-[#00D4FF] via-[#8A2BE2] to-[#FF4DB8] bg-clip-text italic text-transparent">
              starts with hello.
            </span>
          </h1>

          <div className="mt-10 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-[490px] text-[14px] leading-[2] text-white/55 sm:text-[15px]">
              Have a question, an idea, or something you'd like to share? We'd
              love to hear from you. Whether it's feedback or simply a hello,
              our inbox is open.
            </p>

            <span className="font-serif text-lg italic text-[#00D4FF]/70">
              Let's start a conversation.
            </span>
          </div>
        </div>
      </section>

      {/* CONTACT CONTENT */}
      <section className="relative px-6 pb-24 sm:px-10 lg:px-16 lg:pb-32">
        <div className="mx-auto grid max-w-[1300px] gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* LEFT SIDE */}
          <div className="flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#00D4FF]">
              A LITTLE HELLO GOES A LONG WAY
            </p>

            <h2 className="mt-6 max-w-[420px] font-serif text-4xl leading-[1.15] text-white sm:text-5xl">
              We'd like to
              <span className="block italic text-[#8A2BE2]">
                hear from you.
              </span>
            </h2>

            <p className="mt-6 max-w-[400px] text-[14px] leading-[2] text-white/50">
              Prativa is a space built around creative expression. Your
              thoughts, suggestions and feedback help it grow into something
              better.
            </p>

            {/* EMAIL */}
            <div className="mt-12 border-y border-white/10 py-8">
              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF]">
                  <Mail size={20} strokeWidth={1.6} />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    WRITE TO US
                  </p>

                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="mt-2 inline-flex items-center gap-2 break-all font-serif text-lg text-white transition-colors hover:text-[#00D4FF] sm:text-xl"
                  >
                    {CONTACT_EMAIL}
                    <ArrowUpRight size={17} className="shrink-0" />
                  </a>

                  <p className="mt-2 text-[12px] text-white/35">
                    For questions, feedback and collaborations.
                  </p>
                </div>
              </div>
            </div>

            {/* LOCATION */}
            <div className="flex items-start gap-5 border-b border-white/10 py-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#8A2BE2]/25 bg-[#8A2BE2]/10 text-[#B78AFF]">
                <MapPin size={20} strokeWidth={1.6} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  OUR ROOTS
                </p>

                <p className="mt-2 font-serif text-xl text-white">
                  Made with creativity in Nepal.
                </p>

                <p className="mt-2 text-[12px] text-white/35">
                  Connecting creative minds, everywhere.
                </p>
              </div>
            </div>

            {/* BRAND MESSAGE */}
            <div className="mt-auto pt-14">
              <Sparkles size={22} className="text-[#B7FF3F]" />

              <p className="mt-5 max-w-[340px] font-serif text-2xl italic leading-relaxed text-white/75">
                "Every great connection begins with someone reaching out."
              </p>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                PRATIVA · WHERE TALENT LEAVES ITS MARK
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - CONTACT FORM */}
          <div className="group relative">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-[#00D4FF]/35 via-[#8A2BE2]/20 to-[#FF4DB8]/30 opacity-70 blur-sm" />

            <div className="relative overflow-hidden rounded-[27px] border border-white/10 bg-[#080F36]/90 px-6 py-10 shadow-[0_25px_100px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              {/* Decorative circles */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#00D4FF]/10" />
              <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-[#8A2BE2]/15" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#00D4FF]">
                    SEND A MESSAGE
                  </p>

                  <Stars size={21} className="text-[#B7FF3F]" />
                </div>

                <h2 className="mt-5 font-serif text-4xl text-white sm:text-5xl">
                  Let's talk.
                </h2>

                <p className="mt-4 max-w-[420px] text-[13px] leading-[1.9] text-white/45">
                  Fill in the details below. Your email application will open
                  with your message ready to send.
                </p>

                <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                  {/* NAME */}
                  <div>
                    <label htmlFor="name" className={labelClass}>
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
                      className={inputClass}
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label htmlFor="email" className={labelClass}>
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
                      className={inputClass}
                    />
                  </div>

                  {/* SUBJECT */}
                  <div>
                    <label htmlFor="subject" className={labelClass}>
                      What is this about?
                    </label>

                    <select
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option className="bg-[#080F36]">General enquiry</option>
                      <option className="bg-[#080F36]">
                        Feedback & suggestions
                      </option>
                      <option className="bg-[#080F36]">
                        Technical support
                      </option>
                      <option className="bg-[#080F36]">Collaboration</option>
                      <option className="bg-[#080F36]">Something else</option>
                    </select>
                  </div>

                  {/* MESSAGE */}
                  <div>
                    <label htmlFor="message" className={labelClass}>
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
                      className={`${inputClass} resize-y leading-[1.8]`}
                    />
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    className="group/button relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#00D4FF] to-[#8A2BE2] px-9 py-4 text-[13px] font-semibold text-[#050A30] shadow-[0_0_30px_rgba(0,212,255,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(0,212,255,0.3)] active:scale-95"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#B7FF3F] to-[#00D4FF] opacity-0 transition-opacity duration-300 group-hover/button:opacity-100" />

                    <span className="relative">Send your message</span>

                    <Send
                      size={16}
                      className="relative transition-transform duration-300 group-hover/button:translate-x-1 group-hover/button:-translate-y-1"
                    />
                  </button>

                  <p className="text-[11px] leading-relaxed text-white/30">
                    This will open your default email application. You can
                    review your message before sending it.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING STRIP */}
      <section className="relative border-t border-white/10 px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1300px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-lg italic text-white/40">
            Where talent leaves its mark.
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#00D4FF] transition-colors hover:text-[#B7FF3F]"
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
