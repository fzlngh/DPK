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
    transition: { staggerChildren: 0.15 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050510] text-white overflow-hidden">
      <motion.div variants={container} initial="hidden" animate="show" className="w-[90%] max-w-3xl p-10 rounded-3xl border border-cyan-400/30 bg-[#0a0a18]/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,255,0.15)]">
        <motion.h1 variants={item} className="text-3xl font-bold text-center mb-10 tracking-widest text-cyan-300 drop-shadow-[0_0_12px_cyan]">
          HOME DASHBOARD
        </motion.h1>

        <motion.div variants={container} className="grid md:grid-cols-2 gap-8">

          <motion.div variants={item}>
            <Link href="/dashboard" className="group block p-8 rounded-2xl border border-fuchsia-400/40 bg-black/40 hover:bg-fuchsia-500/10 transition-all duration-300 shadow-[0_0_20px_rgba(255,0,255,0.15)] hover:shadow-[0_0_35px_rgba(255,0,255,0.5)] hover:-translate-y-1">
              <h2 className="text-xl font-semibold mb-2 text-fuchsia-300 group-hover:text-fuchsia-200">Projek pak Muji</h2>
              <p className="text-sm text-gray-400">Kumpulan project dan tugas pak Muji</p>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link href="/portofolio" className="group block p-8 rounded-2xl border border-cyan-400/40 bg-black/40 hover:bg-cyan-500/10 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.15)] hover:shadow-[0_0_35px_rgba(0,255,255,0.5)] hover:-translate-y-1">
              <h2 className="text-xl font-semibold mb-2 text-cyan-300 group-hover:text-cyan-200">Portofolio</h2>
              <p className="text-sm text-gray-400">Showcase karya saya</p>
            </Link>
          </motion.div>

          <motion.div variants={item} className="md:col-span-2">
            <Link href={feedbackMenu.path} className="h-16 flex items-center justify-center rounded-2xl bg-black border border-pink-500 text-pink-300 font-semibold shadow-[0_0_20px_#ff00ff] transition-all duration-300 hover:bg-pink-500 hover:text-black hover:shadow-[0_0_40px_#ff00ff] active:scale-95">
              {feedbackMenu.name}
            </Link>
          </motion.div>

        </motion.div>
      </motion.div>
    </main>
  );
}
