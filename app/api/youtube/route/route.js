import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const HANDLE = process.env.YOUTUBE_HANDLE || "FlashDust";

async function getChannelIdFromHandle() {
  if (CHANNEL_ID) return CHANNEL_ID;
  if (!API_KEY) throw new Error("Missing YOUTUBE_API_KEY.");

  const handleUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(HANDLE)}&key=${API_KEY}`;
  const handleRes = await fetch(handleUrl, { next: { revalidate: 3600 } });
  const handleData = await handleRes.json();

  if (handleData?.items?.[0]?.id) return handleData.items[0].id;

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(HANDLE)}&maxResults=1&key=${API_KEY}`;
  const searchRes = await fetch(searchUrl, { next: { revalidate: 3600 } });
  const searchData = await searchRes.json();

  const found = searchData?.items?.[0]?.snippet?.channelId;
  if (!found) throw new Error("Could not find YouTube channel ID.");
  return found;
}

export async function GET() {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "Missing YOUTUBE_API_KEY.", videos: [] },
        { status: 500 }
      );
    }

    const channelId = await getChannelIdFromHandle();

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=5&order=date&type=video&key=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 900 } });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "YouTube API error.", videos: [] },
        { status: 500 }
      );
    }

    const videos = (data.items || []).map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    return NextResponse.json({ channelId, videos });
  } catch (error) {
    return NextResponse.json({ error: error.message, videos: [] }, { status: 500 });
  }
}
