import React from "react";

const ROUTE_META = {
  yellow: {
    id: "yellow",
    label: "Yellow Route",
    level: "Beginner · V1",
    color: "#d8c57a"
  },
  green: {
    id: "green",
    label: "Green Route",
    level: "Intermediate · V3",
    color: "#89b89a"
  },
  red: {
    id: "red",
    label: "Red Route",
    level: "Advanced · V5",
    color: "#b87884"
  }
};

const WALL_WIDTH = 1100;
const WALL_HEIGHT = 980;

export default function LearningPathView({
  modules,
  onOpenLesson,
  completedLessons
}) {
  const [routeFilter, setRouteFilter] = React.useState("all");
  const viewportRef = React.useRef(null);
  const dragStateRef = React.useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startScrollTop: 0
  });

  const flatNodes = React.useMemo(
    () =>
      modules.flatMap((module) =>
        module.lessons.map((lesson) => ({
          ...lesson,
          moduleId: module.id,
          moduleCode: module.code,
          moduleTitle: module.title
        }))
      ),
    [modules]
  );

  const moduleById = React.useMemo(
    () => new Map(modules.map((module) => [module.id, module])),
    [modules]
  );

  const nodeById = React.useMemo(
    () => new Map(flatNodes.map((node) => [node.id, node])),
    [flatNodes]
  );

  const isUnlocked = React.useCallback(
    (node) => (node.prerequisites ?? []).every((id) => completedLessons.includes(id)),
    [completedLessons]
  );

  const routeCounts = React.useMemo(() => {
    const counts = {
      yellow: 0,
      green: 0,
      red: 0
    };
    flatNodes.forEach((node) => {
      if (counts[node.route] !== undefined) {
        counts[node.route] += 1;
      }
    });
    return counts;
  }, [flatNodes]);

  const connectorLines = React.useMemo(() => {
    const lines = [];
    flatNodes.forEach((node) => {
      (node.prerequisites ?? []).forEach((prereqId) => {
        const prereqNode = nodeById.get(prereqId);
        if (!prereqNode) return;
        lines.push({
          id: `${prereqId}->${node.id}`,
          from: prereqNode,
          to: node
        });
      });
    });
    return lines;
  }, [flatNodes, nodeById]);

  const handlePointerDown = (event) => {
    if (event.target instanceof Element && event.target.closest(".climb-hold")) return;
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

    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;
    viewport.scrollLeft = dragStateRef.current.startScrollLeft - deltaX;
    viewport.scrollTop = dragStateRef.current.startScrollTop - deltaY;
  };

  const endDragging = () => {
    const viewport = viewportRef.current;
    dragStateRef.current.dragging = false;
    viewport?.classList.remove("dragging");
  };

  return (
    <section className="panel">
      <h2>Lesson Map</h2>
      <p className="muted">
        Climb with Pulse. Stick to one route or branch sideways to tougher holds once prerequisites are met.
      </p>

      <div className="wall-toolbar">
        <div className="route-filter-list">
          <button
            type="button"
            className={`pill ${routeFilter === "all" ? "active" : ""}`}
            onClick={() => setRouteFilter("all")}
          >
            All routes ({flatNodes.length})
          </button>
          {Object.values(ROUTE_META).map((route) => (
            <button
              key={route.id}
              type="button"
              className={`pill ${routeFilter === route.id ? "active" : ""}`}
              onClick={() => setRouteFilter(route.id)}
            >
              <span className="route-dot" style={{ backgroundColor: route.color }} /> {route.label} (
              {routeCounts[route.id]})
            </button>
          ))}
        </div>
        <p className="pulse-guide muted">
          <img src="/assistant-ai-icon.png" alt="Pulse" className="pulse-guide-icon" />
          <span className="pulse-guide-label">Pulse:</span>
          Gray holds are locked. Complete required holds to unlock side jumps into higher difficulty routes.
        </p>
      </div>

      <div
        ref={viewportRef}
        className="climb-wall-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDragging}
        onPointerLeave={endDragging}
      >
        <div className="climb-wall-canvas" style={{ width: WALL_WIDTH, height: WALL_HEIGHT }}>
          <svg className="climb-wall-lines" viewBox={`0 0 ${WALL_WIDTH} ${WALL_HEIGHT}`} aria-hidden="true">
            {connectorLines.map((line) => {
              const fromX = (line.from.wallPosition.x / 100) * WALL_WIDTH;
              const fromY = (line.from.wallPosition.y / 100) * WALL_HEIGHT;
              const toX = (line.to.wallPosition.x / 100) * WALL_WIDTH;
              const toY = (line.to.wallPosition.y / 100) * WALL_HEIGHT;
              const routeColor = ROUTE_META[line.to.route]?.color ?? "#a0cefd";
              const filteredOut = routeFilter !== "all" && line.to.route !== routeFilter && line.from.route !== routeFilter;
              const unlocked = completedLessons.includes(line.from.id);
              return (
                <line
                  key={line.id}
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke={routeColor}
                  strokeOpacity={filteredOut ? 0.18 : unlocked ? 0.68 : 0.35}
                  strokeWidth="3.5"
                  strokeDasharray={unlocked ? "0" : "7 7"}
                />
              );
            })}
          </svg>

          {flatNodes.map((node) => {
            const module = moduleById.get(node.moduleId);
            if (!module) return null;
            const routeMeta = ROUTE_META[node.route] ?? ROUTE_META.yellow;
            const completed = completedLessons.includes(node.id);
            const unlocked = isUnlocked(node);
            const filteredOut = routeFilter !== "all" && node.route !== routeFilter;
            const lockReason =
              !unlocked && (node.prerequisites ?? []).length
                ? `Requires: ${(node.prerequisites ?? [])
                    .map((id) => nodeById.get(id)?.code ?? id)
                    .join(", ")}`
                : "";

            return (
              <button
                key={node.id}
                type="button"
                className={`climb-hold ${completed ? "completed" : ""} ${!unlocked ? "locked" : ""} ${
                  filteredOut ? "filtered" : ""
                }`}
                style={{
                  left: `${node.wallPosition.x}%`,
                  top: `${node.wallPosition.y}%`,
                  "--route-color": routeMeta.color
                }}
                disabled={!unlocked}
                title={lockReason || `Open ${node.code}`}
                onClick={() => onOpenLesson(module, node)}
              >
                <span className="climb-hold-code">{node.code}</span>
                <span className="climb-hold-title">{node.title}</span>
                <span className="climb-hold-meta">
                  {completed ? "Cleared" : unlocked ? "Climb hold" : "Locked"}
                </span>
                <span className="climb-hold-route">{routeMeta.label}</span>
                <img src="/assistant-ai-icon.png" alt="Pulse mascot" className="pulse-hover-logo" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
