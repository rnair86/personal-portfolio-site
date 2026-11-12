import Image from "next/image";
import { profile } from "@/data/profile";
import { TwinButton } from "./TwinButton";

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] overflow-hidden text-white"
    >
      <Image
        src="/hero-infrastructure.png"
        alt="Data center corridor with teal server rack lighting"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(8,10,14,0.88) 0%, rgba(8,10,14,0.72) 42%, rgba(8,10,14,0.35) 70%, rgba(8,10,14,0.55) 100%)",
        }}
      />
      <div className="hero-scan absolute inset-0 noise-overlay" />

      <div className="section-pad relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end pb-16 pt-28 md:justify-center md:pb-24 md:pt-24">
        <div className="max-w-3xl">
          <p
            className="animate-fade mb-5 font-display text-sm font-semibold uppercase tracking-[0.28em] text-signal md:text-base"
            style={{ animationDelay: "0.1s" }}
          >
            {profile.name}
          </p>
          <h1
            className="animate-rise font-display text-[clamp(2.75rem,8vw,5.75rem)] font-extrabold leading-[0.95] tracking-tight"
            style={{ animationDelay: "0.18s" }}
          >
            Resilient backends.
            <br />
            <span className="text-white/80">Cloud to payments.</span>
          </h1>
          <p
            className="animate-rise mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg"
            style={{ animationDelay: "0.32s" }}
          >
            {profile.tagline}
          </p>
          <div
            className="animate-rise mt-10 flex flex-wrap gap-3"
            style={{ animationDelay: "0.45s" }}
          >
            <a href="#journey" className="btn-primary">
              View career journey
            </a>
            <TwinButton className="btn-ghost">
              <span className="live-dot inline-block h-2 w-2 rounded-full bg-signal" />
              Ask my Digital Twin
            </TwinButton>
          </div>
        </div>

        <div
          className="animate-fade mt-16 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-white/50 md:mt-20"
          style={{ animationDelay: "0.7s" }}
        >
          <span className="live-dot inline-block h-2 w-2 rounded-full bg-signal" />
          {profile.location} · Open to senior roles
        </div>
      </div>
    </section>
  );
}
