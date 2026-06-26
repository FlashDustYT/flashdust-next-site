"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Palette, Rocket, Globe2, Video, Gamepad2 } from "lucide-react";

const themeOptions = {
  gold: {
    name: "Gold Mode",
    background: "linear-gradient(135deg, #050505, #17130a 55%, #080808)",
    accent: "#ffd54a",
    glow: "rgba(255,213,74,.28)",
  },
  blue: {
    name: "Blue Neon",
    background: "linear-gradient(135deg, #04101d, #071a30 55%, #02060d)",
    accent: "#66c0f4",
    glow: "rgba(102,192,244,.28)",
  },
  purple: {
    name: "Purple Pulse",
    background: "linear-gradient(135deg, #090514, #201039 55%, #05020b)",
    accent: "#b084ff",
    glow: "rgba(176,132,255,.28)",
  },
  green: {
    name: "Cyber Green",
    background: "linear-gradient(135deg, #03100a, #0d2418 55%, #020805)",
    accent: "#9be870",
    glow: "rgba(155,232,112,.25)",
  },
};

export default function CreatorOSPage() {
  const [form, setForm] = useState({
    name: "Your Name",
    username: "yourname",
    bio: "Creator, streamer, developer, or artist building something worth showing.",
    theme: "gold",
    youtube: "",
    twitch: "",
    arcade: "",
  });

  const theme = themeOptions[form.theme];

  const siteUrl = useMemo(() => {
    const clean = form.username.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "") || "yourname";
    return `${clean}.flashdust.dev`;
  }, [form.username]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="creator-builder-page">
      <section className="builder-shell">
        <Link href="/" className="back-home">← Back to FlashDust</Link>

        <div className="builder-hero">
          <span className="label">Creator OS</span>
          <h1>Build your own creator website.</h1>
          <p>
            Start with a FlashDust-style creator hub, customize it with your brand, then launch
            it at your own creator subdomain. Subscription flow comes next.
          </p>
        </div>

        <section className="builder-grid">
          <form className="builder-form">
            <label>
              <span>Creator name</span>
              <input value={form.name} onChange={(event) => update("name", event.target.value)} />
            </label>

            <label>
              <span>Username / subdomain</span>
              <input value={form.username} onChange={(event) => update("username", event.target.value)} />
              <small>{siteUrl}</small>
            </label>

            <label>
              <span>Short bio</span>
              <textarea rows={4} value={form.bio} onChange={(event) => update("bio", event.target.value)} />
            </label>

            <label>
              <span>Theme</span>
              <div className="theme-picker">
                {Object.entries(themeOptions).map(([key, option]) => (
                  <button
                    key={key}
                    type="button"
                    className={form.theme === key ? "active" : ""}
                    onClick={() => update("theme", key)}
                  >
                    <i style={{ background: option.accent }} />
                    {option.name}
                  </button>
                ))}
              </div>
            </label>

            <div className="builder-actions">
              <button type="button">Create Account Coming Next</button>
              <p>$9.99/month plan will connect to Stripe after login + dashboard are wired.</p>
            </div>
          </form>

          <aside className="creator-live-preview" style={{ background: theme.background, boxShadow: `0 0 80px ${theme.glow}` }}>
            <div className="preview-nav">
              <strong>{form.name || "Your Name"}</strong>
              <span>{siteUrl}</span>
            </div>

            <div className="preview-avatar" style={{ background: theme.accent }}>
              {(form.name || "YN").slice(0, 2).toUpperCase()}
            </div>

            <h2>{form.name || "Your Name"}</h2>
            <p>{form.bio}</p>

            <div className="preview-link-row">
              <span><Video size={15} /> Videos</span>
              <span><Gamepad2 size={15} /> Games</span>
              <span><Globe2 size={15} /> Socials</span>
            </div>

            <div className="preview-card-stack">
              <div><CheckCircle2 size={17} /> YouTube section ready</div>
              <div><CheckCircle2 size={17} /> FlashArcade integration ready</div>
              <div><CheckCircle2 size={17} /> Custom colors saved per creator</div>
            </div>
          </aside>
        </section>

        <section className="pricing-preview">
          <div>
            <span className="label">Launch Price</span>
            <h2>$9.99/month</h2>
            <p>No huge upfront setup fee. Creators pay monthly for hosting, updates, analytics, customization, and future integrations.</p>
          </div>

          <ul>
            <li><CheckCircle2 /> Creator website</li>
            <li><CheckCircle2 /> Custom colors</li>
            <li><CheckCircle2 /> Videos, games, socials</li>
            <li><CheckCircle2 /> username.flashdust.dev</li>
            <li><CheckCircle2 /> Future custom domain support</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
