"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Passwort zurücksetzen</h1>
          <p className="mt-2 text-slate-400">
            Wir senden dir einen Link zum Festlegen eines neuen Passworts.
          </p>
        </div>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-Mail-Adresse"
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}
        {sent && (
          <p className="text-sm text-emerald-400">
            Falls ein Konto für diese E-Mail-Adresse existiert, wurde ein Passwort-Link versendet.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || sent}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Wird gesendet..." : "Passwort-Link senden"}
        </button>

        <Link
          href="/login"
          className="block text-center text-sm text-blue-400 hover:text-blue-300"
        >
          Zurück zur Anmeldung
        </Link>
      </form>
    </main>
  );
}
