import { NextResponse } from "next/server";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const CHANNEL = process.env.TWITCH_CHANNEL || "flashdustwastaken";

async function getToken() {
  const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
  const res = await fetch(url, { method: "POST", next: { revalidate: 3600 } });
  const data = await res.json();
  if (!data.access_token) throw new Error("Could not get Twitch token.");
  return data.access_token;
}

export async function GET() {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) return NextResponse.json({ live: false, configured: false, channel: CHANNEL });
    const token = await getToken();
    const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(CHANNEL)}`, {
      headers: { "Client-ID": CLIENT_ID, Authorization: `Bearer ${token}` },
      next: { revalidate: 120 },
    });
    const data = await res.json();
    const stream = data?.data?.[0];
    if (!stream) return NextResponse.json({ live: false, configured: true, channel: CHANNEL });
    return NextResponse.json({ live: true, configured: true, channel: CHANNEL, title: stream.title, game: stream.game_name, viewers: stream.viewer_count, startedAt: stream.started_at, thumbnail: stream.thumbnail_url });
  } catch (error) {
    return NextResponse.json({ live: false, configured: true, channel: CHANNEL, error: error.message });
  }
}
