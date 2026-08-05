"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

const Paw = ({ small = false }: { small?: boolean }) => (
  <svg className={small ? "paw paw-small" : "paw"} viewBox="0 0 64 64" aria-hidden="true">
    <ellipse cx="32" cy="42" rx="18" ry="14" />
    <ellipse cx="13" cy="28" rx="7" ry="9" transform="rotate(-25 13 28)" />
    <ellipse cx="25" cy="18" rx="7" ry="9" transform="rotate(-8 25 18)" />
    <ellipse cx="39" cy="18" rx="7" ry="9" transform="rotate(8 39 18)" />
    <ellipse cx="51" cy="28" rx="7" ry="9" transform="rotate(25 51 28)" />
  </svg>
);

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    if (demoMode) {
      await new Promise((resolve) => setTimeout(resolve, 650));
      form.reset();
      setStatus("success");
      setMessage("Preview complete. In production, these three items will be emailed to the Bear.");
      return;
    }

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Submission failed.");
      form.reset();
      setStatus("success");
      setMessage("The Bear has your three. Watch your inbox for the ranking.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="logo"><Paw small /></div>
          <div>
            <strong>Bear Ranks</strong>
            <span>Powered by ChatBRP</span>
          </div>
        </div>
        <button className="new-rank" type="button"><span>＋</span> New ranking</button>
        <div className="sidebar-copy">
          <Paw small />
          <p>Three options enter the den. The Bear decides the order.</p>
        </div>
        <div className="sidebar-footer">Human-ranked. Bear-approved.</div>
      </aside>

      <section className="main-panel">
        <header className="mobile-header">
          <div className="brand-lockup">
            <div className="logo"><Paw small /></div>
            <div><strong>Bear Ranks</strong><span>Powered by ChatBRP</span></div>
          </div>
        </header>

        <div className="conversation">
          <div className="hero">
            <div className="hero-mark"><Paw /></div>
            <h1>What should the Bear rank?</h1>
            <p>Submit exactly three items. No criteria. No explanations. Just the order.</p>
          </div>

          <form className="rank-form" onSubmit={submit}>
            <div className="three-boxes">
              {[1, 2, 3].map((number) => (
                <label className="option-box" key={number}>
                  <span className="option-number">{number}</span>
                  <textarea
                    name={`item${number}`}
                    required
                    maxLength={500}
                    placeholder={`Item ${number}`}
                    aria-label={`Item ${number}`}
                  />
                </label>
              ))}
            </div>

            <div className="submit-row">
              <label className="email-field">
                <span>Email for the ranking</span>
                <input name="email" type="email" required placeholder="you@example.com" />
              </label>
              <button className="submit-button" disabled={status === "sending"} type="submit">
                {status === "sending" ? "Sending to the den…" : "Ask the Bear"}
                <span className="arrow">↑</span>
              </button>
            </div>

            {demoMode && <div className="preview-note">UI preview mode: no email will be sent.</div>}
            {message && <div className={`notice ${status}`} role="status">{message}</div>}
          </form>
        </div>
        <footer>The ranker chooses the basis and replies with only 1, 2, 3.</footer>
      </section>
    </main>
  );
}
