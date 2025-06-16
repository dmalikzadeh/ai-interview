import { NextResponse } from "next/server";
import { AzureOpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";

const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_GPT_4O!;
const openai = new AzureOpenAI({
  apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
});

const useAI = process.env.NEXT_PUBLIC_USE_AI === "true";

const MAX_HISTORY = 10; // Keep last 10 exchanges (user + assistant)

export async function POST(req: Request) {
  const body = await req.json();
  const {
    name,
    role,
    company,
    cv,
    description,
    length,
    history = [],
    timeRemaining,
  } = body;

  // Time handling
  const nearEnd = timeRemaining <= length * 60 * 0.1;
  const forceEnd = timeRemaining < -60;
  if (forceEnd) {
    return NextResponse.json({
      message: "Your interview time has run out. Thank you for participating.",
      note: {
        strength: "None",
        criticism: "None",
        score: 0,
      },
      ended: true,
    });
  }

  // candidateInfo object for debugging
  const candidateInfo = {
    name,
    jobRole: role,
    companyName: company,
  };
  console.log("Candidate info:", candidateInfo);
  console.log("📄 Job Description:", description);
  console.log("Time remaining:", timeRemaining, "Near end:", nearEnd);

  // Return fake message when AI is disabled
  if (!useAI) {
    const fallbackMessage = `Thank you for your response, can you please elaborate on your experience with ${role} at ${company}?`;
    return NextResponse.json({ message: fallbackMessage });
  }

  // Construct improved prompt for AI
  const prompt = [
    `You are Ava, a realistic AI interviewer for ${company}, interviewing ${name} for the ${role} role.`,
    ``,
    `###`,
    `After each candidate response, reply in **valid JSON only** (no markdown or extra text) using this schema:`,
    `{`,
    `  "message": "<follow-up or wrap-up message, conversational and concise>",`,
    `  "note": {`,
    `    "strength": "<1 clear strength (≤20 words) or 'None'>",`,
    `    "criticism": "<1 actionable suggestion (≤30 words) or 'None'>",`,
    `    "score": <integer 0-5>`,
    `  },`,
    `  "ended": <true | false>`,
    `}`,
    `###`,
    ``,
    `### Tone & behavior:`,
    `- Friendly and human, occasionally use light sarcasm if the candidate is vague or unserious`,
    `- If vague, off-topic, or personal: respond politely but redirect back to job-relevant discussion`,
    `- End naturally around the scheduled time (±10%), or if candidate asks (ended: true)`,
    `- Ask open-ended, role-relevant questions only`,
    `- Use natural follow-ups that sound like a real conversation`,
    `###`,
    ``,
    `### Context:`,
    `${cv ? `CV: """${cv}"""` : ""}`,
    `${description ? `Job Description: """${description}"""` : ""}`,
    `Duration: ${length} minutes — Time remaining: ${timeRemaining} seconds`,
    `${nearEnd ? "The interview is nearly over. Start wrapping up." : ""}`,
  ].join("\n");

  // Trim history to last few turns (to reduce tokens)
  const recentHistory = history.slice(-MAX_HISTORY);

  interface Message {
    role: string;
    content: string;
  }

  // Compose messages array
  const restOfMessages = recentHistory
    .filter((msg: Message) => msg.content?.trim())
    .map((msg: Message) => ({
      role: msg.role,
      content: msg.content.trim(),
    }));

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: prompt,
    },
    ...restOfMessages,
  ];

  const completion = await openai.chat.completions.create({
    model: deployment,
    temperature: 0.7,
    messages,
    response_format: { type: "json_object" },
  });

  console.log("🧠 Completion tokens used:", completion.usage?.total_tokens);

  let raw;
  try {
    raw = completion.choices?.[0]?.message?.content;
    if (!raw || raw.trim().length === 0) {
      console.error("🧠 Unexpected AI response format:", completion);
      return NextResponse.json(
        { firstMessage: "⚠️ Error parsing AI response. Please try again." },
        { status: 500 }
      );
    }
    const lastUserMsg =
      recentHistory.at(-1)?.content?.trim() || "(no user msg)";
    console.log("👤 User Message:", lastUserMsg);
    console.log("🧠 AI Raw Response:", raw);
  } catch (err) {
    console.error("❌ Failed to parse AI response:", err, completion);
    return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("❌ Failed to parse JSON response:", raw);
    parsed = {
      message: raw.trim(),
      note: {
        strength: "None",
        criticism: "None",
        score: 0,
      },
      ended: false,
    };
  }

  return NextResponse.json(parsed);
}
