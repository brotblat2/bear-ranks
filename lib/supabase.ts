const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

function configured() {
  return Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY);
}

export async function db<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!configured()) throw new Error("Supabase is not configured.");

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SECRET_KEY!,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Database request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function isConfigured() {
  return configured();
}
