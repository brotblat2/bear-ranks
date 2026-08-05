import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/supabase";
import { sendUserResult } from "../../../../lib/email";
import type { RankRequest } from "../../../../lib/types";

export async function POST(request: NextRequest) {
  if (!process.env.RANKER_KEY || request.headers.get("x-ranker-key") !== process.env.RANKER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, order } = await request.json();
    if (!Array.isArray(order) || order.length !== 3 || new Set(order).size !== 3 || order.some((x) => ![1, 2, 3].includes(x))) {
      return NextResponse.json({ error: "Invalid ranking order." }, { status: 400 });
    }
    const updated = await db<RankRequest[]>(`rank_requests?id=eq.${id}&status=eq.pending`, {
      method: "PATCH",
      body: JSON.stringify({ status: "answered", ranking_order: order, answered_at: new Date().toISOString() }),
    });
    if (!updated[0]) return NextResponse.json({ error: "Request was already answered or not found." }, { status: 409 });
    await sendUserResult(updated[0]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Response failed." }, { status: 500 });
  }
}
