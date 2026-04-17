import React from "react";

function describeRiskLevel(score) {
  if (score <= 3) return "Conservative";
  if (score <= 7) return "Balanced";
  return "Growth-seeking";
}

export default function Dashboard({
  progress,
  totalLessons,
  onOpenWeakTopicLesson,
  riskProfile,
  learningGoals = []
}) {
  const completedCount = progress.completedLessons.length;
  const completionRate = Math.round((completedCount / totalLessons) * 100);
  const riskAppetiteScore = riskProfile?.score ?? 5;
  const riskLevel = describeRiskLevel(riskAppetiteScore);

  // Basic gamification badges based on milestones.
  const badges = [
    completedCount >= 1 ? "First Lesson" : null,
    completedCount >= 3 ? "Momentum Builder" : null,
    completedCount >= 6 ? "Curriculum Finisher" : null,
    progress.streak >= 3 ? "3-Day Streak" : null
  ].filter(Boolean);

  return (
    <section className="panel">
      <h2>Dashboard</h2>
      <p className="muted">
        Track your growth as you move through investment concepts.
      </p>

      <div className="card-grid">
        <article className="card">
          <h3>Points</h3>
          <p className="metric">{progress.points}</p>
          <p className="card-hint muted">From quiz challenges</p>
        </article>
        <article className="card">
          <h3>Lesson XP</h3>
          <p className="metric">{progress.xp ?? 0}</p>
          <p className="card-hint muted">From lesson questions</p>
        </article>
        <article className="card">
          <h3>Streak</h3>
          <p className="metric">{progress.streak} days</p>
        </article>
        <article className="card">
          <h3>Completed Lessons</h3>
          <p className="metric">
            {completedCount} / {totalLessons}
          </p>
        </article>
        <article className="card">
          <h3>Progress</h3>
          <p className="metric">{completionRate}%</p>
        </article>
        <article className="card">
          <h3>Top Weak Topic</h3>
          <p className="metric">ETF Diversification</p>
          <button type="button" className="btn btn-primary" onClick={onOpenWeakTopicLesson}>
            Review lesson
          </button>
        </article>
      </div>

      <div className="progress-wrap" aria-label="Completion progress">
        <div className="progress-bar" style={{ width: `${completionRate}%` }} />
      </div>

      <div className="badge-area">
        <h3>Badges</h3>
        {badges.length ? (
          <ul className="badge-list">
            {badges.map((badge) => (
              <li key={badge} className="badge">
                {badge}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Complete lessons and quizzes to unlock badges.</p>
        )}
      </div>

      <div className="dashboard-profile-panel">
        <article className="card dashboard-risk-card">
          <h3>Risk Appetite Score</h3>
          <p className="metric">{riskAppetiteScore} / 10</p>
          <p className="card-hint muted">{riskLevel}</p>
        </article>
        <article className="card dashboard-goals-card">
          <h3>Learning Goals</h3>
          <ul className="dashboard-goal-list">
            {learningGoals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
