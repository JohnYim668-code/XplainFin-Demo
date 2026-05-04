import React, { useMemo, useState } from "react";
import NavTabs from "./components/NavTabs";
import Dashboard from "./components/Dashboard";
import Lessons from "./components/Lessons";
import ReelsSection from "./components/ReelsSection";
import ExploreWithPulse from "./components/ExploreWithPulse";
import Arena from "./components/Arena";
import LearningTwinDrawer from "./components/LearningTwinDrawer";
import { learningPathModules } from "./data/learningPathData";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [focusLessonId, setFocusLessonId] = useState(null);
  const [twinOpen, setTwinOpen] = useState(false);
  const [lessonTelemetry, setLessonTelemetry] = useState({
    totalAttempts: 0,
    totalIncorrect: 0,
    byLesson: {}
  });
  const [chatTelemetry, setChatTelemetry] = useState({
    sentimentCounts: { positive: 0, neutral: 0, negative: 0 },
    confidenceCounts: { high: 0, medium: 0, low: 0 },
    recentInputs: []
  });
  const [progress, setProgress] = useState({
    points: 0,
    xp: 0,
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

  const lessonTitleById = useMemo(
    () =>
      new Map(
        learningPathModules.flatMap((module) => module.lessons.map((lesson) => [lesson.id, lesson.title]))
      ),
    []
  );

  const awardXp = (amount) => {
    setProgress((prev) => ({ ...prev, xp: prev.xp + amount }));
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

  const openWeakTopicLesson = () => {
    setFocusLessonId("lesson-green-2");
    setActiveTab("lessons");
  };

  const recordQuestionAttempt = ({ lessonId, correct }) => {
    setLessonTelemetry((prev) => ({
      totalAttempts: prev.totalAttempts + 1,
      totalIncorrect: prev.totalIncorrect + (correct ? 0 : 1),
      byLesson: {
        ...prev.byLesson,
        [lessonId]: {
          attempts: (prev.byLesson[lessonId]?.attempts ?? 0) + 1,
          incorrect: (prev.byLesson[lessonId]?.incorrect ?? 0) + (correct ? 0 : 1)
        }
      }
    }));
  };

  const recordPulseSignal = ({ sentiment, confidence, text }) => {
    setChatTelemetry((prev) => ({
      sentimentCounts: {
        ...prev.sentimentCounts,
        [sentiment]: (prev.sentimentCounts[sentiment] ?? 0) + 1
      },
      confidenceCounts: {
        ...prev.confidenceCounts,
        [confidence]: (prev.confidenceCounts[confidence] ?? 0) + 1
      },
      recentInputs: [...prev.recentInputs, text].slice(-12)
    }));
  };

  const adaptiveUserProfile = useMemo(() => {
    const incorrectRate =
      lessonTelemetry.totalAttempts > 0 ? lessonTelemetry.totalIncorrect / lessonTelemetry.totalAttempts : 0;

    const completedCount = progress.completedLessons.length;
    const completionRatio = totalLessons > 0 ? completedCount / totalLessons : 0;
    const negativeChat = chatTelemetry.sentimentCounts.negative;
    const highConfidenceChat = chatTelemetry.confidenceCounts.high;

    const baseRisk = 6;
    const riskScoreRaw =
      baseRisk +
      highConfidenceChat * 0.35 -
      negativeChat * 0.35 -
      incorrectRate * 4 +
      completionRatio * 2;
    const riskScore = Math.max(1, Math.min(10, Math.round(riskScoreRaw)));
    const riskLabel = riskScore <= 3 ? "Conservative" : riskScore <= 7 ? "Balanced" : "Growth-seeking";

    const weakTopics = Object.entries(lessonTelemetry.byLesson)
      .sort((a, b) => (b[1].incorrect ?? 0) - (a[1].incorrect ?? 0))
      .filter(([, stats]) => (stats.incorrect ?? 0) > 0)
      .slice(0, 3)
      .map(([lessonId]) => lessonTitleById.get(lessonId) ?? lessonId);

    const dailyTaskPerformance =
      completionRatio >= 0.6 && incorrectRate < 0.35
        ? "strong"
        : completionRatio >= 0.3
          ? "steady"
          : "needs support";

    const learningLevel = completionRatio > 0.5 ? "intermediate" : "beginner";
    const dominantSentiment =
      chatTelemetry.sentimentCounts.negative > chatTelemetry.sentimentCounts.positive
        ? "negative"
        : chatTelemetry.sentimentCounts.positive > chatTelemetry.sentimentCounts.negative
          ? "positive"
          : "neutral";
    const confidenceSignal =
      chatTelemetry.confidenceCounts.low > chatTelemetry.confidenceCounts.high
        ? "low"
        : chatTelemetry.confidenceCounts.high > chatTelemetry.confidenceCounts.low
          ? "high"
          : "medium";

    return {
      risk_profile: {
        score: riskScore,
        label: riskLabel
      },
      learning_context: {
        level: learningLevel,
        top_weak_topics: weakTopics.length ? weakTopics : ["ETF Diversification"],
        recent_incorrect_answers: lessonTelemetry.totalIncorrect,
        daily_task_performance: dailyTaskPerformance
      },
      behavioral_signals: {
        chat_sentiment: dominantSentiment,
        confidence_signal: confidenceSignal
      }
    };
  }, [chatTelemetry, lessonTelemetry, lessonTitleById, progress.completedLessons.length, totalLessons]);

  const navigateFromPulseRecommendation = (lessonId) => {
    setFocusLessonId(lessonId);
    setActiveTab("lessons");
  };

  const learningGoals = useMemo(() => {
    const inputs = chatTelemetry.recentInputs.map((x) => x.toLowerCase());
    const goals = [];

    if (inputs.some((x) => x.includes("laptop") || x.includes("save") || x.includes("budget"))) {
      goals.push("Save $500 for a new laptop");
    }
    if (inputs.some((x) => x.includes("option") || x.includes("derivative"))) {
      goals.push("Understand Options before June");
    }
    if (inputs.some((x) => x.includes("etf") || x.includes("diversification"))) {
      goals.push("Build a starter ETF watchlist");
    }
    if (inputs.some((x) => x.includes("risk") || x.includes("volatility"))) {
      goals.push("Set personal risk limits for each trade");
    }

    if (!goals.length) {
      goals.push("Complete 2 new holds this week");
      goals.push("Build confidence in ETF diversification");
    }

    return goals.slice(0, 4);
  }, [chatTelemetry.recentInputs]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-header-row">
          <h1>XplainFin</h1>
          <button type="button" className="twin-open-btn" onClick={() => setTwinOpen(true)}>
            <img src="/assistant-ai-icon.png" alt="Pulse" className="twin-open-icon" />
            Learning Twin
          </button>
        </div>
        <div className="app-header-divider" />
        <p className="app-hero-subtitle">Learn money skills with real market data.</p>
      </header>

      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "dashboard" ? (
        <Dashboard
          progress={progress}
          totalLessons={totalLessons}
          onOpenWeakTopicLesson={openWeakTopicLesson}
          riskProfile={adaptiveUserProfile.risk_profile}
          learningGoals={learningGoals}
        />
      ) : null}

      {activeTab === "lessons" ? (
        <Lessons
          modules={learningPathModules}
          completedLessons={progress.completedLessons}
          onCompleteLesson={completeLesson}
          onAwardXp={awardXp}
          onQuestionAttempt={recordQuestionAttempt}
          focusLessonId={focusLessonId}
          onFocusLessonHandled={() => setFocusLessonId(null)}
        />
      ) : null}

      {activeTab === "explore" ? (
        <ExploreWithPulse
          userProfile={adaptiveUserProfile}
          onProfileSignals={recordPulseSignal}
          onNavigateToLesson={navigateFromPulseRecommendation}
        />
      ) : null}

      {activeTab === "arena" ? <Arena currentUser={{ id: "demo-user-001", name: "You" }} /> : null}

      {activeTab === "reels" ? <ReelsSection /> : null}

      <LearningTwinDrawer isOpen={twinOpen} onClose={() => setTwinOpen(false)} profile={adaptiveUserProfile} />
    </main>
  );
}
