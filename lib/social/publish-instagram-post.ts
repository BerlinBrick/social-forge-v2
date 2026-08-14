import { createAdminClient } from "@/lib/supabase/admin";
import { publishInstagramImage } from "@/lib/social/instagram";
import { decryptSecret } from "@/lib/social/secrets";

export function safePublishErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Instagram publishing failed.";
  return message
    .replace(/(access_token|refresh_token|client_secret|code)=([^\s&]+)/gi, "$1=[redacted]")
    .replace(/authorization:\s*bearer\s+[^\s]+/gi, "authorization: Bearer [redacted]");
}

export async function publishInstagramPost(postId: string) {
  const admin = createAdminClient();
  const { data: post, error: postError } = await admin
    .from("posts")
    .select("id, project, content, hashtags, image_url")
    .eq("id", postId)
    .single();

  if (postError || !post) throw new Error("Beitrag nicht gefunden.");
  if (!post.image_url) throw new Error("F\u00fcr Instagram wird ein Bild ben\u00f6tigt.");

  const { data: project } = await admin.from("projects").select("id").eq("name", post.project).single();
  if (!project) throw new Error("Projekt dieses Beitrags wurde nicht gefunden.");

  const { data: account } = await admin
    .from("social_accounts")
    .select("id, provider_account_id")
    .eq("project_id", project.id)
    .eq("platform", "instagram")
    .eq("status", "connected")
    .maybeSingle();
  if (!account) throw new Error("F\u00fcr dieses Projekt ist kein Instagram-Konto verbunden.");

  const { data: token } = await admin
    .from("social_account_tokens")
    .select("access_token_ciphertext, access_token_iv, access_token_tag, expires_at")
    .eq("social_account_id", account.id)
    .single();
  if (!token) throw new Error("Instagram-Zugangsdaten fehlen. Bitte verbinde das Konto erneut.");
  if (token.expires_at && new Date(token.expires_at) <= new Date()) {
    throw new Error("Instagram-Zugang ist abgelaufen. Bitte verbinde das Konto erneut.");
  }

  const accessToken = decryptSecret({
    ciphertext: token.access_token_ciphertext,
    iv: token.access_token_iv,
    tag: token.access_token_tag,
  });
  const caption = [post.content, post.hashtags].filter(Boolean).join("\n\n");
  const instagramPostId = await publishInstagramImage(account.provider_account_id, accessToken, post.image_url, caption);
  const { error: updateError } = await admin
    .from("posts")
    .update({ status: "Ver\u00f6ffentlicht", published_at: new Date().toISOString() })
    .eq("id", post.id);
  if (updateError) throw new Error("Instagram-Beitrag wurde ver\u00f6ffentlicht, aber der Status konnte nicht gespeichert werden.");

  return instagramPostId;
}
