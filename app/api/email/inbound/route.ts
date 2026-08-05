import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "../../../../lib/supabase";
import { parseRanking, sendUserResult } from "../../../../lib/email";
import type { RankRequest } from "../../../../lib/types";

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    if (event.type !== "email.received") return NextResponse.json({ ok: true });
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is missing.");

    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.receiving.get(event.data.email_id);
    const email = result.data;
    if (!email) throw new Error("Could not retrieve inbound email.");

    const subject = String(email.subject || event.data.subject || "");
    const id = subject.match(/\[BR:([0-9a-f-]{36})\]/i)?.[1];
    const order = parseRanking(String(email.text || ""));
    if (!id || !order) return NextResponse.json({ ok: true, ignored: true });

    const updated = await db<RankRequest[]>(`rank_requests?id=eq.${id}&status=eq.pending`, {
      method: "PATCH",
      body: JSON.stringify({ status: "answered", ranking_order: order, answered_at: new Date().toISOString(), route: "email" }),
    });
    if (updated[0]) await sendUserResult(updated[0]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Inbound processing failed." }, { status: 500 });
  }
}
