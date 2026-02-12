import Link from "next/link";

type Menu = {
  name: string;
  path: string;
};

const debugMenu: Menu = {
  name: "Debug Section",
  path: "/debug-projek",
};

const feedbackMenu: Menu = {
  name: "Feedback",
  path: "/feedback",
};

const projectMenus: Menu[] = [
  { name: "Projek 1", path: "/projek-1" },
  { name: "Projek 2", path: "/projek-2" },
  { name: "Projek 3", path: "/projek-3" },
  { name: "Projek 4", path: "/projek-4" },
];

export default function Dashboard() {
  return (
    <main className="min-h-screen w-full bg-[radial-gradient(circle_at_center,#0f0f1a,#05050a)] p-8">
      <div className="w-full h-full rounded-3xl bg-[#0f0f1acc] backdrop-blur-xl border border-cyan-400/40 shadow-[0_0_25px_#00ffff,0_0_60px_#ff00ff] p-10 flex flex-col">
        
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-[#00ffff] tracking-wide drop-shadow-[0_0_14px_#00ffff]">
            Dashboard Dhiyaa Fazila Nugraha
          </h1>
          <p className="text-pink-300/80 mt-2">
            Pilih menu untuk masuk ke projek saya
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-4">
          
          <Link
            href={debugMenu.path}
            className="h-20 flex items-center justify-center rounded-2xl bg-black border border-cyan-400 text-cyan-300 font-semibold text-lg shadow-[0_0_20px_#00ffff] transition-all duration-300 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_40px_#00ffff] active:scale-95"
          >
            {debugMenu.name}
          </Link>

          <Link
            href={feedbackMenu.path}
            className="h-16 flex items-center justify-center rounded-2xl bg-black border border-pink-500 text-pink-300 font-semibold shadow-[0_0_20px_#ff00ff] transition-all duration-300 hover:bg-pink-500 hover:text-black hover:shadow-[0_0_40px_#ff00ff] active:scale-95"
          >
            {feedbackMenu.name}
          </Link>

        </div>

        <div className="flex-1 overflow-auto mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {projectMenus.map((menu) => (
              <Link
                key={menu.path}
                href={menu.path}
                className="h-24 flex items-center justify-center rounded-2xl bg-black border border-purple-400 text-purple-300 font-semibold shadow-[0_0_20px_#a855f7] transition-all duration-300 hover:bg-purple-500 hover:text-black hover:shadow-[0_0_40px_#a855f7] active:scale-95"
              >
                {menu.name}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
