import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { publishInstagramImage } from "@/lib/social/instagram";
import { decryptSecret } from "@/lib/social/secrets";

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

    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: post, error: postError } = await admin
      .from("posts")
      .select("id, project, content, hashtags, image_url")
      .eq("id", id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "Beitrag nicht gefunden." }, { status: 404 });
    }

    if (!post.image_url) {
      return NextResponse.json({ error: "Für Instagram wird ein Bild benötigt." }, { status: 400 });
    }

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("name", post.project)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Kein Zugriff auf das Projekt dieses Beitrags." }, { status: 403 });
    }

    const { data: account } = await admin
      .from("social_accounts")
      .select("id, provider_account_id, status")
      .eq("project_id", project.id)
      .eq("platform", "instagram")
      .eq("status", "connected")
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ error: "Für dieses Projekt ist kein Instagram-Konto verbunden." }, { status: 400 });
    }

    const { data: token } = await admin
      .from("social_account_tokens")
      .select("access_token_ciphertext, access_token_iv, access_token_tag, expires_at")
      .eq("social_account_id", account.id)
      .single();

    if (!token) {
      return NextResponse.json({ error: "Instagram-Zugangsdaten fehlen. Bitte verbinde das Konto erneut." }, { status: 400 });
    }

    if (token.expires_at && new Date(token.expires_at) <= new Date()) {
      return NextResponse.json({ error: "Instagram-Zugang ist abgelaufen. Bitte verbinde das Konto erneut." }, { status: 400 });
    }

    const accessToken = decryptSecret({
      ciphertext: token.access_token_ciphertext,
      iv: token.access_token_iv,
      tag: token.access_token_tag,
    });
    const caption = [post.content, post.hashtags].filter(Boolean).join("\n\n");
    const instagramPostId = await publishInstagramImage(
      account.provider_account_id,
      accessToken,
      post.image_url,
      caption
    );

    return NextResponse.json({ success: true, instagramPostId });
  } catch (error) {
    console.error("Instagram Veröffentlichung Fehler:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Instagram-Beitrag konnte nicht veröffentlicht werden." },
      { status: 500 }
    );
  }
}
