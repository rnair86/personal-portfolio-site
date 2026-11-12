import { profile } from "@/data/profile";
import { Reveal } from "./Reveal";

export function About() {
  return (
    <section id="about" className="relative border-b border-line bg-bg">
      <div className="section-pad mx-auto grid max-w-7xl gap-12 py-20 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:py-28 lg:gap-24">
        <Reveal>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-signal-deep">
            About
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl">
            Built for systems
            <br />
            that can&apos;t fail.
          </h2>
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.18em] text-ink-faint">
            {profile.title} · 15+ years
          </p>
        </Reveal>

        <div className="space-y-5 text-base leading-relaxed text-ink-muted md:text-lg">
          {profile.summary.map((paragraph, i) => (
            <Reveal key={paragraph.slice(0, 24)} delay={(i + 1) as 1 | 2 | 3}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
          <Reveal delay={3}>
            <p className="border-l-2 border-signal pl-5 font-medium text-ink">
              {profile.seeking}
            </p>
          </Reveal>
        </div>
      </div>

      <div className="section-pad mx-auto max-w-7xl pb-20 md:pb-28">
        <Reveal>
          <div className="grid-atmosphere rounded-none border border-line bg-bg-elevated p-6 md:p-10">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-ink-faint">
              Core stack &amp; domain
            </p>
            <ul className="flex flex-wrap gap-2.5">
              {profile.topSkills.map((skill) => (
                <li
                  key={skill}
                  className="border border-line-strong bg-bg px-3.5 py-2 text-sm font-medium text-ink transition hover:border-signal hover:text-signal-deep"
                >
                  {skill}
                </li>
              ))}
            </ul>
            <div className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
              {profile.languages.map((lang) => (
                <div key={lang.name}>
                  <p className="font-display text-lg font-semibold text-ink">
                    {lang.name}
                  </p>
                  <p className="text-sm text-ink-faint">{lang.level}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
