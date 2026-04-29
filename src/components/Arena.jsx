import React from "react";
import StockChartModal, { buildMockSeries, CORAL, MINT } from "./StockChartModal";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function formatMoney(n, ccy = "USD") {
  const value = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: ccy,
    maximumFractionDigits: 2
  }).format(value);
}

function percent(n) {
  const v = Number.isFinite(n) ? n : 0;
  const sign = v > 0 ? "+" : "";
  return `${sign}${(v * 100).toFixed(2)}%`;
}

function sparkPath(values, w, h, pad = 8) {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = (w - pad * 2) / Math.max(1, values.length - 1);
  return values
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + (1 - (v - min) / span) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function ChevronIcon({ expanded }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`arena-chevron ${expanded ? "expanded" : ""}`}
      aria-hidden="true"
    >
      <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const MOCK_ASSETS = [
  { symbol: "0700.HK", name: "Tencent", venue: "HKEX", ccy: "HKD", price: 320.4 },
  { symbol: "3690.HK", name: "Meituan", venue: "HKEX", ccy: "HKD", price: 112.9 },
  { symbol: "000001.SZ", name: "Ping An Bank", venue: "Shenzhen Connect", ccy: "CNY", price: 12.41 },
  { symbol: "AAPL", name: "Apple", venue: "US", ccy: "USD", price: 214.15 },
  { symbol: "TSLA", name: "Tesla", venue: "US", ccy: "USD", price: 182.33 }
];

const FX_TO_USD = {
  USD: 1,
  HKD: 0.128,
  CNY: 0.138
};

function randomWalkPrice(prev) {
  const drift = 0;
  const vol = 0.012;
  const shock = (Math.random() - 0.5) * 2 * vol;
  const next = prev * (1 + drift + shock);
  return Math.max(0.01, next);
}

function riskBadge(label) {
  if (label === "Buy") return "arena-badge buy";
  if (label === "Sell") return "arena-badge sell";
  return "arena-badge";
}

function LogoBadge({ name, symbol }) {
  const seed = `${symbol}-${name}`.length;
  const hue = (seed * 47) % 360;
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span
      className="arena-logo"
      style={{
        background: `linear-gradient(135deg, hsla(${hue}, 90%, 70%, 0.9), hsla(${(hue + 40) % 360}, 90%, 62%, 0.9))`
      }}
      aria-hidden="true"
    >
      {initials || "•"}
    </span>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="arena-prize-icon" aria-hidden="true">
      <path
        d="M4 9l4 4 4-7 4 7 4-4v10H4V9z"
        fill="currentColor"
        opacity="0.95"
      />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="arena-prize-icon" aria-hidden="true">
      <path
        d="M12 2c2 4-1 6 2 9 2 2 4 4 4 7a6 6 0 1 1-12 0c0-4 3-6 6-9 2-2 0-4 0-7z"
        fill="currentColor"
      />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="arena-prize-icon" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="8" ry="8" fill="currentColor" opacity="0.92" />
      <path d="M9 12h6" stroke="#000" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M12 9v6" stroke="#000" strokeOpacity="0.25" strokeWidth="2" />
    </svg>
  );
}

export default function Arena({ currentUser }) {
  const [prices, setPrices] = React.useState(() =>
    MOCK_ASSETS.reduce((acc, a) => {
      acc[a.symbol] = { price: a.price, prev: a.price, dir: "flat", flashAt: 0, ccy: a.ccy, name: a.name, venue: a.venue };
      return acc;
    }, {})
  );

  const [portfolio, setPortfolio] = React.useState(() => ({
    cashUsd: 10000,
    holdings: {
      "0700.HK": 6,
      AAPL: 8,
      TSLA: 0,
      "000001.SZ": 200,
      "3690.HK": 0
    }
  }));

  const startingEquityRef = React.useRef(0);
  const [equitySeries, setEquitySeries] = React.useState(() => Array.from({ length: 30 }, () => 10000));

  const [expandedSymbol, setExpandedSymbol] = React.useState(MOCK_ASSETS[0].symbol);

  const [tradeOpen, setTradeOpen] = React.useState(false);
  const [tradeSymbol, setTradeSymbol] = React.useState(MOCK_ASSETS[0].symbol);
  const [tradeSide, setTradeSide] = React.useState("buy");
  const [tradeQty, setTradeQty] = React.useState(1);
  const [tradeError, setTradeError] = React.useState("");

  const totalValueUsd = React.useMemo(() => {
    const holdingsUsd = Object.entries(portfolio.holdings).reduce((sum, [sym, qty]) => {
      const p = prices[sym]?.price ?? 0;
      const ccy = prices[sym]?.ccy ?? "USD";
      return sum + qty * p * (FX_TO_USD[ccy] ?? 1);
    }, 0);
    return portfolio.cashUsd + holdingsUsd;
  }, [portfolio.cashUsd, portfolio.holdings, prices]);

  React.useEffect(() => {
    if (startingEquityRef.current === 0) {
      startingEquityRef.current = totalValueUsd;
      setEquitySeries((prev) => prev.map(() => totalValueUsd));
    }
  }, [totalValueUsd]);

  const monthlyReturn = React.useMemo(() => {
    const start = startingEquityRef.current || totalValueUsd;
    return start > 0 ? totalValueUsd / start - 1 : 0;
  }, [totalValueUsd]);

  React.useEffect(() => {
    const t = window.setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        for (const sym of Object.keys(next)) {
          const cur = next[sym].price;
          const nxt = randomWalkPrice(cur);
          const dir = nxt > cur ? "up" : nxt < cur ? "down" : "flat";
          next[sym] = {
            ...next[sym],
            prev: cur,
            price: nxt,
            dir,
            flashAt: Date.now()
          };
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  React.useEffect(() => {
    const t = window.setInterval(() => {
      setEquitySeries((prev) => {
        const next = [...prev.slice(1), totalValueUsd];
        return next;
      });
    }, 1500);
    return () => window.clearInterval(t);
  }, [totalValueUsd]);

  const openTrade = (symbol) => {
    setTradeSymbol(symbol);
    setTradeSide("buy");
    setTradeQty(1);
    setTradeError("");
    setTradeOpen(true);
  };

  const closeTrade = () => {
    setTradeOpen(false);
    setTradeError("");
  };

  const toggleExpanded = (symbol) => {
    setExpandedSymbol((prev) => (prev === symbol ? null : symbol));
  };

  const estCostUsd = React.useMemo(() => {
    const p = prices[tradeSymbol]?.price ?? 0;
    const ccy = prices[tradeSymbol]?.ccy ?? "USD";
    const usd = p * (FX_TO_USD[ccy] ?? 1);
    return usd * Math.max(0, Number(tradeQty) || 0);
  }, [prices, tradeQty, tradeSymbol]);

  const availableShares = portfolio.holdings[tradeSymbol] ?? 0;

  const submitTrade = () => {
    const qty = Math.floor(Number(tradeQty) || 0);
    if (qty <= 0) {
      setTradeError("Enter a valid share quantity.");
      return;
    }

    if (tradeSide === "buy" && estCostUsd > portfolio.cashUsd + 1e-6) {
      setTradeError("Not enough buying power.");
      return;
    }

    if (tradeSide === "sell" && qty > availableShares) {
      setTradeError("Not enough shares to sell.");
      return;
    }

    setPortfolio((prev) => {
      const nextHoldings = { ...prev.holdings };
      const curQty = nextHoldings[tradeSymbol] ?? 0;
      nextHoldings[tradeSymbol] = tradeSide === "buy" ? curQty + qty : curQty - qty;
      const cashDelta = tradeSide === "buy" ? -estCostUsd : estCostUsd;
      return { ...prev, cashUsd: prev.cashUsd + cashDelta, holdings: nextHoldings };
    });

    closeTrade();
  };

  const leaderboard = React.useMemo(() => {
    const others = [
      { id: "u-1", name: "Kai", ret: 0.123 },
      { id: "u-2", name: "Mina", ret: 0.104 },
      { id: "u-3", name: "Jules", ret: 0.082 },
      { id: "u-4", name: "Noah", ret: 0.061 },
      { id: "u-5", name: "Sora", ret: 0.044 }
    ];
    const me = { id: currentUser?.id ?? "me", name: currentUser?.name ?? "You", ret: monthlyReturn };
    const all = [...others, me].sort((a, b) => b.ret - a.ret);
    const rank = all.findIndex((x) => x.id === me.id) + 1;
    return { list: all, myRank: rank };
  }, [currentUser?.id, currentUser?.name, monthlyReturn]);

  const chartW = 360;
  const chartH = 120;
  const chartPath = React.useMemo(() => sparkPath(equitySeries, chartW, chartH), [equitySeries]);
  const chartUp = equitySeries.length >= 2 ? equitySeries[equitySeries.length - 1] >= equitySeries[0] : true;

  return (
    <section className="arena-shell">
      <div className="arena-main panel">
        <div className="arena-header">
          <div>
            <h2>Arena</h2>
            <p className="muted">Monthly virtual competitions · paper trading with mock live data</p>
          </div>
        </div>

        <div className="arena-metrics">
          <article className="arena-metric-card">
            <p className="arena-metric-label muted">Total Value</p>
            <p className="arena-metric-value">{formatMoney(totalValueUsd, "USD")}</p>
            <p className={`arena-metric-sub ${monthlyReturn >= 0 ? "up" : "down"}`}>1‑month: {percent(monthlyReturn)}</p>
          </article>
          <article className="arena-metric-card">
            <p className="arena-metric-label muted">Buying Power</p>
            <p className="arena-metric-value">{formatMoney(portfolio.cashUsd, "USD")}</p>
            <p className="arena-metric-sub muted">Instant fills · no fees (demo)</p>
          </article>
          <article className="arena-metric-card arena-chart-card">
            <p className="arena-metric-label muted">1‑month P&L</p>
            <svg width={chartW} height={chartH} className="arena-spark">
              <path d={chartPath} fill="none" stroke={chartUp ? MINT : CORAL} strokeWidth="3" />
            </svg>
          </article>
        </div>

        <div className="arena-holdings-header">
          <h3>Holdings</h3>
          <p className="muted">HKEX · Shenzhen Connect · US stocks (mock)</p>
        </div>

        <div className="arena-holdings-list" role="list">
          {MOCK_ASSETS.map((a) => {
            const px = prices[a.symbol]?.price ?? a.price;
            const prev = prices[a.symbol]?.prev ?? px;
            const dir = prices[a.symbol]?.dir ?? "flat";
            const shares = portfolio.holdings[a.symbol] ?? 0;
            const delta = px - prev;
            const deltaPct = prev > 0 ? delta / prev : 0;
            const valueUsd = shares * px * (FX_TO_USD[a.ccy] ?? 1);
            const isExpanded = expandedSymbol === a.symbol;
            const sparkSeries = buildMockSeries({ rangeId: "1D", basePrice: px, symbol: a.symbol }).data;
            const sparkValues = sparkSeries.map((point) => point.price);
            const sparkUp =
              sparkValues.length >= 2 ? sparkValues[sparkValues.length - 1] >= sparkValues[0] : true;
            const sparkW = 136;
            const sparkH = 42;
            const spark = sparkPath(sparkValues, sparkW, sparkH, 4);

            return (
              <div
                key={a.symbol}
                className={`arena-holding-row arena-holding-row-interactive ${isExpanded ? "expanded" : ""}`}
                role="listitem"
              >
                <div
                  className="arena-holding-toggle"
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onClick={() => toggleExpanded(a.symbol)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleExpanded(a.symbol);
                    }
                  }}
                >
                  <div className="arena-holding-left">
                    <LogoBadge name={a.name} symbol={a.symbol} />
                    <div className="arena-holding-meta">
                      <div className="arena-holding-topline">
                        <span className="arena-symbol-code">{a.symbol}</span>
                        <span className="arena-venue muted">{a.venue}</span>
                      </div>
                      <div className="arena-holding-name muted">{a.name}</div>
                      <div className="arena-shares muted">{shares} sh owned</div>
                    </div>
                  </div>

                  <div className="arena-holding-spark-wrap" aria-hidden="true">
                    <svg width={sparkW} height={sparkH} className="arena-holding-spark">
                      <path
                        d={spark}
                        fill="none"
                        stroke={sparkUp ? MINT : CORAL}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div className="arena-holding-right">
                    <div className="arena-holding-price">
                      <span className={`arena-price ${dir}`}>{px.toFixed(2)} {a.ccy}</span>
                      <span className={`arena-delta ${dir}`}>
                        {dir === "flat" ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)} (${percent(deltaPct)})`}
                      </span>
                    </div>
                    <div className="arena-holding-bottomline">
                      <span className="arena-value">{formatMoney(valueUsd, "USD")}</span>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTrade(a.symbol);
                        }}
                      >
                        Trade
                      </button>
                      <ChevronIcon expanded={isExpanded} />
                    </div>
                  </div>
                </div>

                <div className={`arena-holding-expand ${isExpanded ? "expanded" : ""}`}>
                  <div className="arena-holding-expand-inner">
                    {isExpanded ? (
                      <StockChartModal
                        symbol={a.symbol}
                        name={a.name}
                        venue={a.venue}
                        ccy={a.ccy}
                        currentPrice={px}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {tradeOpen ? (
          <div className="arena-modal-backdrop" role="presentation" onClick={closeTrade}>
            <div className="arena-modal" role="dialog" aria-label="Trade" onClick={(e) => e.stopPropagation()}>
              <div className="arena-modal-header">
                <div>
                  <p className="arena-modal-title">Trade {tradeSymbol}</p>
                  <p className="muted arena-modal-sub">
                    Buying power: <strong>{formatMoney(portfolio.cashUsd, "USD")}</strong>
                  </p>
                </div>
                <button type="button" className="btn btn-secondary" onClick={closeTrade}>
                  Close
                </button>
              </div>

              <div className="arena-modal-grid">
                <label className="arena-field">
                  <span className="muted">Side</span>
                  <div className="arena-side-tabs">
                    <button
                      type="button"
                      className={`arena-side-tab ${tradeSide === "buy" ? "active" : ""}`}
                      onClick={() => setTradeSide("buy")}
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      className={`arena-side-tab ${tradeSide === "sell" ? "active" : ""}`}
                      onClick={() => setTradeSide("sell")}
                    >
                      Sell
                    </button>
                  </div>
                </label>

                <label className="arena-field">
                  <span className="muted">Shares</span>
                  <input
                    className="arena-input"
                    type="number"
                    min="1"
                    step="1"
                    value={tradeQty}
                    onChange={(e) => setTradeQty(clamp(Number(e.target.value || 1), 1, 100000))}
                  />
                  <span className="muted arena-field-hint">You have {availableShares} shares</span>
                </label>

                <div className="arena-est">
                  <p className="muted">Estimated {tradeSide === "buy" ? "cost" : "proceeds"}</p>
                  <p className="arena-est-value">{formatMoney(estCostUsd, "USD")}</p>
                  <p className="muted">At current mock price</p>
                </div>
              </div>

              {tradeError ? <p className="arena-error">{tradeError}</p> : null}

              <div className="arena-modal-actions">
                <span className={riskBadge(tradeSide === "buy" ? "Buy" : "Sell")}>{tradeSide.toUpperCase()}</span>
                <button type="button" className="btn btn-primary" onClick={submitTrade}>
                  Place order
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="arena-side panel">
        <h3>Monthly Leaderboard</h3>
        <p className="muted">Ranked by 1‑month return</p>

        <ol className="arena-leaderboard">
          {leaderboard.list.map((row, idx) => {
            const isMe = row.id === (currentUser?.id ?? "me");
            return (
              <li key={row.id} className={`arena-leader-row ${isMe ? "me" : ""}`}>
                <span className="arena-rank">#{idx + 1}</span>
                <span className="arena-name">{row.name}</span>
                <span className={`arena-ret ${row.ret >= 0 ? "up" : "down"}`}>{percent(row.ret)}</span>
              </li>
            );
          })}
        </ol>

        <div className="arena-me-rank">
          <p className="muted">Your rank</p>
          <p className="arena-me-rank-value">#{leaderboard.myRank}</p>
        </div>

        <div className="arena-prizes">
          <h4>Prizes & Recognition</h4>
          <div className="arena-prize-card top1">
            <div className="arena-prize-medal gold">
              <CrownIcon />
            </div>
            <p className="arena-prize-text">Pulse Crown · Featured champion badge</p>
          </div>
          <div className="arena-prize-card">
            <div className="arena-prize-medal silver">
              <FlameIcon />
            </div>
            <p className="arena-prize-text">Silver streak badge · Profile highlight</p>
          </div>
          <div className="arena-prize-card">
            <div className="arena-prize-medal bronze">
              <CoinIcon />
            </div>
            <p className="arena-prize-text">Bronze badge · Shoutout on the island map</p>
          </div>
        </div>
      </aside>
    </section>
  );
}

