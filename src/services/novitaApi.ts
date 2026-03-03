const NOVITA_API_URL = "https://api.novita.ai/v3/openai/chat/completions";

interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
      reasoning_content?: string;
    };
  }>;
}

export async function callModel(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000); // 4s hard cap

  try {
    const response = await fetch(NOVITA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 40,
        temperature: 1.0,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() ?? '';

    if (!content && data.choices?.[0]?.message?.reasoning_content) {
      const reasoning = data.choices[0].message.reasoning_content;
      const lines = reasoning.split('\n').filter((l: string) => l.trim());
      return lines[lines.length - 1]?.trim() ?? '';
    }

    return content;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// Single attempt — no retry, fallback AI handles failures instantly
export async function callModelWithRetry(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  try {
    return await callModel(model, systemPrompt, userPrompt, apiKey);
  } catch {
    return ''; // Fallback AI takes over immediately
  }
}

export async function callModelForInterview(
  model: string,
  nickname: string,
  context: string,
  apiKey: string
): Promise<string> {
  const systemPrompt = `You are "${nickname}" who just competed in the LLM Colosseum battle royale. Give a brief, entertaining post-game interview response (1-2 sentences). Stay in character.`;
  const userPrompt = `The battle is over. ${context}\n\nWhat are your thoughts on the battle? Keep it short and entertaining.`;

  try {
    const result = await callModelWithRetry(model, systemPrompt, userPrompt, apiKey);
    return result || "...";
  } catch {
    return "I have nothing to say.";
  }
}
