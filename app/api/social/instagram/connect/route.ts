import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createInstagramAuthorizationUrl } from "@/lib/social/instagram";
import { encryptSecret } from "@/lib/social/secrets";

export const runtime = "nodejs";

function toBase64Url(value: Buffer) {
  return value.toString("base64url");
}

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "Projekt fehlt." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Kein Zugriff auf dieses Projekt." }, { status: 403 });
    }

    const state = toBase64Url(randomBytes(32));
    const stateHash = createHash("sha256").update(state).digest("hex");
    const encryptedStateRecord = encryptSecret(state);
    const admin = createAdminClient();

    const { error } = await admin.from("social_oauth_states").insert({
      state_hash: stateHash,
      user_id: user.id,
      project_id: project.id,
      platform: "instagram",
      code_verifier_ciphertext: encryptedStateRecord.ciphertext,
      code_verifier_iv: encryptedStateRecord.iv,
      code_verifier_tag: encryptedStateRecord.tag,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: "OAuth-Status konnte nicht gespeichert werden." }, { status: 500 });
    }

    return NextResponse.json({
      url: createInstagramAuthorizationUrl(state),
    });
  } catch (error) {
    console.error("Instagram OAuth Start Fehler:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Instagram-Verbindung konnte nicht gestartet werden." },
      { status: 500 }
    );
  }
}
