"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setRecoveryReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Neues Passwort festlegen</h1>
          <p className="mt-2 text-slate-400">
            Wähle ein neues Passwort für dein Social-Forge-Konto.
          </p>
        </div>

        {!recoveryReady ? (
          <p className="text-sm text-slate-400">Passwort-Link wird geprüft...</p>
        ) : (
          <>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Neues Passwort"
              required
              minLength={6}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            />

            <input
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              placeholder="Neues Passwort bestätigen"
              required
              minLength={6}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Passwort wird gespeichert..." : "Passwort speichern"}
            </button>
          </>
        )}

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
