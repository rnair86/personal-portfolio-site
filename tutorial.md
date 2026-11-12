# Building a Professional Portfolio Site with an AI "Digital Twin"

### A beginner-friendly walkthrough of the Rohit Nair portfolio project

This tutorial explains, step by step, how this website was built: what each technology does, how the pieces fit together, and what every important file contains. It assumes **no prior front-end experience**. Where a term might be new, it's explained the first time it appears, and there's a glossary at the end.

---

## Table of contents

1. [What we built](#1-what-we-built)
2. [The technology, in plain English](#2-the-technology-in-plain-english)
3. [Core ideas you need first](#3-core-ideas-you-need-first)
4. [How the project is organized](#4-how-the-project-is-organized)
5. [High-level walkthrough](#5-high-level-walkthrough)
6. [Detailed code review](#6-detailed-code-review)
7. [Running and changing the site](#7-running-and-changing-the-site)
8. [Self-review: how the code could be improved](#8-self-review-how-the-code-could-be-improved)
9. [Glossary](#9-glossary)

---

## 1. What we built

A single-page personal website, built from a LinkedIn profile export (`profile.pdf`), with these sections, top to bottom:

| Section | What it shows |
| --- | --- |
| **Navigation bar** | Name/monogram plus links that jump to each section |
| **Hero** | Full-screen photo, headline, tagline, and two buttons |
| **About** | Summary paragraphs, skills, and spoken languages |
| **Career journey** | A vertical timeline of every job, plus education |
| **Portfolio** | Three "coming soon" cards reserved for future case studies |
| **Contact** | Email, LinkedIn, and phone cards |
| **Footer** | Name and copyright |
| **Digital Twin** | A floating AI chat window that answers questions about the career |

The design brief was **"Enterprise meets edgy"**: calm, professional structure (grids, thin lines, lots of whitespace) combined with bold typography, a dark cinematic hero, and a teal "signal" accent color.

The project was built in two rounds:

1. **The static website:** every section above except the chat.
2. **The Digital Twin:** an AI chatbot, powered by OpenRouter and the `openai/gpt-oss-120b` model, that speaks as Rohit's "twin" and answers only from his profile.

---

## 2. The technology, in plain English

| Technology | What it is | Why we used it |
| --- | --- | --- |
| **HTML** | The structure of a web page (headings, paragraphs, buttons) | Every website is HTML in the end |
| **CSS** | The styling (colors, sizes, layout, animation) | Makes it look good |
| **JavaScript** | The programming language of the browser | Makes the page interactive |
| **TypeScript** | JavaScript plus *types* (labels saying "this is a string", "this is a list of messages") | Catches mistakes before you run the code |
| **React 19** | A library for building a UI out of reusable *components* | Lets us write each section as its own small piece |
| **Next.js 16** | A *framework* built on React that adds routing, a server, image optimization, and fonts | Gives us both the website and a small back-end (for the AI chat) in one project |
| **Tailwind CSS 4** | A way of styling by adding short class names like `text-sm` or `mt-6` directly in the markup | Fast to write, and keeps styling next to the thing it styles |
| **Google Fonts via `next/font`** | **Syne** (the wide, bold display font) and **IBM Plex Sans** (body text) | Distinctive headlines while body text stays readable |
| **OpenRouter** | A service that gives one API for many AI models | Lets us call `openai/gpt-oss-120b` with a single API key |
| **`openai/gpt-oss-120b`** | An open-weight large language model (LLM) | Generates the Digital Twin's answers |

### Front end vs. back end

- The **front end** is what runs in the visitor's **browser**: the page they see and click.
- The **back end** is code that runs on a **server**, a computer you control.

Next.js lets one project contain both. That matters here because the AI chat needs a **secret API key**. If that key were sent to the browser, anyone could open developer tools, copy it, and spend your credits. So the browser talks to *our own* server, and our server talks to OpenRouter with the key.

```text
 Visitor's browser  ──►  Our Next.js server (/api/chat)  ──►  OpenRouter  ──►  gpt-oss-120b
   (no secrets)             (holds OPENROUTER_API_KEY)
```

---

## 3. Core ideas you need first

If you're brand new, read this section before the code review. Everything later builds on these five ideas.

### 3.1 Components

A **component** is a function that returns a piece of UI. You write it once and use it like a custom HTML tag.

```tsx
function Greeting() {
  return <h1>Hello!</h1>;
}

// Used elsewhere like this:
<Greeting />
```

Our whole page is a stack of components: `<Nav />`, `<Hero />`, `<About />`, and so on.

### 3.2 JSX

That HTML-looking code inside JavaScript is called **JSX**. A few differences from plain HTML:

- `class` is written `className` (because `class` is a reserved word in JavaScript).
- Curly braces `{ }` insert JavaScript values: `<p>{profile.name}</p>` shows the name.
- Special characters like apostrophes are escaped: `can&apos;t` shows up as `can't`.

### 3.3 Props

**Props** are inputs to a component, like arguments to a function:

```tsx
function Badge({ label }: { label: string }) {
  return <span>{label}</span>;
}

<Badge label="AWS" />
```

### 3.4 State

**State** is data that can change while the page is open, like "is the chat window open?" When state changes, React automatically re-draws the parts of the page that depend on it.

```tsx
const [open, setOpen] = useState(false); // starts closed
setOpen(true);                           // React re-renders with the window open
```

### 3.5 Server components vs. client components

In Next.js, components are **server components by default**. They run once on the server, produce HTML, and send *no JavaScript* for themselves to the browser. That makes pages fast.

If a component needs interactivity (clicks, typing, scroll tracking, state), you put `"use client"` at the very top of the file. That makes it a **client component**, which runs in the browser.

In this project:

| Server components (no JS shipped) | Client components (`"use client"`) |
| --- | --- |
| `Hero`, `About`, `Journey`, `Portfolio`, `Contact`, `Footer`, `page.tsx`, `layout.tsx` | `Nav` (tracks scrolling, mobile menu), `Reveal` (scroll animations), `DigitalTwin` (chat), `TwinButton` (click handler) |

A good rule: **start as a server component, and only add `"use client"` when you need interactivity.**

---

## 4. How the project is organized

```text
Site/
├── .env                        ← secret API key (never committed to git)
├── profile.pdf                 ← the LinkedIn export the content came from
├── package.json                ← project name, scripts, and dependencies
├── public/
│   └── hero-infrastructure.png ← the hero background photo
└── src/
    ├── app/
    │   ├── layout.tsx          ← the outer HTML shell: fonts, <html>, <body>, page title
    │   ├── page.tsx            ← the home page: stacks all the sections
    │   ├── globals.css         ← design tokens (colors, fonts) and custom animations
    │   └── api/
    │       └── chat/
    │           └── route.ts    ← the back-end endpoint the chat talks to
    ├── components/
    │   ├── Nav.tsx             ← top navigation bar
    │   ├── Hero.tsx            ← full-screen intro
    │   ├── About.tsx           ← summary, skills, languages
    │   ├── Journey.tsx         ← career timeline and education
    │   ├── Portfolio.tsx       ← "coming soon" project cards
    │   ├── Contact.tsx         ← contact cards
    │   ├── Footer.tsx          ← page footer
    │   ├── Reveal.tsx          ← reusable "fade in when scrolled into view" wrapper
    │   ├── DigitalTwin.tsx     ← the AI chat window
    │   └── TwinButton.tsx      ← a button that opens the chat from anywhere
    ├── data/
    │   └── profile.ts          ← ALL the career content lives here
    └── lib/
        └── twin-prompt.ts      ← builds the AI's instructions from profile.ts
```

### Why this layout?

- **`src/app/`** is special in Next.js (the "App Router"). The folder structure *is* the URL structure: `app/page.tsx` is `/`, and `app/api/chat/route.ts` is `/api/chat`.
- **`src/components/`** holds reusable UI pieces.
- **`src/data/`** separates **content** from **presentation**. To update a job, you edit one data file, not six components.
- **`src/lib/`** holds helper logic that isn't UI.

---

## 5. High-level walkthrough

### 5.1 What happened, in order

1. **Read the LinkedIn PDF** and pulled out name, headline, summary, skills, languages, every job, and education.
2. **Created a Next.js app** with `create-next-app` (TypeScript, Tailwind, App Router, `src/` folder).
3. **Moved all content into `src/data/profile.ts`** so components only handle layout.
4. **Built a design system** in `globals.css`: a color palette, two fonts, and reusable animations.
5. **Generated a hero image**: a moody data-center corridor that suits an infrastructure and payments engineer.
6. **Built each section as its own component** and stacked them in `page.tsx`.
7. **Added scroll-reveal motion** with a small `Reveal` component.
8. **Verified in a real browser** at desktop and phone sizes, and fixed a low-contrast button.
9. **Added the Digital Twin:** a server route (`/api/chat`), a prompt builder, and a chat UI.
10. **Tested the chat**: accurate answers, honest "I don't know" answers, and a fix for two bugs found along the way.

### 5.2 How a page load works

```text
Browser requests  http://localhost:3000/
        │
        ▼
Next.js runs layout.tsx  →  loads fonts, sets <html>/<body>, page title
        │
        ▼
Next.js runs page.tsx    →  <Nav/> <Hero/> <About/> <Journey/> <Portfolio/> <Contact/> <Footer/> <DigitalTwin/>
        │
        ▼
Server components become plain HTML; client components also ship their JavaScript
        │
        ▼
Browser shows the page; client components "wake up" (hydrate) and become interactive
```

### 5.3 How a chat message works

```text
1. Visitor types "What's your AWS experience?" and presses Enter
2. DigitalTwin.tsx  → POST /api/chat  with the whole conversation so far
3. route.ts checks the input, reads OPENROUTER_API_KEY from .env
4. route.ts adds a "system prompt" (instructions + full profile) and calls OpenRouter
5. OpenRouter streams the answer back piece by piece
6. route.ts strips the streaming wrapper and forwards just the text
7. DigitalTwin.tsx appends each piece to the message as it arrives → the "typing" effect
```

---

## 6. Detailed code review

We'll go file by file, in the order the data flows: **content → shell → page → sections → chat**.

### 6.1 `src/data/profile.ts`: the single source of truth

All career content lives in one file, as plain JavaScript objects.

```ts
export const profile = {
  name: "Rohit Nair",
  monogram: "RN",
  title: "Software Engineer",
  location: "Floral Park, New York",
  email: "rohitmohanihm@gmail.com",
  linkedin: "https://www.linkedin.com/in/rnair8",
  summary: [ /* three paragraphs */ ],
  topSkills: ["Software Engineering", "Cloud Infrastructure", "AWS", /* ... */],
  // ...
} as const;
```

**What to notice:**

- **`export`** makes the object importable from other files.
- **`as const`** tells TypeScript these values won't change, so it can type them more precisely.

Jobs get their own **type**, which describes the shape every job must have:

```ts
export type Experience = {
  company: string;
  role: string;
  period: string;
  duration: string;
  location: string;
  highlights: string[];   // a list of strings
  current?: boolean;      // the "?" means optional
};

export const experiences: Experience[] = [
  {
    company: "Cardlytics",
    role: "Software Engineer III",
    period: "Mar 2023 — Oct 2025",
    // ...
  },
  // ...
];
```

If you forget `location` on a job, TypeScript shows an error before you ever open the browser. That's the main benefit of types.

> **Beginner takeaway:** keeping content in data files means non-designers can update the site safely, and the same data can feed more than one feature. Here it feeds both the web page *and* the AI's knowledge.

---

### 6.2 `src/app/layout.tsx`: the outer shell

Every page is wrapped by the root layout. It's where fonts and the page `<title>` are set.

```tsx
import { IBM_Plex_Sans, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const ibmPlex = IBM_Plex_Sans({
  variable: "--font-ibm",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rohit Nair — Software Engineer",
  description: "Software engineer specializing in scalable backend services...",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${syne.variable} ${ibmPlex.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
```

**What to notice:**

- **`next/font/google`** downloads the fonts at build time and serves them from your own site. That's faster and more private than linking to Google.
- **`variable: "--font-syne"`** exposes the font as a CSS variable, which `globals.css` then plugs into Tailwind.
- **`metadata`** sets the browser tab title and the description search engines see.
- **`{children}`** is where the page content (from `page.tsx`) gets inserted.

---

### 6.3 `src/app/globals.css`: the design system

This file defines the site's visual language once, so every component uses the same colors and effects.

#### Design tokens (named colors)

```css
:root {
  --bg: #eceef1;          /* cool light gray page background */
  --bg-elevated: #f7f8fa; /* slightly lighter panels */
  --ink: #0c0f14;         /* near-black text */
  --ink-muted: #4a5160;   /* secondary text */
  --signal: #0d9f8a;      /* teal accent: the "edgy" pop */
  --ember: #e84d2c;       /* orange-red for small highlights */
}

@theme inline {
  --color-ink: var(--ink);
  --color-signal: var(--signal);
  /* ... */
}
```

The `@theme` block is Tailwind 4's way of turning those variables into class names. After it, you can write `text-ink`, `bg-signal`, or `border-signal` anywhere. To rebrand the whole site, you'd change a handful of hex codes here.

#### Custom animations

```css
@keyframes rise-in {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-rise {
  animation: rise-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}
```

`@keyframes` describes an animation from a start state to an end state. Here, text starts invisible and 28px lower, then glides up into place. The `cubic-bezier(...)` part is the *easing curve*: it starts fast and settles gently, which feels more polished than a constant speed.

#### Scroll reveal classes

```css
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.8s ..., transform 0.8s ...;
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

Elements start hidden. When JavaScript adds the `is-visible` class, the `transition` animates them into view. You'll see the JavaScript half in `Reveal.tsx`.

#### Reusable buttons

```css
.btn-primary {
  background: #f4f6f8;
  color: var(--ink);
  /* ... */
}

.btn-primary:hover {
  background: var(--signal);
}
```

> **Real bug fixed here:** the first version of `.btn-primary` was *dark* ink on the *dark* hero photo, so it nearly disappeared. The browser screenshot check caught it, and the button was switched to light-on-dark. Always look at your UI; don't just trust the code.

---

### 6.4 `src/app/page.tsx`: the home page

The page itself is short. It just stacks the sections in order:

```tsx
export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <About />
        <Journey />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
      <DigitalTwin />
    </>
  );
}
```

**What to notice:**

- **`<> ... </>`** is a *fragment*: a wrapper that doesn't add an extra element to the HTML.
- **`<main>`** is a *semantic* HTML tag. Screen readers and search engines understand that it holds the main content.
- `DigitalTwin` sits outside `<main>` because it's a floating overlay, not part of the reading flow.

Keeping `page.tsx` this small is deliberate: you can read the whole page structure at a glance.

---

### 6.5 `src/components/Nav.tsx`: the navigation bar

The nav is transparent over the hero photo, then turns into a frosted-glass bar once you scroll. It needs to know the scroll position, so it's a **client component**.

```tsx
"use client";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // ...
}
```

**Line by line:**

- **`useState(false)`** creates two pieces of state: `scrolled` (has the user scrolled past 24px?) and `open` (is the mobile menu open?).
- **`useEffect(() => { ... }, [])`** runs code *after* the component appears on screen. The empty `[]` means "run once."
- Inside it, we **listen for scroll events** and update `scrolled`.
- The **`return () => ...`** is a *cleanup function*. It removes the listener if the component disappears, which prevents memory leaks.
- **`{ passive: true }`** tells the browser this listener won't block scrolling, which keeps scrolling smooth.

The styling then switches based on state:

```tsx
<header
  className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
    scrolled || open ? "nav-blur" : "bg-transparent"
  }`}
>
```

This is a **template literal** (backticks) with a **ternary** (`condition ? a : b`) inside it: if scrolled, add the blur class; otherwise stay transparent.

The **mobile menu** is a hamburger button. On small screens, the desktop links are hidden (`hidden md:flex`), and the button toggles a drop-down:

```tsx
<button
  type="button"
  aria-label="Toggle menu"
  aria-expanded={open}
  onClick={() => setOpen((v) => !v)}
>
```

`aria-label` and `aria-expanded` are **accessibility attributes**. They tell screen-reader users what the button does and whether the menu is open.

---

### 6.6 `src/components/Hero.tsx`: the first impression

The hero is a **server component**: it has no interactivity of its own. It layers three things on top of each other:

```tsx
<section id="top" className="relative min-h-[100svh] overflow-hidden text-white">
  {/* Layer 1: the photo */}
  <Image
    src="/hero-infrastructure.png"
    alt="Data center corridor with teal server rack lighting"
    fill
    priority
    className="object-cover object-center"
    sizes="100vw"
  />

  {/* Layer 2: a dark gradient so white text is readable */}
  <div
    className="absolute inset-0"
    style={{
      background:
        "linear-gradient(105deg, rgba(8,10,14,0.88) 0%, rgba(8,10,14,0.72) 42%, rgba(8,10,14,0.35) 70%, ...)",
    }}
  />

  {/* Layer 3: the text content */}
  ...
</section>
```

**What to notice:**

- **`next/image`** (`<Image>`) automatically resizes and compresses the photo for each device. **`priority`** tells Next.js to load it first, because it's the first thing visitors see.
- **`alt`** text describes the image for screen readers. It's also required for accessibility.
- **`min-h-[100svh]`** makes the hero at least the full screen height. `svh` ("small viewport height") avoids a jump on mobile browsers whose address bar shows and hides.
- The gradient is **darkest on the left** (88% opacity) where the text sits, and lighter on the right so the server racks show through. Text stays readable and the photo still shows.

The headline uses **fluid type**, which scales smoothly with the screen width:

```tsx
<h1 className="animate-rise font-display text-[clamp(2.75rem,8vw,5.75rem)] font-extrabold ...">
  Enterprise systems.
  <br />
  <span className="text-white/80">Edgy execution.</span>
</h1>
```

`clamp(min, preferred, max)` means "8% of screen width, but never smaller than 2.75rem or larger than 5.75rem."

Elements appear one after another using **staggered animation delays**:

```tsx
<p className="animate-fade ..." style={{ animationDelay: "0.1s" }}>...</p>
<h1 className="animate-rise ..." style={{ animationDelay: "0.18s" }}>...</h1>
<p className="animate-rise ..." style={{ animationDelay: "0.32s" }}>...</p>
```

The hero also includes the **"Ask my Digital Twin"** button. The hero is a server component and can't handle clicks itself, so it uses a tiny client component, `TwinButton`, covered in [section 6.12](#612-srccomponentstwinbuttontsx-opening-the-chat-from-anywhere).

---

### 6.7 `src/components/Reveal.tsx`: scroll animations

This is a reusable wrapper: anything placed inside `<Reveal>` fades up when it scrolls into view.

```tsx
"use client";

export function Reveal({ children, className = "", delay }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("is-visible");
          observer.unobserve(node);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${delayClass} ${className}`}>
      {children}
    </div>
  );
}
```

**Concepts introduced:**

- **`useRef`** gives you a handle to a real HTML element (here, the wrapping `<div>`) so you can work with it directly.
- **`IntersectionObserver`** is a browser feature that tells you when an element enters the screen. It's much more efficient than checking positions on every scroll event.
- **`threshold: 0.14`** means "fire when 14% of the element is visible."
- **`observer.unobserve(node)`** stops watching after the first reveal, so the animation plays only once.
- **`children`** is a special prop: whatever you put between `<Reveal>` and `</Reveal>`.

Usage elsewhere looks like this:

```tsx
<Reveal delay={2}>
  <p>This paragraph fades in slightly after the one above it.</p>
</Reveal>
```

> **Design pattern:** because `Reveal` is a client component that *wraps* server components, `About`, `Journey`, and the others stay server components (no JavaScript of their own) while still getting animation.

---

### 6.8 `src/components/About.tsx`: rendering lists from data

About shows the summary, a skills "tag cloud," and the spoken languages. The key technique is **rendering a list with `.map()`**:

```tsx
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
```

**What to notice:**

- **`.map()`** turns each item in an array into a piece of JSX. Twelve skills become twelve `<li>` tags.
- **`key={skill}`** is required whenever you render a list. React uses it to track which item is which when the list changes. Keys must be unique and stable, and the skill name is both.
- **`hover:border-signal`** is Tailwind's way of saying "on hover, use the teal border."

The layout is a **responsive grid**:

```tsx
<div className="... grid gap-12 md:grid-cols-[0.9fr_1.1fr] ...">
```

On phones it's one column. From the `md` breakpoint (768px wide and up), it becomes two columns, with the right one slightly wider for the paragraphs. This "mobile first, then add `md:` / `lg:` overrides" pattern is how responsive design works in Tailwind.

---

### 6.9 `src/components/Journey.tsx`: the career timeline

The timeline is a vertical line with a dot for each job. It's built from three layers:

```tsx
<div className="relative">
  {/* 1. The vertical rail */}
  <div className="timeline-rail absolute bottom-0 left-[7px] top-2 w-px origin-top bg-line-strong md:left-[11px]" />

  <ol className="space-y-10 md:space-y-14">
    {experiences.map((job, index) => (
      <li key={`${job.company}-${job.role}`} className="relative pl-10 md:pl-14">
        {/* 2. The dot; the most recent job gets a pulsing teal dot */}
        <span
          className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-ink bg-bg-elevated md:h-6 md:w-6 ${
            index === 0 ? "live-dot !border-signal !bg-signal" : ""
          }`}
        />

        {/* 3. The content */}
        <Reveal delay={index % 3 === 0 ? 1 : index % 3 === 1 ? 2 : 3}>
          ...
        </Reveal>
      </li>
    ))}
  </ol>
</div>
```

**What to notice:**

- **`<ol>`** (ordered list) is the semantically correct tag for a sequence of events.
- **`key={`${job.company}-${job.role}`}`** combines two fields, because Rohit held more than one role at the same company (Cardlytics, Micro Merchant). The company name alone wouldn't be unique.
- **`index === 0`** singles out the first (most recent) job for the pulsing "live" dot.
- **`index % 3`** (remainder after dividing by 3) cycles the reveal delay 1, 2, 3, 1, 2, 3... so items don't all animate at the same moment.
- **Absolute positioning:** the rail and dots use `absolute` inside a `relative` parent, which pins them exactly on the left edge.

Each job's bullet points use a small orange square instead of a default bullet, drawn with Tailwind's `before:` utilities:

```tsx
<li className="relative pl-4 ... before:absolute before:left-0 before:top-[0.65em] before:h-1 before:w-1 before:bg-ember">
  {item}
</li>
```

---

### 6.10 `Portfolio.tsx`, `Contact.tsx`, `Footer.tsx`

These follow the same patterns, so here are just the highlights.

**Portfolio** uses a neat trick for thin dividing lines between cards: the grid container has a gray background and a 1px gap, and each card has a solid background. The "gap" shows through as a line.

```tsx
<div className="grid gap-px bg-line-strong md:grid-cols-3">
  {portfolioPlaceholders.map((item, i) => (
    <article className="... bg-bg ...">...</article>
  ))}
</div>
```

**Contact** builds special links:

```tsx
<a href={`mailto:${profile.email}`}>...</a>                    {/* opens the email app */}
<a href={profile.linkedin} target="_blank" rel="noopener noreferrer">...</a>
<a href={`tel:+1${profile.phone.replace(/\D/g, "")}`}>...</a>  {/* taps to call on phones */}
```

- **`target="_blank"`** opens the link in a new tab. **`rel="noopener noreferrer"`** is a security best practice whenever you do that.
- **`.replace(/\D/g, "")`** is a *regular expression* that strips everything that isn't a digit, turning `347-497-0384` into `3474970384` for the `tel:` link.

**Footer** computes the year automatically, so the copyright never goes stale:

```tsx
const year = new Date().getFullYear();
```

---

### 6.11 `src/components/DigitalTwin.tsx`: the chat window

This is the most complex component. It's split into logical parts below.

#### Part 1: state

```tsx
const [open, setOpen] = useState(false);              // is the panel visible?
const [messages, setMessages] = useState<Message[]>([]); // the conversation
const [input, setInput] = useState("");               // what's in the text box
const [loading, setLoading] = useState(false);        // waiting for the AI?
const [error, setError] = useState<string | null>(null);

const scrollRef = useRef<HTMLDivElement>(null);       // the scrollable message area
const inputRef = useRef<HTMLTextAreaElement>(null);   // the text box (to focus it)
const abortRef = useRef<AbortController | null>(null); // lets us cancel a request
```

A `Message` is a simple typed object:

```ts
type Message = { role: "user" | "assistant"; content: string };
```

`"user" | "assistant"` is a **union type**: the role must be exactly one of those two strings. This is the same format AI chat APIs use, so the conversation can be sent almost as-is.

#### Part 2: side effects

```tsx
// Open when any TwinButton anywhere on the page fires the event
useEffect(() => {
  const onOpen = () => setOpen(true);
  window.addEventListener(OPEN_TWIN_EVENT, onOpen);
  return () => window.removeEventListener(OPEN_TWIN_EVENT, onOpen);
}, []);

// Put the cursor in the text box when the panel opens
useEffect(() => {
  if (open) inputRef.current?.focus();
}, [open]);

// Auto-scroll to the newest message
useEffect(() => {
  scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
}, [messages, loading]);
```

The array at the end of each `useEffect` is its **dependency list**: "re-run this whenever these values change." `[open]` re-runs when the panel opens or closes. `[messages, loading]` re-runs as each new chunk of text arrives, which keeps the view scrolled to the bottom.

The `?.` is **optional chaining**: "if this is null, stop here instead of crashing."

#### Part 3: sending a message and reading the stream

This is the heart of the chat:

```tsx
const send = useCallback(
  async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;           // ignore empty input or double-sends

    const history: Message[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]); // empty bubble = "thinking…"
    setInput("");
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply }]);
      }

      if (!reply.trim()) throw new Error("No response received. Please try again.");
    } catch (err) {
      if ((err as Error).name === "AbortError") return; // user pressed Reset: not an error
      setMessages(history);                               // remove the empty bubble
      setError((err as Error).message);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  },
  [loading, messages],
);
```

**Step by step:**

1. **`[...messages, newItem]`** uses the *spread operator* to make a **new** array with the new message on the end. React state must be replaced, never changed in place, or React won't notice the change.
2. An **empty assistant message** is added immediately. The UI shows three pulsing dots while `content` is empty.
3. **`fetch("/api/chat", ...)`** sends the conversation to *our own* server. The browser never sees the API key.
4. **`res.body.getReader()`** reads the response **as a stream**: pieces arrive as the AI generates them, instead of waiting for the full answer.
5. The **`while (true)` loop** reads each piece, appends it to `reply`, and updates state. Each update re-renders the bubble, which produces the typing effect.
6. **`AbortController`** lets the Reset button cancel a request that's still in flight.
7. **`try / catch / finally`**: `catch` handles failures and shows a friendly error; `finally` always runs, so `loading` is switched off whether the request succeeded or failed.
8. **`useCallback`** keeps the same `send` function between renders unless `loading` or `messages` changes.

#### Part 4: light Markdown formatting

The AI sometimes replies with `**bold**`, `*italic*`, and `- ` bullets. A small function converts those into real formatting:

```tsx
function renderInline(text: string) {
  return text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i} className="text-ink">{part.slice(1, -1)}</em>;
    }
    return part.replace(/^- /gm, "• ");
  });
}
```

It splits the text wherever it finds `**...**` or `*...*`, wraps those pieces in `<strong>` or `<em>`, and turns line-starting dashes into bullets. Because React renders this as elements rather than raw HTML, it's **safe**: a malicious reply can't inject scripts. (Section 8 suggests a more complete approach.)

#### Part 5: keyboard handling

```tsx
<textarea
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();  // don't insert a newline
      send(input);
    }
  }}
  maxLength={2000}
/>
```

Enter sends, and Shift+Enter adds a new line, which is the convention in most chat apps. `maxLength={2000}` matches the server's limit, so users are stopped *before* sending something the server would reject.

#### Part 6: responsive panel

```tsx
<section
  role="dialog"
  aria-label="Digital Twin chat"
  className="... fixed inset-x-0 bottom-0 h-[85svh] ... sm:inset-x-auto sm:bottom-24 sm:right-5 sm:h-[600px] sm:w-[400px] ..."
>
```

On phones the panel is a full-width sheet covering 85% of the screen. From the `sm` breakpoint up, it becomes a 400×600px floating card in the corner. It's one element, with two layouts chosen by breakpoint prefixes.

---

### 6.12 `src/components/TwinButton.tsx`: opening the chat from anywhere

**The problem:** the Hero (a server component) wants a button that opens the chat, but the chat's `open` state lives inside `DigitalTwin`, in a different part of the page.

**The solution:** a **custom browser event**, which works like a radio broadcast.

```tsx
"use client";

export function TwinButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_TWIN_EVENT))}
    >
      {children}
    </button>
  );
}
```

`TwinButton` *broadcasts* `"open-digital-twin"`, and `DigitalTwin` *listens* for it (see Part 2 above). Neither needs to know where the other lives. You can drop a `TwinButton` into any section and it will work.

---

### 6.13 `src/app/api/chat/route.ts`: the back end

In the App Router, a file named `route.ts` creates an **API endpoint**. Because this one lives at `app/api/chat/`, it answers requests to `/api/chat`. Exporting a function named `POST` means it handles POST requests.

#### Configuration

```ts
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";
const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;
```

Named constants at the top make the settings easy to find and change.

#### Step 1: check the secret key exists

```ts
export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Chat is not configured on the server." }, { status: 500 });
  }
```

**`process.env`** holds **environment variables**. Next.js automatically loads them from the `.env` file. This code runs **only on the server**, so the key never reaches the browser. The `.env` file is also listed in `.gitignore`, so it's never committed to git.

#### Step 2: never trust input from the browser

```ts
function isValidMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length > 0 &&
        m.content.length <= MAX_CHARS,
    )
  );
}
```

Anyone can send anything to a public endpoint, not just our chat UI. This **validation** function checks the shape of every message before we spend money calling the AI.

Two details:

- Only `"user"` and `"assistant"` roles are allowed. If a visitor could send their own `"system"` message, they could override the twin's instructions.
- **`value is ChatMessage[]`** is a TypeScript *type guard*. After this check passes, TypeScript knows `messages` has the right shape.

Invalid requests get a **400 Bad Request** response.

#### Step 3: call OpenRouter

```ts
const upstream = await fetch(OPENROUTER_URL, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": request.headers.get("origin") ?? "http://localhost:3000",
    "X-Title": "Rohit Nair - Digital Twin",
  },
  body: JSON.stringify({
    model: MODEL,
    stream: true,
    temperature: 0.4,
    reasoning: { effort: "low", exclude: true },
    messages: [
      { role: "system", content: buildTwinSystemPrompt() },
      ...messages.slice(-MAX_MESSAGES),
    ],
  }),
  signal: request.signal,
});
```

**Each setting explained:**

| Setting | Meaning |
| --- | --- |
| `Authorization: Bearer ...` | Proves to OpenRouter who we are |
| `HTTP-Referer`, `X-Title` | Optional OpenRouter headers identifying the app in their dashboard |
| `stream: true` | Send the answer in pieces as it's generated |
| `temperature: 0.4` | Lower = more focused and consistent; higher = more creative. A career twin should be factual. |
| `reasoning: { effort: "low", exclude: true }` | `gpt-oss-120b` "thinks" before answering. Low effort keeps replies fast, and `exclude` keeps that internal thinking out of the reply. |
| `system` message | The hidden instructions plus the full profile, placed first |
| `messages.slice(-MAX_MESSAGES)` | Only the last 20 messages, which limits cost on long chats |
| `signal: request.signal` | If the visitor closes the page, the OpenRouter call is cancelled too |

> **Real bug fixed here:** the first version had `"X-Title": "Rohit Nair — Digital Twin"` with an **em dash (—)**. HTTP headers only allow basic characters, so the request crashed with *"Cannot convert argument to a ByteString."* Swapping it for a plain hyphen fixed it. The lesson: read the server logs when something fails. The error pointed to the exact line.

#### Step 4: handle upstream errors without leaking details

```ts
if (!upstream.ok || !upstream.body) {
  const detail = await upstream.text().catch(() => "");
  console.error("OpenRouter error", upstream.status, detail);
  return Response.json({ error: "The digital twin is unavailable right now." }, { status: 502 });
}
```

The full error is logged **on the server** for you to debug. The visitor only sees a friendly message, so no internal details leak out.

#### Step 5: transform the stream

OpenRouter streams in a format called **Server-Sent Events (SSE)**, which looks like this:

```text
data: {"choices":[{"delta":{"content":"I've"}}]}
data: {"choices":[{"delta":{"content":" spent"}}]}
data: [DONE]
```

The browser only needs the words, so we unwrap them on the server:

```ts
const stream = upstream.body.pipeThrough(
  new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";         // keep an incomplete last line for next time

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          const text: string | undefined = json.choices?.[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        } catch {
          // SSE comments and partial frames are skipped
        }
      }
    },
  }),
);

return new Response(stream, {
  headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
});
```

**Key ideas:**

- **`TransformStream`** is a pipe that edits data as it flows through. Here, SSE goes in and plain text comes out.
- **The buffer:** network chunks don't line up neatly with lines. One chunk might end halfway through a line. `lines.pop()` keeps the unfinished line and joins it to the next chunk. This is a common streaming pattern.
- **`TextDecoder` / `TextEncoder`** convert between raw bytes and text.
- **`Cache-Control: no-store`** stops browsers or proxies from caching personal chat replies.

---

### 6.14 `src/lib/twin-prompt.ts`: teaching the AI who it is

The **system prompt** is the hidden instruction sheet the AI reads before every conversation. Instead of pasting the profile in by hand, it's **generated from `profile.ts`**:

```ts
export function buildTwinSystemPrompt() {
  return `You are the "Digital Twin" of ${profile.name}, embedded on his personal website...

Rules:
- Only use the facts in the PROFILE below. Never invent employers, dates, metrics, projects, or credentials.
- Do not embellish: don't add techniques, tools, outcomes, or design details (e.g. auto-scaling,
  monitoring, specific AWS services) that the PROFILE doesn't state. Rephrasing is fine; new specifics are not.
- If a question can't be answered from the profile, say so honestly and suggest reaching out directly...
- Be concise, warm, and professional. Prefer 2–5 sentences or a short bulleted list.
- Politely decline requests unrelated to ${profile.name}'s professional background...
- Do not share the phone number unless explicitly asked how to contact him.

PROFILE
Name: ${profile.name}
...
Experience (most recent first):
${formatExperience()}
...`;
}
```

**Why it's built this way:**

- **One source of truth:** update a job in `profile.ts`, and both the timeline *and* the AI learn about it.
- **Grounding rules:** LLMs will happily make things up (called *hallucinating*). The rules tell it to stay within the facts and admit when it doesn't know.
- **The "do not embellish" rule was added after testing.** The first answer about AWS invented details like "auto-scaling" and "monitoring/alerting" that aren't in the profile. After the rule was added, the same question produced only real facts. Test your prompts with real questions and tighten them based on what you see.

Tests that were run:

| Question | Result |
| --- | --- |
| "What payment processing experience do you have?" | Accurate: WorldPay, FirstMile/EMV/UL certification, Cores Messaging |
| "Did you work at Google?" | Honest "no," plus a pointer to email and LinkedIn |
| "What is your cloud and AWS experience?" | After the prompt fix, stuck to the stated facts only |

---

## 7. Running and changing the site

### Run it

Open a terminal in the project folder:

```bash
npm install     # first time only: downloads dependencies into node_modules/
npm run dev     # starts the dev server at http://localhost:3000
```

The dev server **hot-reloads**: save a file and the browser updates within a second.

Other useful commands:

```bash
npm run build   # production build; also catches type errors
npm run start   # serves the production build
npm run lint    # checks code for common mistakes
```

Stop the dev server with **Ctrl + C** in its terminal.

### The API key

The chat needs `.env` in the project root containing:

```text
OPENROUTER_API_KEY=your-key-here
```

Restart `npm run dev` after changing `.env`. Never commit this file; `.gitignore` already excludes it.

### Common edits

| I want to... | Edit this |
| --- | --- |
| Change a job, skill, or summary | `src/data/profile.ts` |
| Add a real portfolio link | `portfolioPlaceholders` in `src/data/profile.ts` (and add a link in `Portfolio.tsx`) |
| Change the accent color | `--signal` in `src/app/globals.css` |
| Change the hero headline | `src/components/Hero.tsx` |
| Change how the twin behaves | The rules in `src/lib/twin-prompt.ts` |
| Change the suggested chat questions | `suggestions` in `src/components/DigitalTwin.tsx` |
| Swap the AI model | `MODEL` in `src/app/api/chat/route.ts` |

---

## 8. Self-review: how the code could be improved

A candid review of the finished code, ordered roughly by importance.

### 8.1 Content accuracy (most important)

**Some content isn't from the LinkedIn profile.** The PDF lists **no bullet points** for *Software Engineer II at Cardlytics*, but `profile.ts` contains two invented highlights for that role:

```ts
highlights: [
  "Grew into senior backend ownership across campaign and publishing systems.",
  "Strengthened service reliability and delivery practices across distributed teams.",
],
```

The portfolio card descriptions are also placeholder copy. This matters twice over: visitors read it as fact, **and** the Digital Twin is told to treat everything in `profile.ts` as fact, so it repeats these lines confidently. **Fix:** replace them with real accomplishments, or remove the bullets for that role. The two early Micro Merchant roles were also merged into one timeline entry for brevity; split them if you want an exact match with LinkedIn.

### 8.2 Security and cost

- **No rate limiting on `/api/chat`.** Anyone who finds the endpoint can call it in a loop and use up your OpenRouter credits. Before deploying publicly, add per-IP rate limiting (for example with a service like Upstash), and set a spending limit in the OpenRouter dashboard.
- **No request timeout.** If OpenRouter hangs, the request hangs too. Combine `AbortSignal.timeout(30_000)` with the existing signal.
- **Publishing the phone number.** It's shown on the page and sits in the AI's prompt. Consider removing it from the public site and keeping email and LinkedIn as the contact routes.

### 8.3 Chat robustness

- **Mid-stream failures are silent.** If the connection drops halfway through, the visitor sees a truncated answer with no warning. The server could send an end marker, or the client could flag unexpectedly short replies.
- **Home-made Markdown parsing.** `renderInline` handles only bold, italics, and dashes. Numbered lists, links, and headings show up as raw symbols. Use a library such as `react-markdown` (which is also safe by default).
- **Array index used as React `key`** for messages (`key={i}`). It works here because messages are only ever appended, but giving each message an `id` (for example `crypto.randomUUID()`) is the more robust habit.
- **No persistence.** Refreshing the page loses the conversation. Saving it in `sessionStorage` would fix that.

### 8.4 Accessibility

- **The chat dialog isn't fully accessible.** It needs `aria-modal`, the **Escape** key to close, focus kept inside the panel while open, and focus returned to the button on close.
- **Streaming text isn't announced.** Screen-reader users won't hear replies arrive. Add `aria-live="polite"` to the message area.
- **Motion preferences are ignored.** Some people get motion sickness from animation. Wrap the animations in `@media (prefers-reduced-motion: no-preference)` so visitors who've asked their OS for reduced motion get a still page.
- **Content depends on JavaScript.** `.reveal` starts at `opacity: 0`, so if JavaScript fails to load, those sections stay invisible. A `<noscript>` style override, or hiding content only once JavaScript is confirmed running, would fix that.

### 8.5 Code organization

- **Some facts are hard-coded in the prompt** instead of coming from `profile.ts`: the Walmart role and the long headline string. Move them into `profile.ts` so there really is one source of truth.
- **Portfolio items have no `url` field.** Add `url?: string` to the data and render a real link when it's present, so launching a case study becomes a one-line data change.
- **Duplicated card styles** in `Contact.tsx` (three near-identical `<a>` blocks) could become a small `ContactCard` component.
- **The `Reveal` delay logic** (`delay === 1 ? ... : delay === 2 ? ...`) could be a simple lookup object: `{1: "reveal-delay-1", 2: "reveal-delay-2", 3: "reveal-delay-3"}[delay]`.

### 8.6 Testing and quality

- **No automated tests.** Good first candidates:
  - Unit tests for `isValidMessages` and the SSE parsing in `route.ts`.
  - A snapshot test for `buildTwinSystemPrompt`.
  - An end-to-end test (Playwright) that opens the chat and checks a reply appears. The OpenRouter call can be faked so tests don't cost money.
- **No "eval" set for the AI.** Keep a list of questions with expected answers (including trick questions like "Did you work at Google?") and re-run it whenever the prompt or model changes.

### 8.7 Nice-to-haves

- A downloadable résumé PDF button.
- Open Graph image (`opengraph-image.tsx`) so links shared on LinkedIn show a rich preview.
- A dark/light theme toggle.
- Analytics on which chat questions visitors ask, to learn what recruiters care about.

---

## 9. Glossary

| Term | Meaning |
| --- | --- |
| **API** | A way for one program to talk to another over the network |
| **API key** | A secret password that identifies you to an API |
| **App Router** | Next.js's system where folders inside `src/app/` become URLs |
| **Breakpoint** | A screen width where the layout changes (`sm` = 640px, `md` = 768px, `lg` = 1024px in Tailwind) |
| **Client component** | A React component that runs in the browser (`"use client"`) |
| **Component** | A reusable function that returns UI |
| **Dependency list** | The array at the end of `useEffect` that controls when it re-runs |
| **Environment variable** | A configuration value (often secret) supplied outside the code, e.g. in `.env` |
| **Hallucination** | When an AI states something false with confidence |
| **Hydration** | The browser attaching interactivity to HTML that came from the server |
| **JSX** | HTML-like syntax inside JavaScript/TypeScript |
| **LLM** | Large Language Model: the AI that generates text |
| **Props** | Inputs passed into a component |
| **Server component** | A React component that runs only on the server and ships no JavaScript |
| **SSE (Server-Sent Events)** | A format for streaming data from server to client as `data: ...` lines |
| **State** | Data that can change and causes the UI to re-render |
| **Streaming** | Sending a response in pieces as it's produced, instead of all at once |
| **System prompt** | Hidden instructions that shape an AI's behavior |
| **Tailwind utility class** | A short class name that applies one style, like `mt-6` (margin-top) |
| **Temperature** | An AI setting: lower is more predictable, higher is more creative |
| **Type (TypeScript)** | A description of what shape a value must have |
| **Validation** | Checking input is well-formed before using it |

---

*Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and OpenRouter (`openai/gpt-oss-120b`).*
