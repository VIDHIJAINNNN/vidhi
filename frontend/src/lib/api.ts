import { storage } from "@/src/utils/storage";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL ?? "";
const TOKEN_KEY = "legacy_token";

async function getToken(): Promise<string | null> {
  return await storage.secureGet(TOKEN_KEY, null as unknown as string);
}

export async function saveToken(token: string) {
  await storage.secureSet(TOKEN_KEY, token);
}

export async function clearToken() {
  await storage.secureRemove(TOKEN_KEY);
}

async function request<T = any>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api${path}`, { ...opts, headers });
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const msg = isJson && body?.detail ? body.detail : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body as T;
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data ?? {}) }),
  delete: <T = any>(path: string) => request<T>(path, { method: "DELETE" }),
  base: BASE,
  async streamCareerChat(payload: { career_id: string; session_id: string; message: string }, onDelta: (t: string) => void) {
    const token = await getToken();
    const res = await fetch(`${BASE}/api/career-chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
        Accept: "text/event-stream",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok || !res.body) {
      // Fallback: non-streaming
      const r = await request<{ text: string }>("/career-chat", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onDelta(r.text);
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;
        const content = line.slice(5).trimStart();
        if (content === "[DONE]") return;
        if (content.startsWith("[error")) {
          onDelta(`\n\n${content}`);
          continue;
        }
        onDelta(content);
      }
    }
  },
};
