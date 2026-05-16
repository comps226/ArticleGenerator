import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function Spinner() {
  return (
    <div style={{
      width: 28, height: 28,
      border: "3px solid #1a1a2e",
      borderTop: "3px solid #e94560",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
  );
}

function StepBadge({ n, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <div style={{
        width: 26, height: 26, borderRadius: "50%",
        background: "#e94560", color: "#fff",
        fontSize: 11, fontWeight: 800, fontFamily: "'Courier New', monospace",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{n}</div>
      <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#888", fontFamily: "'Courier New', monospace" }}>{label}</span>
    </div>
  );
}

function ArticleDisplay({ data, topic, stance }) {
  const [copied, setCopied] = useState(false);

  const fullText = [
    `# ${topic} — ${stance.toUpperCase()} CASE\n`,
    `**Audience:** ${data.audience}  **Tone:** ${data.tone}\n`,
    `**Outline:**\n${data.outline.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n`,
    `---\n`,
    `${data.introduction}\n`,
    ...data.sections.map(s => `## ${s.heading}\n\n${s.body}`),
    `---\n`,
    `${data.conclusion}\n`,
    `*${data.cta}*`,
  ].join("\n\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <div style={{
          background: "#0f0f1a", border: "1px solid #2a2a4a",
          borderRadius: 6, padding: "6px 14px",
          fontSize: 12, color: "#aaa", fontFamily: "'Courier New', monospace",
        }}>
          <span style={{ color: "#e94560" }}>audience</span> → {data.audience}
        </div>
        <div style={{
          background: "#0f0f1a", border: "1px solid #2a2a4a",
          borderRadius: 6, padding: "6px 14px",
          fontSize: 12, color: "#aaa", fontFamily: "'Courier New', monospace",
        }}>
          <span style={{ color: "#e94560" }}>tone</span> → {data.tone}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <StepBadge n="2" label="5-Point Outline" />
        <div style={{
          background: "#0a0a18", border: "1px solid #1e1e3a",
          borderRadius: 8, padding: "16px 20px", marginTop: 8,
        }}>
          {data.outline.map((point, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 4 ? 10 : 0 }}>
              <span style={{ color: "#e94560", fontFamily: "'Courier New', monospace", fontSize: 13, flexShrink: 0 }}>0{i + 1}</span>
              <span style={{ color: "#ccc", fontSize: 14, lineHeight: 1.5 }}>{point}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <StepBadge n="3" label="Introduction" />
        <p style={{ color: "#ddd", fontSize: 15, lineHeight: 1.8, marginTop: 8, fontStyle: "italic", borderLeft: "3px solid #e94560", paddingLeft: 16 }}>
          {data.introduction}
        </p>
      </div>

      <div style={{ marginBottom: 32 }}>
        <StepBadge n="4" label="Body Sections" />
        {data.sections.map((s, i) => (
          <div key={i} style={{
            marginTop: 20, paddingBottom: 20,
            borderBottom: i < 4 ? "1px solid #1e1e3a" : "none",
          }}>
            <h3 style={{
              color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 10,
              fontFamily: "'Georgia', serif",
            }}>
              <span style={{ color: "#e94560", fontFamily: "'Courier New', monospace", fontSize: 13, marginRight: 10 }}>
                [{String(i + 1).padStart(2, "0")}]
              </span>
              {s.heading}
            </h3>
            <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.85, margin: 0 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 24 }}>
        <StepBadge n="5" label="Conclusion" />
        <p style={{ color: "#ddd", fontSize: 15, lineHeight: 1.8, marginTop: 8 }}>{data.conclusion}</p>
      </div>

      <div style={{
        background: "linear-gradient(135deg, #1a0a14, #0a0a1a)",
        border: "1px solid #e94560",
        borderRadius: 8, padding: "16px 20px", marginBottom: 28,
      }}>
        <StepBadge n="6" label="Call to Action" />
        <p style={{ color: "#f5c6d0", fontSize: 15, lineHeight: 1.7, fontStyle: "italic", margin: "8px 0 0" }}>
          {data.cta}
        </p>
      </div>

      <button
        onClick={handleCopy}
        style={{
          background: copied ? "#1a3a1a" : "#1a1a2e",
          border: `1px solid ${copied ? "#4caf50" : "#2a2a4a"}`,
          color: copied ? "#4caf50" : "#888",
          borderRadius: 6, padding: "10px 20px",
          fontSize: 12, letterSpacing: 1.5,
          textTransform: "uppercase", cursor: "pointer",
          fontFamily: "'Courier New', monospace",
          transition: "all 0.2s",
        }}
      >
        {copied ? "✓ Copied to clipboard" : "Copy full article"}
      </button>
    </div>
  );
}

export default function App() {
  const [topic, setTopic] = useState("");
  const [stance, setStance] = useState("bullish");
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  const steps = [
    "Identifying audience & tone",
    "Building outline",
    "Writing introduction",
    "Developing sections",
    "Writing conclusion & CTA",
  ];

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setArticle(null);
    setError("");
    setStep(0);

    const interval = setInterval(() => {
      setStep(s => (s < steps.length - 1 ? s + 1 : s));
    }, 2200);

    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, stance }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`);
      }

      setArticle(data);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07070f",
      color: "#fff",
      fontFamily: "'Georgia', serif",
      padding: "0 0 80px",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea:focus { outline: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a18; }
        ::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 3px; }
      `}</style>

      <div style={{
        borderBottom: "1px solid #1a1a2e",
        padding: "24px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#07070f",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e94560", animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase" }}>
              Article Generator
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 4, letterSpacing: -0.5 }}>
            6-Step Framework Engine
          </h1>
        </div>
        <div style={{
          fontFamily: "'Courier New', monospace", fontSize: 10,
          color: "#333", letterSpacing: 1, textAlign: "right", lineHeight: 1.8,
        }}>
          POWERED BY<br />
          <span style={{ color: "#e94560" }}>CLAUDE SONNET 4</span>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 0" }}>

        <div style={{
          background: "#0d0d1f",
          border: "1px solid #1e1e3a",
          borderRadius: 12, padding: 28, marginBottom: 36,
        }}>
          <label style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#888", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 10 }}>
            Article Topic
          </label>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. Why AI is a stock market bubble..."
            rows={3}
            style={{
              width: "100%", background: "#07070f",
              border: "1px solid #2a2a4a", borderRadius: 8,
              color: "#fff", fontSize: 15, lineHeight: 1.6,
              padding: "14px 16px", resize: "vertical",
              fontFamily: "'Georgia', serif",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#e94560"}
            onBlur={e => e.target.style.borderColor = "#2a2a4a"}
          />

          <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["bullish", "bearish", "neutral", "contrarian"].map(s => (
                <button
                  key={s}
                  onClick={() => setStance(s)}
                  style={{
                    padding: "7px 14px", borderRadius: 6, fontSize: 12,
                    fontFamily: "'Courier New', monospace", letterSpacing: 1,
                    cursor: "pointer", textTransform: "uppercase",
                    border: stance === s ? "1px solid #e94560" : "1px solid #2a2a4a",
                    background: stance === s ? "#1a0a14" : "transparent",
                    color: stance === s ? "#e94560" : "#666",
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={generate}
              disabled={loading || !topic.trim()}
              style={{
                marginLeft: "auto",
                background: loading || !topic.trim() ? "#111" : "#e94560",
                color: loading || !topic.trim() ? "#444" : "#fff",
                border: "none", borderRadius: 8,
                padding: "10px 28px", fontSize: 13,
                fontFamily: "'Courier New', monospace",
                letterSpacing: 1.5, textTransform: "uppercase",
                cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              {loading ? <><Spinner /> Generating...</> : "Generate →"}
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ marginBottom: 36, animation: "fadeUp 0.3s ease" }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                marginBottom: 10, opacity: i <= step ? 1 : 0.25,
                transition: "opacity 0.4s",
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                  background: i < step ? "#e94560" : i === step ? "transparent" : "#1a1a2e",
                  border: i === step ? "2px solid #e94560" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  animation: i === step ? "pulse 1s infinite" : "none",
                }}>
                  {i < step && <span style={{ fontSize: 10, color: "#fff" }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: i === step ? "#fff" : "#555", fontFamily: "'Courier New', monospace" }}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{
            background: "#1a0a0a", border: "1px solid #e94560",
            borderRadius: 8, padding: "14px 18px", marginBottom: 24,
            color: "#f5c6d0", fontSize: 14, fontFamily: "'Courier New', monospace",
          }}>
            ⚠ {error}
          </div>
        )}

        {article && !loading && (
          <div style={{
            background: "#0d0d1f", border: "1px solid #1e1e3a",
            borderRadius: 12, padding: 32,
          }}>
            <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #1e1e3a" }}>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 2, color: "#e94560", textTransform: "uppercase" }}>
                Generated Article
              </span>
              <h2 style={{ fontSize: 20, marginTop: 6, color: "#fff", letterSpacing: -0.3 }}>
                {topic}
                <span style={{ fontSize: 12, color: "#888", fontFamily: "'Courier New', monospace", marginLeft: 12, letterSpacing: 1 }}>
                  [{stance.toUpperCase()}]
                </span>
              </h2>
            </div>
            <ArticleDisplay data={article} topic={topic} stance={stance} />
          </div>
        )}

        {!article && !loading && !error && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#333" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>
              Enter a topic to begin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
