import React from "react";
import { sendPulseMessage } from "../services/pulseApi";
import KnowledgeArchipelago from "./KnowledgeArchipelago";

function classifySentiment(text) {
  const t = text.toLowerCase();
  const positiveWords = ["good", "great", "confident", "clear", "understand", "easy"];
  const negativeWords = ["confused", "lost", "hard", "worried", "scared", "stress"];
  const positive = positiveWords.some((word) => t.includes(word));
  const negative = negativeWords.some((word) => t.includes(word));
  if (positive && !negative) return "positive";
  if (negative && !positive) return "negative";
  return "neutral";
}

function confidenceSignal(text) {
  const t = text.toLowerCase();
  if (t.includes("i know") || t.includes("i think i can")) return "high";
  if (t.includes("not sure") || t.includes("don't understand") || t.includes("confused")) return "low";
  return "medium";
}

export default function ExploreWithPulse({ userProfile, onProfileSignals, onNavigateToLesson }) {
  const [mode, setMode] = React.useState("live"); // live | history
  const [draft, setDraft] = React.useState("");
  const [messages, setMessages] = React.useState([
    {
      id: "seed-1",
      role: "assistant",
      text: "I am Pulse. Ask me anything about investing, risk, ETFs, stocks, or your climbing route.",
      xaiBreakdown: [
        "Bootstrapped from your profile baseline.",
        "Calibrated explanation level to your current learning context."
      ]
    }
  ]);
  const [expandedIds, setExpandedIds] = React.useState([]);
  const [pending, setPending] = React.useState(false);
  const listRef = React.useRef(null);

  const [conversations, setConversations] = React.useState(() => {
    try {
      const raw = window.localStorage.getItem("xplainfin_pulse_conversations");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [drawerConversation, setDrawerConversation] = React.useState(null);

  React.useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem("xplainfin_pulse_conversations", JSON.stringify(conversations));
    } catch {
      // ignore storage failures
    }
  }, [conversations]);

  const toggleXai = (id) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || pending) return;

    const sentiment = classifySentiment(text);
    const confidence = confidenceSignal(text);
    onProfileSignals?.({ sentiment, confidence, text });

    const userMessage = { id: `u-${Date.now()}`, role: "user", text };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setDraft("");
    setPending(true);

    try {
      const result = await sendPulseMessage({
        message: text,
        userProfile,
        history: nextHistory
      });

      const assistantMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: result.reply,
        xaiBreakdown: result.xaiBreakdown,
        recommendation: result.routeRecommendation,
        detectedTopics: result.detectedTopics
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage
      ]);

      const primaryTopic = result.detectedTopics?.[0] ?? "Personal Finance";
      const titleSeed = text.split(/[.!?]/)[0].slice(0, 38).trim();
      const title = titleSeed ? titleSeed : primaryTopic;
      const summary =
        primaryTopic === "ETF Diversification"
          ? "A quick breakdown of ETFs, diversification, and how to reduce single-stock risk."
          : `Pulse explained ${primaryTopic} with tailored analogies and next-step recommendations.`;

      setConversations((prev) => [
        {
          id: `c-${Date.now()}`,
          createdAt: Date.now(),
          primaryTopic,
          detectedTopics: result.detectedTopics,
          title,
          summary,
          messages: [...nextHistory, assistantMessage]
        },
        ...prev
      ].slice(0, 25));
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="panel">
      <h2>Explore with Pulse</h2>
      <p className="muted">
        Pulse adapts to your risk profile and learning gaps while explaining terms with transparent logic.
      </p>

      <div className="explore-profile-strip">
        <span>Risk: {userProfile.risk_profile.label}</span>
        <span>Score: {userProfile.risk_profile.score}/10</span>
        <span>Gaps: {userProfile.learning_context.top_weak_topics.join(", ")}</span>
      </div>

      <div className="explore-mode-toggle">
        <button
          type="button"
          className={`explore-mode-tab ${mode === "live" ? "active" : ""}`}
          onClick={() => setMode("live")}
        >
          Live Chat
        </button>
        <button
          type="button"
          className={`explore-mode-tab ${mode === "history" ? "active" : ""}`}
          onClick={() => setMode("history")}
        >
          Knowledge Archipelago
        </button>
      </div>

      <div className="explore-chat-shell">
        {mode === "history" ? (
          <KnowledgeArchipelago conversations={conversations} onOpenConversation={setDrawerConversation} />
        ) : (
          <>
            <div className="explore-chat-log" ref={listRef}>
              {messages.map((message) => (
                <article key={message.id} className={`explore-msg ${message.role}`}>
                  <div className="explore-msg-main">
                    {message.role === "assistant" ? (
                      <img src="/assistant-ai-icon.png" alt="Pulse" className="explore-pulse-avatar" />
                    ) : null}
                    <p>{message.text}</p>
                  </div>

                  {message.role === "assistant" && message.xaiBreakdown ? (
                    <div className="explore-xai-block">
                      <button type="button" className="btn btn-secondary" onClick={() => toggleXai(message.id)}>
                        {expandedIds.includes(message.id) ? "Hide XAI breakdown" : "How Pulse derived this"}
                      </button>
                      {expandedIds.includes(message.id) ? (
                        <ul className="explore-xai-list">
                          {message.xaiBreakdown.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}

                  {message.recommendation ? (
                    <div className="explore-reco-card">
                      <p className="explore-reco-title">Want to learn more?</p>
                      <p className="explore-reco-text">
                        Climb to Route {message.recommendation.route}, Hold {message.recommendation.hold} (
                        {message.recommendation.title}) on the Bouldering Wall.
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => onNavigateToLesson?.(message.recommendation.lessonId)}
                      >
                        Open this hold
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="explore-chat-input-row">
              <textarea
                className="explore-chat-input"
                rows={3}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask Pulse about ETFs, risk, valuation, or your next route..."
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button type="button" className="btn btn-primary" onClick={handleSend} disabled={pending}>
                {pending ? "Pulse thinking..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>

      {drawerConversation ? (
        <div className="arch-drawer-backdrop" role="presentation" onClick={() => setDrawerConversation(null)}>
          <aside className="arch-drawer" role="dialog" aria-label="Saved conversation" onClick={(e) => e.stopPropagation()}>
            <div className="arch-drawer-header">
              <div>
                <p className="arch-drawer-title">{drawerConversation.title}</p>
                <p className="muted arch-drawer-sub">{drawerConversation.primaryTopic}</p>
              </div>
              <button type="button" className="btn btn-secondary" onClick={() => setDrawerConversation(null)}>
                Close
              </button>
            </div>

            <div className="arch-drawer-log">
              {drawerConversation.messages.map((m) => (
                <div key={m.id} className={`arch-drawer-msg ${m.role}`}>
                  {m.role === "assistant" ? (
                    <img src="/assistant-ai-icon.png" alt="Pulse" className="explore-pulse-avatar" />
                  ) : null}
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
