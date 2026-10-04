"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { DM_Sans, DM_Serif_Display, DM_Mono } from "next/font/google";
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
});
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
});

const ASSETS = {
  photo: "/portofolio/photo.jpg",
  cv: "/portofolio/cv.pdf",
};

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#skills", label: "Skills" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#play", label: "Play" },
  { href: "#contact", label: "Contact" },
];

const ABOUT_STATS = [
  { label: "School", value: "SMK Negeri 1 Jakarta" },
  { label: "Major", value: "SIJA, 4 year program" },
  { label: "Focus", value: "Software Engineering & Robotics" },
  { label: "Based in", value: "Depok, Indonesia" },
  { label: "Status", value: "Open to opportunities" },
];

type ExperienceItem = {
  period: string;
  title: string;
  tag: "Award" | "Competition" | "Training" | "Training & Competition";
  points: string[];
};

const EXPERIENCE: ExperienceItem[] = [
  {
    period: "Jul 2026 - Present",
    title: "Training & Competition, Samsung Solve For Tomorrow",
    tag: "Training & Competition",
    points: [
      "Completed a one month design thinking training program mentored by Samsung.",
      "Built an IoT workout companion with an AI coaching assistant.",
    ],
  },
  {
    period: "Aug 2026",
    title: "1st Place, Creative Robotic Senior High School Gebyar Merdeka GliterJak DKI Jakarta",
    tag: "Award",
    points: [
      "Developed a garden patrol robot named Grenvis as a programmer and wiring technician",
      "Built a fullstack web infrastructure for garden monitoring.",
    ],
  },
  {
    period: "Jun 2026 - Jul 2026",
    title: "Collaborative Robotic System Integration, Training & Competition",
    tag: "Competition",
    points: [
      "Trained as a collaborative robotic operator and programmer.",
      "Competed at a national scale in the Collaborative Robotic System Integration competition.",
    ],
  },
  {
    period: "Mar 2026 - Apr 2026",
    title: "3rd Place, Student Competition (LKS) - Cloud Computing, Central Jakarta Region 1",
    tag: "Award",
    points: [
      "Built a serverless hospital administration platform using Amazon Web Services.",
      "Gained hands on understanding of cloud infrastructure on AWS.",
    ],
  },
  {
    period: "Feb 2026",
    title: "3rd Place, UI/UX Design Compiler XVI",
    tag: "Award",
    points: [
      'Designed a UI/UX concept for "WargaKlik", a smart community platform for public issue petitions.',
      "Deepened understanding of UI terminology and patterns for web platforms.",
    ],
  },
  {
    period: "Dec 2025 - Jan 2026",
    title: "2nd Place, Scientific Paper Competition, LITECROWLED",
    tag: "Award",
    points: [
      "Researched water pH levels at school water refill stations.",
      'Built "PHscope", an app to analyze water pH quality at school.',
    ],
  },
  {
    period: "Sep 2025 - Oct 2025",
    title: "1st Place, IoT ITechnoCup, Politeknik Negeri Jakarta",
    tag: "Award",
    points: [
      "Built LUMINA, a face recognition based food & beverage lunch management system.",
      "Took on the roles of web developer and UI/UX designer.",
    ],
  },
];

type Project = {
  index: string;
  category: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  links: { label: string; href: string }[];
};

const PROJECTS: Project[] = [
  {
    index: "01",
    category: "Project",
    title: "Atlet Guardian",
    description: "An IoT based PWA that serves as the companion software for an advanced fitness band. It features an integrated AI model that acts as a virtual coach, assisting users with personalized workouts tailored to their specific needs.",
    image: "/portofolio/projects/athlet-guardian.jpg",
    tags: ["Frontend", "Backend", "IoT", "Fullstack", "Engineering"],
    links: [{ label: "GitHub", href: "https://github.com/Vkzapple/Atlet-Guardian" }],
  },
  {
    index: "02",
    category: "IoT & Web Development",
    title: "LUMINA",
    description:
      "A face-recognition-based food and beverage lunch management system, built for the ITechnoCup competition.",
    image: "/portofolio/projects/lumina.jpg",
    tags: ["IoT", "Face Recognition", "Web Development"],
    links: [{ label: "GitHub", href: "https://github.com/fzlngh/Lumina" }],
  },
  {
    index: "03",
    category: "Full-Stack Development",
    title: "TEMANAI",
    description: "A progressive web app (PWA) chatbot that you can install directly on your phone. The backend is powered by Go and the go-chi framework. The AI helps with simple tasks and runs on three separate engines that act as fallbacks for one another if one goes down.",
    image: "/portofolio/projects/temanai.jpg",
    tags: ["Frontend", "Backend", "Go", "React", "PWA", "AI"],
    links: [
      { label: "Frontend", href: "https://github.com/fzlngh/frontend-temanAI" },
      { label: "Backend", href: "https://github.com/fzlngh/backend-temanAI" },
    ],
  },
];

const CONTACT_LINKS = [
  { label: "GitHub", value: "github.com/fzlngh", href: "https://github.com/fzlngh" },
  { label: "Instagram", value: "@pajilowkey", href: "https://www.instagram.com/pajilowkey" },
  { label: "Email", value: "nugrahafazila@gmail.com", href: "mailto:nugrahafazila@gmail.com" },
];

const MARQUEE_ITEMS = [
  "Fullstack Developer",
  "Cloud Engineer",
  "Collaborative Robotic Operator",
  "UI/UX Design",
  "IoT Builder",
  "5 Competition Placements",
  "SMK Negeri 1 Jakarta · SIJA",
];

type Signal = { name: string; glyph: string };

const SIGNALS: Signal[] = [
  { name: "star", glyph: "✦" },
  { name: "circle", glyph: "●" },
  { name: "triangle", glyph: "▲" },
  { name: "diamond", glyph: "◆" },
  { name: "cross", glyph: "✚" },
];

const EXPLORE_MILESTONES = [
  { id: "about", label: "About", signal: SIGNALS[0] },
  { id: "experience", label: "Experience", signal: SIGNALS[1] },
  { id: "projects", label: "Projects", signal: SIGNALS[2] },
  { id: "skills", label: "Skills", signal: SIGNALS[3] },
  { id: "contact", label: "Contact", signal: SIGNALS[4] },
];

function useRevealOnScroll() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(".reveal");
    const bars = document.querySelectorAll<HTMLElement>(".fill-bar");
    const revealVisible = () => {
      const viewportHeight = window.innerHeight;
      [...items, ...bars].forEach((item) => {
        const bounds = item.getBoundingClientRect();
        if (bounds.top < viewportHeight && bounds.bottom > 0) {
          item.classList.add("is-visible");
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((item) => observer.observe(item));
    bars.forEach((bar) => observer.observe(bar));
    revealVisible();
    window.addEventListener("scroll", revealVisible, { passive: true });
    window.addEventListener("resize", revealVisible);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", revealVisible);
      window.removeEventListener("resize", revealVisible);
    };
  }, []);
}

function useHeaderScrollState() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scrolled;
}

function useActiveSection() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sections = NAV_LINKS.map(({ href }) => document.querySelector<HTMLElement>(href)).filter(
      (section): section is HTMLElement => section !== null
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-22% 0px -62% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return activeSection;
}

function usePortfolioJourneyProgress() {
  const [visitedSections, setVisitedSections] = useState<string[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const newlyVisited = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.id);

        if (newlyVisited.length > 0) {
          setVisitedSections((current) =>
            [...new Set([...current, ...newlyVisited])]
          );
        }
      },
      { rootMargin: "-15% 0px -60% 0px", threshold: 0 }
    );

    EXPLORE_MILESTONES.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return visitedSections;
}

function useScrollProgress() {
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
      document.documentElement.style.setProperty("--scroll-progress", `${progress}%`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}

function useCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const enabled = useSyncExternalStore(
    (onChange) => {
      const finePointer = window.matchMedia("(pointer: fine)");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      finePointer.addEventListener("change", onChange);
      reducedMotion.addEventListener("change", onChange);
      return () => {
        finePointer.removeEventListener("change", onChange);
        reducedMotion.removeEventListener("change", onChange);
      };
    },
    () => window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );

  useEffect(() => {
    if (!enabled) return;
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let frame = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
      }
    };

    const tick = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return { enabled, dotRef, ringRef };
}

function useMagnetic() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.3}px)`;
    };
    const onLeave = () => {
      el.style.transform = "translate(0, 0)";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return ref;
}

function InitialsAvatar({ shape = "circle" }: { shape?: "circle" | "portrait" }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] ff-serif text-4xl text-white ${shape === "portrait" ? "rounded-[28px]" : "rounded-full"}`}>
      DFN
    </div>
  );
}

function Photo({ shape = "circle" }: { shape?: "circle" | "portrait" }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <InitialsAvatar shape={shape} />;
  return (
    <Image
      src={ASSETS.photo}
      alt="Dhiyaa Fazila Nugraha"
      width={600}
      height={600}
      sizes="(max-width: 768px) 190px, 300px"
      priority
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover object-top grayscale-[10%] transition-[filter] duration-300 hover:grayscale-0 ${shape === "portrait" ? "rounded-[28px]" : "rounded-full"}`}
    />
  );
}

export default function PortfolioPage() {
  useRevealOnScroll();
  useScrollProgress();
  const scrolled = useHeaderScrollState();
  const activeSection = useActiveSection();
  const visitedSections = usePortfolioJourneyProgress();
  const { enabled: cursorEnabled, dotRef, ringRef } = useCursor();
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryCtaRef = useMagnetic();
  const ghostCtaRef = useMagnetic();

  return (
    <div
      className={`portfolio ${dmSans.variable} ${dmSerif.variable} ${dmMono.variable} relative min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)]`}
    >
      <style>{`
        :root {
          color-scheme: light;
          --bg: #f7fbff;
          --surface: #ffffff;
          --surface2: #edf7ff;
          --border: rgba(23, 50, 77, 0.12);
          --border-hover: rgba(23, 50, 77, 0.25);
          --text: #17324d;
          --muted: #526b82;
          --accent: #087da8;
          --accent2: #176d9a;
          --white: #102b46;
        }

        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
          .reveal,
          .fill-bar,
          .marquee-track,
          .blob,
          .hero-item,
          .ring-spin,
          .pulse-dot {
            animation: none !important;
            transition: none !important;
          }
        }

        body {
          font-family: var(--font-sans), sans-serif;
        }

        .ff-serif {
          font-family: var(--font-serif), serif;
        }
        .ff-mono {
          font-family: var(--font-mono), monospace;
        }

        ::selection {
          background: var(--accent);
          color: #080d0c;
        }

        :where(a, button):focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 4px;
        }

        .scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 2px;
          width: var(--scroll-progress, 0%);
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          z-index: 200;
          transition: width 0.1s linear;
        }

        .grain::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 150;
        }

        .cursor-dot {
          position: fixed;
          top: 0;
          left: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          pointer-events: none;
          z-index: 300;
          mix-blend-mode: difference;
        }
        .cursor-ring {
          position: fixed;
          top: 0;
          left: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(198, 243, 107, 0.45);
          pointer-events: none;
          z-index: 299;
        }

        .reveal {
          opacity: 0;
          transform: translateY(26px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.is-visible {
          opacity: 1;
          transform: none;
        }
        .reveal-d1 {
          transition-delay: 0.08s;
        }
        .reveal-d2 {
          transition-delay: 0.16s;
        }
        .reveal-d3 {
          transition-delay: 0.24s;
        }

        .fill-bar {
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fill-bar.is-visible {
          transform: scaleX(1);
        }

        @keyframes floatSlow {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -30px) scale(1.05);
          }
        }
        .blob {
          animation: floatSlow 12s ease-in-out infinite;
        }
        .blob-delay {
          animation-delay: 3s;
        }

        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .ring-spin {
          animation: spinSlow 9s linear infinite;
        }

        @keyframes pulseDot {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.75);
          }
        }
        .pulse-dot {
          animation: pulseDot 2s infinite;
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 24s linear infinite;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero-item {
          opacity: 0;
          animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .nav-underline {
          position: relative;
        }
        .nav-underline::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -4px;
          height: 1px;
          background: var(--accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .nav-underline:hover::after {
          transform: scaleX(1);
        }

        .nav-underline[aria-current="location"] {
          color: var(--white);
        }

        .nav-underline[aria-current="location"]::after {
          transform: scaleX(1);
        }

        .project-art {
          background-image: linear-gradient(rgba(198, 243, 107, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(198, 243, 107, 0.06) 1px, transparent 1px);
          background-size: 22px 22px;
        }

        @keyframes signalEnter {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .signal-cell {
          animation: signalEnter 0.25s ease-out both;
        }
        .signal-cell:nth-child(2n) { animation-delay: 25ms; }
        .signal-cell:nth-child(3n) { animation-delay: 50ms; }
        @media (prefers-reduced-motion: reduce) {
          .signal-cell { animation: none; }
        }
      `}</style>

      <div className="grain" />
      <div className="scroll-progress" />
      {cursorEnabled && (
        <>
          <div ref={dotRef} className="cursor-dot" />
          <div ref={ringRef} className="cursor-ring" />
        </>
      )}

      <header
          className={`fixed inset-x-0 top-0 z-[100] flex items-center justify-between px-[6%] py-6 transition-colors duration-300 ${
          scrolled ? "border-b border-[var(--border)] bg-[#080d0cf2] backdrop-blur-xl" : ""
        }`}
      >
        <div className="ff-mono text-sm tracking-wide text-[var(--muted)]">
          <span className="text-[var(--accent)]">Fazil</span>.dev
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-5 lg:gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={activeSection === link.href.slice(1) ? "location" : undefined}
              className="nav-underline text-[13px] tracking-wide text-[var(--muted)] transition-colors hover:text-[var(--text)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="header-cta hidden items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors md:inline-flex"
        >
          Let&apos;s talk <span aria-hidden="true" className="ml-2">↗</span>
        </a>

        <button
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-md border border-[var(--border)] px-3 py-2 text-[var(--text)] transition-colors hover:border-[var(--border-hover)] md:hidden"
        >
          {menuOpen ? "\u2715" : "\u2630"}
        </button>

      </header>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[205] bg-black/55 md:hidden"
        />
      )}
      <nav
        id="mobile-navigation"
        aria-label="Mobile"
        inert={!menuOpen}
        onClick={() => setMenuOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setMenuOpen(false);
        }}
        className={`fixed right-0 top-0 z-[210] flex h-dvh w-[85vw] max-w-80 flex-col gap-6 border-l border-[var(--border-hover)] bg-[#101816] px-8 pb-8 pt-24 shadow-2xl shadow-black/70 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            aria-current={activeSection === link.href.slice(1) ? "location" : undefined}
            className="text-base text-[var(--text)] transition-colors hover:text-[var(--accent)]"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <main>
        <section id="home" className="portfolio-hero relative grid min-h-screen items-center gap-14 overflow-hidden px-[6%] pb-16 pt-28 md:grid-cols-2 md:pb-0 md:pt-0">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(198,243,107,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(198,243,107,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

          <div className="hero-copy relative z-10 order-1 text-center md:text-left">
            <div
              className="hero-item mb-6 inline-flex items-center gap-2 ff-mono text-xs uppercase tracking-[0.18em] text-[var(--accent2)]"
              style={{ animationDelay: "0.15s" }}
            >
              <span className="h-px w-6 bg-[var(--accent2)]" />
              Student builder
            </div>

            <h1
              className="hero-item mb-6 ff-serif text-[clamp(48px,7.6vw,88px)] font-normal leading-[0.98] text-[var(--white)]"
              style={{ animationDelay: "0.28s" }}
            >
              I build ideas
              <br />
              into <em className="italic text-[var(--accent)]">real things.</em>
            </h1>

            <p
              className="hero-item mx-auto mb-8 max-w-[500px] text-[15px] leading-[1.8] text-[var(--muted)] md:mx-0"
              style={{ animationDelay: "0.4s" }}
            >
              I&apos;m Dhiyaa Fazila Nugraha (Fazil), a SIJA student at SMK Negeri 1 Jakarta. I
              create fullstack software, work with collaborative robots, and explore cloud and
              IoT systems through hands-on projects.
            </p>

            <div
              className="hero-item flex flex-wrap justify-center gap-3 md:justify-start"
              style={{ animationDelay: "0.52s" }}
            >
              <a
                ref={primaryCtaRef as React.RefObject<HTMLAnchorElement>}
                href="#experience"
                className="hero-primary inline-block rounded-full bg-[var(--accent)] px-7 py-[14px] text-[13px] font-medium tracking-wide text-white transition-transform will-change-transform hover:brightness-95"
              >
                Explore my work <span aria-hidden="true" className="ml-2">↘</span>
              </a>
              <a
                ref={ghostCtaRef as React.RefObject<HTMLAnchorElement>}
                href="#contact"
                className="hero-secondary inline-block rounded-full border border-[var(--border)] px-7 py-[14px] text-[13px] font-medium tracking-wide text-[var(--text)] transition-transform will-change-transform hover:border-[var(--border-hover)]"
              >
                Get in touch
              </a>
            </div>
            <div className="hero-proof hero-item mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-left md:justify-start" style={{ animationDelay: "0.64s" }}>
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="proof-stars">✦</span>
                <span className="text-xs font-semibold">Award-winning projects</span>
              </div>
              <span className="proof-divider hidden h-5 w-px sm:block" aria-hidden="true" />
              <span className="text-xs">5 competition placements</span>
            </div>
          </div>

          <div className="hero-visual hero-item relative z-10 order-2 flex justify-center md:justify-end" style={{ animationDelay: "0.35s" }}>
            <div className="hero-portrait relative h-[290px] w-[260px] sm:h-[350px] sm:w-[320px] md:mr-[5%] md:h-[440px] md:w-[390px]">
              <div className="hero-halo absolute -inset-12 rounded-full" aria-hidden="true" />
              <div className="portrait-frame absolute inset-0 overflow-hidden rounded-[46%_46%_28px_28px]">
                <Photo />
              </div>
              <div className="hero-award absolute -left-6 top-[19%] z-10 rounded-2xl border px-4 py-3 shadow-xl sm:-left-12">
                <span className="block ff-mono text-[10px] uppercase tracking-wider">Recent highlight</span>
                <strong className="mt-1 block text-sm">1st place · Creative Robotics</strong>
                <span className="mt-1 block text-xs">GliterJak DKI Jakarta, 2026</span>
              </div>
              <div className="hero-school absolute -bottom-4 right-0 z-10 rounded-2xl border px-4 py-3 shadow-xl sm:-right-5">
                <span className="block ff-mono text-[10px] uppercase tracking-wider">Currently studying</span>
                <strong className="mt-1 block text-sm">SIJA · SMK Negeri 1 Jakarta</strong>
              </div>
              <div className="hero-availability absolute right-3 top-5 z-10 flex items-center gap-2 rounded-full border px-3 py-2 ff-mono text-[10px]">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Open to opportunities
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 overflow-hidden border-y border-[var(--border)] bg-[var(--surface)] py-4 md:mt-0">
          <div className="marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-6 whitespace-nowrap px-6 ff-mono text-xs uppercase tracking-[0.15em] text-[var(--muted)]"
              >
                {item}
                <span className="text-[var(--accent)]">*</span>
              </span>
            ))}
          </div>
        </div>

        <section id="skills" className="skills-showcase scroll-mt-24 px-[6%] py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="reveal mb-4 text-center ff-mono text-[11px] uppercase tracking-[0.16em] text-[var(--accent2)]">
              What I can do <span className="mx-2" aria-hidden="true">/</span> what I bring
            </div>
            <h2 className="reveal reveal-d1 mx-auto mb-12 max-w-3xl text-center ff-serif text-[clamp(30px,4.5vw,48px)] leading-tight text-[var(--white)]">
              Curious by nature. <em className="italic text-[var(--accent)]">Practical by design.</em>
            </h2>

            <div className="skills-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Fullstack development", detail: "From modular Python applications to responsive web experiences.", tags: ["Fullstack Developer", "Python", "Google Apps Script"] },
                { title: "Cloud computing", detail: "Built and competed with a serverless hospital administration platform on AWS.", tags: ["Cloud Engineer", "AWS", "Infrastructure"] },
                { title: "Collaborative robotics", detail: "Trained in collaborative robot operation, programming, and system integration.", tags: ["Robotic Operation", "Programming", "Schneider EcoStructure"] },
                { title: "IoT & hardware", detail: "Connected software and hardware in projects for monitoring and everyday use.", tags: ["IoT", "Wiring", "VS Code", "Jupyter"] },
                { title: "UI/UX design", detail: "Designed digital product concepts for community services and school workflows.", tags: ["WargaKlik", "LUMINA", "UI/UX"] },
                { title: "Research & teamwork", detail: "Combined scientific research with teaching, leadership, and collaborative project work.", tags: ["PHscope", "Teaching", "Leadership", "Indonesian · English · Japanese"] },
              ].map((card, index) => (
                <article key={card.title} className={`skill-card reveal ${index % 3 === 1 ? "reveal-d1" : index % 3 === 2 ? "reveal-d2" : ""}`}>
                  <span className="skill-number ff-mono" aria-hidden="true">0{index + 1}</span>
                  <h3 className="mt-5 ff-serif text-xl text-[var(--white)]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{card.detail}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {card.tags.map((tag) => <span key={tag} className="skill-tag rounded-full px-3 py-1.5 text-[11px]">{tag}</span>)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="profile-band scroll-mt-24 px-[6%] py-16 md:py-20">
          <div className="profile-band__inner mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[0.82fr_1.18fr] md:gap-16">
            <div className="profile-photo-wrap reveal relative mx-auto w-full max-w-[360px]">
              <div className="profile-photo overflow-hidden rounded-[28px]">
                <Photo shape="portrait" />
              </div>
              <div className="profile-photo-caption absolute -bottom-4 -right-3 rounded-2xl px-4 py-3 shadow-lg sm:-right-5">
                <strong className="block text-sm">Dhiyaa Fazila Nugraha</strong>
                <span className="mt-1 block text-xs">Student builder · SIJA</span>
              </div>
            </div>
            <div className="reveal reveal-d1">
              <div className="profile-eyebrow mb-4 flex items-center gap-3 ff-mono text-[11px] uppercase tracking-[0.14em]">
                A little about me <span className="h-px w-10" />
              </div>
              <h2 className="mb-6 ff-serif text-[clamp(32px,4.5vw,52px)] leading-tight">
                Learning by <em className="italic">making.</em>
              </h2>
              <div className="profile-copy flex flex-col gap-4 text-[15px] leading-[1.8]">
                <p>
                  I&apos;m a student in Information Systems, Networking, and Applications (SIJA) at
                  SMK Negeri 1 Jakarta, building a foundation across networks, software, and
                  hands-on engineering.
                </p>
                <p>
                  I enjoy working where software meets the physical world—from fullstack tools and
                  cloud platforms to IoT projects and collaborative robots. I&apos;ve also explored
                  UI/UX design and scientific research through student competitions.
                </p>
              </div>
              <ul className="profile-highlights mt-7 grid gap-3 sm:grid-cols-2">
                <li><span aria-hidden="true">✦</span> First place in creative robotics</li>
                <li><span aria-hidden="true">✦</span> Third place in cloud computing</li>
                <li><span aria-hidden="true">✦</span> SIJA four-year program</li>
                <li><span aria-hidden="true">✦</span> Based in Depok, Indonesia</li>
              </ul>
              <div className="profile-facts mt-8 flex flex-wrap gap-2">
                {ABOUT_STATS.filter((stat) => ["Major", "Focus", "Status"].includes(stat.label)).map((stat) => (
                  <span key={stat.label} className="rounded-full border px-3 py-2 text-xs">
                    <strong>{stat.label}:</strong> {stat.value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="scroll-mt-24 px-[6%] py-24 md:py-28">
          <div className="reveal mb-4 flex items-center gap-3 ff-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent2)]">
            Experience
            <span className="h-px w-10 bg-[var(--border)]" />
          </div>
          <h2 className="reveal reveal-d1 mb-14 ff-serif text-[clamp(28px,4vw,44px)] leading-tight text-[var(--white)]">
            Competitions and <em className="italic text-[var(--accent)]">training.</em>
          </h2>

          <ExperienceList />
        </section>

        <section className="px-[6%] pb-6">
          <div className="reveal rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="ff-serif text-xl text-[var(--white)] md:text-2xl">SMK Negeri 1 Jakarta</h3>
              <span className="ff-mono text-xs tracking-wide text-[var(--muted)]">Jul 2025 - Present</span>
            </div>
            <p className="mb-4 text-sm text-[var(--accent2)]">
              Information Systems, Networking, and Applications (SIJA)
            </p>
            <ul className="flex flex-col gap-1.5 text-sm leading-relaxed text-[var(--muted)]">
              <li className="flex gap-2">
                <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--accent)]" />
                Studying network architecture, fullstack development, cybersecurity, IoT, and cloud
                computing.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--accent)]" />A 4 year
                program that includes 1 year of industry internship (PKL).
              </li>
            </ul>
          </div>
        </section>

        <section id="projects" className="scroll-mt-24 px-[6%] py-24 md:py-28">
          <div className="reveal mb-4 flex items-center gap-3 ff-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent2)]">
            Projects
            <span className="h-px w-10 bg-[var(--border)]" />
          </div>
          <h2 className="reveal reveal-d1 mb-14 ff-serif text-[clamp(28px,4vw,44px)] leading-tight text-[var(--white)]">
            Things I&apos;ve <em className="italic text-[var(--accent)]">built.</em>
          </h2>

          <ProjectList />
        </section>

        <section id="play" className="scroll-mt-24 px-[6%] pb-16 pt-12 md:py-20">
          <div className="reveal relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[radial-gradient(ellipse_at_top_right,rgba(25,191,229,0.12),transparent_48%),var(--surface)] p-6 sm:p-9 md:p-12">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-[var(--border)] opacity-60" />
            <div className="pointer-events-none absolute -right-4 -top-8 h-40 w-40 rounded-full border border-[var(--border)] opacity-60" />
            <div className="relative grid gap-10 md:grid-cols-[1fr_320px] md:items-center">
              <div>
                <div className="mb-4 flex items-center gap-3 ff-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent2)]">
                  The portfolio quest <span className="h-px w-10 bg-[var(--border)]" />
                </div>
                <h2 className="mb-4 ff-serif text-[clamp(28px,4vw,42px)] leading-tight text-[var(--white)]">
                  Explore. Collect. <em className="italic text-[var(--accent)]">Complete.</em>
                </h2>
                <p className="max-w-lg text-sm leading-7 text-[var(--muted)]">
                  Temukan satu sinyal di setiap bagian portofolio. Progres bertambah saat kamu
                  menjelajahi About, Experience, Projects, Skills, dan Contact.
                </p>
                <a
                  href={`#${EXPLORE_MILESTONES.find(({ id }) => !visitedSections.includes(id))?.id ?? "contact"}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 ff-mono text-[11px] font-medium text-white transition hover:brightness-95"
                >
                  {visitedSections.length === 0
                    ? "Mulai jelajah"
                    : visitedSections.length === EXPLORE_MILESTONES.length
                      ? "Lihat hadiah"
                      : "Lanjut jelajah"}
                  <span aria-hidden="true">↘</span>
                </a>
              </div>
              <ExploreGame visitedSections={visitedSections} />
            </div>
          </div>
        </section>

        <section id="contact" className="contact-band scroll-mt-24 px-[6%] py-16 md:py-24">
          <div className="contact-inner mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1fr_0.95fr] md:gap-16">
            <div className="reveal">
              <div className="contact-eyebrow mb-4 flex items-center gap-3 ff-mono text-[11px] uppercase tracking-[0.14em]">
                Contact <span className="h-px w-10" />
              </div>
              <h2 className="mb-5 ff-serif text-[clamp(34px,5vw,56px)] leading-tight text-[var(--white)]">
                Let&apos;s make <em className="italic text-[var(--accent)]">something matter.</em>
              </h2>
              <p className="mb-7 max-w-lg text-[15px] leading-[1.8] text-[var(--muted)]">
                Open to opportunities, project collaborations, and conversations about technology.
                Reach out or take a look at my CV.
              </p>
              <ul className="contact-benefits mb-8 flex flex-col gap-3 text-sm text-[var(--text)]">
                <li><span aria-hidden="true">✓</span> Fullstack software and web projects</li>
                <li><span aria-hidden="true">✓</span> Cloud, IoT, and robotics collaboration</li>
                <li><span aria-hidden="true">✓</span> Based in Depok, Indonesia</li>
              </ul>
              <a href={ASSETS.cv} download className="contact-cv inline-flex min-h-11 items-center rounded-full border px-5 py-3 text-sm font-semibold transition-colors">
                Download CV <span aria-hidden="true" className="ml-2">↓</span>
              </a>
            </div>

            <div className="contact-card reveal reveal-d1 rounded-[28px] p-6 sm:p-8">
              <span className="contact-card-label ff-mono text-[10px] uppercase tracking-[0.16em]">Say hello</span>
              <h3 className="mt-3 ff-serif text-2xl text-[var(--white)]">Find me here</h3>
              <div className="my-6 flex flex-col gap-2">
                {CONTACT_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    className="contact-link group flex min-h-14 items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-colors"
                  >
                    <span className="contact-link-copy">
                      <span className="block ff-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">{link.label}</span>
                      <span className="mt-1 block text-sm font-semibold text-[var(--text)]">{link.value}</span>
                    </span>
                    <span aria-hidden="true" className="contact-arrow text-lg transition-transform group-hover:translate-x-1">↗</span>
                  </a>
                ))}
              </div>
              <a href="mailto:nugrahafazila@gmail.com" className="contact-email inline-flex min-h-12 w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors">
                Email me <span aria-hidden="true" className="ml-2">↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] px-[6%] py-8">
        <p className="ff-mono text-xs tracking-wide text-[var(--muted)]">© 2026 Dhiyaa Fazila Nugraha</p>
        <p className="ff-mono text-xs tracking-wide text-[var(--muted)]">Built with care in Jakarta, Indonesia</p>
      </footer>
    </div>
  );
}

function ExperienceList() {
  const filters: Array<"All" | ExperienceItem["tag"]> = [
    "All",
    "Award",
    "Competition",
    "Training",
    "Training & Competition",
  ];
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const visibleExperience =
    activeFilter === "All" ? EXPERIENCE : EXPERIENCE.filter((item) => item.tag === activeFilter);

  return (
    <>
      <div className="reveal mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter experience by type">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            aria-pressed={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full border px-4 py-2 ff-mono text-[11px] transition-colors ${
              activeFilter === filter
                ? "border-[var(--accent)] bg-[var(--accent)] text-[#080d0c]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-hover)] hover:text-[var(--text)]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="relative flex flex-col gap-1" aria-live="polite">
        <div className="absolute bottom-0 left-[7px] top-0 hidden w-px bg-[var(--border)] md:block" />
        {visibleExperience.map((item, index) => (
          <article
            key={item.title}
            className={`relative flex flex-col gap-2 border-b border-[var(--border)] py-7 last:border-none md:pl-10 ${
              index % 2 === 0 ? "" : "md:translate-x-2"
            }`}
          >
            <span className="absolute left-0 top-9 hidden h-3.5 w-3.5 rounded-full border-2 border-[var(--accent)] bg-[var(--bg)] md:block" />
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface2)] px-3 py-1 ff-mono text-[10px] uppercase tracking-wider text-[var(--accent2)]">
                {item.tag}
              </span>
              <span className="ff-mono text-xs tracking-wide text-[var(--muted)]">{item.period}</span>
            </div>
            <h3 className="ff-serif text-lg text-[var(--white)] md:text-xl">{item.title}</h3>
            <ul className="flex flex-col gap-1.5 text-sm leading-relaxed text-[var(--muted)]">
              {item.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--accent)]" />
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}

function ExploreGame({ visitedSections }: { visitedSections: string[] }) {
  const progress = visitedSections.length;
  const complete = progress === EXPLORE_MILESTONES.length;

  return (
    <div className="relative rounded-2xl border border-[var(--border)] bg-[#080d0c]/75 p-5 shadow-2xl shadow-black/20 sm:p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="mb-1 ff-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Sinyal terkumpul
          </p>
          <p className="ff-serif text-2xl text-[var(--white)]">
            {progress}<span className="text-[var(--muted)]"> / {EXPLORE_MILESTONES.length}</span>
          </p>
        </div>
        <span className="ff-mono text-xs text-[var(--accent)]">{Math.round((progress / EXPLORE_MILESTONES.length) * 100)}%</span>
      </div>
      <div
        className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label="Progres eksplorasi portofolio"
        aria-valuemin={0}
        aria-valuemax={EXPLORE_MILESTONES.length}
        aria-valuenow={progress}
      >
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500"
          style={{ width: `${(progress / EXPLORE_MILESTONES.length) * 100}%` }}
        />
      </div>
      <div className="grid grid-cols-5 gap-2" role="group" aria-label="Sinyal dari setiap bagian">
        {EXPLORE_MILESTONES.map(({ id, signal }) => {
          const collected = visitedSections.includes(id);
          return (
            <div
              key={id}
              role="img"
              className={`flex aspect-square items-center justify-center rounded-xl border text-xl transition-all duration-300 ${
                collected
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] bg-white/[0.025] text-[var(--muted)]/40"
              }`}
              aria-label={`${signal.name} signal ${collected ? "terkumpul" : "belum terkumpul"}`}
              title={`${signal.name} signal`}
            >
              {collected ? signal.glyph : "·"}
            </div>
          );
        })}
      </div>
      <p className="mt-4 min-h-10 ff-mono text-[10px] leading-relaxed text-[var(--muted)]" aria-live="polite">
        {complete
          ? "Quest selesai! Semua sinyal sudah kamu temukan. Terima kasih sudah menjelajahi portofolio ini."
          : `Jelajahi ${EXPLORE_MILESTONES.find(({ id }) => !visitedSections.includes(id))?.label} untuk menemukan sinyal berikutnya.`}
      </p>
      {complete && (
        <a
          href="#contact"
          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[var(--accent)] px-3 py-2 ff-mono text-[10px] text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[#080d0c]"
        >
          Explorer badge unlocked <span aria-hidden="true">✦</span>
        </a>
      )}
    </div>
  );
}

function ProjectList() {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  return (
    <div className="reveal reveal-d2 flex flex-col gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)]">
      {PROJECTS.map((project) => {
        const isExpanded = expandedProject === project.index;
        return (
          <article key={project.title} className="bg-[var(--surface)] transition-colors hover:bg-[var(--surface2)]">
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_180px] sm:p-8">
              <div>
                <div className="mb-2 ff-mono text-[11px] tracking-wide text-[var(--muted)]">
                  {project.index} / {project.category}
                </div>
                <h3 className="mb-2 ff-serif text-xl text-[var(--white)] md:text-2xl">{project.title}</h3>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`project-details-${project.index}`}
                  onClick={() => setExpandedProject(isExpanded ? null : project.index)}
                  className="flex items-center gap-2 ff-mono text-xs text-[var(--accent)] hover:text-[var(--white)]"
                >
                  {isExpanded ? "Hide details" : "Explore details"}
                  <span aria-hidden="true" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                    ↓
                  </span>
                </button>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center rounded-full border border-[var(--border)] px-4 py-2 ff-mono text-xs text-[var(--accent)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface2)]"
                    >
                      {link.label} <span aria-hidden="true" className="ml-2">↗</span>
                    </a>
                  ))}
                </div>
              </div>
              <ProjectArtwork project={project} />
            </div>
            <div
              id={`project-details-${project.index}`}
              hidden={!isExpanded}
              className="border-t border-[var(--border)] px-6 py-6 sm:px-8"
            >
              <p className="mb-4 max-w-[640px] text-sm leading-relaxed text-[var(--muted)]">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-[var(--border)] bg-[var(--surface2)] px-2.5 py-1 ff-mono text-[11px] text-[var(--muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ProjectArtwork({ project }: { project: Project }) {
  const [imageAvailable, setImageAvailable] = useState(true);

  return (
    <div className="project-art relative flex min-h-32 items-center justify-center overflow-hidden border border-[var(--border)] bg-[var(--surface2)] ff-mono text-4xl text-[var(--accent)]">
      {imageAvailable ? (
        <Image
          src={project.image}
          alt={`${project.title} project preview`}
          fill
          sizes="(max-width: 639px) 100vw, 180px"
          className="object-cover"
          onError={() => setImageAvailable(false)}
        />
      ) : (
        <span aria-hidden="true">{project.index}</span>
      )}
    </div>
  );
}