"use client";
import { useEffect, useMemo, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

// Short, clean presets and 3 simple themes
const PRESETS = [
  "GM ☀️",
  "Shipping today 🚀",
  "I need coffee ☕",
  "Hot take 🔥",
  "Looking for feedback 🙏",
  "WAGMI ✨",
];

const THEMES = [
  { name: "Grape",  bg: "#0b0b0b", fg: "#ffffff", accent: "#8A63D2" },
  { name: "Mint",   bg: "#071410", fg: "#eafff7", accent: "#3ad1a1" },
  { name: "Sunset", bg: "#160e09", fg: "#ffe9d6", accent: "#ff7f50" },
];

export default function Page() {
  const [text, setText] = useState("");
  const [theme, setTheme] = useState(THEMES[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Tell the Farcaster container we're ready (no-op on web)
    sdk.actions.ready().catch(() => {});
  }, []);

  // Nice default: rotate preset by day
  useEffect(() => {
    const i = (new Date().getUTCDate() + new Date().getUTCMonth()) % PRESETS.length;
    setText(PRESETS[i]);
  }, []);

  const disabled = useMemo(() => !text || text.length > 80, [text]);

  async function share() {
    setErrorMsg("");
    setLoading(true);
    try {
      // 1) Ask our Edge route to render a PNG
      const res = await fetch("/api/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, theme }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setErrorMsg(`Image generation failed: ${msg}`);
        return;
      }
      const blob = await res.blob();

      // 2) Attach ONLY the image to the composer (no embeds → no gray link box)
      const file = new File([blob], "castcard.png", { type: "image/png" });
      await sdk.actions.composeCast({
        text,
        attachments: [file],
      });
    } catch (e) {
      setErrorMsg(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  function copyPreset(p) { setText(p); }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
      <h1 style={{ fontWeight: 800, letterSpacing: 0.3 }}>CastCard</h1>

      <section style={card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>1) Pick a preset</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PRESETS.map((p) => (
            <button key={p} onClick={() => copyPreset(p)} style={chip}>
              {p}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
          (You can edit it below — max 80 chars)
        </div>
      </section>

      <section style={card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>2) Edit text</div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your line…"
          maxLength={80}
          style={input}
        />
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
          {text.length}/80
        </div>
      </section>

      <section style={card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>3) Choose a theme</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {THEMES.map((t) => (
            <button
              key={t.name}
              onClick={() => setTheme(t)}
              style={{
                ...chip,
                borderColor: theme.name === t.name ? t.accent : "#333",
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  marginRight: 8,
                  background: t.accent,
                  display: "inline-block",
                }}
              />
              {t.name}
            </button>
          ))}
        </div>
      </section>

      {errorMsg && (
        <div style={{ ...card, borderColor: "#a33", color: "#fbb" }}>
          {errorMsg}
        </div>
      )}

      <section style={{ display: "flex", gap: 8 }}>
        <button onClick={share} disabled={disabled || loading} style={btnPrimary(theme)}>
          {loading ? "Preparing…" : "Share"}
        </button>
        <button onClick={() => setText("")} style={btnGhost}>Clear</button>
      </section>
    </main>
  );
}

// Simple inline styles (no Tailwind required)
const card = { border: "1px solid #333", borderRadius: 12, padding: 12, background: "transparent" };
const chip = {
  background: "transparent", color: "#fff", border: "1px solid #333",
  borderRadius: 999, padding: "8px 12px", cursor: "pointer"
};
const input = {
  background: "#111", color: "#fff", border: "1px solid #444",
  borderRadius: 12, padding: "10px 12px", width: "100%"
};
const btnPrimary = (t) => ({
  background: t.accent, color: "#000", border: 0,
  padding: "12px 16px", borderRadius: 12, fontWeight: 800, minWidth: 140
});
const btnGhost = {
  background: "transparent", color: "#fff", border: "1px solid #444",
  padding: "12px 16px", borderRadius: 12, minWidth: 120
};
