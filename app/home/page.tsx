import Link from "next/link";

type Menu = {
  name: string;
  path: string;
};

const feedbackMenu: Menu = {
  name: "Feedback",
  path: "/feedback",
};

export default function home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050510] text-white">
      <div className="w-[90%] max-w-3xl p-10 rounded-3xl border border-cyan-400/30 bg-[#0a0a18]/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,255,0.15)]">
        <h1 className="text-3xl font-bold text-center mb-10 tracking-widest text-cyan-300 drop-shadow-[0_0_12px_cyan]">
          HOME DASHBOARD
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <Link
            href="/dashboard"
            className="group p-8 rounded-2xl border border-fuchsia-400/40 bg-black/40 hover:bg-fuchsia-500/10 transition-all duration-300 shadow-[0_0_20px_rgba(255,0,255,0.15)] hover:shadow-[0_0_35px_rgba(255,0,255,0.5)] hover:-translate-y-1"
          >
            <h2 className="text-xl font-semibold mb-2 text-fuchsia-300 group-hover:text-fuchsia-200">
              Projek pak Muji
            </h2>
            <p className="text-sm text-gray-400">
              Kumpulan project dan tugas pak Muji
            </p>
          </Link>

          <Link
            href="/portofolio"
            className="group p-8 rounded-2xl border border-cyan-400/40 bg-black/40 hover:bg-cyan-500/10 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.15)] hover:shadow-[0_0_35px_rgba(0,255,255,0.5)] hover:-translate-y-1"
          >
            <h2 className="text-xl font-semibold mb-2 text-cyan-300 group-hover:text-cyan-200">
              Portofolio
            </h2>
            <p className="text-sm text-gray-400">
              Showcase karya saya
            </p>
          </Link>

          <Link
             href={feedbackMenu.path}
             className="md:col-span-2 h-16 flex items-center justify-center rounded-2xl bg-black border border-pink-500 text-pink-300 font-semibold shadow-[0_0_20px_#ff00ff] transition-all duration-300 hover:bg-pink-500 hover:text-black hover:shadow-[0_0_40px_#ff00ff] active:scale-95"
          >
                {feedbackMenu.name}
          </Link>

        </div>
      </div>
    </main>
  );
}
