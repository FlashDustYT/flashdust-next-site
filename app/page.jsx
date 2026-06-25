"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, Tv, Mail, ExternalLink, Radio, Sparkles, Eye, Users, Video, Flame } from "lucide-react";

const LINKS = {
  main: "https://www.youtube.com/@FlashDust",
  second: "https://www.youtube.com/@FlashYappp",
  vods: "https://www.youtube.com/@FlashDustLive",
  twitch: "https://www.twitch.tv/flashdustwastaken",
  email: "mailto:FlashDustCorp@gmail.com",
};

function pickRandom(items) {
  if (!items?.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [twitch, setTwitch] = useState({ live: false, configured: false, channel: "flashdustwastaken" });
  const [channelStats, setChannelStats] = useState(null);
  const [mode, setMode] = useState("youtube");
  const [youtubeError, setYoutubeError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [ytRes, twRes] = await Promise.all([
          fetch("/api/youtube"),
          fetch("/api/twitch"),
        ]);

        const yt = await ytRes.json();
        const tw = await twRes.json();

        if (yt?.videos?.length) {
          setVideos(yt.videos);
          setFeatured(pickRandom(yt.videos));
          if (yt.stats) setChannelStats(yt.stats);
        } else {
          setYoutubeError(yt?.error || "Could not load YouTube videos yet.");
        }

        setTwitch(tw);

        if (tw?.live) setMode("twitch");
      } catch {
        setYoutubeError("Could not load media yet.");
      }
    }

    load();
  }, []);

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
            <a href={LINKS.twitch} target="_blank">Twitch</a>
          </nav>
        </header>

        {twitch.live ? (
          <a className="live-banner" href={LINKS.twitch} target="_blank">
            <Flame size={18} /><strong>LIVE NOW</strong><span>{twitch.game || "Streaming"} • {twitch.viewers || 0} viewers</span><ExternalLink size={18} />
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

            {channelStats ? (
              <div className="stats-strip">
                <Stat icon={<Users />} label="Subscribers" value={channelStats.formattedSubscribers} />
                <Stat icon={<Eye />} label="Channel Views" value={channelStats.formattedViews} />
                <Stat icon={<Video />} label="Uploads" value={channelStats.formattedVideos} />
              </div>
            ) : null}
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
                  {youtubeError || "Loading latest FlashDust videos..."}
                </div>
              )}
            </div>

            <div>
              <h2>{mediaTitle}</h2>
              <p>
                {showTwitch && twitch.live
                  ? `${twitch.game || "Live"} • ${twitch.viewers || 0} viewers`
                  : showTwitch
                  ? "The Twitch player is ready. If you are offline, it will show the channel state."
                  : "Randomly selected from your latest 5 main-channel uploads."}
              </p>
            </div>

            <div className="toggle-row">
              <button className={mode === "youtube" ? "active" : ""} onClick={() => setMode("youtube")}>
                Random Latest Video
              </button>
              <button className={mode === "twitch" ? "active" : ""} onClick={() => setMode("twitch")}>
                Twitch Player
              </button>
            </div>
          </aside>
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
            <p>Automatically pulled from the main FlashDust channel once your YouTube API key is connected.</p>
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

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat">
      {icon}
      <div><strong>{value}</strong><span>{label}</span></div>
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
