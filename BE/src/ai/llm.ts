import OpenAI from "openai";
import { config } from "../config";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export type LlmFn = (system: string, turns: ChatTurn[]) => Promise<string>;

export class LlmError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

let client: OpenAI | null = null;

export function isLlmConfigured(): boolean {
  return Boolean(config.llm.apiKey?.trim());
}

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: config.llm.apiKey,
      baseURL: config.llm.baseUrl,
      timeout: config.llm.timeoutMs,
      maxRetries: 0,
    });
  }

  return client;
}

export const askLlm: LlmFn = async (system, turns) => {
  try {
    const completion = await getClient().chat.completions.create({
      model: config.llm.model,
      messages: [{ role: "system", content: system }, ...turns],
      temperature: 0.4,
    });

    return (
      completion.choices[0]?.message?.content?.trim() ||
      "(The model did not return a response.)"
    );
  } catch (err) {
    if (err instanceof LlmError) {
      throw err;
    }

    const error = err as { status?: number; message?: string };

    console.error("LLM Error:", err);

    throw new LlmError(
      error.message || "LLM request failed",
      error.status,
    );
  }
};