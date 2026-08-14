import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { exchangeInstagramCode, getInstagramProfile } from "@/lib/social/instagram";
import { encryptSecret } from "@/lib/social/secrets";

export const runtime = "nodejs";

function redirectToSettings(request: Request, result: "connected" | "error") {
  const url = new URL("/settings", process.env.APP_URL!);
  url.searchParams.set("instagram", result);
  return NextResponse.redirect(url);
}

function logStepError(step: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unbekannter Fehler";
  const sanitizedMessage = message.replace(
    /(access_token|refresh_token|code_verifier|client_secret|code)=([^\s&]+)/gi,
    "$1=[redacted]"
  );

  console.error(`[instagram-callback] step=${step} status=error message=${sanitizedMessage}`);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state || url.searchParams.get("error")) {
      return redirectToSettings(request, "error");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirectToSettings(request, "error");
    }

    const admin = createAdminClient();
    const stateHash = createHash("sha256").update(state).digest("hex");
    const { data: oauthState } = await admin
      .from("social_oauth_states")
      .select("*")
      .eq("state_hash", stateHash)
      .eq("platform", "instagram")
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!oauthState || oauthState.user_id !== user.id) {
      return redirectToSettings(request, "error");
    }

    await admin
      .from("social_oauth_states")
      .update({ consumed_at: new Date().toISOString() })
      .eq("state_hash", stateHash);

    let token;

    try {
      token = await exchangeInstagramCode(code);
      console.info("[instagram-callback] step=exchange-code-and-long-lived-token status=ok");
    } catch (error) {
      logStepError("exchange-code-and-long-lived-token", error);
      throw error;
    }

    if (!token.user_id) {
      throw new Error("Instagram-Konto-ID fehlt in der OAuth-Antwort.");
    }

    let profile;

    try {
      profile = await getInstagramProfile(token.access_token!, token.user_id);
      console.info("[instagram-callback] step=load-instagram-profile status=ok");
    } catch (error) {
      logStepError("load-instagram-profile", error);
      throw error;
    }

    const { data: existingAccount } = await admin
      .from("social_accounts")
      .select("id, project_id")
      .eq("platform", "instagram")
      .eq("provider_account_id", profile.accountId)
      .maybeSingle();

    if (existingAccount && existingAccount.project_id !== oauthState.project_id) {
      return redirectToSettings(request, "error");
    }

    let accountId = existingAccount?.id;

    try {
      if (accountId) {
        const { error } = await admin
          .from("social_accounts")
          .update({ username: profile.username, status: "connected", updated_at: new Date().toISOString() })
          .eq("id", accountId);

        if (error) throw error;
      } else {
        const { data, error } = await admin
          .from("social_accounts")
          .insert({
            project_id: oauthState.project_id,
            platform: "instagram",
            provider_account_id: profile.accountId,
            username: profile.username,
            status: "connected",
            created_by: user.id,
          })
          .select("id")
          .single();

        if (error || !data) throw error ?? new Error("Instagram-Konto konnte nicht gespeichert werden.");
        accountId = data.id;
      }

      console.info("[instagram-callback] step=save-social-account status=ok");
    } catch (error) {
      logStepError("save-social-account", error);
      throw error;
    }

    const encryptedAccessToken = encryptSecret(token.access_token!);
    const encryptedRefreshToken = token.refresh_token ? encryptSecret(token.refresh_token) : null;
    const expiresAt = token.expires_in
      ? new Date(Date.now() + token.expires_in * 1000).toISOString()
      : null;

    try {
      const { error: tokenError } = await admin.from("social_account_tokens").upsert(
        {
          social_account_id: accountId,
          access_token_ciphertext: encryptedAccessToken.ciphertext,
          access_token_iv: encryptedAccessToken.iv,
          access_token_tag: encryptedAccessToken.tag,
          refresh_token_ciphertext: encryptedRefreshToken?.ciphertext ?? null,
          refresh_token_iv: encryptedRefreshToken?.iv ?? null,
          refresh_token_tag: encryptedRefreshToken?.tag ?? null,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "social_account_id" }
      );

      if (tokenError) throw tokenError;
      console.info("[instagram-callback] step=save-social-account-token status=ok");
    } catch (error) {
      logStepError("save-social-account-token", error);
      throw error;
    }

    return redirectToSettings(request, "connected");
  } catch (error) {
    console.error("Instagram OAuth Callback Fehler:", error);
    return redirectToSettings(request, "error");
  }
}
