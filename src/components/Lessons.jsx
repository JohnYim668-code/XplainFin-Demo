import React from "react";
import LearningPathView from "./LearningPathView";
import LessonDetailView from "./LessonDetailView";
import LessonCompletedView from "./LessonCompletedView";

export default function Lessons({
  modules,
  completedLessons,
  onCompleteLesson,
  onAwardXp,
  onQuestionAttempt,
  focusLessonId,
  onFocusLessonHandled
}) {
  const [activeModule, setActiveModule] = React.useState(null);
  const [activeLesson, setActiveLesson] = React.useState(null);
  const [view, setView] = React.useState("path");
  const [lastLessonXp, setLastLessonXp] = React.useState(0);

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

  React.useEffect(() => {
    if (!focusLessonId) return;

    for (const module of modules) {
      const lesson = module.lessons.find((item) => item.id === focusLessonId);
      if (!lesson) continue;
      setActiveModule(module);
      setActiveLesson(lesson);
      setView("lesson");
      onFocusLessonHandled?.();
      return;
    }
  }, [focusLessonId, modules, onFocusLessonHandled]);

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
        onQuestionAttempt={onQuestionAttempt}
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
      onOpenLesson={handleOpenLesson}
      completedLessons={completedLessons}
    />
  );
}
