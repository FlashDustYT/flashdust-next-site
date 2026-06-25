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

function compact(value) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
}

export async function GET() {
  try {
    if (!API_KEY) return NextResponse.json({ error: "Missing YOUTUBE_API_KEY.", videos: [], stats: null }, { status: 500 });

    const channelId = await getChannelIdFromHandle();
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`;
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=5&order=date&type=video&key=${API_KEY}`;

    const [channelRes, searchRes] = await Promise.all([
      fetch(channelUrl, { next: { revalidate: 3600 } }),
      fetch(searchUrl, { next: { revalidate: 900 } }),
    ]);
    const channelData = await channelRes.json();
    const searchData = await searchRes.json();
    if (!channelRes.ok) return NextResponse.json({ error: channelData?.error?.message || "YouTube channel API error.", videos: [], stats: null }, { status: 500 });
    if (!searchRes.ok) return NextResponse.json({ error: searchData?.error?.message || "YouTube search API error.", videos: [], stats: null }, { status: 500 });

    const ids = (searchData.items || []).map((item) => item.id.videoId).filter(Boolean);
    let statsById = {};
    if (ids.length) {
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids.join(",")}&key=${API_KEY}`;
      const statsRes = await fetch(statsUrl, { next: { revalidate: 900 } });
      const statsData = await statsRes.json();
      statsById = Object.fromEntries((statsData.items || []).map((item) => [item.id, item.statistics || {}]));
    }

    const videos = (searchData.items || []).map((item) => {
      const id = item.id.videoId;
      const s = statsById[id] || {};
      return {
        id,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
        url: `https://www.youtube.com/watch?v=${id}`,
        views: s.viewCount || "0",
        likes: s.likeCount || "0",
        formattedViews: compact(s.viewCount || 0),
      };
    });

    const c = channelData.items?.[0];
    const stats = c ? {
      title: c.snippet?.title || "FlashDust",
      subscribers: c.statistics?.hiddenSubscriberCount ? null : c.statistics?.subscriberCount,
      views: c.statistics?.viewCount,
      videos: c.statistics?.videoCount,
      formattedSubscribers: c.statistics?.hiddenSubscriberCount ? "Hidden" : compact(c.statistics?.subscriberCount || 0),
      formattedViews: compact(c.statistics?.viewCount || 0),
      formattedVideos: compact(c.statistics?.videoCount || 0),
    } : null;

    return NextResponse.json({ channelId, videos, stats });
  } catch (error) {
    return NextResponse.json({ error: error.message, videos: [], stats: null }, { status: 500 });
  }
}
