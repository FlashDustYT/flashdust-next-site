import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const CHANNEL = process.env.TWITCH_CHANNEL || "flashdustwastaken";

async function getToken() {
  const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
  const res = await fetch(url, {
    method: "POST",
    cache: "no-store",
  });

  const data = await res.json();

  if (!data.access_token) throw new Error("Could not get Twitch token.");
  return data.access_token;
}

export async function GET() {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json({
        live: false,
        configured: false,
        channel: CHANNEL,
        followers: null,
        formattedFollowers: "Connect",
        checkedAt: new Date().toISOString(),
        message: "Twitch live detection is not connected yet.",
      });
    }

    const token = await getToken();

    const headers = {
      "Client-ID": CLIENT_ID,
      Authorization: `Bearer ${token}`,
    };

    const [userRes, streamRes] = await Promise.all([
      fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(CHANNEL)}`, {
        headers,
        cache: "no-store",
      }),
      fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(CHANNEL)}`, {
        headers,
        cache: "no-store",
      }),
    ]);

    const userData = await userRes.json();
    const streamData = await streamRes.json();

    const user = userData?.data?.[0];
    const stream = streamData?.data?.[0];

    if (!stream) {
      return NextResponse.json({
        live: false,
        configured: true,
        channel: CHANNEL,
        displayName: user?.display_name || CHANNEL,
        profileImage: user?.profile_image_url || null,
        viewers: 0,
        checkedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      live: true,
      configured: true,
      channel: CHANNEL,
      displayName: user?.display_name || CHANNEL,
      profileImage: user?.profile_image_url || null,
      title: stream.title,
      game: stream.game_name,
      viewers: stream.viewer_count ?? 0,
      startedAt: stream.started_at,
      thumbnail: stream.thumbnail_url,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      live: false,
      configured: true,
      channel: CHANNEL,
      viewers: 0,
      checkedAt: new Date().toISOString(),
      error: error.message,
    });
  }
}
