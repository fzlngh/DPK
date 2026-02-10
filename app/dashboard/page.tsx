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
  { name: "Projek 5", path: "/projek-5" },
  { name: "Projek 6", path: "/projek-6" },
  { name: "Projek 7", path: "/projek-7" }
];

export default function Dashboard() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="w-full h-full bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 flex flex-col">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard Dhiyaa Fazila Nugraha
          </h1>
          <p className="text-slate-500 mt-1">
            Pilih menu untuk masuk ke projek saya
          </p>
        </div>

        <div className="mb-10">
          <Link
            href={debugMenu.path}
            className="block w-full h-20 flex items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-xl active:scale-95"
          >
            {debugMenu.name}
          </Link>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {projectMenus.map((menu) => (
              <Link
                key={menu.path}
                href={menu.path}
                className="h-24 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-95"
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
