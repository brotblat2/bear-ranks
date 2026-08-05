import { NextRequest, NextResponse } from "next/server";
import { db, isConfigured } from "../../../lib/supabase";
import { sendRankerRequest } from "../../../lib/email";
import type { RankRequest } from "../../../lib/types";

export async function POST(request: NextRequest) {
  try {
    if (!isConfigured()) return NextResponse.json({ error: "The backend is not configured yet." }, { status: 503 });
    const body = await request.json();
    const items = [body.item1, body.item2, body.item3].map((x) => String(x || "").trim());
    const email = String(body.email || "").trim();
    if (items.some((x) => !x) || !email.includes("@")) return NextResponse.json({ error: "Enter three items and a valid email." }, { status: 400 });

    const presence = await db<{ last_seen_at: string }[]>("ranker_presence?id=eq.1&select=last_seen_at");
    const online = Boolean(presence[0]?.last_seen_at && Date.now() - new Date(presence[0].last_seen_at).getTime() < 60_000);
    const rows = await db<RankRequest[]>("rank_requests", {
      method: "POST",
      body: JSON.stringify({ user_email: email, item_1: items[0], item_2: items[1], item_3: items[2], route: online ? "live" : "email" }),
    });
    const created = rows[0];
    if (!online) {
      await sendRankerRequest(created);
      await db(`rank_requests?id=eq.${created.id}`, { method: "PATCH", body: JSON.stringify({ email_fallback_sent: true }) });
    }
    return NextResponse.json({ id: created.id, online });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Submission failed." }, { status: 500 });
  }
}
