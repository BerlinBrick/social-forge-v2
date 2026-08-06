import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "GET fehlgeschlagen" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("POST erhalten:", body);

    const { data, error } = await supabase
      .from("posts")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("Supabase Fehler:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("Gespeichert:", data);

    return NextResponse.json(data);
  } catch (err) {
    console.error("POST Fehler:", err);

    return NextResponse.json(
      { error: "POST fehlgeschlagen" },
      { status: 500 }
    );
  }
}