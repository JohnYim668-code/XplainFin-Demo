import React from "react";

export default function LessonDetailView({ module, lesson, onBackToPath, onCompleteLesson }) {
  const { multipleChoice, trueFalse, openEnded } = lesson.questions;

  return (
    <section className="panel">
      <button type="button" className="btn btn-secondary" onClick={onBackToPath}>
        Back to path
      </button>

      <header className="lesson-detail-header">
        <p className="muted">
          {module.code} - {module.title}
        </p>
        <h2>
          {lesson.code} - {lesson.title}
        </h2>
        <p>{lesson.summary}</p>
      </header>

      <article className="question-section">
        <h3>Multiple Choice</h3>
        {multipleChoice.map((question) => (
          <div key={question.id} className="question-card">
            <p className="question-title">{question.prompt}</p>
            <ul className="option-list">
              {question.options.map((option, index) => (
                <li key={option} className={option === question.correctAnswer ? "correct-option" : ""}>
                  <span className="option-key">{String.fromCharCode(97 + index)})</span> {option}
                </li>
              ))}
            </ul>
            <p className="answer-hint muted">
              Demo answer key: <strong>{question.correctAnswer}</strong>
            </p>
          </div>
        ))}
      </article>

      <article className="question-section">
        <h3>True / False</h3>
        {trueFalse.map((question) => (
          <div key={question.id} className="question-card">
            <p className="question-title">{question.prompt}</p>
            <p className="answer-hint muted">
              Demo answer key: <strong>{question.answer ? "True" : "False"}</strong>
            </p>
          </div>
        ))}
      </article>

      <article className="question-section">
        <h3>Open-Ended</h3>
        <div className="question-card">
          <p className="question-title">{openEnded.prompt}</p>
          <textarea
            className="open-ended-input"
            rows={5}
            defaultValue={openEnded.defaultAnswer}
            aria-label="Open-ended response"
          />
          <p className="muted">This response is prefilled for demo purposes.</p>
        </div>
      </article>

      <button type="button" className="btn btn-primary lesson-complete-btn" onClick={onCompleteLesson}>
        Complete lesson
      </button>
    </section>
  );
}
