import React, { useMemo, useState } from "react";

export default function QuizChallenges({
  modules,
  quizByLesson,
  onAwardPoints,
  onCompleteLesson
}) {
  const lessons = useMemo(
    () => modules.flatMap((module) => module.lessons),
    [modules]
  );

  const [activeLessonId, setActiveLessonId] = useState(lessons[0]?.id || null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isRoundComplete, setIsRoundComplete] = useState(false);

  const questions = quizByLesson[activeLessonId] || [];
  const currentQuestion = questions[questionIndex];

  const startRound = (lessonId) => {
    setActiveLessonId(lessonId);
    setQuestionIndex(0);
    setRoundScore(0);
    setFeedback("");
    setIsRoundComplete(false);
  };

  const handleAnswer = (choice) => {
    if (!currentQuestion || isRoundComplete) return;

    const isCorrect = choice === currentQuestion.correctAnswer;
    const nextScore = isCorrect ? roundScore + 1 : roundScore;
    setRoundScore(nextScore);

    setFeedback(
      isCorrect
        ? "Correct! +10 points."
        : `Not quite. ${currentQuestion.explanation}`
    );

    onAwardPoints(isCorrect ? 10 : 2);

    const isLastQuestion = questionIndex === questions.length - 1;
    if (isLastQuestion) {
      setIsRoundComplete(true);
      onCompleteLesson(activeLessonId);
      return;
    }

    setTimeout(() => {
      setQuestionIndex((idx) => idx + 1);
      setFeedback("");
    }, 900);
  };

  const activeLessonTitle =
    lessons.find((lesson) => lesson.id === activeLessonId)?.title || "None";

  return (
    <section className="panel">
      <h2>Quiz / Challenges</h2>
      <p className="muted">
        Pick a lesson and complete quiz rounds with instant feedback.
      </p>

      <div className="lesson-pills">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            type="button"
            className={`pill ${activeLessonId === lesson.id ? "active" : ""}`}
            onClick={() => startRound(lesson.id)}
          >
            {lesson.title}
          </button>
        ))}
      </div>

      {questions.length === 0 ? (
        <p>No quiz questions are available for this lesson yet.</p>
      ) : (
        <article className="quiz-card">
          <h3>{activeLessonTitle}</h3>
          {!isRoundComplete ? (
            <>
              <p className="muted">
                Question {questionIndex + 1} of {questions.length}
              </p>
              <h4>{currentQuestion.question}</h4>
              <div className="answer-grid">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h4>
                Round complete! Score: {roundScore}/{questions.length}
              </h4>
              <p className="muted">
                Try again to improve your score and keep your streak alive.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => startRound(activeLessonId)}
              >
                Retry round
              </button>
            </>
          )}

          {feedback ? (
            <p className={`feedback ${feedback.startsWith("Correct") ? "ok" : "warn"}`}>
              {feedback}
            </p>
          ) : null}
        </article>
      )}
    </section>
  );
}
