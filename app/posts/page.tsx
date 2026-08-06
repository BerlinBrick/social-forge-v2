"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import PostEditor from "../components/PostEditor";

export default function PostsPage() {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <AppShell>
      <div className="space-y-8">

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

        <div className="rounded-2xl border border-dashed border-slate-700 p-20 text-center">

          <h2 className="text-2xl font-bold text-white">
            Noch keine Beiträge vorhanden
          </h2>

          <p className="mt-3 text-slate-400">
            Erstelle deinen ersten Beitrag oder generiere ihn im Content Studio.
          </p>

        </div>

        {editorOpen && (
          <PostEditor
            onClose={() => setEditorOpen(false)}
          />
        )}

      </div>
    </AppShell>
  );
}