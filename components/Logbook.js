// ABOUTME: The Logbook — a scrollable, newest-first feed of visitor messages and small drawings.
// ABOUTME: Fetches/submits via /api/logbook; a signed admin cookie (set at /api/admin/login) unlocks per-entry delete.

"use client";

import { useEffect, useRef, useState } from "react";

const CANVAS_SIZE = 240;
const VISIBLE_ENTRIES_BEFORE_SCROLL = 3;

const COLORS = [
  { name: "ink", value: "#2b2620" },
  { name: "slate", value: "#6b6b6b" },
  { name: "rust", value: "#b5533c" },
  { name: "mustard", value: "#c99a2e" },
  { name: "moss", value: "#5c7a4b" },
  { name: "teal", value: "#3f7d7a" },
  { name: "denim", value: "#3f5f7a" },
  { name: "plum", value: "#6b4a7a" },
  { name: "rose", value: "#c96a83" },
  { name: "brass", value: "#b4863a" },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Logbook() {
  const [entries, setEntries] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | idle | submitting | error
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [hasDrawing, setHasDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0].value);

  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const feedRef = useRef(null);
  const [feedMaxHeight, setFeedMaxHeight] = useState(null);

  useEffect(() => {
    fetch("/api/logbook")
      .then((res) => res.json())
      .then((payload) => {
        setEntries(payload.entries);
        setIsAdmin(payload.isAdmin);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, []);

  // The feed shows exactly VISIBLE_ENTRIES_BEFORE_SCROLL entries before it scrolls.
  // Entries vary in height (a drawing makes one much taller than a text-only one),
  // so this measures real rendered heights rather than assuming a fixed row height.
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    function measure() {
      const children = Array.from(container.children).slice(0, VISIBLE_ENTRIES_BEFORE_SCROLL);
      if (!children.length) {
        setFeedMaxHeight(null);
        return;
      }
      const gap = parseFloat(getComputedStyle(container).rowGap || "0");
      const total = children.reduce(
        (sum, el, i) => sum + el.getBoundingClientRect().height + (i > 0 ? gap : 0),
        0
      );
      setFeedMaxHeight(total);
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [entries]);

  function getCanvasContext() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }

  function pointFromEvent(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const point = e.touches ? e.touches[0] : e;
    return {
      x: (point.clientX - rect.left) * scaleX,
      y: (point.clientY - rect.top) * scaleY,
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = pointFromEvent(e);
  }

  function draw(e) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = getCanvasContext();
    const point = pointFromEvent(e);
    const last = lastPointRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
    setHasDrawing(true);
  }

  function stopDrawing() {
    drawingRef.current = false;
  }

  function clearCanvas() {
    const ctx = getCanvasContext();
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    setHasDrawing(false);
  }

  useEffect(() => {
    clearCanvas();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim() && !hasDrawing) {
      setError("Leave a message or a drawing first.");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          message,
          drawingDataUrl: hasDrawing ? canvasRef.current.toDataURL("image/png") : "",
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error || "Something went wrong — try again.");
        setStatus("idle");
        return;
      }
      setEntries(payload.entries);
      setIsAdmin(payload.isAdmin);
      setName("");
      setMessage("");
      clearCanvas();
      setStatus("idle");
    } catch {
      setError("Couldn't reach the server — try again.");
      setStatus("idle");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setLoginError(payload.error || "Something went wrong.");
        return;
      }
      setIsAdmin(true);
      setShowLogin(false);
      setPassword("");
    } catch {
      setLoginError("Couldn't reach the server — try again.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAdmin(false);
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/logbook/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  }

  if (status === "loading" || !entries) {
    return <p className="quiet-note">[loading the logbook…]</p>;
  }

  return (
    <div className="logbook">
      <p className="mono-label logbook-eyebrow">
        leave a note for whoever wanders by next
      </p>

      <form className="logbook-form" onSubmit={handleSubmit}>
        <input
          type="text"
          maxLength={40}
          placeholder="name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          maxLength={280}
          placeholder="a short message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
        <div className="logbook-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="logbook-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="logbook-canvas-side">
            <div className="logbook-colors">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={"logbook-color" + (color === c.value ? " active" : "")}
                  style={{ background: c.value }}
                  title={c.name}
                  aria-label={c.name}
                  onClick={() => setColor(c.value)}
                />
              ))}
            </div>
            <div className="logbook-canvas-actions">
              <button type="button" className="logbook-clear" onClick={clearCanvas}>
                clear
              </button>
              <button type="submit" className="logbook-post" disabled={status === "submitting"}>
                {status === "submitting" ? "posting…" : "post"}
              </button>
            </div>
          </div>
        </div>
        {error && <p className="frog-error">{error}</p>}
      </form>

      <div
        className="logbook-feed"
        ref={feedRef}
        style={feedMaxHeight ? { maxHeight: `${feedMaxHeight}px` } : undefined}
      >
        {entries.length === 0 && (
          <p className="quiet-note">No entries yet — be the first.</p>
        )}
        {entries.map((entry) => (
          <div className="logbook-entry" key={entry.id}>
            <div className="logbook-entry-head">
              <span className="logbook-entry-name">{entry.name || "anonymous"}</span>
              <span className="logbook-entry-date">{formatDate(entry.createdAt)}</span>
            </div>
            {entry.message && <p className="logbook-entry-message">{entry.message}</p>}
            {entry.drawingDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.drawingDataUrl}
                alt={`A small drawing left by ${entry.name || "an anonymous visitor"}`}
                className="logbook-entry-drawing"
              />
            )}
            {isAdmin && (
              <button
                type="button"
                className="logbook-delete"
                onClick={() => handleDelete(entry.id)}
              >
                take down
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="logbook-admin">
        {isAdmin ? (
          <button type="button" className="logbook-admin-toggle" onClick={handleLogout}>
            log out
          </button>
        ) : showLogin ? (
          <form className="logbook-login" onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button type="submit">go</button>
            {loginError && <p className="frog-error">{loginError}</p>}
          </form>
        ) : (
          <button
            type="button"
            className="logbook-admin-toggle"
            onClick={() => setShowLogin(true)}
          >
            beck?
          </button>
        )}
      </div>
    </div>
  );
}
