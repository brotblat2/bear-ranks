import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/supabase";
import type { RankRequest } from "../../../../lib/types";

export async function GET(request: NextRequest) {
  if (!process.env.RANKER_KEY || request.headers.get("x-ranker-key") !== process.env.RANKER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await db<RankRequest[]>("rank_requests?status=eq.pending&order=created_at.asc&select=*");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Queue failed." }, { status: 500 });
  }
}
