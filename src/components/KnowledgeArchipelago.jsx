import React from "react";

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 820;
const ZOOM_MIN = 0.55;
const ZOOM_MAX = 1.35;
const ZOOM_STEP = 0.1;

const ISLANDS = [
  {
    id: "equities",
    label: "Equities & Stocks",
    left: 14,
    top: 18,
    width: 360,
    height: 250,
    blob: "58% 42% 45% 55% / 55% 44% 56% 45%"
  },
  {
    id: "personal",
    label: "Personal Finance",
    left: 52,
    top: 16,
    width: 420,
    height: 280,
    blob: "45% 55% 53% 47% / 52% 40% 60% 48%"
  },
  {
    id: "etfs",
    label: "ETFs & Funds",
    left: 20,
    top: 56,
    width: 420,
    height: 250,
    blob: "52% 48% 60% 40% / 52% 55% 45% 48%"
  },
  {
    id: "crypto",
    label: "Crypto",
    left: 62,
    top: 58,
    width: 320,
    height: 230,
    blob: "60% 40% 52% 48% / 45% 55% 45% 55%"
  },
  {
    id: "derivatives",
    label: "Derivatives",
    left: 76,
    top: 34,
    width: 300,
    height: 210,
    blob: "46% 54% 47% 53% / 55% 46% 54% 45%"
  }
];

function islandForTopic(topic) {
  const t = (topic ?? "").toLowerCase();
  if (t.includes("etf") || t.includes("fund") || t.includes("diversification")) return "etfs";
  if (t.includes("option") || t.includes("derivative") || t.includes("margin") || t.includes("short")) return "derivatives";
  if (t.includes("crypto") || t.includes("bitcoin") || t.includes("eth")) return "crypto";
  if (t.includes("budget") || t.includes("saving") || t.includes("emergency") || t.includes("debt")) return "personal";
  if (t.includes("stock") || t.includes("equity") || t.includes("valuation")) return "equities";
  return "personal";
}

function pickPrimaryTopic(conversation) {
  if (conversation.primaryTopic) return conversation.primaryTopic;
  const detected = conversation.detectedTopics ?? [];
  return detected[0] ?? "Personal Finance";
}

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function KnowledgeArchipelago({ conversations, onOpenConversation }) {
  const viewportRef = React.useRef(null);
  const dragStateRef = React.useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startScrollTop: 0
  });

  const [tooltip, setTooltip] = React.useState(null);
  const [zoom, setZoom] = React.useState(1);

  const fitToView = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const padding = 24;
    const fitX = (viewport.clientWidth - padding) / MAP_WIDTH;
    const fitY = (viewport.clientHeight - padding) / MAP_HEIGHT;
    const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.min(fitX, fitY)));
    setZoom(next);
    // center after fit
    window.requestAnimationFrame(() => {
      viewport.scrollLeft = Math.max(0, (MAP_WIDTH * next - viewport.clientWidth) / 2);
      viewport.scrollTop = Math.max(0, (MAP_HEIGHT * next - viewport.clientHeight) / 2);
    });
  }, []);

  React.useEffect(() => {
    fitToView();
    window.addEventListener("resize", fitToView);
    return () => window.removeEventListener("resize", fitToView);
  }, [fitToView]);

  const grouped = React.useMemo(() => {
    const map = new Map(ISLANDS.map((island) => [island.id, []]));
    conversations.forEach((c, idx) => {
      const topic = pickPrimaryTopic(c);
      const islandId = islandForTopic(topic);
      const list = map.get(islandId) ?? [];
      // deterministically scatter pins from conversation id/index
      const seed = (idx + 1) * 997;
      const px = 16 + (seed % 68); // 16..84
      const py = 20 + ((seed * 3) % 60); // 20..80
      list.push({
        ...c,
        islandId,
        pinX: px,
        pinY: py,
        topic
      });
      map.set(islandId, list);
    });
    return map;
  }, [conversations]);

  const handlePointerDown = (event) => {
    if (event.target instanceof Element && event.target.closest(".arch-pin")) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    dragStateRef.current = {
      dragging: true,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: viewport.scrollLeft,
      startScrollTop: viewport.scrollTop
    };
    viewport.classList.add("dragging");
  };

  const handlePointerMove = (event) => {
    const viewport = viewportRef.current;
    if (!viewport || !dragStateRef.current.dragging) return;
    viewport.scrollLeft = dragStateRef.current.startScrollLeft - (event.clientX - dragStateRef.current.startX);
    viewport.scrollTop = dragStateRef.current.startScrollTop - (event.clientY - dragStateRef.current.startY);
  };

  const endDragging = () => {
    dragStateRef.current.dragging = false;
    viewportRef.current?.classList.remove("dragging");
  };

  const applyZoom = (nextZoom) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      setZoom(nextZoom);
      return;
    }

    const prevZoom = zoom;
    const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
    const centerY = viewport.scrollTop + viewport.clientHeight / 2;
    const ratio = nextZoom / prevZoom;

    setZoom(nextZoom);

    window.requestAnimationFrame(() => {
      viewport.scrollLeft = Math.max(0, centerX * ratio - viewport.clientWidth / 2);
      viewport.scrollTop = Math.max(0, centerY * ratio - viewport.clientHeight / 2);
    });
  };

  return (
    <div className="arch-shell">
      <div className="arch-zoom-controls">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => applyZoom(Math.max(ZOOM_MIN, Number((zoom - ZOOM_STEP).toFixed(2))))}
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="arch-zoom-label">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => applyZoom(Math.min(ZOOM_MAX, Number((zoom + ZOOM_STEP).toFixed(2))))}
          aria-label="Zoom in"
        >
          +
        </button>
        <button type="button" className="btn btn-secondary" onClick={fitToView}>
          Fit
        </button>
      </div>

      <div
        ref={viewportRef}
        className="arch-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDragging}
        onPointerLeave={endDragging}
      >
        <div
          className="arch-canvas"
          style={{
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            transform: `scale(${zoom})`,
            transformOrigin: "0 0"
          }}
        >
          <div className="arch-ocean" aria-hidden="true" />

          {ISLANDS.map((island) => (
            <div
              key={island.id}
              className="arch-island"
              style={{
                left: `${island.left}%`,
                top: `${island.top}%`,
                width: island.width,
                height: island.height,
                borderRadius: island.blob
              }}
            >
              <div className="arch-island-label">{island.label}</div>

              {(grouped.get(island.id) ?? []).map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  className="arch-pin"
                  style={{ left: `${conv.pinX}%`, top: `${conv.pinY}%` }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      id: conv.id,
                      title: conv.title,
                      date: formatDate(conv.createdAt),
                      summary: conv.summary,
                      x: rect.left + rect.width / 2,
                      y: rect.top
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => onOpenConversation?.(conv)}
                >
                  <span className="arch-pin-dot" />
                  <span className="arch-pin-title">{conv.title}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {tooltip ? (
        <div className="arch-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <p className="arch-tooltip-title">{tooltip.title}</p>
          <p className="arch-tooltip-meta muted">{tooltip.date}</p>
          <p className="arch-tooltip-summary">{tooltip.summary}</p>
        </div>
      ) : null}
    </div>
  );
}

