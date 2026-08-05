import { Resend } from "resend";
import type { RankRequest } from "./types";
import { rankedItems } from "./types";

function client() {
  if (!process.env.RESEND_API_KEY) throw new Error("Resend is not configured.");
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendRankerRequest(request: RankRequest) {
  const rankerEmail = process.env.RANKER_EMAIL;
  const from = process.env.FROM_EMAIL;
  const replyTo = process.env.INBOUND_EMAIL;
  if (!rankerEmail || !from || !replyTo) throw new Error("Email settings are incomplete.");

  await client().emails.send({
    from,
    to: rankerEmail,
    replyTo,
    subject: `[BR:${request.id}] Rank these three items`,
    text: `Bear Ranks request\n\n1. ${request.item_1}\n2. ${request.item_2}\n3. ${request.item_3}\n\nReply with only the order, such as 2-3-1.`,
  });
}

export async function sendUserResult(request: RankRequest) {
  const from = process.env.FROM_EMAIL;
  if (!from) throw new Error("FROM_EMAIL is missing.");
  const items = rankedItems(request);
  await client().emails.send({
    from,
    to: request.user_email,
    subject: "Your Bear Ranking",
    text: `The Bear ranked your items:\n\n1. ${items[0]}\n2. ${items[1]}\n3. ${items[2]}`,
  });
}

export function parseRanking(text: string): number[] | null {
  const match = text.match(/(?:^|\D)([123])\s*[-,>\s]\s*([123])\s*[-,>\s]\s*([123])(?:\D|$)/m);
  if (!match) return null;
  const order = [Number(match[1]), Number(match[2]), Number(match[3])];
  return new Set(order).size === 3 ? order : null;
}
