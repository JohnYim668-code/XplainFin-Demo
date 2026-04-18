import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const RANGE_OPTIONS = [
  { id: "1D", label: "1D" },
  { id: "5D", label: "5D" },
  { id: "1M", label: "1M" },
  { id: "6M", label: "6M" },
  { id: "YTD", label: "YTD" },
  { id: "MAX", label: "Max" }
];

// Deeper trend colors for higher contrast on light glass surfaces
export const MINT = "#0D9488"; // teal-600
export const CORAL = "#E11D48"; // rose-600
const EXTENDED_STROKE = "rgba(148, 163, 184, 0.85)";
const GRID = "rgba(148, 163, 184, 0.35)"; // slate-ish, subtle on light bg
const PREV_CLOSE = "rgba(148, 163, 184, 0.95)"; // slate-400 baseline

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** @typedef {'premarket' | 'regular' | 'after'} Session */

/**
 * @param {object} opts
 * @param {string} opts.rangeId
 * @param {number} opts.basePrice
 * @param {string} opts.symbol
 */
export function buildMockSeries({ rangeId, basePrice, symbol }) {
  const seed = hashStr(`${symbol}|${rangeId}|chart`);
  const rnd = mulberry32(seed);
  const vol = 0.008 + rnd() * 0.02;

  /** @type {{ t: number, label: string, price: number, session?: Session, reg?: number | null, ext?: number | null }[]} */
  const out = [];

  let n = 48;
  let spanMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  let start = now - spanMs;

  switch (rangeId) {
    case "1D":
      n = 96;
      spanMs = 16 * 60 * 60 * 1000;
      start = new Date();
      start.setHours(4, 0, 0, 0);
      start = start.getTime();
      break;
    case "5D":
      n = 40;
      spanMs = 5 * 24 * 60 * 60 * 1000;
      start = now - spanMs;
      break;
    case "1M":
      n = 44;
      spanMs = 30 * 24 * 60 * 60 * 1000;
      start = now - spanMs;
      break;
    case "6M":
      n = 52;
      spanMs = 182 * 24 * 60 * 60 * 1000;
      start = now - spanMs;
      break;
    case "YTD": {
      const y = new Date();
      y.setMonth(0, 1);
      y.setHours(9, 30, 0, 0);
      start = y.getTime();
      n = Math.min(64, Math.max(24, Math.ceil((now - start) / (24 * 60 * 60 * 1000))));
      spanMs = now - start;
      break;
    }
    case "MAX":
      n = 72;
      spanMs = 12 * 365 * 24 * 60 * 60 * 1000;
      start = now - spanMs;
      break;
    default:
      start = now - spanMs;
  }

  let price = basePrice * (0.92 + rnd() * 0.08);
  const drift = (rnd() - 0.45) * 0.0002;
  const span =
    rangeId === "YTD" ? Math.max(1, now - start) : rangeId === "1D" ? Math.max(1, spanMs) : spanMs;

  for (let i = 0; i < n; i++) {
    const t = start + (i / Math.max(1, n - 1)) * span;
    const shock = (rnd() - 0.5) * 2 * vol;
    price = Math.max(0.01, price * (1 + drift + shock));

    const d = new Date(t);
    let label = "";
    if (rangeId === "1D") {
      label = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    } else if (rangeId === "5D" || rangeId === "1M") {
      label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } else {
      label = d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
    }

    const frac = i / Math.max(1, n - 1);
    /** @type {Session} */
    let session = "regular";
    if (rangeId === "1D") {
      if (frac < 0.22) session = "premarket";
      else if (frac > 0.78) session = "after";
    }

    const isExt = session !== "regular";
    out.push({
      t,
      label,
      price,
      session,
      reg: isExt ? null : price,
      ext: isExt ? price : null
    });
  }

  if (rangeId === "1D" && out.length >= 2) {
    const bridged = [];
    for (let i = 0; i < out.length; i++) {
      bridged.push(out[i]);
      if (i < out.length - 1) {
        const a = out[i];
        const b = out[i + 1];
        if (a.session !== b.session) {
          const t = (a.t + b.t) / 2;
          const p = (a.price + b.price) / 2;
          bridged.push({
            t,
            label: new Date(t).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
            price: p,
            session: "bridge",
            reg: p,
            ext: p
          });
        }
      }
    }
    out.length = 0;
    out.push(...bridged);
  }

  const last = out[out.length - 1]?.price ?? basePrice;
  return { data: out, previousClose: out[0]?.price ?? last, lastPrice: last };
}

function formatMoney(n, ccy) {
  const value = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: ccy,
    maximumFractionDigits: 2
  }).format(value);
}

function ChartTooltip({ active, payload, ccy }) {
  if (!active || !payload?.length) return null;
  const pt = payload.find((p) => p.dataKey === "price") ?? payload[0];
  const row = pt?.payload;
  const price = row?.price;
  const t = row?.t;
  const timeLabel =
    row?.label ??
    (typeof t === "number"
      ? new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
      : "");
  return (
    <div className="arena-stock-tooltip">
      <p className="arena-stock-tooltip-price">{formatMoney(price, ccy)}</p>
      <p className="arena-stock-tooltip-time muted">{timeLabel}</p>
    </div>
  );
}

export default function StockChartModal({ symbol, name, venue, ccy, currentPrice }) {
  const [range, setRange] = React.useState("1D");
  const [animKey, setAnimKey] = React.useState(0);

  React.useEffect(() => {
    setRange("1D");
  }, [symbol]);

  React.useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [range, symbol]);

  const { data, previousClose, lastPrice } = React.useMemo(
    () => buildMockSeries({ rangeId: range, basePrice: currentPrice, symbol }),
    [range, currentPrice, symbol]
  );

  const positive = lastPrice >= previousClose;
  const stroke = positive ? MINT : CORAL;
  const gradId = `arenaFill-${symbol.replace(/[^a-zA-Z0-9]/g, "")}-${range}-${positive ? "up" : "down"}`;

  return (
    <div className="arena-chart-inline">
      <div className="arena-chart-inline-header">
        <div>
          <p className="arena-chart-inline-symbol">{symbol}</p>
          <p className="arena-chart-inline-name muted">
            {name} · {venue}
          </p>
        </div>
        <p className={`arena-chart-inline-last ${positive ? "up" : "down"}`}>{formatMoney(lastPrice, ccy)}</p>
      </div>

      <div className="arena-chart-range-tabs" role="tablist" aria-label={`${symbol} time range`}>
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={range === r.id}
            className={`arena-chart-range-tab ${range === r.id ? "active" : ""}`}
            onClick={() => setRange(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="arena-chart-panel">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart key={animKey} data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.34} />
                <stop offset="58%" stopColor={stroke} stopOpacity={0.08} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="3 6" />
            <XAxis
              dataKey="t"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fill: "rgba(66,66,66,0.78)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.55)" }}
              tickFormatter={(v) => {
                const d = new Date(v);
                if (range === "1D") return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
                if (range === "5D" || range === "1M") {
                  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                }
                return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
              }}
              minTickGap={32}
            />
            <YAxis
              domain={["auto", "auto"]}
              orientation="right"
              tick={{ fill: "rgba(66,66,66,0.82)", fontSize: 11, fontVariantNumeric: "tabular-nums" }}
              tickFormatter={(v) => v.toFixed(2)}
              width={56}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <Tooltip
              content={<ChartTooltip ccy={ccy} />}
              cursor={{ stroke: "rgba(160, 206, 253, 0.8)", strokeWidth: 1 }}
              animationDuration={0}
            />
            <ReferenceLine
              y={previousClose}
              stroke={PREV_CLOSE}
              strokeDasharray="4 6"
              strokeWidth={1}
              ifOverflow="extendDomain"
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="none"
              fill={`url(#${gradId})`}
              isAnimationActive
              animationDuration={900 + (animKey % 5) * 40}
              animationEasing="ease-out"
            />
            {range === "1D" ? (
              <>
                <Line
                  type="monotone"
                  dataKey="ext"
                  stroke={EXTENDED_STROKE}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: EXTENDED_STROKE, stroke: "#fff", strokeWidth: 1 }}
                  connectNulls
                  isAnimationActive
                  animationDuration={750}
                />
                <Line
                  type="monotone"
                  dataKey="reg"
                  stroke={stroke}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: stroke, stroke: "#fff", strokeWidth: 1 }}
                  connectNulls
                  isAnimationActive
                  animationDuration={750}
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey="price"
                stroke={stroke}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: stroke, stroke: "#fff", strokeWidth: 1 }}
                isAnimationActive
                animationDuration={900 + (animKey % 5) * 40}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        <p className="arena-chart-prev-hint muted">Dashed line: mock previous close</p>
      </div>
    </div>
  );
}
