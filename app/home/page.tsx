"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";

type Menu = {
  name: string;
  path: string;
};

const feedbackMenu: Menu = {
  name: "Feedback",
  path: "/feedback",
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#0c0d0f] text-white overflow-hidden px-5">

      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#7eb8a4]/5 blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-[#e8d5a3]/4 blur-[100px]" />
      </div>

      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-lg"
      >
        {/* Header */}
        <motion.div variants={item} className="mb-10">
          <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#7eb8a4] mb-3 flex items-center gap-3">
            <span className="inline-block w-6 h-px bg-[#7eb8a4]" />
            Dashboard
          </p>
          <h1
            className="text-4xl font-light leading-tight text-[#f4f4f5]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Selamat datang,{" "}
            <em className="italic text-[#e8d5a3]">Fazil.</em>
          </h1>
        </motion.div>

        {/* Cards */}
        <div className="flex flex-col gap-px bg-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden mb-3">

          {/* Card 1 */}
          <motion.div variants={item}>
            <Link
              href="/dashboard"
              className="group flex items-center justify-between p-6 bg-[#141518] hover:bg-[#1c1e22] transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1c1e22] group-hover:bg-[#242629] border border-white/[0.07] flex items-center justify-center transition-colors duration-200 text-[#e8d5a3] text-sm flex-shrink-0">
                  📁
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e8e9eb] mb-0.5">Projek Pak Muji</p>
                  <p className="text-xs text-[#6b7280] leading-relaxed">Kumpulan project dan tugas pak Muji</p>
                </div>
              </div>
              <span className="text-[#6b7280] group-hover:text-[#e8d5a3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 text-base flex-shrink-0 ml-4">
                ↗
              </span>
            </Link>
          </motion.div>

          {/* Divider */}
          <div className="h-px bg-white/[0.04]" />

          {/* Card 2 */}
          <motion.div variants={item}>
            <Link
              href="/portofolio"
              className="group flex items-center justify-between p-6 bg-[#141518] hover:bg-[#1c1e22] transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1c1e22] group-hover:bg-[#242629] border border-white/[0.07] flex items-center justify-center transition-colors duration-200 text-[#7eb8a4] text-sm flex-shrink-0">
                  ✦
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e8e9eb] mb-0.5">Portofolio</p>
                  <p className="text-xs text-[#6b7280] leading-relaxed">Showcase karya saya</p>
                </div>
              </div>
              <span className="text-[#6b7280] group-hover:text-[#7eb8a4] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 text-base flex-shrink-0 ml-4">
                ↗
              </span>
            </Link>
          </motion.div>

        </div>

        {/* Feedback button */}
        <motion.div variants={item}>
          <Link
            href={feedbackMenu.path}
            className="group flex items-center justify-between w-full p-5 rounded-2xl bg-[#141518] border border-white/[0.06] hover:border-[#e8d5a3]/25 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1c1e22] border border-white/[0.07] flex items-center justify-center text-[#6b7280] text-sm flex-shrink-0">
                ◎
              </div>
              <p className="text-sm font-medium text-[#6b7280] group-hover:text-[#e8e9eb] transition-colors duration-200">
                {feedbackMenu.name}
              </p>
            </div>
            <span className="text-[#6b7280] group-hover:text-[#e8d5a3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 text-base flex-shrink-0 ml-4">
              ↗
            </span>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={item}
          className="mt-8 text-center font-mono text-[11px] text-[#6b7280]/50 tracking-widest"
        >
          © 2026 · Fazil.dev
        </motion.p>
      </motion.div>
    </main>
  );
}