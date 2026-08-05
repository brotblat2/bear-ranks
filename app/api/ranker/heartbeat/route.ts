import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/supabase";

function authorized(request: NextRequest) {
  return Boolean(process.env.RANKER_KEY && request.headers.get("x-ranker-key") === process.env.RANKER_KEY);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await db("ranker_presence?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ id: 1, last_seen_at: new Date().toISOString() }),
    });
    return NextResponse.json({ online: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Heartbeat failed." }, { status: 500 });
  }
}
