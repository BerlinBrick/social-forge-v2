"use client";

import { useRef, useState } from "react";

type Props = {
  onClose: () => void;
};

export default function PostEditor({ onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [project, setProject] = useState("BerlinBrick");
  const [platform, setPlatform] = useState("Instagram");
  const [status, setStatus] = useState("Entwurf");
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  async function savePost() {
    alert("Button funktioniert");

    try {
      setSaving(true);

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          project,
          platform,
          status,
          content,
          hashtags,
          image_url: imagePreview,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error ?? "Fehler beim Speichern");
        return;
      }

      alert("Beitrag gespeichert.");

      onClose();
    } catch (err) {
      console.error(err);
      alert("Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8">

      <div className="w-full max-w-6xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-800 p-6">

          <h2 className="text-3xl font-bold text-white">
            Neuer Beitrag
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-3 py-2 text-white hover:bg-slate-800"
          >
            ✕
          </button>

        </div>

        <div className="grid grid-cols-2 gap-8 p-8">

          <div className="space-y-5">

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

            <div>
              <label className="mb-2 block text-slate-400">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
              >
                <option>Entwurf</option>
                <option>Geplant</option>
                <option>Veröffentlicht</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-slate-400">
                Beitrag
              </label>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="h-44 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white"
                placeholder="Schreibe hier deinen Beitrag..."
              />
            </div>

            <div>
              <label className="mb-2 block text-slate-400">
                Hashtags
              </label>

              <textarea
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="h-24 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white"
                placeholder="#lego #berlinbrick"
              />
            </div>

          </div>

          <div>

            <label className="mb-2 block text-slate-400">
              Bild
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  className="h-full w-full object-cover"
                  alt=""
                />
              ) : (
                <span className="text-slate-500">
                  Bild auswählen
                </span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleImage}
            />

          </div>

        </div>

        <div className="flex justify-end gap-4 border-t border-slate-800 p-6">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-6 py-3 text-white"
          >
            Abbrechen
          </button>

          <button
            type="button"
            onClick={savePost}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? "Speichern..." : "💾 Speichern"}
          </button>

        </div>

      </div>

    </div>
  );
}