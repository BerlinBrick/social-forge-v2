"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  post: {
    id: string;
    title: string;
    project: string;
    platform: string;
    status: string;
    content: string;
    hashtags: string;
    image_url: string | null;
    scheduled_at?: string | null;
    published_at?: string | null;
  } | null;
  onClose: () => void;
};

function toLocalDateTimeInputValue(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function PostEditor({ post, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [project, setProject] = useState(post?.project ?? "BerlinBrick");
  const [platform, setPlatform] = useState(post?.platform ?? "Instagram");
  const [status, setStatus] = useState(post?.status ?? "Entwurf");
  const [content, setContent] = useState(post?.content ?? "");
  const [hashtags, setHashtags] = useState(post?.hashtags ?? "");
  const [scheduledAt, setScheduledAt] = useState(toLocalDateTimeInputValue(post?.scheduled_at));

  const [imagePreview, setImagePreview] = useState<string | null>(post?.image_url ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(post?.title ?? "");
    setProject(post?.project ?? "BerlinBrick");
    setPlatform(post?.platform ?? "Instagram");
    setStatus(post?.status ?? "Entwurf");
    setContent(post?.content ?? "");
    setHashtags(post?.hashtags ?? "");
    setScheduledAt(toLocalDateTimeInputValue(post?.scheduled_at));
    setImagePreview(post?.image_url ?? null);
    setImageFile(null);
  }, [post]);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  async function savePost() {
    try {
      setSaving(true);

      if (status === "Geplant" && !scheduledAt) {
        alert("Bitte wähle ein Datum und eine Uhrzeit.");
        return;
      }

      let imageUrl: string | null = post?.image_url ?? null;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const err = await uploadResponse.json();

          alert(err.error ?? "Bildupload fehlgeschlagen.");

          return;
        }

        const uploadData = await uploadResponse.json();

        imageUrl = uploadData.url;
      }

      const response = await fetch(post ? `/api/posts/${post.id}` : "/api/posts", {
        method: post ? "PATCH" : "POST",
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
          image_url: imageUrl,
          scheduled_at: status === "Geplant" ? new Date(scheduledAt).toISOString() : null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();

        alert(err.error ?? "Speichern fehlgeschlagen.");

        return;
      }

      alert(post ? "Beitrag aktualisiert." : "Beitrag gespeichert.");

      onClose();
    } catch (err) {
      console.error(err);

      alert("Unbekannter Fehler.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8">

      <div className="w-full max-w-6xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-800 p-6">

          <h2 className="text-3xl font-bold text-white">
            {post ? "Beitrag bearbeiten" : "Neuer Beitrag"}
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-4 py-2 text-white hover:bg-slate-800"
          >
            ✕
          </button>

        </div>

        <div className="grid grid-cols-2 gap-8 p-8">

          <div className="space-y-5">

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            />

            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            >
              <option>BerlinBrick</option>
              <option>Cat-2-Go</option>
            </select>

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

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            >
              <option>Entwurf</option>
              <option>Geplant</option>
              <option>Veröffentlicht</option>
            </select>

            {status === "Geplant" && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
              />
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Beitrag"
              className="h-44 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white"
            />

            <textarea
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#hashtags"
              className="h-24 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white"
            />

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
                  alt=""
                  className="h-full w-full object-cover"
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
