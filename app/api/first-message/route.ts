// app/api/first-message/route.ts
import { NextResponse } from "next/server";
import { AzureOpenAI } from "openai";

const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_GPT_4O_MINI!;
const openai = new AzureOpenAI({
  apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
});
const useAI = process.env.NEXT_PUBLIC_USE_AI === "true"; // env flag to toggle AI

export async function POST(req: Request) {
  const { name, role, company } = await req.json();

  if (!useAI) {
    const fallback = `Hi ${name}, welcome! I'm Ava, and I'll be conducting your interview for the ${role} role at ${company}. Let's get started.`;
    return NextResponse.json({ firstMessage: fallback });
  }

  const prompt = `
You're Ava, a friendly and professional interviewer.

Start the interview with ${name}, applying for ${role} at ${company}. Send your first message — keep it natural, human, and not overly formal. Introduce yourself or the company, ask how they're doing, and ease into the conversation.

Do not start asking questions yet.
`;

  const response = await openai.chat.completions.create({
    model: deployment,
    temperature: 0.7,
    max_tokens: 150,
    messages: [{ role: "system", content: prompt }],
  });

  const message = response.choices?.[0]?.message?.content?.trim();
  if (!message) {
    return NextResponse.json(
      { error: "Failed to generate first message." },
      { status: 500 }
    );
  }

  return NextResponse.json({ firstMessage: message });
}
