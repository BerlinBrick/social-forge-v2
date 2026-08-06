"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";

export default function PostsPage() {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <AppShell>
      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-white">
            Beiträge
          </h1>

          <p className="mt-2 text-slate-400">
            Verwalte alle Beiträge.
          </p>

        </div>

        <button
          onClick={() => setEditorOpen(true)}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
        >
          ➕ Neuer Beitrag
        </button>

      </div>

      {editorOpen && (

        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <h2 className="text-2xl font-bold text-white">
            Neuer Beitrag
          </h2>

          <p className="mt-3 text-slate-400">
            Der Editor wird im nächsten Schritt eingebaut.
          </p>

          <button
            onClick={() => setEditorOpen(false)}
            className="mt-6 rounded-lg bg-slate-800 px-5 py-2 text-white"
          >
            Schließen
          </button>

        </div>

      )}

    </AppShell>
  );
}