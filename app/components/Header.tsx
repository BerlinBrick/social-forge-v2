"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-8">

      <div>

        <h2 className="text-2xl font-bold text-white">
          Social Forge
        </h2>

        <p className="text-slate-400">
          AI Marketing Suite
        </p>

      </div>

      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          O
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Abmelden
        </button>
      </div>

    </header>
  );
}
