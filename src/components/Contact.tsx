import { profile } from "@/data/profile";
import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-ink text-bg-elevated"
    >
      <div className="grid-atmosphere absolute inset-0 opacity-40" />
      <div className="section-pad relative mx-auto max-w-7xl py-20 md:py-28">
        <Reveal>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-signal">
            Contact
          </p>
          <h2 className="max-w-3xl font-display text-4xl font-bold tracking-tight md:text-6xl">
            Let&apos;s build something that holds under pressure.
          </h2>
          <p className="mt-6 max-w-xl text-base text-white/65 md:text-lg">
            Open to senior software engineering roles and conversations with
            engineering leaders shipping meaningful, cloud-native systems.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <Reveal delay={1}>
            <a
              href={`mailto:${profile.email}`}
              className="block border border-white/15 bg-white/[0.03] p-6 transition hover:border-signal hover:bg-white/[0.06]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Email
              </p>
              <p className="mt-3 break-all font-display text-lg font-semibold text-white">
                {profile.email}
              </p>
            </a>
          </Reveal>
          <Reveal delay={2}>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-white/15 bg-white/[0.03] p-6 transition hover:border-signal hover:bg-white/[0.06]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                LinkedIn
              </p>
              <p className="mt-3 font-display text-lg font-semibold text-white">
                linkedin.com/in/rnair8 ↗
              </p>
            </a>
          </Reveal>
          <Reveal delay={3}>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-white/15 bg-white/[0.03] p-6 transition hover:border-signal hover:bg-white/[0.06]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                GitHub
              </p>
              <p className="mt-3 font-display text-lg font-semibold text-white">
                github.com/rnair86 ↗
              </p>
            </a>
          </Reveal>
          <Reveal delay={3}>
            <a
              href={`tel:+1${profile.phone.replace(/\D/g, "")}`}
              className="block border border-white/15 bg-white/[0.03] p-6 transition hover:border-signal hover:bg-white/[0.06]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Phone
              </p>
              <p className="mt-3 font-display text-lg font-semibold text-white">
                {profile.phone}
              </p>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
