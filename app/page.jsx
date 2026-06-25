"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Tv, Mail, ExternalLink, Radio, Sparkles, Eye, Users, Video, Flame, MessageCircle, Volume2, VolumeX, Activity, Music, Music2, Gamepad2 } from "lucide-react";

const LINKS = {
  main: "https://www.youtube.com/@FlashDust",
  second: "https://www.youtube.com/@FlashYappp",
  vods: "https://www.youtube.com/@FlashDustLive",
  twitch: "https://www.twitch.tv/flashdustwastaken",
  email: "mailto:FlashDustCorp@gmail.com",
};

// Edit this list anytime to match the games you actually want viewers to join you in.
const GAMES_I_PLAY = [
  { name: "Fortnite", note: "Customs, creative, or squads", link: "https://www.twitch.tv/flashdustwastaken" },
  { name: "Roblox", note: "Viewer games and chaotic sessions", link: "https://www.twitch.tv/flashdustwastaken" },
  { name: "Minecraft", note: "Community worlds and chill streams", link: "https://www.twitch.tv/flashdustwastaken" },
  { name: "GTA / FiveM", note: "RP, races, or random nonsense", link: "https://www.twitch.tv/flashdustwastaken" },
  { name: "Party Games", note: "Jackbox-style viewer chaos", link: "https://www.twitch.tv/flashdustwastaken" },
];

function pickRandom(items) {
  if (!items?.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function playClick(enabled) {
  if (!enabled || typeof window === "undefined") return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(360, ctx.currentTime + 0.055);

    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.065);
  } catch {}
}

function createAmbientLoop() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContext();
  const master = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  master.gain.value = 0.018;
  filter.type = "lowpass";
  filter.frequency.value = 850;

  filter.connect(master);
  master.connect(ctx.destination);

  const notes = [110, 164.81, 220, 277.18];
  const oscillators = notes.map((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = index % 2 === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;
    gain.gain.value = 0.035 / notes.length;

    osc.connect(gain);
    gain.connect(filter);
    osc.start();

    return { osc, gain };
  });

  let interval = setInterval(() => {
    const now = ctx.currentTime;
    oscillators.forEach(({ osc, gain }, i) => {
      const mod = notes[(i + Math.floor(Math.random() * notes.length)) % notes.length];
      osc.frequency.exponentialRampToValueAtTime(mod, now + 2.5);
      gain.gain.linearRampToValueAtTime(0.02 / notes.length, now + 1.2);
      gain.gain.linearRampToValueAtTime(0.04 / notes.length, now + 2.8);
    });
  }, 3200);

  return {
    stop() {
      clearInterval(interval);
      const now = ctx.currentTime;
      master.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      setTimeout(() => {
        oscillators.forEach(({ osc }) => osc.stop());
        ctx.close();
      }, 450);
    },
  };
}

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsError, setCommentsError] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [channelStats, setChannelStats] = useState(null);
  const [twitch, setTwitch] = useState({ live: false, configured: false, channel: "flashdustwastaken" });
  const [mode, setMode] = useState("youtube");
  const [youtubeError, setYoutubeError] = useState("");
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [twitchVideos, setTwitchVideos] = useState([]);
  const [twitchVideosError, setTwitchVideosError] = useState("");
  const [showTwitchChat, setShowTwitchChat] = useState(false);
  const ambientRef = useRef(null);

  async function refreshTwitchStatus({ autoSwitch = false } = {}) {
    try {
      const twRes = await fetch(`/api/twitch?t=${Date.now()}`, {
        cache: "no-store",
      });
      const tw = await twRes.json();
      setTwitch(tw);

      if (autoSwitch && tw?.live) {
        setMode("twitch");
      }
    } catch {
      setTwitch((current) => ({
        ...current,
        error: "Could not refresh Twitch status.",
      }));
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [ytRes, twRes] = await Promise.all([
          fetch("/api/youtube"),
          fetch(`/api/twitch?t=${Date.now()}`, { cache: "no-store" }),
        ]);

        const yt = await ytRes.json();
        const tw = await twRes.json();

        if (yt?.videos?.length) {
          setVideos(yt.videos);
          setFeatured(pickRandom(yt.videos));
          setYoutubeError("");
        } else {
          setYoutubeError(yt?.error || "Could not load YouTube videos yet.");
        }

        if (yt?.stats) setChannelStats(yt.stats);
        setTwitch(tw);

        try {
          const twitchVideosRes = await fetch(`/api/twitch-videos?t=${Date.now()}`, { cache: "no-store" });
          const twitchVideosData = await twitchVideosRes.json();
          if (twitchVideosData?.videos?.length) {
            setTwitchVideos(twitchVideosData.videos);
            setTwitchVideosError("");
          } else {
            setTwitchVideos([]);
            setTwitchVideosError(twitchVideosData?.message || twitchVideosData?.error || "No recent Twitch broadcasts found.");
          }
        } catch {
          setTwitchVideosError("Could not load recent Twitch broadcasts.");
        }

        if (tw?.live) setMode("twitch");
      } catch {
        setYoutubeError("Could not load media yet.");
      } finally {
        setLoading(false);
      }
    }

    load();

    const twitchTimer = setInterval(() => {
      refreshTwitchStatus({ autoSwitch: false });
    }, 30000);

    return () => clearInterval(twitchTimer);
  }, []);

  useEffect(() => {
    async function loadComments() {
      if (!featured?.id || mode !== "youtube") return;

      try {
        setCommentsLoading(true);
        setCommentsError("");
        const res = await fetch(`/api/comments?videoId=${featured.id}`);
        const data = await res.json();

        if (data?.comments?.length) {
          setComments(data.comments);
        } else {
          setComments([]);
          setCommentsError(data?.error || "No recent public comments found for this video.");
        }
      } catch {
        setComments([]);
        setCommentsError("Could not load recent comments.");
      } finally {
        setCommentsLoading(false);
      }
    }

    loadComments();
  }, [featured?.id, mode]);

  useEffect(() => {
    const handler = (event) => {
      if (event.target.closest("button, a")) playClick(soundOn);
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [soundOn]);

  useEffect(() => {
    if (musicOn && !ambientRef.current) {
      ambientRef.current = createAmbientLoop();
    }

    if (!musicOn && ambientRef.current) {
      ambientRef.current.stop();
      ambientRef.current = null;
    }

    return () => {
      if (ambientRef.current) {
        ambientRef.current.stop();
        ambientRef.current = null;
      }
    };
  }, [musicOn]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (mode === "youtube" && videos.length) {
        setFeatured(pickRandom(videos));
      }
    }, 45000);

    return () => clearInterval(timer);
  }, [mode, videos]);

  const twitchParent = typeof window !== "undefined" ? window.location.hostname : "";
  const showTwitch = mode === "twitch";
  const canShowYoutube = featured && mode === "youtube";

  const mediaTitle = useMemo(() => {
    if (showTwitch && twitch.live) return "FlashDust is LIVE";
    if (showTwitch) return "FlashDust on Twitch";
    if (featured) return featured.title;
    return "Latest FlashDust Video";
  }, [showTwitch, twitch.live, featured]);

  return (
    <main>
      <div className="dynamic-bg">
        <span />
        <span />
        <span />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="dust" />

      <section className="wrap">
        <header>
          <a className="brand" href="#">
            <span className="logo">FDC</span>
            <span>FlashDust</span>
          </a>

          <nav>
            <a href="#channels">Channels</a>
            <a href="#latest">Latest</a>
            <a href="#contact">Business</a>
            <a href={LINKS.twitch} target="_blank">
              {twitch.live ? <span className="nav-live-dot" /> : null}
              Twitch
            </a>
            <button className="sound-toggle" onClick={() => setSoundOn((value) => !value)} title="Toggle click sound effects">
              {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <button className="sound-toggle" onClick={() => setMusicOn((value) => !value)} title="Toggle soft ambient background audio">
              {musicOn ? <Music2 size={17} /> : <Music size={17} />}
            </button>
          </nav>
        </header>

        {twitch.live ? (
          <a className="live-banner" href={LINKS.twitch} target="_blank">
            <Flame size={18} />
            <strong>LIVE NOW</strong>
            <span>{twitch.game || "Streaming"} • {twitch.viewers || 0} viewers</span>
            <ExternalLink size={18} />
          </a>
        ) : null}

        <section className="hero">
          <div className="hero-copy">
            <div className="badge">
              <Sparkles size={16} />
              Official FlashDust Content Network
            </div>

            <h1>
              Flash<span>Dust</span>
            </h1>

            <p>
              Commentary, streams, VODs, side-channel chaos, and business contact —
              all wrapped in one premium black-and-gold creator hub.
            </p>

            <div className="actions">
              <a className="button gold" href={LINKS.main} target="_blank">
                <Play size={20} /> Watch Main Channel
              </a>
              <a className="button dark" href={LINKS.twitch} target="_blank">
                <Tv size={20} /> Catch Me Live
              </a>
            </div>

            <div className="stats-strip">
              {mode === "twitch" ? (
                <>
                  <Stat icon={<Activity />} label="Twitch Status" value={twitch.live ? "LIVE" : "Offline"} />
                  <Stat icon={<Eye />} label={twitch.live ? "Live Viewers" : "Viewers"} value={twitch.live ? String(twitch.viewers || 0) : "0"} />
                  <Stat icon={<Tv />} label="Channel" value={twitch.displayName || "FlashDust"} />
                </>
              ) : channelStats ? (
                <>
                  <Stat icon={<Users />} label="Subscribers" value={channelStats.formattedSubscribers} />
                  <Stat icon={<Eye />} label="Channel Views" value={channelStats.formattedViews} />
                  <Stat icon={<Video />} label="Uploads" value={channelStats.formattedVideos} />
                </>
              ) : null}
            </div>
          </div>

          <aside className="media-card">
            <div className="media-top">
              <span>{showTwitch ? "TWITCH PLAYER" : "LATEST YOUTUBE"}</span>
              <span className={twitch.live ? "live" : ""}>
                {twitch.live ? "LIVE NOW" : showTwitch ? "OFFLINE" : "AUTO"}
              </span>
            </div>

            <div className="player">
              {showTwitch ? (
                <iframe
                  src={`https://player.twitch.tv/?channel=flashdustwastaken&parent=${twitchParent}&muted=true`}
                  allowFullScreen
                  title="FlashDust Twitch Player"
                />
              ) : canShowYoutube ? (
                <iframe
                  src={`https://www.youtube.com/embed/${featured.id}?rel=0&modestbranding=1`}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={featured.title}
                />
              ) : (
                <div className="empty">
                  {loading ? "Loading latest FlashDust videos..." : youtubeError || "Latest videos are unavailable right now."}
                </div>
              )}
            </div>

            <div>
              <h2>{mediaTitle}</h2>
              <p>
                {showTwitch && twitch.live
                  ? `${twitch.game || "Live"} • ${twitch.viewers || 0} viewers • Live status refreshes every 30s`
                  : showTwitch
                  ? twitch.configured
                    ? `Currently offline • Last checked ${twitch.checkedAt ? new Date(twitch.checkedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "just now"}`
                    : "Twitch live detection is not connected yet. Add Twitch credentials to enable it."
                  : featured
                    ? `${featured.formattedViews || "0"} views • Uploaded ${formatDate(featured.publishedAt)}`
                    : "Randomly selected from your latest 5 main-channel uploads."}
              </p>
            </div>

            <div className="toggle-row">
              <button className={mode === "youtube" ? "active" : ""} onClick={() => { setMode("youtube"); setShowGames(false); setShowTwitchChat(false); }}>
                Random Latest Video
              </button>
              <button className={mode === "twitch" ? "active" : ""} onClick={() => setMode("twitch")}>
                Twitch Player
              </button>
              {mode === "twitch" ? (
                <button className={showGames ? "active" : ""} onClick={() => setShowGames((value) => !value)}>
                  Recent Streams
                </button>
              ) : null}
            </div>
          </aside>
        </section>

        {mode === "twitch" && showGames ? (
          <section className="games-panel">
            <div className="activity-head">
              <Gamepad2 size={20} />
              <div>
                <h2>Recent Twitch Streams</h2>
                <p>Twitch does not provide a simple public “last games played” history, so this shows your recent broadcasts. When you are live, the current category/game appears first.</p>
              </div>
            </div>

            <div className="games-grid">
              {twitch.live && twitch.game ? (
                <a className="game-card featured-game" href={LINKS.twitch} target="_blank">
                  <span className="label">Playing Now</span>
                  <h3>{twitch.game}</h3>
                  <p>{twitch.title || "Currently live on Twitch."}</p>
                  <strong>Join Stream ↗</strong>
                </a>
              ) : null}

              {twitchVideos.length ? twitchVideos.map((video) => (
                <a className="game-card stream-card" href={video.url} target="_blank" key={video.id}>
                  {video.thumbnail ? <img src={video.thumbnail} alt="" loading="lazy" /> : null}
                  <span className="label">Recent Broadcast</span>
                  <h3>{video.title}</h3>
                  <p>{video.views} views • {video.duration} • {formatDate(video.createdAt)}</p>
                  <strong>Watch VOD ↗</strong>
                </a>
              )) : (
                <div className="game-card">
                  <span className="label">Recent Broadcasts</span>
                  <h3>No VODs Found</h3>
                  <p>{twitchVideosError || "Recent Twitch broadcasts will appear here after your next saved stream."}</p>
                  <strong>Check Twitch ↗</strong>
                </div>
              )}
            </div>
          </section>
        ) : null}

        <section className="activity-shell">
          <div className="activity-panel">
            <div className="activity-head">
              <MessageCircle size={19} />
              <div>
                <h2>{mode === "twitch" ? "Twitch Chat" : "Latest YouTube Comments"}</h2>
                <p>{mode === "twitch" ? "Live chat appears here when Twitch allows the embed." : "Recent public comments from the currently featured video."}</p>
              </div>
            </div>

            {mode === "twitch" ? (
              showTwitchChat ? (
                <div className="chat-frame">
                  <iframe
                    src={`https://www.twitch.tv/embed/flashdustwastaken/chat?parent=${twitchParent}&darkpopout`}
                    title="FlashDust Twitch Chat"
                  />
                </div>
              ) : (
                <div className="chat-placeholder">
                  <MessageCircle size={26} />
                  <h3>Twitch chat is ready</h3>
                  <p>Keeping chat closed improves site performance. Open it when you want the live chat panel.</p>
                  <button onClick={() => setShowTwitchChat(true)}>Open Twitch Chat</button>
                </div>
              )
            ) : featured ? (
              <div className="comments-list">
                {commentsLoading ? (
                  <div className="empty compact">Loading latest comments...</div>
                ) : comments.length ? (
                  comments.map((comment) => (
                    <div className="comment" key={comment.id}>
                      {comment.avatar ? <img src={comment.avatar} alt="" /> : <div className="comment-avatar" />}
                      <div>
                        <div className="comment-top">
                          <strong>{comment.author}</strong>
                          <span>{formatDate(comment.publishedAt)}</span>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="video-activity">
                    <img src={featured.thumbnail} alt="" />
                    <div>
                      <span className="label">Now Featured</span>
                      <h3>{featured.title}</h3>
                      <p>{commentsError || "No public comments are available for this video yet."}</p>
                      <a href={featured.url} target="_blank">Open on YouTube <ExternalLink size={15} /></a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty compact">Comments will appear after YouTube loads.</div>
            )}
          </div>
        </section>

        <section id="channels" className="section">
          <div className="section-head">
            <h2>Pick your platform.</h2>
            <p>Every FlashDust destination organized cleanly for viewers, fans, sponsors, and anyone trying to find the chaos.</p>
          </div>

          <div className="grid">
            <Card icon={<Play />} label="YouTube" title="Main Channel" text="The main home for FlashDust videos, commentary, and polished uploads." href={LINKS.main} />
            <Card icon={<Play />} label="YouTube" title="2nd Channel" text="Extra videos, loose content, and yapping that deserved its own channel." href={LINKS.second} />
            <Card icon={<Radio />} label="YouTube" title="Stream VODs" text="Missed a stream? Full VODs and live moments live here." href={LINKS.vods} />
            <Card icon={<Tv />} label="Twitch" title="Live Streams" text="Catch FlashDust live when the content is happening in real time." href={LINKS.twitch} />
          </div>
        </section>

        <section id="latest" className="section">
          <div className="section-head">
            <h2>Latest uploads.</h2>
            <p>Automatically pulled from your main channel and refreshed through the YouTube Data API.</p>
          </div>

          <div className="video-grid">
            {videos.length ? videos.map((video) => (
              <a className="video-card" href={video.url} target="_blank" key={video.id}>
                <img src={video.thumbnail} alt="" />
                <div>
                  <h3>{video.title}</h3>
                  <p>{video.formattedViews} views • {formatDate(video.publishedAt)}</p>
                </div>
              </a>
            )) : (
              <div className="empty wide-empty">{youtubeError || "Latest videos will appear here after setup."}</div>
            )}
          </div>
        </section>

        <section id="contact" className="contact">
          <div>
            <span className="label">Business</span>
            <h2>Work with FlashDust</h2>
            <p>For sponsorships, collabs, brand deals, or professional contact, use the official business email.</p>
          </div>

          <a className="button gold" href={LINKS.email}>
            <Mail size={20} /> FlashDustCorp@gmail.com
          </a>
        </section>

        <footer>© {new Date().getFullYear()} FlashDust / FDC. Built in Gold Mode.</footer>
      </section>
    </main>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat">
      {icon}
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function Card({ icon, label, title, text, href }) {
  return (
    <a className="card" href={href} target="_blank">
      <div>
        <div className="label-row">{icon}<span>{label}</span></div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <ExternalLink className="card-arrow" />
    </a>
  );
}
