// app/api/card/route.js
export const runtime = "edge";
import { ImageResponse } from "next/og";

function render({ text = "GM ☀️", theme }) {
  const t = theme || { bg:"#0b0b0b", fg:"#ffffff", accent:"#8A63D2" };

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630,
          background: t.bg, color: t.fg,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          fontFamily: "Inter, ui-sans-serif, system-ui",
        }}
      >
        <div style={{ position:"absolute", inset:0, border:"24px solid #222", borderRadius:32 }} />
        <div style={{ fontSize: 72, fontWeight: 900, marginBottom: 24 }}>CastCard</div>
        <div style={{ maxWidth: 900, textAlign: "center", padding: "0 40px",
          fontSize: 56, lineHeight: 1.1 }}>
          {text}
        </div>
        <div style={{ marginTop: 40, fontSize: 28, color: t.accent }}>farcaster mini app</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

// POST: generate from JSON body (used for inline preview in the app)
export async function POST(req) {
  const { text = "GM ☀️", theme } = await req.json().catch(() => ({}));
  return render({ text, theme });
}

// GET: generate from URL params so we can share a direct PNG link in casts
// Example: /api/card.png?text=Hot%20take%20%F0%9F%94%A5&theme=grape
export async function GET(req) {
  const url = new URL(req.url);
  const text = url.searchParams.get("text") || "GM ☀️";
  const themeName = (url.searchParams.get("theme") || "grape").toLowerCase();

  const THEMES = {
    grape:  { bg:"#0b0b0b", fg:"#ffffff", accent:"#8A63D2" },
    mint:   { bg:"#071410", fg:"#eafff7", accent:"#3ad1a1" },
    sunset: { bg:"#160e09", fg:"#ffe9d6", accent:"#ff7f50" },
  };
  const theme = THEMES[themeName] || THEMES.grape;

  // Force image content type (ImageResponse sets it automatically; we redirect path)
  return render({ text, theme });
}
