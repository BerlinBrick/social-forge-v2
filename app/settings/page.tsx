"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: string;
  name: string;
};

type InstagramAccount = {
  id: string;
  username: string;
  status: string;
};

export default function SettingsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadAccounts(selectedProjectId: string) {
    if (!selectedProjectId) {
      setAccounts([]);
      return;
    }

    const response = await fetch(`/api/social/instagram/accounts?projectId=${selectedProjectId}`);
    const data = await response.json();
    setAccounts(response.ok ? data : []);
  }

  useEffect(() => {
    async function loadProjects() {
      const supabase = createClient();
      const { data, error } = await supabase.from("projects").select("id, name").order("name");

      if (error) {
        console.error("Projekte konnten nicht geladen werden:", error);
        setProjectError("Projekte konnten nicht geladen werden. Bitte versuche es erneut.");
        return;
      }

      if (data?.length) {
        setProjects(data);
        setProjectId(data[0].id);
        loadAccounts(data[0].id);
      }
    }

    loadProjects();

    const result = new URLSearchParams(window.location.search).get("instagram");
    if (result === "connected") setMessage("Instagram-Konto wurde verbunden.");
    if (result === "error") setMessage("Instagram-Verbindung konnte nicht abgeschlossen werden.");
  }, []);

  async function connectInstagram() {
    if (!projectId) return;

    setLoading(true);
    setMessage(null);
    const response = await fetch("/api/social/instagram/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? "Instagram-Verbindung konnte nicht gestartet werden.");
      setLoading(false);
      return;
    }

    window.location.assign(data.url);
  }

  async function disconnectInstagram(accountId: string) {
    const response = await fetch(`/api/social/instagram/accounts/${accountId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("Instagram-Konto konnte nicht getrennt werden.");
      return;
    }

    loadAccounts(projectId);
  }

  return (
    <AppShell>
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Einstellungen</h1>
          <p className="mt-2 text-slate-400">Verwalte die Social-Media-Konten deiner Projekte.</p>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-bold text-white">Instagram</h2>

          {projectError ? (
            <p className="mt-4 text-red-400">{projectError}</p>
          ) : projects.length === 0 ? (
            <p className="mt-4 text-slate-400">Dir ist aktuell kein Projekt zugeordnet.</p>
          ) : (
            <>
              <select
                value={projectId}
                onChange={(event) => {
                  setProjectId(event.target.value);
                  loadAccounts(event.target.value);
                }}
                className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={connectInstagram}
                disabled={loading}
                className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? "Weiterleitung..." : "Instagram verbinden"}
              </button>

              {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}

              <div className="mt-6 space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-xl border border-slate-700 p-4"
                  >
                    <div>
                      <p className="font-semibold text-white">@{account.username}</p>
                      <p className="text-sm text-slate-400">{account.status}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => disconnectInstagram(account.id)}
                      className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800"
                    >
                      Trennen
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
