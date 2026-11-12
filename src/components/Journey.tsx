import { experiences, profile } from "@/data/profile";
import { Reveal } from "./Reveal";

export function Journey() {
  return (
    <section id="journey" className="border-b border-line bg-bg-elevated">
      <div className="section-pad mx-auto max-w-7xl py-20 md:py-28">
        <Reveal>
          <div className="mb-14 max-w-2xl md:mb-20">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-signal-deep">
              Career journey
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
              From pharmacy software to cloud-native platforms.
            </h2>
            <p className="mt-5 text-base text-ink-muted md:text-lg">
              Over a decade across healthcare, public safety, fintech terminals, and
              high-throughput campaign platforms — always on systems people
              depend on.
            </p>
          </div>
        </Reveal>

        <div className="relative">
          <div className="timeline-rail absolute bottom-0 left-[7px] top-2 w-px origin-top bg-line-strong md:left-[11px]" />

          <ol className="space-y-10 md:space-y-14">
            {experiences.map((job, index) => (
              <li key={`${job.company}-${job.role}`} className="relative pl-10 md:pl-14">
                <span
                  className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-ink bg-bg-elevated md:h-6 md:w-6 ${
                    index === 0 ? "live-dot !border-signal !bg-signal" : ""
                  }`}
                />
                <Reveal delay={index % 3 === 0 ? 1 : index % 3 === 1 ? 2 : 3}>
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-10">
                    <div>
                      <p className="font-display text-xl font-bold text-ink md:text-2xl">
                        {job.company}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-signal-deep">
                        {job.role}
                      </p>
                      <p className="mt-3 text-sm text-ink-faint">
                        {job.period}
                        <span className="mx-2 text-line-strong">·</span>
                        {job.duration}
                      </p>
                      <p className="text-sm text-ink-faint">{job.location}</p>
                    </div>
                    <ul className="space-y-2.5 border-t border-line pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                      {job.highlights.map((item) => (
                        <li
                          key={item}
                          className="relative pl-4 text-sm leading-relaxed text-ink-muted md:text-base before:absolute before:left-0 before:top-[0.65em] before:h-1 before:w-1 before:bg-ember"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        <Reveal>
          <div className="mt-16 grid gap-6 border-t border-line pt-12 md:mt-20 md:grid-cols-2">
            {profile.education.map((edu) => (
              <div key={edu.school}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">
                  Education
                </p>
                <p className="mt-2 font-display text-xl font-semibold text-ink">
                  {edu.school}
                </p>
                <p className="mt-1 text-sm text-ink-muted">{edu.degree}</p>
                <p className="mt-1 text-sm text-ink-faint">{edu.years}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
