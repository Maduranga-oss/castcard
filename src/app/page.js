"use client";
import { useEffect, useMemo, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

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
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    sdk.actions.ready().catch(() => {});
    // rotate a default preset
    const i = (new Date().getUTCDate() + new Date().getUTCMonth()) % PRESETS.length;
    setText(PRESETS[i]);
  }, []);

  const disabled = useMemo(() => !text || text.length > 80, [text]);

  async function share() {
  setErrorMsg("");
  setLoading(true);
  setPreviewUrl("");
  try {
    // (Optional) still show an inline preview via POST so the user sees the card render
    const res = await fetch(`/api/card?ts=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, theme }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    }

    // Build a PUBLIC direct image URL for the embed (works on web + mobile)
    const origin = typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_DOMAIN || "https://your-domain");
    const themeKey = theme.name.toLowerCase(); // "Grape" -> "grape"
    const embedUrl = `${origin}/api/card.png?text=${encodeURIComponent(text)}&theme=${encodeURIComponent(themeKey)}`;

    // Send ONLY the embed URL; composer will show the image preview
    await sdk.actions.composeCast({
      text,
      embeds: [embedUrl],
    });
  } catch (e) {
    setErrorMsg(String(e?.message || e));
  } finally {
    setLoading(false);
  }
}


  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
      <h1 style={{ fontWeight: 800, letterSpacing: 0.3 }}>CastCard</h1>

      <section style={card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>1) Pick a preset</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PRESETS.map((p) => (
            <button key={p} onClick={() => setText(p)} style={chip}>
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

      {previewUrl && (
        <section style={card}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Preview (generated PNG)</div>
          <img src={previewUrl} alt="card preview" style={{ maxWidth: "100%", borderRadius: 12 }} />
        </section>
      )}

      {errorMsg && (
        <div style={{ ...card, borderColor: "#a33", color: "#fbb" }}>
          {errorMsg}
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            If you’re in the developer shell, click <b>Open URL as Mini App</b> and try again.
          </div>
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

const card = { border: "1px solid #333", borderRadius: 12, padding: 12, background: "transparent" };
const chip = {
  background: "transparent", color: "#000", border: "1px solid #333",
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
  background: "transparent", color: "#000", border: "1px solid #444",
  padding: "12px 16px", borderRadius: 12, minWidth: 120
};
