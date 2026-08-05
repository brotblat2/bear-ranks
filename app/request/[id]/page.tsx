"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { RankRequest } from "../../../lib/types";
import { rankedItems } from "../../../lib/types";

export default function RequestPage() {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RankRequest | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const response = await fetch(`/api/requests/${id}`, { cache: "no-store" });
      if (response.ok && !cancelled) setRequest(await response.json());
    };
    poll();
    const polling = setInterval(poll, 3000);
    const clock = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => { cancelled = true; clearInterval(polling); clearInterval(clock); };
  }, [id]);

  useEffect(() => {
    if (!request || request.status === "answered" || request.email_fallback_sent) return;
    const age = Date.now() - new Date(request.created_at).getTime();
    if (age >= 5 * 60_000) fetch(`/api/requests/${id}`, { method: "POST" });
  }, [request, id, seconds]);

  if (!request) return <main className="center-page"><div className="loader">🐻</div><h1>Opening the den…</h1></main>;

  if (request.status === "answered") {
    const items = rankedItems(request);
    return <main className="center-page result-page"><div className="hero-bear">🐻</div><h1>The Bear has ranked them</h1><ol className="result-list">{items.map((item) => <li key={item}>{item}</li>)}</ol><a className="button-link" href="/">Rank another three</a></main>;
  }

  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(request.created_at).getTime()) / 1000));
  const remaining = Math.max(0, 300 - elapsed);
  return <main className="center-page waiting-page"><div className="loader">🐻</div><h1>The Bear is ranking your options…</h1><p>{request.route === "live" && !request.email_fallback_sent ? "A ranker is online and your request is in the live queue." : "Your request is with the ranker by email. You may close this page; the result will also be emailed."}</p>{remaining > 0 && !request.email_fallback_sent && <div className="countdown">Email fallback in {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2,"0")}</div>}<div className="submitted-items"><span>{request.item_1}</span><span>{request.item_2}</span><span>{request.item_3}</span></div></main>;
}
