import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishInstagramPost, safePublishErrorMessage } from "@/lib/social/publish-instagram-post";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: duePosts, error } = await admin
    .from("posts")
    .select("id")
    .eq("status", "Geplant")
    .eq("platform", "Instagram")
    .is("published_at", null)
    .lte("scheduled_at", new Date().toISOString());
  if (error) return NextResponse.json({ error: "Geplante Beitr\u00e4ge konnten nicht geladen werden." }, { status: 500 });

  let published = 0;
  let failed = 0;
  for (const post of duePosts ?? []) {
    const { data: claimed, error: claimError } = await admin
      .from("posts")
      .update({ status: "Wird ver\u00f6ffentlicht" })
      .eq("id", post.id)
      .eq("status", "Geplant")
      .is("published_at", null)
      .select("id")
      .maybeSingle();
    if (claimError || !claimed) {
      if (claimError) console.error(`[scheduled-publish] post=${post.id} step=claim status=error message=${claimError.message}`);
      continue;
    }
    try {
      await publishInstagramPost(post.id);
      published += 1;
    } catch (publishError) {
      failed += 1;
      console.error(`[scheduled-publish] post=${post.id} step=publish status=error message=${safePublishErrorMessage(publishError)}`);
      await admin.from("posts").update({ status: "Geplant" }).eq("id", post.id).eq("status", "Wird ver\u00f6ffentlicht").is("published_at", null);
    }
  }

  return NextResponse.json({ published, failed });
}
