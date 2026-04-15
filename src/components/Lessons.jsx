import React from "react";
import LearningPathView from "./LearningPathView";
import LessonDetailView from "./LessonDetailView";
import LessonCompletedView from "./LessonCompletedView";

export default function Lessons({ modules, completedLessons, onCompleteLesson, onAwardXp }) {
  const [expandedModuleIds, setExpandedModuleIds] = React.useState([modules[0]?.id]);
  const [activeModule, setActiveModule] = React.useState(null);
  const [activeLesson, setActiveLesson] = React.useState(null);
  const [view, setView] = React.useState("path");
  const [lastLessonXp, setLastLessonXp] = React.useState(0);

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

  const handleLessonFinished = (lessonId, xpEarned) => {
    setLastLessonXp(xpEarned);
    onCompleteLesson(lessonId);
    setView("completed");
  };

  if (view === "lesson" && activeLesson && activeModule) {
    return (
      <LessonDetailView
        key={activeLesson.id}
        module={activeModule}
        lesson={activeLesson}
        isReview={completedLessons.includes(activeLesson.id)}
        onBackToPath={() => setView("path")}
        onCompleteLesson={handleLessonFinished}
        onAwardXp={onAwardXp}
      />
    );
  }

  if (view === "completed" && activeLesson) {
    return (
      <LessonCompletedView
        lesson={activeLesson}
        xpEarned={lastLessonXp}
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
