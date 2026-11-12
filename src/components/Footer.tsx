import { profile } from "@/data/profile";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-ink text-white/50">
      <div className="section-pad mx-auto flex max-w-7xl flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-sm font-semibold tracking-wide text-white/80">
          {profile.name}
        </p>
        <p className="text-xs tracking-wide">
          © {year} · Software Engineer · {profile.location}
        </p>
      </div>
    </footer>
  );
}
