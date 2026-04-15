import React from "react";

export default function LearningPathView({
  modules,
  expandedModuleIds,
  onToggleModule,
  onOpenLesson,
  completedLessons
}) {
  return (
    <section className="panel">
      <h2>Learning Path</h2>
      <p className="muted">
        Click a module to expand its lessons, then open a lesson to start.
      </p>

      <div className="path-layout">
        {modules.map((module) => {
          const isExpanded = expandedModuleIds.includes(module.id);

          return (
            <div key={module.id} className="path-module-block">
              <button
                type="button"
                className={`path-node module-node ${isExpanded ? "expanded" : ""}`}
                onClick={() => onToggleModule(module.id)}
              >
                <span className="node-title">{module.code}</span>
                <span className="node-subtitle">{module.title}</span>
              </button>

              <p className="module-description muted">{module.description}</p>

              {isExpanded ? (
                <div className="lesson-node-list">
                  {module.lessons.map((lesson, index) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isLast = index === module.lessons.length - 1;
                    const pathDirection = index % 2 ? "right" : "left";

                    return (
                      <div
                        key={lesson.id}
                        className={`lesson-path-step ${pathDirection} ${isCompleted ? "done" : ""}`}
                      >
                        <button
                          type="button"
                          className={`path-node lesson-node ${isCompleted ? "completed" : ""} ${
                            index % 2 ? "offset-right" : "offset-left"
                          }`}
                          onClick={() => onOpenLesson(module, lesson)}
                        >
                          <span className="node-title">{lesson.code}</span>
                          <span className="node-subtitle">{lesson.title}</span>
                          <span className="node-meta">{isCompleted ? "Completed" : "Start lesson"}</span>
                          <span className="lesson-reward-pill">{isCompleted ? "XP earned" : "Reward: XP"}</span>
                        </button>
                        {!isLast ? (
                          <div className={`lesson-connector ${index % 2 ? "curve-left" : "curve-right"}`}>
                            <span className="connector-dot" />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
