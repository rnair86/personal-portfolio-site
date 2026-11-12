"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/profile";

const links = [
  { href: "#about", label: "About" },
  { href: "#journey", label: "Journey" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? "nav-blur" : "bg-transparent"
      }`}
    >
      <nav className="section-pad mx-auto flex h-16 max-w-7xl items-center justify-between md:h-20">
        <a
          href="#top"
          className={`font-display text-lg font-bold tracking-tight transition-colors md:text-xl ${
            scrolled || open ? "text-ink" : "text-white"
          }`}
        >
          {profile.monogram}
          <span
            className={`ml-2 hidden font-sans text-sm font-medium tracking-wide sm:inline ${
              scrolled || open ? "text-ink-muted" : "text-white/70"
            }`}
          >
            {profile.name}
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium tracking-wide transition-colors ${
                scrolled
                  ? "text-ink-muted hover:text-ink"
                  : "text-white/75 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-semibold tracking-wide transition-colors ${
              scrolled
                ? "text-signal-deep hover:text-ink"
                : "text-signal hover:text-white"
            }`}
          >
            LinkedIn
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-semibold tracking-wide transition-colors ${
              scrolled
                ? "text-signal-deep hover:text-ink"
                : "text-signal hover:text-white"
            }`}
          >
            GitHub
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          className={`md:hidden ${scrolled || open ? "text-ink" : "text-white"}`}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="flex h-5 w-6 flex-col justify-between">
            <span
              className={`block h-0.5 w-full origin-center transition ${
                open ? "translate-y-[9px] rotate-45 bg-current" : "bg-current"
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-current transition ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-full origin-center transition ${
                open ? "-translate-y-[9px] -rotate-45 bg-current" : "bg-current"
              }`}
            />
          </div>
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-bg-elevated px-5 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-base font-medium text-ink"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold text-signal-deep"
            >
              LinkedIn ↗
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold text-signal-deep"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
