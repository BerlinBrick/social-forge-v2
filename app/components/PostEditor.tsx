"use client";

import { useState } from "react";

type Props = {
  onClose: () => void;
};

export default function PostEditor({ onClose }: Props) {
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("BerlinBrick");
  const [platform, setPlatform] = useState("Instagram");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900">

        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <h2 className="text-3xl font-bold text-white">
            Neuer Beitrag
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-white hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8 p-8">

          <div className="space-y-6">

            <div>
              <label className="mb-2 block text-slate-400">
                Titel
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-slate-400">
                Projekt
              </label>

              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
              >
                <option>BerlinBrick</option>
                <option>Cat-2-Go</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-slate-400">
                Plattform
              </label>

              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
              >
                <option>Instagram</option>
                <option>Facebook</option>
                <option>Pinterest</option>
                <option>X</option>
                <option>LinkedIn</option>
                <option>YouTube</option>
              </select>
            </div>

          </div>

          <div className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 text-slate-500">
            Bild kommt im nächsten Schritt
          </div>

        </div>

        <div className="flex justify-end border-t border-slate-800 p-6">

          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-500"
          >
            Schließen
          </button>

        </div>

      </div>
    </div>
  );
}