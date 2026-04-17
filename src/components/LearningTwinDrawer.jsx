import React from "react";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function polarToXY(cx, cy, r, angleRad) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function radarPath(values, max, cx, cy, r) {
  const n = values.length;
  const pts = values.map((v, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const rr = (clamp(v, 0, max) / max) * r;
    return polarToXY(cx, cy, rr, a);
  });
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
}

export default function LearningTwinDrawer({ isOpen, onClose, profile }) {
  const riskScore = profile?.risk_profile?.score ?? 5;
  const riskLabel = profile?.risk_profile?.label ?? "Balanced";
  const riskPct = clamp(riskScore / 10, 0, 1);

  // mock traits driven by signals (demo)
  const traits = [
    { key: "FOMO", value: profile?.behavioral_signals?.chat_sentiment === "negative" ? 7 : 5 },
    { key: "Patience", value: profile?.learning_context?.daily_task_performance === "strong" ? 7 : 5 },
    { key: "Analytical", value: profile?.learning_context?.level === "intermediate" ? 7 : 5 },
    { key: "Discipline", value: profile?.learning_context?.recent_incorrect_answers > 6 ? 4 : 6 },
    { key: "Curiosity", value: profile?.behavioral_signals?.confidence_signal === "high" ? 7 : 6 }
  ];

  const radarMax = 10;
  const cx = 120;
  const cy = 118;
  const rr = 78;
  const radarD = radarPath(traits.map((t) => t.value), radarMax, cx, cy, rr);

  if (!isOpen) return null;

  return (
    <div className="twin-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="twin-drawer"
        role="dialog"
        aria-label="Learning Twin"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="twin-header">
          <div>
            <p className="twin-title">Learning Twin</p>
            <p className="twin-sub">Pulse’s behind-the-scenes model of you</p>
          </div>
          <button type="button" className="twin-close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="twin-card">
          <p className="twin-card-title">Risk Tolerance</p>
          <div className="twin-gauge">
            <div className="twin-gauge-track" />
            <div className="twin-gauge-fill" style={{ width: `${riskPct * 100}%` }} />
            <div className="twin-gauge-dot" style={{ left: `${riskPct * 100}%` }} />
          </div>
          <div className="twin-gauge-meta">
            <span className="twin-pill">Score: {riskScore}/10</span>
            <span className="twin-pill">{riskLabel}</span>
          </div>
        </div>

        <div className="twin-card">
          <p className="twin-card-title">Behavior Radar</p>
          <svg width="240" height="240" className="twin-radar" aria-label="Behavior radar chart">
            <g opacity="0.35">
              {[0.25, 0.5, 0.75, 1].map((k) => (
                <circle key={k} cx={cx} cy={cy} r={rr * k} fill="none" stroke="rgba(160,206,253,0.55)" strokeWidth="1" />
              ))}
            </g>
            <path d={radarD} fill="rgba(160,206,253,0.22)" stroke="rgba(160,206,253,0.95)" strokeWidth="2" />
            {traits.map((t, i) => {
              const a = -Math.PI / 2 + (i * 2 * Math.PI) / traits.length;
              const p = polarToXY(cx, cy, rr + 22, a);
              return (
                <text
                  key={t.key}
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(208,215,221,0.92)"
                  fontSize="11"
                  fontWeight="700"
                >
                  {t.key}
                </text>
              );
            })}
          </svg>
          <p className="twin-hint">
            This demo learns silently from your chats and trades to shape how Pulse explains concepts.
          </p>
        </div>
      </aside>
    </div>
  );
}

