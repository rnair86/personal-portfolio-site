<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Personal site agent guide

Use this file to maintain this portfolio, or to turn the same codebase into a site for a different person. The inputs for a new person are a **LinkedIn profile import** (PDF or data export) and one or more **resumes**. Do not invent a career. Every sentence on the page and every fact the chat can say must come from those sources.

`tutorial.md` is a beginner walkthrough of how this site was built. This file is the operating guide.

## What this site is

A single-page professional site: navigation, full-screen hero, about, career timeline, portfolio placeholders, contact, footer, and a floating **Digital Twin** chat. The visual brief is **enterprise meets edgy**: calm grids and whitespace, bold display type, a dark cinematic hero, a teal accent (`--signal`), and a small orange-red mark (`--ember`).

The page is assembled in `src/app/page.tsx`:

`Nav` → `Hero` → `About` → `Journey` → `Portfolio` → `Contact` → `Footer`, with `DigitalTwin` as an overlay outside `<main>`.

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- Fonts: Syne (display) and IBM Plex Sans (body), loaded in `src/app/layout.tsx` via `next/font/google`
- Chat: `POST /api/chat` proxies to OpenRouter (`openai/gpt-oss-120b`). The key is `OPENROUTER_API_KEY` in `.env` (gitignored). The browser never sees it.
- Path alias: `@/` → `src/`

Before changing framework APIs, read the matching doc under `node_modules/next/dist/docs/`. The root layout uses `LayoutProps<"/">`.

Commands: `npm install`, `npm run dev` (http://localhost:3000), `npm run build`, `npm run lint`.

## How the code is split

| Path | Role |
| --- | --- |
| `src/data/profile.ts` | All career content: identity, summary, skills, languages, education, jobs, portfolio cards |
| `src/app/layout.tsx` | HTML shell, fonts, `metadata` (tab title, description, Open Graph) |
| `src/app/globals.css` | Color tokens, fonts, buttons (`.btn-primary`, `.btn-ghost`), scroll-reveal, timeline rail |
| `src/app/page.tsx` | Section order only |
| `src/components/Nav.tsx` | Fixed nav. Transparent over the hero, frosted after 24px of scroll. Mobile menu. **Client.** |
| `src/components/Hero.tsx` | Full-viewport photo, gradient, name, headline, tagline, two CTAs |
| `src/components/About.tsx` | Section headline, summary paragraphs, seeking line, skill chips, languages |
| `src/components/Journey.tsx` | Timeline from `experiences` (most recent first) plus education |
| `src/components/Portfolio.tsx` | Three cards from `portfolioPlaceholders` |
| `src/components/Contact.tsx` | Email (`mailto:`), LinkedIn (`target="_blank"` + `rel="noopener noreferrer"`), phone (`tel:`) |
| `src/components/Footer.tsx` | Name and `© {year}` |
| `src/components/Reveal.tsx` | Fade-up on scroll via `IntersectionObserver`. **Client.** Wraps server content. |
| `src/components/TwinButton.tsx` | Dispatches `open-digital-twin`. **Client.** |
| `src/components/DigitalTwin.tsx` | Chat panel, streaming reader, light Markdown (`**bold**`, `*italic*`, `- ` bullets). **Client.** |
| `src/lib/twin-prompt.ts` | System prompt built from `profile.ts` |
| `src/app/api/chat/route.ts` | Validates messages, calls OpenRouter, unwraps the SSE stream to plain text |
| `public/hero-infrastructure.png` | Hero photo. Must stay dark enough that white type remains readable. |

Server components are the default. Add `"use client"` only for state, scroll listeners, or events. Do not move `Hero`, `About`, `Journey`, `Portfolio`, `Contact`, or `Footer` to the client.

## Content model

`profile` and `experiences` in `src/data/profile.ts` are the source of truth for both the page and the chat. Keep the exported shape:

```ts
profile: {
  name, monogram, title, location, tagline, email, phone, linkedin,
  summary: string[],          // 2–3 paragraphs, first person
  seeking: string,
  topSkills: string[],        // about 8–12, strongest first
  languages: { name, level }[],
  education: { school, degree, years }[],
}
experiences: {
  company, role, period, duration, location,
  highlights: string[],       // bullets from the sources, not paraphrased fiction
  current?: boolean,
}[]
portfolioPlaceholders: { title, category, blurb, status }[]
```

`as const` on `profile` and `portfolioPlaceholders` is intentional. `Experience` is the type for jobs. Timeline keys are `` `${company}-${role}` `` because one company can appear twice.

## Copy that is not in `profile.ts`

These strings are written for Rohit Nair. A new person requires rewriting each one from their sources. Do not leave Rohit's domains, years, or name in them.

| Location | Current copy to replace |
| --- | --- |
| `layout.tsx` `metadata` | Title, description, Open Graph text |
| `Hero.tsx` | Two-line headline (`Enterprise systems.` / `Edgy execution.`), image `alt`, `Open to senior roles` |
| `About.tsx` | `Built for systems that can't fail.`, `10+ years` |
| `Journey.tsx` | `From pharmacy software to cloud-scale payments.` and the intro paragraph |
| `Portfolio.tsx` | Section headline and intro |
| `Contact.tsx` | Headline and the "open to…" paragraph |
| `Footer.tsx` | `Software Engineer` |
| `DigitalTwin.tsx` | Hardcoded monogram `RN`, `Ask about Rohit's career`, the greeting, and `suggestions` |
| `twin-prompt.ts` | Gendered wording (`his`), the long Headline line, and the Walmart role baked into the prompt string |
| `api/chat/route.ts` | `X-Title`. Use an ASCII hyphen. An em dash throws `Cannot convert argument to a ByteString`. |
| `README.md` | Site title and one-line description |

Hero headline pattern: two short lines, specific to this person's work. Second line uses `text-white/80`. Tagline stays in `profile.tagline`.

When personalizing, move anything the prompt needs into `profile.ts` (including early jobs and a `pronouns` field). `buildTwinSystemPrompt()` should read only that file. Speak as the person's digital twin in the first person. If the sources do not state pronouns, use the first name and avoid gendered pronouns.

## Digital Twin rules

- System prompt rules already forbid invented employers, dates, metrics, tools, and outcomes. Keep them.
- Temperature stays low (`0.4`). Only `user` and `assistant` roles are accepted from the browser, so a caller cannot override the system prompt.
- Caps: 20 messages, 2000 characters each. Stream plain text. Log upstream errors on the server; return a generic message to the visitor.
- Do not put the phone number in the twin's default answers. The prompt already says to share it only when asked how to get in contact.
- Suggested questions must be answerable from the profile (cloud, payments, and target role are Rohit's). For a new person, write three recruiter-style questions their sources can actually answer.
- `.env` is never committed. Restart `npm run dev` after changing it.

## Creating a site for someone else

Work in this order. Read both sources completely before editing.

### 1. Ingest

Accept a LinkedIn profile PDF or export, plus resumes. Save them in the project only if the user wants them kept; they contain personal data. Do not scrape LinkedIn.

Build a fact sheet first:

- Name, current title, location, email, phone, LinkedIn URL, spoken languages
- Summary themes and what they are seeking, if stated
- Every role: company, title, dates, duration, location, bullets
- Education
- Skills and tools that appear in either source
- Public project or portfolio URLs, if any
- Conflicts between the LinkedIn import and the resume

### 2. Merge without inventing

- LinkedIn is the spine for employers, titles, dates, locations, education, and the public summary.
- Resumes supply bullets, metrics, and tools LinkedIn left out.
- If dates or titles disagree, keep the LinkedIn employment fact, use the resume's accomplishment wording, and tell the user about the conflict. Do not average them into a third version.
- One timeline entry per role. Do not merge two titles at the same company.
- A bullet may be tightened for length. It may not gain tools, metrics, scope, or outcomes that neither source states.
- If a role has no bullets in either source, use an empty `highlights` array. Do not write placeholder achievements. The current Rohit data has two invented bullets on Cardlytics "Software Engineer II"; do not copy that pattern.
- `topSkills` is a curated subset of skills the sources name, strongest and most recent first. Do not add a technology because it is typical for the job title.
- Portfolio cards describe domains the person actually worked in, with `status: "Coming soon"`, unless a source gives a public URL. Do not present imagined case studies as finished work.
- Compute "N+ years" from the earliest professional start date in the sources. Do not round up past what the dates support.
- `monogram` is the initials of the name.

### 3. Write `profile.ts`, then the voice lines

Replace the Rohit content in `src/data/profile.ts`, then update every row in the copy table above. Summary and `seeking` stay in the person's voice, using their wording where it is already strong.

Section headlines should name their real arc (industries, systems, or craft), in the same typographic pattern: short, confident, specific. The teal/ink layout stays. Change `--signal` in `globals.css` only when the user asks for a different accent.

Replace `public/hero-infrastructure.png` with a dark, full-bleed photograph suited to their field. Update the `alt` text. Keep the left-weighted dark gradient so the headline stays readable. Point `Hero.tsx` at the new file.

Set `metadata.title` to `{Name} — {Title}`.

### 4. Point the twin at the new profile

- Greeting, header monogram, and suggestions in `DigitalTwin.tsx`
- `X-Title` in `route.ts` (`{Name} - Digital Twin`, ASCII hyphen)
- Prompt text in `twin-prompt.ts`, with no leftover employers or pronouns from the previous person

### 5. Check the result

Run the site and walk the page at desktop and a phone width.

- Nav links land on `#about`, `#journey`, `#portfolio`, `#contact`.
- Every job, date, skill, and school matches the fact sheet.
- No previous person's name, company, or domain remains (search the repo).
- Hero type is readable on the photo. Primary buttons are visible on the dark hero.
- Chat: one question the sources answer, one false employer ("Did you work at Google?" or similar), one question the sources do not answer. The twin stays inside the facts and admits the gap.
- `npm run build` succeeds.

Do not commit `.env`, API keys, or resume files unless the user explicitly asks.
