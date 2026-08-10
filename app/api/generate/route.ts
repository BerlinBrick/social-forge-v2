import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Text erzeugen
    const completion = await client.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content:
            "Du bist ein professioneller Social Media Marketing Experte. Erstelle einen fertigen Social Media Beitrag inklusive Titel, Haupttext und passenden Hashtags.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = completion.choices[0].message.content ?? "";

    // Bild erzeugen
    const image = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    const imageBase64 = image.data?.[0]?.b64_json ?? "";

    // In Supabase speichern
    const { data, error } = await supabase
      .from("posts")
      .insert({
        project: "BerlinBrick",
        platform: "Instagram",
        type: "Post",
        prompt,
        title: prompt,
        content: text,
        image_base64: imageBase64,
        status: "Entwurf",
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json({
        success: false,
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      text,
      image: imageBase64,
      post: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Fehler beim Generieren",
      },
      {
        status: 500,
      }
    );
  }
}
