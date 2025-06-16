// @ts-nocheck
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { NextResponse } from "next/server";
import { AzureOpenAI } from "openai";

const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_GPT_4O_MINI!;
const openai = new AzureOpenAI({
  apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
});
const useAI = process.env.NEXT_PUBLIC_USE_AI === "true";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("cv") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileType = file.name.split(".").pop()?.toLowerCase();

  // If AI calls are disabled, skip parsing and return placeholder
  if (!useAI) {
    const dummy = "⚠️ AI disabled - CV parsing and summarization skipped.";
    return NextResponse.json({ summary: dummy });
  }

  let text = "";

  if (fileType === "pdf") {
    try {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } catch (err) {
      console.error("PDF parse error:", err);
      return NextResponse.json(
        { error: "Failed to parse PDF" },
        { status: 500 }
      );
    }
  } else if (fileType === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    return NextResponse.json(
      { error: "Unsupported file type" },
      { status: 400 }
    );
  }

  const completion = await openai.chat.completions.create({
    model: deployment,
    temperature: 0.3,
    max_tokens: 220,
    messages: [
      {
        role: "system",
        content:
          "You summarize CVs for interview prep. Output ≤120 words. Exclude personal/contact info. Focus on relevant roles, standout skills, and education. Keep it clear, compressed, and job-relevant.",
      },
      { role: "user", content: "Summarise this CV." },
      { role: "user", content: text },
    ],
  });

  const summary = completion.choices?.[0]?.message?.content?.trim();
  console.log("🧾 CV Summary:\n", summary);
  return NextResponse.json({ summary });
}
