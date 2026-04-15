import React from "react";

export default function LessonCompletedView({ lesson, xpEarned = 0, onBackToPath, onRetryLesson }) {
  return (
    <section className="panel completion-panel">
      <p className="completion-kicker">Lesson completed!</p>
      <h2>{lesson.title}</h2>
      <p className="muted">
        Nice work. You have finished this lesson and earned progress toward your module goals.
      </p>

      <div className="completion-stats">
        <div>
          <p className="muted">XP earned</p>
          <p className="metric">+{xpEarned}</p>
        </div>
        <div>
          <p className="muted">Questions</p>
          <p className="metric">Done</p>
        </div>
      </div>

      <div className="completion-actions">
        <button type="button" className="btn btn-primary" onClick={onBackToPath}>
          Continue path
        </button>
        <button type="button" className="btn btn-secondary" onClick={onRetryLesson}>
          Review lesson
        </button>
      </div>
    </section>
  );
}
