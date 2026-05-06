import React from "react";
import ReactPlayer from "react-player";

const DEMO_REELS = [
  {
    id: "reel-1",
    title: "What Is Dollar-Cost Averaging?",
    channel: "XplainFin Shorts",
    url: "https://www.youtube.com/shorts/ReqasPjeYLw",
    duration: "2:13",
    description: "A quick walk-through of dollar-cost averaging and why consistency can beat timing the market.",
    comments: [
      { id: "c1-1", user: "Mina", text: "This made DCA finally click for me. Super clear." },
      { id: "c1-2", user: "Ray", text: "Would love a follow-up on when to rebalance." },
      { id: "c1-3", user: "Ari", text: "I started with weekly buys after this video." }
    ]
  },
  {
    id: "reel-2",
    title: "ETF vs Single Stock in 3 Minutes",
    channel: "Finance in a Minute",
    url: "https://www.youtube.com/shorts/-9Lwo2Uao9U",
    duration: "2:47",
    description: "Compares ETF diversification against picking single names, with beginner-friendly risk examples.",
    comments: [
      { id: "c2-1", user: "Noah", text: "ETF explanation was great. Keep these shorts coming." },
      { id: "c2-2", user: "Jules", text: "Nice contrast with single-stock volatility." },
      { id: "c2-3", user: "Sam", text: "Could you do one on sector ETFs next?" }
    ]
  },
  {
    id: "reel-3",
    title: "Risk/Reward Basics for Beginners",
    channel: "Invest Smart Daily",
    url: "https://www.youtube.com/shorts/dmanqHAR_O4",
    duration: "2:32",
    description: "Explains risk/reward setups and position sizing basics for new investors.",
    comments: [
      { id: "c3-1", user: "Kai", text: "The position size part is exactly what I needed." },
      { id: "c3-2", user: "Drew", text: "Simple and practical. Bookmarking this." },
      { id: "c3-3", user: "Leah", text: "Can you add an example with stop loss too?" }
    ]
  }
];

function normalizeYoutubeUrl(url) {
  // Shorts links render more consistently in embedded players when converted to watch URLs.
  const match = url.match(/youtube\.com\/shorts\/([^?&/]+)/i);
  return match ? `https://www.youtube.com/watch?v=${match[1]}` : url;
}

function ActionButton({ label, icon, onClick, count }) {
  return (
    <button type="button" className="reels-action-btn side" aria-label={label} onClick={onClick}>
      <span className="reels-action-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="reels-action-text">{count ?? label}</span>
    </button>
  );
}

export default function ReelsSection() {
  const cardRefs = React.useRef({});
  const toggleLockRef = React.useRef({});

  const initialLikes = React.useMemo(
    () =>
      DEMO_REELS.reduce((acc, reel, idx) => {
        // Keep random-like defaults stable (1-100) for demo screenshots and rerenders.
        const seed = (reel.id.length * 23 + idx * 31) % 100;
        acc[reel.id] = seed + 1;
        return acc;
      }, {}),
    []
  );

  const [likesById, setLikesById] = React.useState(initialLikes);
  const [playingById, setPlayingById] = React.useState(
    () => DEMO_REELS.reduce((acc, reel) => ({ ...acc, [reel.id]: false }), {})
  );
  const [mutedById, setMutedById] = React.useState(
    () => DEMO_REELS.reduce((acc, reel) => ({ ...acc, [reel.id]: true }), {})
  );
  const [volumeById, setVolumeById] = React.useState(
    () => DEMO_REELS.reduce((acc, reel) => ({ ...acc, [reel.id]: 0.6 }), {})
  );
  const [hoverVolumeById, setHoverVolumeById] = React.useState(
    () => DEMO_REELS.reduce((acc, reel) => ({ ...acc, [reel.id]: false }), {})
  );
  const [menuOpenById, setMenuOpenById] = React.useState(
    () => DEMO_REELS.reduce((acc, reel) => ({ ...acc, [reel.id]: false }), {})
  );
  const [commentsOpenById, setCommentsOpenById] = React.useState(
    () => DEMO_REELS.reduce((acc, reel) => ({ ...acc, [reel.id]: false }), {})
  );
  const [commentsById, setCommentsById] = React.useState(
    () => DEMO_REELS.reduce((acc, reel) => ({ ...acc, [reel.id]: reel.comments }), {})
  );
  const [commentDraftById, setCommentDraftById] = React.useState(
    () => DEMO_REELS.reduce((acc, reel) => ({ ...acc, [reel.id]: "" }), {})
  );

  const closeAllMenus = React.useCallback(() => {
    setMenuOpenById((prev) => Object.keys(prev).reduce((acc, id) => ({ ...acc, [id]: false }), {}));
  }, []);

  React.useEffect(() => {
    function handleGlobalClick(event) {
      const clickedInsideMenu = Object.values(cardRefs.current).some((node) => {
        const menu = node?.querySelector(".reel-top-menu");
        const menuBtn = node?.querySelector(".reel-top-btn.menu");
        return menu?.contains(event.target) || menuBtn?.contains(event.target);
      });

      if (!clickedInsideMenu) {
        closeAllMenus();
      }
    }

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [closeAllMenus]);

  const togglePlay = (reelId) => {
    if (toggleLockRef.current[reelId]) return;
    // Prevent rapid play/pause races that can trigger interrupted play() errors.
    toggleLockRef.current[reelId] = true;
    setPlayingById((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
    window.setTimeout(() => {
      toggleLockRef.current[reelId] = false;
    }, 180);
  };

  const toggleMute = (reelId) => {
    setMutedById((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const toggleComments = (reelId) => {
    setCommentsOpenById((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const toggleMenu = (reelId) => {
    setMenuOpenById((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const incrementLike = (reelId) => {
    setLikesById((prev) => ({ ...prev, [reelId]: (prev[reelId] ?? 0) + 1 }));
  };

  const handleVolumeChange = (reelId, nextVolume) => {
    const volume = Number(nextVolume);
    setVolumeById((prev) => ({ ...prev, [reelId]: volume }));
    // Sliding volume above 0 should automatically unmute for a predictable UX.
    setMutedById((prev) => ({ ...prev, [reelId]: volume === 0 ? true : prev[reelId] && false }));
  };

  const postComment = (reelId) => {
    const draft = (commentDraftById[reelId] || "").trim();
    if (!draft) return;

    setCommentsById((prev) => ({
      ...prev,
      [reelId]: [
        ...(prev[reelId] || []),
        {
          id: `${reelId}-u-${Date.now()}`,
          user: "You",
          text: draft
        }
      ]
    }));
    setCommentDraftById((prev) => ({ ...prev, [reelId]: "" }));
  };

  const requestFullscreen = async (reelId) => {
    const node = cardRefs.current[reelId];
    if (!node || !node.requestFullscreen) return;
    try {
      await node.requestFullscreen();
    } catch {
      // Ignore fullscreen failures in browsers that block untrusted calls.
    }
  };

  return (
    <section className="reels-shell panel">
      <header className="reels-header">
        <h2>Reels / Shorts</h2>
        <p className="muted">Swipe or scroll vertically to move between short investing videos.</p>
      </header>

      <div className="reels-scroll" aria-label="Investment shorts feed">
        {DEMO_REELS.map((reel) => (
          <article
            className="reel-card"
            key={reel.id}
            ref={(node) => {
              cardRefs.current[reel.id] = node;
            }}
          >
            <div className="reel-content-row">
              <div className="reel-player-wrap with-overlay">
                <ReactPlayer
                  // Keep URL normalization so Shorts links play in embedded mode.
                  src={normalizeYoutubeUrl(reel.url)}
                  controls={false}
                  playing={playingById[reel.id]}
                  muted={mutedById[reel.id]}
                  volume={volumeById[reel.id]}
                  width="100%"
                  height="100%"
                  playsInline
                  config={{
                    youtube: {
                      playerVars: {
                        // We use custom overlay controls to mimic reels UI.
                        controls: 0,
                        fs: 0,
                        modestbranding: 1,
                        rel: 0
                      }
                    }
                  }}
                />

                <div className="reel-top-controls">
                  <button
                    type="button"
                    className="reel-top-btn"
                    aria-label={playingById[reel.id] ? "Pause video" : "Play video"}
                    onClick={() => togglePlay(reel.id)}
                  >
                    {playingById[reel.id] ? "❚❚" : "▶"}
                  </button>

                  <div
                    className="reel-volume-wrap"
                    onMouseEnter={() => setHoverVolumeById((prev) => ({ ...prev, [reel.id]: true }))}
                    onMouseLeave={() => setHoverVolumeById((prev) => ({ ...prev, [reel.id]: false }))}
                  >
                    <button
                      type="button"
                      className="reel-top-btn"
                      aria-label={mutedById[reel.id] ? "Unmute video" : "Mute video"}
                      onClick={() => toggleMute(reel.id)}
                    >
                      {mutedById[reel.id] ? "🔇" : "🔊"}
                    </button>
                    <div className={`reel-volume-slider ${hoverVolumeById[reel.id] ? "show" : ""}`}>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volumeById[reel.id]}
                        aria-label="Volume"
                        onChange={(e) => handleVolumeChange(reel.id, e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="reel-menu-wrap">
                    <button
                      type="button"
                      className="reel-top-btn menu"
                      aria-label="Open video menu"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(reel.id);
                      }}
                    >
                      ⋮
                    </button>
                    {menuOpenById[reel.id] ? (
                      <div className="reel-top-menu" role="menu">
                        <button type="button" role="menuitem">
                          Description
                        </button>
                        <button type="button" role="menuitem">
                          Report
                        </button>
                        <button type="button" role="menuitem">
                          Send feedback
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="reel-top-btn"
                    aria-label="Fullscreen"
                    onClick={() => requestFullscreen(reel.id)}
                  >
                    ⛶
                  </button>
                </div>

                <div className="reel-side-actions">
                  <ActionButton label="Like" icon="👍" count={likesById[reel.id]} onClick={() => incrementLike(reel.id)} />
                  <ActionButton label="Dislike" icon="👎" onClick={() => {}} />
                  <ActionButton
                    label="Comment"
                    icon="💬"
                    count={String((commentsById[reel.id] || []).length)}
                    onClick={() => toggleComments(reel.id)}
                  />
                  <ActionButton label="Share" icon="↗" onClick={() => {}} />
                </div>
              </div>

              {commentsOpenById[reel.id] ? (
                <aside className="reel-comments-side">
                  <div className="reel-comments-head">
                    <p className="reel-comments-title">Comments {(commentsById[reel.id] || []).length}</p>
                    <button
                      type="button"
                      className="reel-comments-close"
                      aria-label="Close comments"
                      onClick={() => toggleComments(reel.id)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="reel-comments-list">
                    {(commentsById[reel.id] || []).map((comment) => (
                      <div className="reel-comment-item" key={comment.id}>
                        <span className="reel-comment-user">@{comment.user}</span>
                        <span className="reel-comment-text">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="reel-comment-compose">
                    <input
                      type="text"
                      className="reel-comment-input"
                      placeholder="Add a comment..."
                      value={commentDraftById[reel.id] || ""}
                      onChange={(e) =>
                        setCommentDraftById((prev) => ({
                          ...prev,
                          [reel.id]: e.target.value
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          postComment(reel.id);
                        }
                      }}
                    />
                    <button type="button" className="reel-comment-post" onClick={() => postComment(reel.id)}>
                      Post
                    </button>
                  </div>
                </aside>
              ) : null}
            </div>

            <div className="reel-meta">
              <p className="reel-title">{reel.title}</p>
              <p className="reel-sub muted">
                {reel.channel} · {reel.duration}
              </p>
              <p className="reel-description muted">{reel.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
