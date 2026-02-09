import Link from "next/link";

export default function DebugPage() {
  return (
    <div className="p-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center mb-6 px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
      >
        Kembali ke dashboard
      </Link>

      <h1 className="text-2xl">Testing</h1>
    </div>
  );
}
