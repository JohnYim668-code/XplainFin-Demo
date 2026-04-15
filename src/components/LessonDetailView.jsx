import React, { useCallback, useMemo, useRef, useState } from "react";
import AskAiPanel from "./AskAiPanel";
import { buildLessonSteps, formatXpValue, xpForStepKind } from "../utils/lessonQuestionSteps";

const OPEN_MIN_CHARS = 15;

function stepHeading(step, index, total) {
  const n = index + 1;
  if (step.kind === "mc") return `Multiple choice (${n} of ${total})`;
  if (step.kind === "tf") return `True / false (${n} of ${total})`;
  return `Open-ended (${n} of ${total})`;
}

export default function LessonDetailView({
  module,
  lesson,
  onBackToPath,
  onCompleteLesson,
  onAwardXp,
  /** True when this lesson was already completed once — lower XP per question */
  isReview = false
}) {
  const steps = useMemo(() => buildLessonSteps(lesson), [lesson]);
  const total = steps.length;

  /** -1 intro, 0..length-1 questions */
  const [phaseIndex, setPhaseIndex] = useState(-1);
  const earnedRef = useRef(new Set());
  const lessonXpRef = useRef(0);
  const [lessonXpTotal, setLessonXpTotal] = useState(0);

  const [mcSelection, setMcSelection] = useState(null);
  const [tfSelection, setTfSelection] = useState(null);
  const [openText, setOpenText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const [askAiOpen, setAskAiOpen] = useState(false);
  const [helpNudge, setHelpNudge] = useState(false);
  const clearHelpNudge = useCallback(() => setHelpNudge(false), []);

  const currentStep = phaseIndex >= 0 && phaseIndex < total ? steps[phaseIndex] : null;

  const xpBreakdown = useMemo(() => {
    const mc = steps.filter((s) => s.kind === "mc").length;
    const tf = steps.filter((s) => s.kind === "tf").length;
    const op = steps.filter((s) => s.kind === "open").length;
    const parts = [];
    if (mc) {
      parts.push(
        `${mc}× multiple choice (+${formatXpValue(xpForStepKind("mc", isReview))} XP each)`
      );
    }
    if (tf) {
      parts.push(`${tf}× true/false (+${formatXpValue(xpForStepKind("tf", isReview))} XP each)`);
    }
    if (op) {
      parts.push(`${op}× open-ended (+${formatXpValue(xpForStepKind("open", isReview))} XP each)`);
    }
    return parts.join(" · ");
  }, [steps, isReview]);

  const resetQuestionInputs = () => {
    setMcSelection(null);
    setTfSelection(null);
    setOpenText("");
    setFeedback("");
    setWrongAttempts(0);
  };

  const tryGrantXp = (questionId, xpAmount) => {
    if (earnedRef.current.has(questionId)) return;
    earnedRef.current.add(questionId);
    lessonXpRef.current += xpAmount;
    onAwardXp(xpAmount);
    setLessonXpTotal(lessonXpRef.current);
  };

  const goNextOrFinish = (questionId, xpAmount) => {
    tryGrantXp(questionId, xpAmount);
    const isLast = phaseIndex === total - 1;

    if (isLast) {
      window.setTimeout(() => {
        onCompleteLesson(lesson.id, lessonXpRef.current);
      }, 500);
      return;
    }

    window.setTimeout(() => {
      setPhaseIndex((i) => i + 1);
      resetQuestionInputs();
      setHelpNudge(false);
      setAskAiOpen(false);
    }, 650);
  };

  const handleMcSubmit = () => {
    if (!currentStep || currentStep.kind !== "mc") return;
    if (!mcSelection) {
      setFeedback("Choose an answer first.");
      return;
    }

    if (mcSelection === currentStep.correctAnswer) {
      const xp = xpForStepKind("mc", isReview);
      setFeedback(`Correct! +${formatXpValue(xp)} XP.`);
      goNextOrFinish(currentStep.id, xp);
      return;
    }

    const nextWrong = wrongAttempts + 1;
    setWrongAttempts(nextWrong);
    if (nextWrong < 3) {
      setFeedback("Not quite—try again.");
    } else {
      setFeedback("Not quite—try again or use Ask AI.");
      setAskAiOpen(true);
      setHelpNudge(true);
    }
  };

  const handleTfAnswer = (choice) => {
    if (!currentStep || currentStep.kind !== "tf") return;
    setTfSelection(choice);

    if (choice === currentStep.answer) {
      const xp = xpForStepKind("tf", isReview);
      setFeedback(`Correct! +${formatXpValue(xp)} XP.`);
      goNextOrFinish(currentStep.id, xp);
      return;
    }

    const nextWrong = wrongAttempts + 1;
    setWrongAttempts(nextWrong);
    if (nextWrong < 3) {
      setFeedback("Not quite—try again.");
    } else {
      setFeedback("Not quite—try again or use Ask AI.");
      setAskAiOpen(true);
      setHelpNudge(true);
    }
  };

  const handleOpenSubmit = () => {
    if (!currentStep || currentStep.kind !== "open") return;
    const text = openText.trim();
    if (text.length < OPEN_MIN_CHARS) {
      setFeedback(`Please write at least ${OPEN_MIN_CHARS} characters.`);
      return;
    }
    const xp = xpForStepKind("open", isReview);
    setFeedback(`Nice work! +${formatXpValue(xp)} XP.`);
    goNextOrFinish(currentStep.id, xp);
  };

  const questionPrompt = currentStep ? currentStep.prompt : "";

  const askAiFabVisible =
    phaseIndex >= 0 &&
    currentStep &&
    (currentStep.kind === "open" || wrongAttempts >= 3);

  return (
    <section className="panel lesson-flow-panel">
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
      </header>

      {phaseIndex === -1 ? (
        <article className="lesson-intro-card">
          <p className="lesson-intro-summary">{lesson.summary}</p>
          <p className="muted lesson-intro-meta">
            {total} question{total === 1 ? "" : "s"}
            {xpBreakdown ? ` · ${xpBreakdown}` : ""}
            {isReview ? (
              <>
                {" "}
                · <strong>Review mode</strong>: reduced XP for each question
              </>
            ) : null}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              resetQuestionInputs();
              setPhaseIndex(0);
            }}
          >
            {isReview ? "Review lesson" : "Start lesson"}
          </button>
        </article>
      ) : null}

      {currentStep ? (
        <article className="question-page">
          <p className="question-page-kicker muted">{stepHeading(currentStep, phaseIndex, total)}</p>
          <h3 className="question-title">{questionPrompt}</h3>

          {currentStep.kind === "mc" ? (
            <>
              <div className="answer-grid" role="group" aria-label="Answer choices">
                {currentStep.options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    className={`btn ${mcSelection === option ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setMcSelection(option)}
                  >
                    <span className="option-key">{String.fromCharCode(97 + index)})</span> {option}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-primary question-submit" onClick={handleMcSubmit}>
                Submit answer
              </button>
            </>
          ) : null}

          {currentStep.kind === "tf" ? (
            <div className="tf-row" role="group" aria-label="True or false">
              <button
                type="button"
                className={`btn ${tfSelection === true ? "btn-primary" : "btn-secondary"}`}
                onClick={() => handleTfAnswer(true)}
              >
                True
              </button>
              <button
                type="button"
                className={`btn ${tfSelection === false ? "btn-primary" : "btn-secondary"}`}
                onClick={() => handleTfAnswer(false)}
              >
                False
              </button>
            </div>
          ) : null}

          {currentStep.kind === "open" ? (
            <>
              <textarea
                className="open-ended-input"
                rows={6}
                value={openText}
                onChange={(e) => setOpenText(e.target.value)}
                placeholder="Write your answer…"
                aria-label="Open-ended response"
              />
              <button type="button" className="btn btn-primary question-submit" onClick={handleOpenSubmit}>
                Submit response
              </button>
            </>
          ) : null}

          {feedback ? (
            <p
              className={`feedback ${feedback.startsWith("Correct") || feedback.startsWith("Nice") ? "ok" : "warn"}`}
            >
              {feedback}
            </p>
          ) : null}

          <p className="muted lesson-xp-inline">Lesson XP so far: {lessonXpTotal}</p>
        </article>
      ) : null}

      <AskAiPanel
        isOpen={askAiOpen}
        onOpenChange={setAskAiOpen}
        lessonTitle={lesson.title}
        questionLabel={phaseIndex >= 0 ? stepHeading(currentStep, phaseIndex, total) : ""}
        questionPrompt={questionPrompt}
        questionId={currentStep?.id ?? `intro-${lesson.id}`}
        fabVisible={askAiFabVisible}
        highlightHelp={helpNudge}
        onHighlightConsumed={clearHelpNudge}
      />
    </section>
  );
}
