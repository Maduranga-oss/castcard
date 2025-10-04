"use client";
import { useEffect, useMemo, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

const PRESETS = [
  "GM ☀️", "Shipping today 🚀", "I need coffee ☕",
  "Hot take 🔥", "Looking for feedback 🙏", "WAGMI ✨",
];

const THEMES = [
  { name:"Grape", bg:"#0b0b0b", fg:"#ffffff", accent:"#8A63D2" },
  { name:"Mint",  bg:"#071410", fg:"#eafff7", accent:"#3ad1a1" },
  { name:"Sunset",bg:"#160e09", fg:"#ffe9d6", accent:"#ff7f50" },
];

export default function Page() {
  const [text, setText] = useState("");
  const [theme, setTheme] = useState(THEMES[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { sdk.actions.ready().catch(() => {}); }, []);

  // pick a fun default (daily seed)
  useEffect(() => {
    const i = (new Date().getUTCDate() + new Date().getUTCMonth()) % PRESETS.length;
    setText(PRESETS[i]);
  }, []);

  const disabled = useMemo(() => !text || text.length > 80, [text]);

  async function share() {
    try {
      setLoading(true);
      const res = await fetch("/api/card", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ text, theme })
      });
      const blob = await res.blob();
      const file = new File([blob], "castcard.png", { type:"image/png" });

      const origin = typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_DOMAIN;

      await sdk.actions.composeCast({
        text,
        embeds: [origin],
        attachments: [file],
      });
    } finally { setLoading(false); }
  }

  function copyPreset(p) { setText(p); }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 16, display:"grid", gap:16 }}>
      <h1 style={{ fontWeight:800, letterSpacing:.3 }}>CastCard</h1>

      <section style={card}>
        <div style={{ fontWeight:700, marginBottom:8 }}>1) Pick a preset</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {PRESETS.map((p) => (
            <button key={p} onClick={() => copyPreset(p)} style={chip}>
              {p}
            </button>
          ))}
        </div>
        <div style={{ marginTop:12, fontSize:12, opacity:.8 }}>
          (You can edit it below — max 80 chars)
        </div>
      </section>

      <section style={card}>
        <div style={{ fontWeight:700, marginBottom:8 }}>2) Edit text</div>
        <input
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder="Type your line…"
          maxLength={80}
          style={input}
        />
      </section>

      <section style={card}>
        <div style={{ fontWeight:700, marginBottom:8 }}>3) Choose a theme</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {THEMES.map(t => (
            <button key={t.name}
              onClick={()=>setTheme(t)}
              style={{
                ...chip,
                borderColor: theme.name===t.name ? t.accent : "#333"
              }}
            >
              <span style={{
                width:16, height:16, borderRadius:4, marginRight:8,
                background: t.accent, display:"inline-block"
              }}/>
              {t.name}
            </button>
          ))}
        </div>
      </section>

      <section style={{ display:"flex", gap:8 }}>
        <button onClick={share} disabled={disabled||loading} style={btnPrimary(theme)}>
          {loading ? "Preparing…" : "Share"}
        </button>
        <button onClick={()=>setText("")} style={btnGhost}>Clear</button>
      </section>

      <footer style={{ textAlign:"center", opacity:.7, fontSize:12 }}>
        Works best inside Farcaster. No data stored.
      </footer>
    </main>
  );
}

const card = { border:"1px solid #333", borderRadius:12, padding:12 };
const chip = { background:"transparent", color:"#fff", border:"1px solid #333",
  borderRadius:999, padding:"8px 12px", cursor:"pointer" };
const input = { background:"#111", color:"#fff", border:"1px solid #444",
  borderRadius:12, padding:"10px 12px", width:"100%" };
const btnPrimary = (t)=>({ background:t.accent, color:"#000", border:0,
  padding:"12px 16px", borderRadius:12, fontWeight:800, minWidth:140 });
const btnGhost = { background:"transparent", color:"#fff", border:"1px solid #444",
  padding:"12px 16px", borderRadius:12, minWidth:120 };
