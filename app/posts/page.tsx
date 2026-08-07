"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import PostEditor from "../components/PostEditor";

type Post = {
  id: string;
  title: string;
  project: string;
  platform: string;
  status: string;
  content: string;
  hashtags: string;
  image_url: string | null;
};

export default function PostsPage() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    try {
      const response = await fetch("/api/posts");
      const data = await response.json();

      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

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

        {loading ? (

          <div className="rounded-2xl border border-slate-700 p-20 text-center text-slate-400">
            Beiträge werden geladen...
          </div>

        ) : posts.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-700 p-20 text-center">

            <h2 className="text-2xl font-bold text-white">
              Noch keine Beiträge vorhanden
            </h2>

            <p className="mt-3 text-slate-400">
              Erstelle deinen ersten Beitrag oder generiere ihn im Content Studio.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

            {posts.map((post) => (

              <div
                key={post.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
              >

                <div className="aspect-square bg-slate-950">

                  {post.image_url ? (

                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    <div className="flex h-full items-center justify-center text-slate-500">
                      Kein Bild
                    </div>

                  )}

                </div>

                <div className="space-y-3 p-5">

                  <h2 className="text-xl font-bold text-white">
                    {post.title}
                  </h2>

                  <div className="flex justify-between text-sm text-slate-400">
                    <span>{post.platform}</span>
                    <span>{post.status}</span>
                  </div>

                  <p className="line-clamp-4 text-sm text-slate-300">
                    {post.content}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

        {editorOpen && (
          <PostEditor
            onClose={() => {
              setEditorOpen(false);
              loadPosts();
            }}
          />
        )}

      </div>
    </AppShell>
  );
}