import React, { useMemo, useState } from "react";
import NavTabs from "./components/NavTabs";
import Dashboard from "./components/Dashboard";
import Lessons from "./components/Lessons";
import QuizChallenges from "./components/QuizChallenges";
import { modules, quizByLesson } from "./data/curriculum";
import { learningPathModules } from "./data/learningPathData";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [progress, setProgress] = useState({
    points: 0,
    streak: 1,
    completedLessons: []
  });

  const validLessonIds = useMemo(
    () => new Set(learningPathModules.flatMap((module) => module.lessons.map((lesson) => lesson.id))),
    []
  );

  const totalLessons = useMemo(
    () => learningPathModules.reduce((count, module) => count + module.lessons.length, 0),
    []
  );

  const awardPoints = (points) => {
    setProgress((prev) => ({ ...prev, points: prev.points + points }));
  };

  const completeLesson = (lessonId) => {
    setProgress((prev) => {
      if (!validLessonIds.has(lessonId)) return prev;

      // Avoid duplicate completion events when users replay rounds.
      if (prev.completedLessons.includes(lessonId)) return prev;

      return {
        ...prev,
        streak: prev.streak + 1,
        completedLessons: [...prev.completedLessons, lessonId]
      };
    });
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>XplainFin</h1>
        <p>Learn investing through short lessons and game-like challenges.</p>
      </header>

      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "dashboard" ? (
        <Dashboard progress={progress} totalLessons={totalLessons} />
      ) : null}

      {activeTab === "lessons" ? (
        <Lessons
          modules={learningPathModules}
          completedLessons={progress.completedLessons}
          onCompleteLesson={completeLesson}
          onAwardPoints={awardPoints}
        />
      ) : null}

      {activeTab === "quiz" ? (
        <QuizChallenges
          modules={modules}
          quizByLesson={quizByLesson}
          onAwardPoints={awardPoints}
          onCompleteLesson={completeLesson}
        />
      ) : null}
    </main>
  );
}
