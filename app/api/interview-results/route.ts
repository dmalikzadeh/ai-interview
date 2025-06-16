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
  const body = await req.json();
  const { name, role, company, notes = [] } = body;

  if (!useAI) {
    // fallback manual version if AI is disabled
    return NextResponse.json({
      intro:
        "Thanks for completing your interview! Here's a quick summary based on your responses.",
      score: 7.3,
      strengths: [
        "Clear communication",
        "Good understanding of the role",
        "Professional tone",
      ],
      improvements: [
        "Provide more specific examples",
        "Be more concise when answering",
      ],
      finalNote:
        "You're on the right track! Focus on refining your answers with real-world examples, and you'll improve quickly.",
    });
  }

  const formattedNotes = notes
    .map(
      (
        note: { strength: string; criticism: string; score: number },
        i: number
      ) =>
        `Note ${i + 1}: Strength: ${note.strength} | Criticism: ${
          note.criticism
        } | Score: ${note.score}/5`
    )
    .join("\n");

  const prompt = `
You are Ava, a supportive and honest interview coach.
${name} just completed an interview for the "${role}" role at "${company}".
Here are the interviewer's notes (score 0-5 each):

${formattedNotes}

Write final feedback in this JSON format:
{
  "intro": "Brief summary of how the interview went.",
  "score": X.X, // Overall score out of 10
  "strengths": [ "Key strengths from the interview." ],
  "improvements": [ "Practical advice for future interviews." ],
  "finalNote": "Brief encouraging message to close."
}

Speak directly to the candidate. 
Reflect on the notes - don't repeat them.
Give honest, varied suggestions.
Keep each strength/improvement short and scannable (1-2 lines max).
Use natural language, not overly formal.
Output JSON only. No markdown or extra text.
`;

  const completion = await openai.chat.completions.create({
    model: deployment,
    temperature: 0.6,
    max_tokens: 350,
    messages: [
      {
        role: "system",
        content: prompt,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    return NextResponse.json(
      { error: "No content returned from AI" },
      { status: 500 }
    );
  }

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Failed to parse AI response:", content);
    return NextResponse.json(
      { error: "Invalid AI response format" },
      { status: 500 }
    );
  }
}
