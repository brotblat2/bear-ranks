import { NextResponse } from "next/server";
import { db, isConfigured } from "../../../lib/supabase";

export async function GET() {
  if (!isConfigured()) return NextResponse.json({ online: false, demo: true });
  const rows = await db<{ last_seen_at: string }[]>("ranker_presence?id=eq.1&select=last_seen_at");
  const lastSeen = rows[0]?.last_seen_at;
  const online = Boolean(lastSeen && Date.now() - new Date(lastSeen).getTime() < 60_000);
  return NextResponse.json({ online, lastSeen });
}
