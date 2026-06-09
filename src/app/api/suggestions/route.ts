import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Content } from "@google/genai";
import { NextRequest } from "next/server";

const MODEL_NAME = "gemini-2.5-flash";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  const { urls } = await request.json();
  if (!Array.isArray(urls) || urls.length === 0) {
    return Response.json({ suggestions: [] });
  }

  const ai = new GoogleGenAI({ apiKey });
  const urlList = urls.join("\n");

  const promptText = `Based on the content of the following documentation URLs, provide 3-4 concise and actionable questions IN KOREAN (한국어) a developer might ask to explore these documents. These questions should be suitable as quick-start prompts. Return ONLY a JSON object with a key "suggestions" containing an array of these question strings in Korean. For example: {"suggestions": ["API 호출 제한(Rate Limit)은 어떻게 되나요?", "API 키를 발급받으려면 어떻게 해야 하나요?", "사용 가능한 모델의 종류를 알려주세요."]}

Relevant URLs:
${urlList}`;

  const contents: Content[] = [{ role: "user", parts: [{ text: promptText }] }];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let suggestions: string[] = [];

    try {
      let jsonStr = text.trim();
      const fenceMatch = jsonStr.match(new RegExp("^```\\w*\\s*\\n?(.*?)\\n?\\s*```$", "s"));
      if (fenceMatch?.[1]) jsonStr = fenceMatch[1].trim();
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.suggestions)) {
        suggestions = parsed.suggestions.filter((s: unknown) => typeof s === "string").slice(0, 4);
      }
    } catch {
      console.warn("Failed to parse suggestions JSON:", text);
    }

    return Response.json({ suggestions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Suggestions API error:", message);
    return Response.json({ suggestions: [] });
  }
}
