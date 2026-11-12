import { portfolioPlaceholders } from "@/data/profile";
import { Reveal } from "./Reveal";

export function Portfolio() {
  return (
    <section id="portfolio" className="border-b border-line bg-bg">
      <div className="section-pad mx-auto max-w-7xl py-20 md:py-28">
        <Reveal>
          <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-signal-deep">
                Portfolio
              </p>
              <h2 className="font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
                Selected work — launching soon.
              </h2>
              <p className="mt-5 text-base text-ink-muted md:text-lg">
                Deep-dive case studies from cloud migrations, payment platforms,
                and backend systems are being prepared. Links will land here.
              </p>
            </div>
            <a
              href="#contact"
              className="inline-flex shrink-0 items-center gap-2 self-start border border-ink px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-bg-elevated"
            >
              Request a walkthrough
              <span aria-hidden>→</span>
            </a>
          </div>
        </Reveal>

        <div className="grid gap-px bg-line-strong md:grid-cols-3">
          {portfolioPlaceholders.map((item, i) => (
            <Reveal key={item.title} delay={(i + 1) as 1 | 2 | 3}>
              <article className="group flex h-full min-h-[280px] flex-col justify-between bg-bg p-7 transition hover:bg-bg-elevated md:p-9">
                <div>
                  <div className="mb-8 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">
                      {item.category}
                    </span>
                    <span className="border border-line px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ember">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-ink-muted md:text-base">
                    {item.blurb}
                  </p>
                </div>
                <p className="mt-10 text-sm font-medium text-ink-faint transition group-hover:text-signal-deep">
                  Link reserved for future case study
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
