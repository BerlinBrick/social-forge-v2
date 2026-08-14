type InstagramTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user_id?: string;
  error_type?: string;
  error_message?: string;
  error_code?: number | string;
};

type InstagramProfile = {
  id?: string;
  user_id?: string;
  username?: string;
  error?: {
    message?: string;
  };
};

type InstagramResponse = {
  id?: string;
  error?: {
    message?: string;
  };
};

function parseInstagramTokenResponse(response: Response, body: string): InstagramTokenResponse {
  const contentType = response.headers.get("content-type") ?? "";
  const looksLikeJson = contentType.includes("application/json") || body.trim().startsWith("{");

  if (!looksLikeJson) {
    const safeBody = body.replace(/\s+/g, " ").slice(0, 200);
    throw new Error(`Instagram-Token-Endpunkt antwortete mit HTTP ${response.status}: ${safeBody}`);
  }

  try {
    return JSON.parse(body) as InstagramTokenResponse;
  } catch {
    throw new Error(`Instagram-Token-Endpunkt lieferte ungültiges JSON (HTTP ${response.status}).`);
  }
}

function logRedirectUri(step: "authorize" | "token-exchange", redirectUri: string) {
  const hash = createHash("sha256").update(redirectUri).digest("hex");
  console.info(
    `[instagram-oauth] step=${step} redirect_uri=${JSON.stringify(redirectUri)} length=${redirectUri.length} sha256=${hash}`
  );
}

export function getInstagramConfig() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  const apiVersion = process.env.INSTAGRAM_GRAPH_API_VERSION;

  if (!appId || !appSecret || !redirectUri || !apiVersion) {
    throw new Error("Die Instagram-Umgebungsvariablen sind unvollständig.");
  }

  return { appId, appSecret, redirectUri, apiVersion };
}

export function createInstagramAuthorizationUrl(state: string) {
  const { appId, redirectUri } = getInstagramConfig();
  const url = new URL("https://www.instagram.com/oauth/authorize");

  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  const authorizationRedirectUri = url.searchParams.get("redirect_uri");

  if (!authorizationRedirectUri) {
    throw new Error("Instagram-Redirect-URI konnte nicht erstellt werden.");
  }

  logRedirectUri("authorize", authorizationRedirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set(
    "scope",
    "instagram_business_basic,instagram_business_content_publish"
  );
  url.searchParams.set("state", state);

  return url.toString();
}

export async function exchangeInstagramCode(code: string) {
  const { appId, appSecret, redirectUri } = getInstagramConfig();
  const formData = new FormData();
  logRedirectUri("token-exchange", redirectUri);
  formData.set("client_id", appId);
  formData.set("client_secret", appSecret);
  formData.set("grant_type", "authorization_code");
  formData.set("redirect_uri", redirectUri);
  formData.set("code", code);

  const response = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: formData,
    cache: "no-store",
  });
  const shortLivedToken = parseInstagramTokenResponse(response, await response.text());

  if (!response.ok || !shortLivedToken.access_token) {
    throw new Error(
      shortLivedToken.error_message ??
        shortLivedToken.error_type ??
        (shortLivedToken.error_code ? `Instagram-Fehlercode ${shortLivedToken.error_code}` : undefined) ??
        "Instagram-Token konnte nicht abgerufen werden."
    );
  }

  const longLivedTokenUrl = new URL("https://graph.instagram.com/access_token");
  longLivedTokenUrl.searchParams.set("grant_type", "ig_exchange_token");
  longLivedTokenUrl.searchParams.set("client_secret", appSecret);
  longLivedTokenUrl.searchParams.set("access_token", shortLivedToken.access_token);

  const longLivedResponse = await fetch(longLivedTokenUrl, { cache: "no-store" });
  const longLivedToken = (await longLivedResponse.json()) as InstagramTokenResponse;

  if (!longLivedResponse.ok || !longLivedToken.access_token) {
    throw new Error(
      longLivedToken.error_message ??
        longLivedToken.error_type ??
        "Langlaufender Instagram-Token konnte nicht abgerufen werden."
    );
  }

  return {
    ...longLivedToken,
    user_id: shortLivedToken.user_id,
  };
}

export async function getInstagramProfile(accessToken: string, _accountId: string) {
  const { apiVersion } = getInstagramConfig();
  const response = await fetch(
    `https://graph.instagram.com/${apiVersion}/me?fields=user_id,username`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );
  const data = (await response.json()) as InstagramProfile;
  const profileAccountId = data.user_id ?? data.id;

  if (!response.ok || !profileAccountId) {
    throw new Error(data.error?.message ?? "Instagram-Profil konnte nicht abgerufen werden.");
  }

  return { accountId: profileAccountId, username: data.username ?? profileAccountId };
}

export async function publishInstagramImage(
  accountId: string,
  accessToken: string,
  imageUrl: string,
  caption: string
) {
  const { apiVersion } = getInstagramConfig();
  const createMediaResponse = await fetch(
    `https://graph.instagram.com/${apiVersion}/${accountId}/media`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ image_url: imageUrl, caption }),
      cache: "no-store",
    }
  );
  const createMediaData = (await createMediaResponse.json()) as InstagramResponse;

  if (!createMediaResponse.ok || !createMediaData.id) {
    throw new Error(createMediaData.error?.message ?? "Instagram-Mediencontainer konnte nicht erstellt werden.");
  }

  const publishResponse = await fetch(
    `https://graph.instagram.com/${apiVersion}/${accountId}/media_publish`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ creation_id: createMediaData.id }),
      cache: "no-store",
    }
  );
  const publishData = (await publishResponse.json()) as InstagramResponse;

  if (!publishResponse.ok || !publishData.id) {
    throw new Error(publishData.error?.message ?? "Instagram-Beitrag konnte nicht veröffentlicht werden.");
  }

  return publishData.id;
}
import { createHash } from "crypto";
