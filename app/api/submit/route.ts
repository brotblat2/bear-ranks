import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#039;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = clean(body.email);
    const items = [clean(body.item1), clean(body.item2), clean(body.item3)];

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (items.some((item) => !item)) {
      return NextResponse.json({ error: "All three items are required." }, { status: 400 });
    }
    if (items.some((item) => item.length > 500)) {
      return NextResponse.json({ error: "Each item must be 500 characters or fewer." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const rankerEmail = process.env.RANKER_EMAIL;
    const fromEmail = process.env.FROM_EMAIL || "Bear Ranks <onboarding@resend.dev>";

    if (!apiKey || !rankerEmail) {
      console.error("Missing RESEND_API_KEY or RANKER_EMAIL");
      return NextResponse.json({ error: "Email delivery is not configured yet." }, { status: 503 });
    }

    const resend = new Resend(apiKey);
    const submitted = items.map(escapeHtml);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: rankerEmail,
      replyTo: email,
      subject: "New Bear Ranks submission",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#231a15">
          <div style="background:#2c1d16;color:#fff;padding:24px;border-radius:18px 18px 0 0">
            <div style="font-size:24px;font-weight:800">🐻 Bear Ranks</div>
            <div style="opacity:.72;margin-top:4px">Powered by ChatBRP</div>
          </div>
          <div style="border:1px solid #e6ddd5;border-top:0;padding:24px;border-radius:0 0 18px 18px">
            <p style="margin-top:0">Rank these three items. Reply directly to this email with only the order.</p>
            ${submitted.map((item, index) => `<div style="padding:16px;margin:10px 0;background:#f7f1eb;border-radius:12px"><strong>${index + 1}.</strong> ${item.replace(/\n/g, "<br>")}</div>`).join("")}
            <p style="margin-bottom:0;color:#78685e;font-size:13px">Submitter: ${escapeHtml(email)}</p>
          </div>
        </div>
      `,
      text: `BEAR RANKS\n\nRank these three items and reply with only the order:\n\n1. ${items[0]}\n\n2. ${items[1]}\n\n3. ${items[2]}\n\nSubmitter: ${email}`,
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "The submission could not be sent." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
}
