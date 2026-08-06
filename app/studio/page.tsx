"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";

export default function StudioPage() {
  const [result, setResult] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");

  async function generateCampaign() {
    setLoading(true);
    setResult("");
    setImage("");

    try {
      // Text erzeugen
      const textResponse = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const textData = await textResponse.json();

      if (textData.success) {
        setResult(textData.text);
      }

      // Bild erzeugen
      const imageResponse = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const imageData = await imageResponse.json();

      if (imageData.success) {
        setImage(`data:image/png;base64,${imageData.image}`);
      }
    } catch (e) {
      console.error(e);
      setResult("Fehler beim Generieren.");
    }

    setLoading(false);
  }

  return (
    <AppShell>
      <div className="grid grid-cols-2 gap-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-2xl font-bold text-white">
            🚀 Content Studio
          </h2>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mb-6 h-48 w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-white"
            placeholder="Beschreibe deine Kampagne..."
          />

          <button
            onClick={generateCampaign}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500"
          >
            {loading ? "Generiere..." : "🚀 Kampagne erzeugen"}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-2xl font-bold text-white">
            KI Vorschau
          </h2>

          <div className="mb-6 flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-slate-700 overflow-hidden">
            {image ? (
              <img
                src={image}
                alt="KI Bild"
                className="w-full rounded-xl"
              />
            ) : (
              <span className="text-slate-500">
                Noch kein Bild erzeugt
              </span>
            )}
          </div>

          <h3 className="mb-3 text-lg font-semibold text-white">
            Generierter Beitrag
          </h3>

          <div className="whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-slate-300">
            {result || "Noch kein Beitrag erstellt."}
          </div>
        </div>
      </div>
    </AppShell>
  );
}