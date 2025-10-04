export const runtime = "edge";
import { ImageResponse } from "next/og";

export async function POST(req) {
  const { text = "GM ☀️", theme } = await req.json().catch(()=>({}));
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
        <div style={{
          maxWidth: 900, textAlign: "center", padding: "0 40px",
          fontSize: 56, lineHeight: 1.1,
        }}>
          {text}
        </div>
        <div style={{ marginTop: 40, fontSize: 28, color: t.accent }}>farcaster mini app</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
