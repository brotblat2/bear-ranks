"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [online, setOnline] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const check = async () => {
      try {
        const response = await fetch("/api/status", { cache: "no-store" });
        const data = await response.json();
        setOnline(Boolean(data.online));
      } catch { setOnline(false); }
    };
    check();
    const timer = setInterval(check, 15_000);
    return () => clearInterval(timer);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Submission failed.");
      router.push(`/request/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSending(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="bear">🐻</span><div><strong>Bear Ranks</strong><small>Powered by ChatBRP</small></div></div>
        <div className={`presence ${online ? "online" : "offline"}`}><span />{online ? "Ranker online" : "Ranker offline"}</div>
        <p className="side-copy">Three options enter the den. A human Bear decides the order.</p>
      </aside>
      <section className="content">
        <div className="hero"><div className="hero-bear">🐻</div><h1>What should the Bear rank?</h1><p>Submit exactly three items. The ranker chooses the basis.</p></div>
        <form className="rank-form" onSubmit={submit}>
          <div className="option-grid">
            {[1,2,3].map((n) => <label className="option-card" key={n}><b>{n}</b><textarea name={`item${n}`} required maxLength={500} placeholder={`Item ${n}`} /></label>)}
          </div>
          <div className="submit-bar"><input name="email" type="email" required placeholder="Email for your result"/><button disabled={sending}>{sending ? "Sending…" : "Ask the Bear"}</button></div>
          <p className="timing">{online ? "A ranker is online. Responses are usually quick." : "No ranker is online. Your request will be sent by email."}</p>
          {error && <p className="error">{error}</p>}
        </form>
      </section>
    </main>
  );
}
