// Netlify Function: forwards Nudge chat requests to the Anthropic API.
// The API key stays on the server (set ANTHROPIC_API_KEY in Netlify), never in the page.

const MODEL = process.env.NUDGE_MODEL || "claude-haiku-4-5-20251001";
const hits = new Map();

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: "Chat isn't set up yet (missing API key)." }, 500);

  // Optional: only accept requests from your own site, e.g. https://nudge-planner.netlify.app
  const allowed = process.env.ALLOWED_ORIGIN;
  const origin = req.headers.get("origin");
  if (allowed && origin && origin !== allowed) return json({ error: "Not allowed" }, 403);

  // Best-effort rate limit per visitor (resets when the function restarts).
  const ip = req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const max = Number(process.env.RATE_LIMIT || 40);
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) return json({ error: "That's a lot of messages. Try again in a few minutes." }, 429);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();

  let body;
  try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  const { system, messages, tools } = body || {};
  if (typeof system !== "string" || system.length > 8000) return json({ error: "Bad request" }, 400);
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 60) return json({ error: "Bad request" }, 400);
  if (!Array.isArray(tools) || tools.length > 20) return json({ error: "Bad request" }, 400);
  if (JSON.stringify(messages).length > 60000) return json({ error: "This chat is too long. Start a new one." }, 400);

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: MODEL, max_tokens: 1024, system, messages, tools }),
  });
  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    console.error("Anthropic API error", upstream.status, JSON.stringify(data).slice(0, 300));
    const busy = upstream.status === 429 || upstream.status === 529;
    return json({ error: busy ? "Chat is busy right now. Try again in a moment." : "Chat hit a problem. Try again." }, 502);
  }
  return json({ content: data.content, stop_reason: data.stop_reason });
};

export const config = { path: "/api/chat" };
