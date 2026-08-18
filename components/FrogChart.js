// ABOUTME: "Roughly how many frogs have you held?" — a visitor-contributed histogram.
// ABOUTME: Fetches/submits via /api/frogs; the server owns validation, the session cookie, and rate limiting.
"use client";

import { useEffect, useState } from "react";

export default function FrogChart() {
  const [data, setData] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState("loading"); // loading | idle | submitting | error
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/frogs")
      .then((res) => res.json())
      .then((payload) => {
        setData(payload);
        if (payload.ownValue !== null) setInputValue(String(payload.ownValue));
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/frogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: Number(inputValue) }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error || "Something went wrong — try again.");
        setStatus("idle");
        return;
      }
      setData(payload);
      setStatus("idle");
    } catch {
      setError("Couldn't reach the server — try again.");
      setStatus("idle");
    }
  }

  if (status === "loading" || !data) {
    return <p className="quiet-note">[loading the frog chart…]</p>;
  }

  const maxCount = Math.max(1, ...data.bins.map((b) => b.count));
  const hasOwn = data.ownValue !== null;

  return (
    <div className="frog-chart">
      <p className="mono-label frog-chart-eyebrow">roughly how many frogs have you held?</p>

      <div className="frog-track">
        {data.bins.map((bin, i) => (
          <div className="frog-bar-col" key={bin.label}>
            {i === data.beckBinIndex && (
              <div className="frog-beck-arrow" title={`Beck · ${data.beckValue}`}>
                <span className="frog-beck-arrow-label">beck</span>
                <span className="frog-beck-arrow-glyph">↓</span>
              </div>
            )}
            <div
              className={"frog-bar" + (hasOwn && i === data.ownBinIndex ? " frog-bar-own" : "")}
              style={{ height: `${(bin.count / maxCount) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="frog-labels">
        {data.bins.map((bin) => (
          <span key={bin.label}>{bin.label}</span>
        ))}
      </div>

      <p className="quiet-note frog-total">
        {data.total} {data.total === 1 ? "person has" : "people have"} answered so far.
      </p>

      <form className="frog-form" onSubmit={handleSubmit}>
        <input
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          required
          autoComplete="off"
          placeholder="e.g. 3"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" disabled={status === "submitting"}>
          {hasOwn ? "Update" : "Submit"}
        </button>
      </form>
      {error && <p className="frog-error">{error}</p>}
    </div>
  );
}
