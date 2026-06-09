import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Content } from "@google/genai";
import { NextRequest } from "next/server";

const MODEL_NAME = "gemini-2.5-flash";

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

interface HistoryMessage {
  role: "user" | "model";
  text: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const { prompt, urls, files, history } = await request.json();

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "prompt가 필요합니다." }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const koreanInstruction =
    "\n\n(참고: 사용자가 명시적으로 요구하지 않는 이상, 항상 정중하고 깊이 있는 한국어로 명확히 답변해 주세요. 대답에는 적절한 단락 구분과 마크다운 스타일을 적용해 가독성을 높여 주십시오.)";

  let fileContext = "";
  const hasFiles = Array.isArray(files) && files.length > 0;
  if (hasFiles) {
    fileContext =
      "\n\n[첨부 문서 목록]:\n" +
      files.map((f: { name: string; mimeType: string }) => `- ${f.name} (${f.mimeType})`).join("\n") +
      "\n(참고: 사용자가 첨부한 문서 파일들을 전송하였으니, 질문의 맥락에 맞추어 같이 참고하여 분석해 주세요.)";
  }

  const hasUrls = Array.isArray(urls) && urls.length > 0;

  // Build multi-turn contents
  const contents: Content[] = [];

  // Add conversation history (up to 10 recent turns)
  const recentHistory: HistoryMessage[] = Array.isArray(history) ? history.slice(-20) : [];
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.text }],
    });
  }

  // Add current user message with context
  let fullPrompt = prompt + koreanInstruction + fileContext;
  if (hasUrls) {
    fullPrompt += "\n\nRelevant URLs for context:\n" + urls.join("\n");
  }

  const parts: unknown[] = [{ text: fullPrompt }];
  if (hasFiles) {
    for (const file of files) {
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data,
        },
      });
    }
  }

  contents.push({ role: "user", parts: parts as Content["parts"] });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        tools: hasUrls ? [{ urlContext: {} }] : undefined,
        safetySettings,
      },
    });

    const text = response.text;
    const candidate = response.candidates?.[0];
    let urlContextMetadata: unknown[] | undefined;

    if (candidate?.urlContextMetadata?.urlMetadata) {
      urlContextMetadata = candidate.urlContextMetadata.urlMetadata as unknown[];
    }

    return Response.json({ text, urlContextMetadata });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Gemini API error:", message);
    return Response.json({ error: `AI 응답 생성 실패: ${message}` }, { status: 500 });
  }
}
