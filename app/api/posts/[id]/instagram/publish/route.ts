import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { publishInstagramPost, safePublishErrorMessage } from "@/lib/social/publish-instagram-post";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

    const admin = createAdminClient();
    const { data: post, error: postError } = await admin
      .from("posts")
      .select("project")
      .eq("id", id)
      .single();
    if (postError || !post) return NextResponse.json({ error: "Beitrag nicht gefunden." }, { status: 404 });

    const { data: project } = await supabase.from("projects").select("id").eq("name", post.project).single();
    if (!project) return NextResponse.json({ error: "Kein Zugriff auf das Projekt dieses Beitrags." }, { status: 403 });

    const instagramPostId = await publishInstagramPost(id);
    return NextResponse.json({ success: true, instagramPostId });
  } catch (error) {
    const message = safePublishErrorMessage(error);
    console.error("Instagram publishing error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
