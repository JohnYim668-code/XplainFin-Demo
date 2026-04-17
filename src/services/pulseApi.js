import baselineProfile from "../data/user_profile.json";

function mergeProfile(baseline, runtime) {
  return {
    ...baseline,
    ...runtime,
    risk_profile: {
      ...baseline.risk_profile,
      ...(runtime?.risk_profile ?? {})
    },
    learning_context: {
      ...baseline.learning_context,
      ...(runtime?.learning_context ?? {})
    },
    behavioral_signals: {
      ...baseline.behavioral_signals,
      ...(runtime?.behavioral_signals ?? {})
    }
  };
}

export function buildPulseSystemPrompt(userProfile) {
  return `
You are Pulse, a sentient data waveform investment coach for Gen-Z learners.
Use these non-negotiable user constraints:
- Risk profile: score ${userProfile.risk_profile.score}/10 (${userProfile.risk_profile.label})
- Learning level: ${userProfile.learning_context.level}
- Top weak topics: ${userProfile.learning_context.top_weak_topics.join(", ")}
- Recent incorrect answers: ${userProfile.learning_context.recent_incorrect_answers}
- Daily task performance: ${userProfile.learning_context.daily_task_performance}
- Chat sentiment: ${userProfile.behavioral_signals.chat_sentiment}
- Confidence signal: ${userProfile.behavioral_signals.confidence_signal}

Response rules:
1) Use simple analogies calibrated to risk tolerance and knowledge level.
2) Explain jargon in plain language.
3) Return an "xai_breakdown" showing logic/math steps.
4) If topic is ETF/diversification, include route recommendation:
   "Route Green, Hold G2 (ETF Diversification)".
`.trim();
}

/**
 * API wrapper skeleton for LLM backend.
 * This is the integration contract for injecting user_profile.json into the prompt.
 *
 * Pseudocode:
 * 1) runtimeProfile = deriveProfileFromTelemetry(appState)
 * 2) merged = mergeProfile(user_profile.json, runtimeProfile)
 * 3) systemPrompt = buildPulseSystemPrompt(merged)
 * 4) POST /api/pulse/chat {
 *      system_prompt: systemPrompt,
 *      user_message: message,
 *      history: chatHistory
 *    }
 * 5) Return model response + xai_breakdown + detected_topics
 */
export async function sendPulseMessage({ message, userProfile, history }) {
  const mergedProfile = mergeProfile(baselineProfile, userProfile);
  const systemPrompt = buildPulseSystemPrompt(mergedProfile);

  // Mock response for local UI development.
  const lower = message.toLowerCase();
  const detectedTopics = [];
  if (lower.includes("etf")) detectedTopics.push("ETF Diversification");
  if (lower.includes("risk")) detectedTopics.push("Risk Management");
  if (lower.includes("option")) detectedTopics.push("Options Trading");

  const riskLabel = mergedProfile.risk_profile.label;
  const explanation =
    lower.includes("etf")
      ? "An ETF is like a playlist of many stocks in one tap, so you do not bet everything on one song."
      : "Think of investing like climbing routes: easier holds build skills, then you branch to harder moves.";

  return Promise.resolve({
    systemPromptUsed: systemPrompt,
    detectedTopics,
    reply: `${explanation} Since your profile is ${riskLabel}, I will keep this practical and step-by-step.`,
    xaiBreakdown: [
      "Mapped your risk score and recent mistakes to explanation depth.",
      "Detected key topic from your message keywords.",
      "Selected analogy style based on preferred_explanation_style.",
      "Generated a recommendation aligned with your current route readiness."
    ],
    routeRecommendation: detectedTopics.includes("ETF Diversification")
      ? {
          lessonId: "lesson-green-2",
          route: "Green",
          hold: "G2",
          title: "ETF Diversification"
        }
      : null,
    updatedProfile: mergedProfile,
    historyLength: history.length + 1
  });
}
