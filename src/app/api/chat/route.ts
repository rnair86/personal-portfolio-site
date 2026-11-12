import { checkRateLimit, clientIp, rateLimitConfig } from "@/lib/rate-limit";
import { buildTwinSystemPrompt } from "@/lib/twin-prompt";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";
const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;
const UPSTREAM_TIMEOUT_MS = 30_000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function isValidMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length > 0 &&
        m.content.length <= MAX_CHARS,
    )
  );
}

export async function POST(request: Request) {
  const rate = checkRateLimit(clientIp(request));
  if (!rate.allowed) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    return Response.json(
      {
        error: `You've reached the chat limit of ${rateLimitConfig.limit} messages per ${rateLimitConfig.windowMinutes} minutes. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}, or reach out by email.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfterSeconds),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Chat is not configured on the server." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (!isValidMessages(messages)) {
    return Response.json({ error: "Invalid messages." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": request.headers.get("origin") ?? "http://localhost:3000",
        "X-Title": "Rohit Nair - Digital Twin",
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        temperature: 0.4,
        reasoning: { effort: "low", exclude: true },
        messages: [
          { role: "system", content: buildTwinSystemPrompt() },
          ...messages.slice(-MAX_MESSAGES),
        ],
      }),
      signal: AbortSignal.any([
        request.signal,
        AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      ]),
    });
  } catch (error) {
    if (request.signal.aborted) {
      return new Response(null, { status: 499 });
    }
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    console.error("OpenRouter request failed", error);
    return Response.json(
      {
        error: timedOut
          ? "The digital twin took too long to respond. Please try again."
          : "The digital twin is unavailable right now.",
      },
      { status: timedOut ? 504 : 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error("OpenRouter error", upstream.status, detail);
    return Response.json(
      { error: "The digital twin is unavailable right now." },
      { status: 502 },
    );
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = upstream.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const text: string | undefined = json.choices?.[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            // SSE comments and partial frames are skipped
          }
        }
      },
    }),
  );

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
