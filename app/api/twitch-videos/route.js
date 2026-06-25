import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const CHANNEL = process.env.TWITCH_CHANNEL || "flashdustwastaken";

async function getToken() {
  const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
  const res = await fetch(url, { method: "POST", cache: "no-store" });
  const data = await res.json();

  if (!data.access_token) throw new Error("Could not get Twitch token.");
  return data.access_token;
}

export async function GET() {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json({
        configured: false,
        videos: [],
        message: "Twitch credentials are not connected yet.",
      });
    }

    const token = await getToken();
    const headers = {
      "Client-ID": CLIENT_ID,
      Authorization: `Bearer ${token}`,
    };

    const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(CHANNEL)}`, {
      headers,
      cache: "no-store",
    });

    const userData = await userRes.json();
    const user = userData?.data?.[0];

    if (!user?.id) {
      return NextResponse.json({ configured: true, videos: [], message: "Could not find Twitch user." });
    }

    const videosRes = await fetch(`https://api.twitch.tv/helix/videos?user_id=${user.id}&type=archive&first=6`, {
      headers,
      cache: "no-store",
    });

    const videosData = await videosRes.json();

    const videos = (videosData?.data || []).map((video) => ({
      id: video.id,
      title: video.title,
      url: video.url,
      createdAt: video.created_at,
      publishedAt: video.published_at,
      duration: video.duration,
      views: video.view_count || 0,
      thumbnail: video.thumbnail_url
        ? video.thumbnail_url.replace("%{width}", "640").replace("%{height}", "360")
        : "",
    }));

    return NextResponse.json({
      configured: true,
      channel: CHANNEL,
      displayName: user.display_name || CHANNEL,
      videos,
    });
  } catch (error) {
    return NextResponse.json({
      configured: true,
      videos: [],
      error: error.message,
    }, { status: 500 });
  }
}
