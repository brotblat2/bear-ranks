import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/supabase";
import { sendRankerRequest } from "../../../../lib/email";
import type { RankRequest } from "../../../../lib/types";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const rows = await db<RankRequest[]>(`rank_requests?id=eq.${id}&select=*`);
    if (!rows[0]) return NextResponse.json({ error: "Request not found." }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Lookup failed." }, { status: 500 });
  }
}

export async function POST(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const rows = await db<RankRequest[]>(`rank_requests?id=eq.${id}&select=*`);
    const item = rows[0];
    if (!item) return NextResponse.json({ error: "Request not found." }, { status: 404 });
    if (item.status === "answered" || item.email_fallback_sent) return NextResponse.json({ ok: true });
    await sendRankerRequest(item);
    await db(`rank_requests?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ email_fallback_sent: true, route: "email" }) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Fallback failed." }, { status: 500 });
  }
}
