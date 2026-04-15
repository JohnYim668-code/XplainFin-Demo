import React from "react";
import LearningPathView from "./LearningPathView";
import LessonDetailView from "./LessonDetailView";
import LessonCompletedView from "./LessonCompletedView";

export default function Lessons({ modules, completedLessons, onCompleteLesson, onAwardPoints }) {
  const [expandedModuleIds, setExpandedModuleIds] = React.useState([modules[0]?.id]);
  const [activeModule, setActiveModule] = React.useState(null);
  const [activeLesson, setActiveLesson] = React.useState(null);
  const [view, setView] = React.useState("path");

  const handleToggleModule = (moduleId) => {
    setExpandedModuleIds((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleOpenLesson = (module, lesson) => {
    setActiveModule(module);
    setActiveLesson(lesson);
    setView("lesson");
  };

  const handleCompleteLesson = () => {
    if (!activeLesson) return;
    onCompleteLesson(activeLesson.id);
    onAwardPoints(20);
    setView("completed");
  };

  if (view === "lesson" && activeLesson && activeModule) {
    return (
      <LessonDetailView
        module={activeModule}
        lesson={activeLesson}
        onBackToPath={() => setView("path")}
        onCompleteLesson={handleCompleteLesson}
      />
    );
  }

  if (view === "completed" && activeLesson) {
    return (
      <LessonCompletedView
        lesson={activeLesson}
        onBackToPath={() => setView("path")}
        onRetryLesson={() => setView("lesson")}
      />
    );
  }

  return (
    <LearningPathView
      modules={modules}
      expandedModuleIds={expandedModuleIds}
      onToggleModule={handleToggleModule}
      onOpenLesson={handleOpenLesson}
      completedLessons={completedLessons}
    />
  );
}
