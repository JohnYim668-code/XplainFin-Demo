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

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        className={`path-node lesson-node ${isCompleted ? "completed" : ""} ${
                          index % 2 ? "offset-right" : "offset-left"
                        }`}
                        onClick={() => onOpenLesson(module, lesson)}
                      >
                        <span className="node-title">{lesson.code}</span>
                        <span className="node-subtitle">{lesson.title}</span>
                        <span className="node-meta">{isCompleted ? "Completed" : "Start lesson"}</span>
                      </button>
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
