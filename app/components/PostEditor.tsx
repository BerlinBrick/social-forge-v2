"use client";

import { useState } from "react";

type Props = {
  onClose: () => void;
};

export default function PostEditor({ onClose }: Props) {
  const [title, setTitle] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900">

        <div className="flex items-center justify-between border-b border-slate-800 p-6">

          <h2 className="text-3xl font-bold text-white">
            Neuer Beitrag
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-white"
          >
            ✕
          </button>

        </div>

        <div className="p-8">

          <label className="mb-2 block text-slate-400">
            Titel
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
          />

        </div>

        <div className="flex justify-end border-t border-slate-800 p-6">

          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white"
          >
            Schließen
          </button>

        </div>

      </div>
    </div>
  );
}