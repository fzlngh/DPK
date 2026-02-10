import Link from "next/link";

type Menu = {
  name: string;
  path: string;
};

const debugMenu: Menu = {
  name: "Debug Section",
  path: "/debug-projek",
};

const projectMenus: Menu[] = [
  { name: "Projek 1", path: "/projek-1" },
  { name: "Projek 2", path: "/projek-2" },
  { name: "Projek 3", path: "/projek-3" },
  { name: "Projek 4", path: "/projek-4" },
];

export default function Dashboard() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#020617] via-[#050b2e] to-black p-8">
      <div className="w-full h-full rounded-3xl bg-black/40 backdrop-blur-xl border border-cyan-400/30 shadow-[0_0_40px_rgba(34,211,238,0.15)] p-10 flex flex-col">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-cyan-300 tracking-wide drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]">
            Dashboard Dhiyaa Fazila Nugraha
          </h1>
          <p className="text-red-300/80 mt-2">
            Pilih menu untuk masuk ke projek saya
          </p>
        </div>

        <div className="mb-10">
          <Link
            href={debugMenu.path}
            className="group block h-20 flex items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold text-lg shadow-[0_0_25px_rgba(236,72,153,0.7)] border border-pink-400/50 transition-all duration-300 hover:scale-[1.03] active:scale-95"
          >
            {debugMenu.name}
          </Link>
        </div>

        <div className="flex-1 overflow-auto mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {projectMenus.map((menu) => (
              <Link
                key={menu.path}
                href={menu.path}
                className="group h-24 flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-400/40 text-cyan-200 font-semibold shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] active:scale-95"
              >
                <span className="group-hover:tracking-wide transition-all duration-300">
                  {menu.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
