import React from "react";
import ReactPlayer from "react-player";

const DEMO_REELS = [
  {
    id: "reel-1",
    title: "What Is Dollar-Cost Averaging?",
    channel: "XplainFin Shorts",
    url: "https://www.youtube.com/shorts/ReqasPjeYLw",
    duration: "2:13"
  },
  {
    id: "reel-2",
    title: "ETF vs Single Stock in 3 Minutes",
    channel: "Finance in a Minute",
    url: "https://www.youtube.com/watch?v=G6wbv9x7L98",
    duration: "2:47"
  },
  {
    id: "reel-3",
    title: "Risk/Reward Basics for Beginners",
    channel: "Invest Smart Daily",
    url: "https://www.youtube.com/watch?v=9xwazD5SyVg",
    duration: "2:32"
  }
];

function normalizeYoutubeUrl(url) {
  // Shorts links render more consistently in embedded players when converted to watch URLs.
  const match = url.match(/youtube\.com\/shorts\/([^?&/]+)/i);
  return match ? `https://www.youtube.com/watch?v=${match[1]}` : url;
}

function ActionButton({ label, icon }) {
  return (
    <button type="button" className="reels-action-btn" aria-label={label}>
      <span className="reels-action-icon" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

export default function ReelsSection() {
  return (
    <section className="reels-shell panel">
      <header className="reels-header">
        <h2>Reels / Shorts</h2>
        <p className="muted">Swipe or scroll vertically to move between short investing videos.</p>
      </header>

      <div className="reels-scroll" aria-label="Investment shorts feed">
        {DEMO_REELS.map((reel) => (
          <article className="reel-card" key={reel.id}>
            <div className="reel-player-wrap">
              <ReactPlayer
                // Keep this URL normalization so Shorts links play in embedded mode.
                url={normalizeYoutubeUrl(reel.url)}
                controls
                width="100%"
                height="100%"
                playsinline
                config={{
                  youtube: {
                    playerVars: {
                      // Keep branding minimal and make playback mobile-friendly.
                      modestbranding: 1,
                      rel: 0
                    }
                  }
                }}
              />
            </div>

            <div className="reel-meta">
              <p className="reel-title">{reel.title}</p>
              <p className="reel-sub muted">
                {reel.channel} · {reel.duration}
              </p>
            </div>

            <div className="reel-actions">
              {/* Demo actions only: wire these to app state/API later. */}
              <ActionButton label="Like" icon="👍" />
              <ActionButton label="Dislike" icon="👎" />
              <ActionButton label="Comment" icon="💬" />
              <ActionButton label="Share" icon="↗" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
