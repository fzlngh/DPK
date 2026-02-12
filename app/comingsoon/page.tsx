import Link from "next/link";

export default function ComingSoon() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_center,#0f0f1a,#05050a)]">

      <div className="fade-up glow text-center px-[70px] py-[55px] rounded-[24px] bg-[rgba(15,15,30,.85)] backdrop-blur-xl border border-cyan-400/30">

        <h1 className="text-[#00ffff] tracking-[6px] mb-10 text-[32px] font-bold drop-shadow-[0_0_15px_#00ffff]">
          COMING SOON
        </h1>

        <Link
          href="/home"
          className="inline-block px-10 py-3 text-[16px] font-semibold rounded-full bg-black text-fuchsia-400 border border-fuchsia-400 shadow-[0_0_12px_#ff00ff] transition-all duration-300 hover:bg-fuchsia-500 hover:text-black hover:shadow-[0_0_30px_#ff00ff] hover:-translate-y-1"
        >
          Back to home
        </Link>

      </div>

    </main>
  );
}
