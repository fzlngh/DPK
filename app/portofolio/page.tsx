"use client";
import { useEffect, useRef, useState } from "react";
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
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
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
  tags: string[];
  image: string;
  comingSoon: boolean;
};

const PROJECTS: Project[] = [
  {
    index: "01",
    category: "Terminal Application",
    title: "Cashier System",
    description:
      "A modular POS application built in Python with an interactive terminal UI, structured architecture, and clean business logic for managing transactions.",
    tags: ["Python", "CLI", "Modular Architecture"],
    image: "/portofolio/projects/cashier-system.jpg",
    comingSoon: true,
  },
  {
    index: "02",
    category: "Web Development",
    title: "Portfolio Website",
    description:
      "This portfolio itself, built with Next.js and crafted for performance, smooth motion, and responsive design across desktop and mobile.",
    tags: ["Next.js", "TypeScript", "CSS"],
    image: "/portofolio/projects/portfolio-site.jpg",
    comingSoon: true,
  },
];

const SKILL_GROUPS: { title: string; items: string[] }[] = [
  { title: "Hard Skills", items: ["Fullstack Developer", "Collaborative Robotic Operation", "Cloud Engineer"] },
  { title: "Software", items: ["VS Code", "Jupyter", "Schneider EcoStructure", "Google Apps Script"] },
  { title: "Languages", items: ["Indonesian", "English", "Japanese"] },
  { title: "Soft Skills", items: ["Teaching", "Leadership"] },
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
];

function useRevealOnScroll() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(".reveal");
    const bars = document.querySelectorAll<HTMLElement>(".fill-bar");

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

    return () => observer.disconnect();
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
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced);
  }, []);

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

function InitialsAvatar() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] ff-serif text-4xl text-black">
      DFN
    </div>
  );
}

function Photo() {
  const [failed, setFailed] = useState(false);
  if (failed) return <InitialsAvatar />;
  return (
    <img
      src={ASSETS.photo}
      alt="Dhiyaa Fazila Nugraha"
      onError={() => setFailed(true)}
      className="h-full w-full rounded-full object-cover object-top grayscale-[20%] transition-[filter] duration-300 hover:grayscale-0"
    />
  );
}

export default function PortfolioPage() {
  useRevealOnScroll();
  useScrollProgress();
  const scrolled = useHeaderScrollState();
  const { enabled: cursorEnabled, dotRef, ringRef } = useCursor();
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryCtaRef = useMagnetic();
  const ghostCtaRef = useMagnetic();

  return (
    <div
      className={`${dmSans.variable} ${dmSerif.variable} ${dmMono.variable} relative min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)]`}
    >
      <style>{`
        :root {
          --bg: #06060a;
          --surface: #0f0f16;
          --surface2: #17171f;
          --border: rgba(255, 255, 255, 0.08);
          --border-hover: rgba(255, 255, 255, 0.18);
          --text: #eef0f5;
          --muted: #8a8ea3;
          --accent: #8b7bff;
          --accent2: #35e0c4;
          --white: #f6f6f8;
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
          .blob {
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
          color: #06060a;
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
          border: 1px solid rgba(139, 123, 255, 0.4);
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
          scrolled ? "border-b border-[var(--border)] bg-[#06060acc] backdrop-blur-xl" : ""
        }`}
      >
        <div className="ff-mono text-sm tracking-wide text-[var(--muted)]">
          <span className="text-[var(--accent)]">Fazil</span>.dev
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-underline text-[13px] tracking-wide text-[var(--muted)] transition-colors hover:text-[var(--text)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-md border border-[var(--border)] px-3 py-2 text-[var(--text)] transition-colors hover:border-[var(--border-hover)] md:hidden"
        >
          {menuOpen ? "\u2715" : "\u2630"}
        </button>

        <nav
          className={`fixed right-0 top-0 flex h-full w-64 flex-col gap-6 border-l border-[var(--border)] bg-[#06060af7] px-8 pb-8 pt-24 backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-base text-[var(--text)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section id="home" className="relative grid min-h-screen items-center gap-14 overflow-hidden px-[6%] pt-28 md:grid-cols-2 md:pt-0">
          <div className="blob pointer-events-none absolute -right-40 -top-52 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(139,123,255,0.10)_0%,transparent_70%)]" />
          <div className="blob blob-delay pointer-events-none absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(53,224,196,0.08)_0%,transparent_70%)]" />

          <div className="relative z-10 order-2 text-center md:order-1 md:text-left">
            <div
              className="hero-item mb-6 inline-flex items-center gap-2 ff-mono text-xs uppercase tracking-[0.18em] text-[var(--accent2)]"
              style={{ animationDelay: "0.15s" }}
            >
              <span className="h-px w-6 bg-[var(--accent2)]" />
              Available for opportunities
            </div>

            <h1
              className="hero-item mb-6 ff-serif text-[clamp(42px,7vw,72px)] font-normal leading-[1.05] text-[var(--white)]"
              style={{ animationDelay: "0.28s" }}
            >
              Hi, I&apos;m
              <br />
              <em className="italic text-[var(--accent)]">Fazil.</em>
            </h1>

            <p
              className="hero-item mx-auto mb-10 max-w-[440px] text-[15px] leading-[1.8] text-[var(--muted)] md:mx-0"
              style={{ animationDelay: "0.4s" }}
            >
              A vocational student at SMK Negeri 1 Jakarta, majoring in Information Systems,
              Networking, and Applications. I build fullstack software, operate collaborative
              robots, and design cloud infrastructure that solves real problems.
            </p>

            <div
              className="hero-item flex flex-wrap justify-center gap-4 md:justify-start"
              style={{ animationDelay: "0.52s" }}
            >
              <a
                ref={primaryCtaRef as React.RefObject<HTMLAnchorElement>}
                href="#experience"
                className="inline-block rounded-md bg-[var(--accent)] px-8 py-[13px] text-[13px] font-medium tracking-wide text-[#06060a] transition-transform will-change-transform hover:brightness-95"
              >
                View Experience
              </a>
              <a
                ref={ghostCtaRef as React.RefObject<HTMLAnchorElement>}
                href="#contact"
                className="inline-block rounded-md border border-[var(--border)] px-8 py-[13px] text-[13px] font-medium tracking-wide text-[var(--text)] transition-transform will-change-transform hover:border-[var(--border-hover)]"
              >
                Get in Touch
              </a>
            </div>
          </div>

          <div className="hero-item relative z-10 order-1 flex justify-center md:order-2" style={{ animationDelay: "0.35s" }}>
            <div className="relative h-[190px] w-[190px] md:h-[300px] md:w-[300px]">
              <div className="ring-spin absolute -inset-px rounded-full bg-[conic-gradient(from_0deg,var(--accent)_0%,transparent_40%,var(--accent2)_60%,transparent_80%,var(--accent)_100%)]" />
              <div className="absolute inset-[3px] rounded-full bg-[var(--bg)]" />
              <div className="absolute inset-[7px] overflow-hidden rounded-full">
                <Photo />
              </div>
              <div className="absolute bottom-3 right-0 z-10 flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface2)]/80 px-3 py-2 ff-mono text-[11px] text-[var(--muted)] backdrop-blur-md">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Open to work
              </div>
            </div>
          </div>
        </section>

        <div className="overflow-hidden border-y border-[var(--border)] bg-[var(--surface)] py-4">
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

        <section id="about" className="px-[6%] py-24 md:py-28">
          <div className="reveal mb-4 flex items-center gap-3 ff-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent2)]">
            About
            <span className="h-px w-10 bg-[var(--border)]" />
          </div>
          <h2 className="reveal reveal-d1 mb-14 ff-serif text-[clamp(28px,4vw,44px)] leading-tight text-[var(--white)]">
            Building with <em className="italic text-[var(--accent)]">intention.</em>
          </h2>

          <div className="grid gap-16 md:grid-cols-[1fr_1.4fr]">
            <div className="reveal reveal-d1 flex flex-col">
              {ABOUT_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-6 first:pt-0"
                >
                  <span className="flex-shrink-0 ff-mono text-xs tracking-wide text-[var(--muted)]">{stat.label}</span>
                  <span className="text-right text-sm text-[var(--text)]">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="reveal reveal-d2 flex flex-col gap-5 text-[15px] leading-[1.9] text-[var(--muted)]">
              <p>
                I&apos;m <span className="font-medium text-[var(--text)]">Dhiyaa Fazila Nugraha</span>, a student
                specializing in network systems, information technology, and application development.
                My program, SIJA, gives me a structured foundation in both theoretical knowledge and
                hands on engineering.
              </p>
              <p>
                I have a strong drive toward{" "}
                <span className="font-medium text-[var(--text)]">software engineering and robotics</span>, with
                hands on experience as a fullstack developer and a collaborative robotic operator. I&apos;ve
                also competed across UI/UX design, IoT, cloud computing, and scientific writing.
              </p>
              <p>
                My long term goal is to work at a global level, collaborating across cultures and
                contributing to technology that genuinely makes a difference.
              </p>
            </div>
          </div>
        </section>

        <section id="experience" className="px-[6%] py-24 md:py-28">
          <div className="reveal mb-4 flex items-center gap-3 ff-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent2)]">
            Experience
            <span className="h-px w-10 bg-[var(--border)]" />
          </div>
          <h2 className="reveal reveal-d1 mb-14 ff-serif text-[clamp(28px,4vw,44px)] leading-tight text-[var(--white)]">
            Competitions and <em className="italic text-[var(--accent)]">training.</em>
          </h2>

          <div className="relative flex flex-col gap-1">
            <div className="absolute bottom-0 left-[7px] top-0 hidden w-px bg-[var(--border)] md:block" />
            {EXPERIENCE.map((item, i) => (
              <div
                key={item.title}
                className={`reveal relative flex flex-col gap-2 border-b border-[var(--border)] py-7 last:border-none md:pl-10 ${
                  i % 2 === 0 ? "" : "reveal-d1"
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
                  {item.points.map((point, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--accent)]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
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

        <section id="projects" className="px-[6%] py-24 md:py-28">
          <div className="reveal mb-4 flex items-center gap-3 ff-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent2)]">
            Projects
            <span className="h-px w-10 bg-[var(--border)]" />
          </div>
          <h2 className="reveal reveal-d1 mb-14 ff-serif text-[clamp(28px,4vw,44px)] leading-tight text-[var(--white)]">
            Things I&apos;ve <em className="italic text-[var(--accent)]">built.</em>
          </h2>

          <div className="reveal reveal-d2 flex flex-col gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)]">
            {PROJECTS.map((project) => (
              <div
                key={project.title}
                className={`relative grid grid-cols-1 items-center gap-6 bg-[var(--surface)] p-8 transition-colors sm:grid-cols-[1fr_auto] ${
                  project.comingSoon ? "opacity-60" : "hover:bg-[var(--surface2)]"
                }`}
              >
                <div>
                  <div className="mb-2 ff-mono text-[11px] tracking-wide text-[var(--muted)]">
                    {project.index} / {project.category}
                  </div>
                  <div className="mb-2 ff-serif text-xl text-[var(--white)] md:text-2xl">{project.title}</div>
                  <p className="mb-4 max-w-[480px] text-sm leading-relaxed text-[var(--muted)]">
                    {project.description}
                  </p>
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
                  {project.comingSoon && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface2)] px-3 py-1.5 ff-mono text-[11px] text-[var(--muted)]">
                      <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                      Coming soon
                    </div>
                  )}
                </div>
                <div className="hidden text-xl text-[var(--border-hover)] sm:block">{"\u2192"}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="skills" className="px-[6%] py-24 md:py-28">
          <div className="reveal mb-4 flex items-center gap-3 ff-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent2)]">
            Skills
            <span className="h-px w-10 bg-[var(--border)]" />
          </div>
          <h2 className="reveal reveal-d1 mb-14 ff-serif text-[clamp(28px,4vw,44px)] leading-tight text-[var(--white)]">
            Tools of the <em className="italic text-[var(--accent)]">trade.</em>
          </h2>

          <div className="grid gap-10 sm:grid-cols-2">
            {SKILL_GROUPS.map((group, i) => (
              <div key={group.title} className={`reveal ${i % 2 === 0 ? "reveal-d1" : "reveal-d2"}`}>
                <div className="mb-5 ff-mono text-[11px] uppercase tracking-[0.12em] text-[var(--accent2)]">
                  {group.title}
                </div>
                <div className="flex flex-wrap gap-3">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="px-[6%] pb-28 pt-8 md:pt-12">
          <div className="reveal mb-4 flex items-center gap-3 ff-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent2)]">
            Contact
            <span className="h-px w-10 bg-[var(--border)]" />
          </div>
          <h2 className="reveal reveal-d1 mb-10 ff-serif text-[clamp(28px,4vw,44px)] leading-tight text-[var(--white)]">
            Let&apos;s <em className="italic text-[var(--accent)]">connect.</em>
          </h2>

          <div className="reveal reveal-d2 max-w-[600px]">
            <p className="mb-10 text-[15px] leading-[1.8] text-[var(--muted)]">
              I&apos;m open to opportunities, collaborations, or just a good conversation about
              technology. Reach out through any of the channels below, or grab a copy of my CV.
            </p>

            <div className="mb-8 flex flex-col gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)]">
              {CONTACT_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex items-center justify-between bg-[var(--surface)] px-6 py-5 transition-colors hover:bg-[var(--surface2)]"
                >
                  <span className="ff-mono text-xs tracking-wide text-[var(--muted)]">{link.label}</span>
                  <span className="flex items-center gap-3 text-sm text-[var(--text)]">
                    {link.value}
                    <span className="text-[var(--border-hover)] transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--accent)]">
                      {"\u2197"}
                    </span>
                  </span>
                </a>
              ))}
            </div>

            <a
              href={ASSETS.cv}
              download
              className="inline-block rounded-md bg-[var(--accent)] px-8 py-[13px] text-[13px] font-medium tracking-wide text-[#06060a] transition-transform hover:brightness-95"
            >
              Download CV
            </a>
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