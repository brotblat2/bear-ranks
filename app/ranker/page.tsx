"use client";

import { DragEvent, useEffect, useState } from "react";
import type { RankRequest } from "../../lib/types";

type Card = { position: number; text: string };

export default function RankerPage() {
  const [key, setKey] = useState("");
  const [queue, setQueue] = useState<RankRequest[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [dragged, setDragged] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const current = queue[0];

  useEffect(() => setKey(localStorage.getItem("bear-ranker-key") || ""), []);
  useEffect(() => {
    if (!current) return setCards([]);
    setCards([{ position: 1, text: current.item_1 }, { position: 2, text: current.item_2 }, { position: 3, text: current.item_3 }]);
  }, [current?.id]);

  useEffect(() => {
    if (!key) return;
    localStorage.setItem("bear-ranker-key", key);
    const headers = { "x-ranker-key": key };
    const refresh = async () => {
      await fetch("/api/ranker/heartbeat", { method: "POST", headers });
      const response = await fetch("/api/ranker/queue", { headers, cache: "no-store" });
      if (response.ok) setQueue(await response.json());
      else setMessage("Invalid ranker key.");
    };
    refresh();
    const timer = setInterval(refresh, 15_000);
    return () => clearInterval(timer);
  }, [key]);

  function drop(event: DragEvent, target: number) {
    event.preventDefault();
    if (dragged === null || dragged === target) return;
    const next = [...cards];
    const [item] = next.splice(dragged, 1);
    next.splice(target, 0, item);
    setCards(next);
    setDragged(null);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= cards.length) return;
    const next = [...cards];
    [next[index], next[target]] = [next[target], next[index]];
    setCards(next);
  }

  async function submit() {
    if (!current) return;
    const response = await fetch("/api/ranker/respond", { method: "POST", headers: { "Content-Type": "application/json", "x-ranker-key": key }, body: JSON.stringify({ id: current.id, order: cards.map((card) => card.position) }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || "Could not submit ranking.");
    setMessage("Ranking sent.");
    setQueue((items) => items.slice(1));
  }

  if (!key) return <main className="ranker-login"><div className="hero-bear">🐻</div><h1>Enter the den</h1><input type="password" placeholder="Ranker key" onChange={(e) => setKey(e.target.value)} /></main>;

  return <main className="ranker-shell"><header><div><h1>Bear Ranker</h1><p><span className="live-dot" /> Online while this page is open</p></div><strong>{queue.length} waiting</strong></header>{message && <p className="notice">{message}</p>}{!current ? <section className="empty-queue"><div>🐻</div><h2>The queue is empty</h2><p>New rankings will appear automatically.</p></section> : <section className="rank-work"><div className="request-meta">Waiting since {new Date(current.created_at).toLocaleTimeString()}</div><h2>Drag into best-to-worst order</h2><div className="drag-list">{cards.map((card, index) => <div className="drag-card" key={card.position} draggable onDragStart={() => setDragged(index)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e, index)}><span className="rank-number">{index + 1}</span><p>{card.text}</p><div className="move-buttons"><button onClick={() => move(index, -1)} disabled={index === 0}>↑</button><button onClick={() => move(index, 1)} disabled={index === 2}>↓</button></div></div>)}</div><button className="submit-ranking" onClick={submit}>Submit ranking</button></section>}</main>;
}
