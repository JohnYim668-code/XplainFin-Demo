import React, { useEffect, useRef } from "react";

function mockTutorReply(userMessage) {
  const snippet = userMessage.trim().slice(0, 120);
  return `Thanks for your question${snippet ? ` about “${snippet}${userMessage.length > 120 ? "…" : ""}”` : ""}. In the full product, an AI tutor would explain the ideas from this lesson, walk through definitions, and help you reason about the question—without simply revealing the exact answer.`;
}

export default function AskAiPanel({
  isOpen,
  onOpenChange,
  lessonTitle,
  questionLabel,
  questionPrompt,
  /** Changes when the learner moves to another question; clears chat context */
  questionId,
  /** When false, the floating control is hidden (chat can still open programmatically). */
  fabVisible = true,
  /** When true after 3 wrong attempts, show a supportive prompt */
  highlightHelp,
  onHighlightConsumed
}) {
  const [messages, setMessages] = React.useState([]);
  const [draft, setDraft] = React.useState("");
  const listRef = useRef(null);

  useEffect(() => {
    setMessages([]);
    setDraft("");
  }, [questionId]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (highlightHelp && isOpen) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === "help-nudge")) return prev;
        return [
          ...prev,
          {
            id: "help-nudge",
            role: "assistant",
            text: "Having trouble with this question? Ask anything about the concept or wording below—your tutor is here to help."
          }
        ];
      });
      onHighlightConsumed?.();
    }
  }, [highlightHelp, isOpen, onHighlightConsumed]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text }]);
    setDraft("");

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", text: mockTutorReply(text) }
      ]);
    }, 400);
  };

  return (
    <>
      {fabVisible ? (
        <button
          type="button"
          className={`ask-ai-fab ${isOpen ? "active" : ""}`}
          onClick={() => onOpenChange(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close Ask AI" : "Ask AI"}
          title="Ask AI"
        >
          <img src="/assistant-ai-icon.png" alt="Ask AI assistant icon" className="ask-ai-fab-art" />
        </button>
      ) : null}

      {isOpen ? (
        <div className="ask-ai-panel" role="dialog" aria-label="Ask AI chat">
          <div className="ask-ai-panel-header">
            <div>
              <p className="ask-ai-panel-title">Ask AI</p>
              <p className="ask-ai-panel-sub muted">{lessonTitle}</p>
            </div>
            <button type="button" className="btn btn-secondary ask-ai-close" onClick={() => onOpenChange(false)}>
              Close
            </button>
          </div>
          {questionLabel ? (
            <p className="ask-ai-context muted">
              {questionLabel}: {questionPrompt}
            </p>
          ) : null}
          <div className="ask-ai-messages" ref={listRef}>
            {messages.length === 0 ? (
              <p className="muted ask-ai-empty">Ask a question about this lesson or the current prompt.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`ask-ai-msg ${m.role}`}>
                  {m.role === "assistant" ? (
                    <img
                      src="/assistant-ai-icon.png"
                      alt="AI assistant"
                      className="ask-ai-msg-avatar"
                    />
                  ) : null}
                  <span>{m.text}</span>
                </div>
              ))
            )}
          </div>
          <div className="ask-ai-input-row">
            <textarea
              className="ask-ai-input"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your question…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button type="button" className="btn btn-primary ask-ai-send" onClick={send}>
              Send
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
