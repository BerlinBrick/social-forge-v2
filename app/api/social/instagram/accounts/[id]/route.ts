import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { data: account } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("id", id)
    .eq("platform", "instagram")
    .single();

  if (!account) {
    return NextResponse.json({ error: "Instagram-Konto nicht gefunden." }, { status: 404 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("social_accounts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
