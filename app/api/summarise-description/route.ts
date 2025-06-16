// /app/api/summarise-description/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AzureOpenAI } from "openai";

const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_GPT_4O_MINI!;
const openai = new AzureOpenAI({
  apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
});

const useAI = process.env.NEXT_PUBLIC_USE_AI !== "false";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { description } = await req.json();

  if (!description || description.length < 10) {
    return NextResponse.json({ summary: description });
  }

  if (!useAI) {
    return NextResponse.json({ summary: description });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: deployment,
      temperature: 0.2,
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that summarizes job descriptions for interviewers. Extract key context, core responsibilities, and must-have skills. Compress into ≤300 characters. Prioritize clarity, relevance, and token efficiency. Omit fluff or repetition.",
        },
        { role: "user", content: "Summarise this job description." },
        { role: "user", content: description },
      ],
    });

    const summary =
      completion.choices?.[0]?.message?.content?.trim() ?? description;
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("❌ Failed to summarise description:", err);
    return new Response("Failed to summarise description", { status: 500 });
  }
}
