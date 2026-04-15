/** XP awarded once per question on first completion (or submitted for open-ended). */
export const XP_MULTIPLE_CHOICE = 10;
export const XP_TRUE_FALSE = 5;
export const XP_OPEN_ENDED = 20;

/** Reduced XP when reviewing a lesson already marked complete. */
export const XP_REVIEW_MULTIPLE_CHOICE = 5;
export const XP_REVIEW_TRUE_FALSE = 2.5;
export const XP_REVIEW_OPEN_ENDED = 10;

/**
 * Flatten lesson questions into one ordered list: MC → TF → open-ended.
 */
export function buildLessonSteps(lesson) {
  const { multipleChoice, trueFalse, openEnded } = lesson.questions;
  const steps = [];

  for (const q of multipleChoice) {
    steps.push({ kind: "mc", ...q });
  }
  for (const q of trueFalse) {
    steps.push({ kind: "tf", ...q });
  }
  if (openEnded) {
    steps.push({ kind: "open", ...openEnded });
  }

  return steps;
}

export function xpForStepKind(kind, isReview = false) {
  if (isReview) {
    if (kind === "mc") return XP_REVIEW_MULTIPLE_CHOICE;
    if (kind === "tf") return XP_REVIEW_TRUE_FALSE;
    if (kind === "open") return XP_REVIEW_OPEN_ENDED;
    return 0;
  }
  if (kind === "mc") return XP_MULTIPLE_CHOICE;
  if (kind === "tf") return XP_TRUE_FALSE;
  if (kind === "open") return XP_OPEN_ENDED;
  return 0;
}

/** Display XP without trailing .0 for whole numbers. */
export function formatXpValue(xp) {
  if (typeof xp !== "number" || Number.isNaN(xp)) return "0";
  if (Number.isInteger(xp)) return String(xp);
  return xp.toFixed(1);
}
