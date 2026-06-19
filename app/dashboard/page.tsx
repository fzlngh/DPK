"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";

type Menu = {
  name: string;
  path: string;
};

const debugMenu: Menu = {
  name: "Debug Section",
  path: "/debug",
};

const projectMenus: Menu[] = [
  { name: "Projek 1", path: "/projek-1" },
  { name: "Projek 2", path: "/projek-2" },
  { name: "Projek 3", path: "/projek-3" },
  { name: "Projek 4", path: "/projek-4" },
  { name: "Projek 5", path: "/projek-5" },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Dashboard() {
  return (
    <main className="relative min-h-screen bg-[#0c0d0f] text-white overflow-hidden px-5 py-12">

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#7eb8a4]/5 blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-[#e8d5a3]/4 blur-[100px]" />
      </div>

      {/* Grain */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-3xl mx-auto"
      >
        {/* Back link */}
        <motion.div variants={item}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.05em] text-[#6b7280] hover:text-[#e8e9eb] transition-colors duration-200 mb-10"
          >
            Back to home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div variants={item} className="mb-10">
          <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#7eb8a4] mb-3 flex items-center gap-3">
            <span className="inline-block w-5 h-px bg-[#7eb8a4]" />
            Dashboard
          </p>
          <h1
            className="text-4xl font-light text-[#f4f4f5] leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Projek{" "}
            <em className="italic text-[#e8d5a3]">Pak Muji.</em>
          </h1>
          <p className="mt-3 text-sm text-[#6b7280]">
            Pilih menu untuk masuk ke projek.
          </p>
        </motion.div>

        {/* Debug section */}
        <motion.div variants={item} className="mb-3">
          <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#6b7280] mb-3">
            Utilitas
          </p>
          <Link
            href={debugMenu.path}
            className="group flex items-center justify-between w-full p-5 bg-[#141518] border border-white/[0.06] rounded-2xl hover:border-[#e8d5a3]/20 hover:bg-[#1c1e22] transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1c1e22] group-hover:bg-[#242629] border border-white/[0.07] flex items-center justify-center text-[#e8d5a3] text-sm flex-shrink-0 transition-colors duration-200">
                ⚙
              </div>
              <span className="text-sm font-medium text-[#e8e9eb]">
                {debugMenu.name}
              </span>
            </div>
            <span className="text-[#6b7280] group-hover:text-[#e8d5a3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0 ml-4">
              ↗
            </span>
          </Link>
        </motion.div>

        {/* Projects grid */}
        <motion.div variants={item}>
          <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#6b7280] mt-8 mb-3">
            Projek — {projectMenus.length} item
          </p>
          <div className="flex flex-col gap-px bg-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden">
            {projectMenus.map((menu, index) => (
              <motion.div key={menu.path} variants={item}>
                <Link
                  href={menu.path}
                  className="group flex items-center justify-between p-5 bg-[#141518] hover:bg-[#1c1e22] transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[11px] text-[#6b7280] w-6 flex-shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-[#e8e9eb]">{menu.name}</span>
                  </div>
                  <span className="text-[#6b7280] group-hover:text-[#7eb8a4] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0 ml-4">
                    ↗
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={item}
          className="mt-10 text-center font-mono text-[11px] text-[#6b7280]/40 tracking-widest"
        >
          © 2026 · Fazil.dev
        </motion.p>
      </motion.div>
    </main>
  );
}