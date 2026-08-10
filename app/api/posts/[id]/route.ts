import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from("posts")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase Fehler:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH Fehler:", err);

    return NextResponse.json(
      { error: "PATCH fehlgeschlagen" },
      { status: 500 }
    );
  }
}
