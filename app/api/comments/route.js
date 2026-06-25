import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API_KEY;

function decodeHtml(value = "") {
  return String(value)
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!API_KEY) {
      return NextResponse.json({ error: "Missing YOUTUBE_API_KEY.", comments: [] }, { status: 500 });
    }

    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId.", comments: [] }, { status: 400 });
    }

    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${encodeURIComponent(videoId)}&maxResults=6&order=time&textFormat=plainText&key=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        error: data?.error?.message || "Could not load comments.",
        comments: [],
      }, { status: 500 });
    }

    const comments = (data.items || []).map((item) => {
      const top = item.snippet?.topLevelComment?.snippet || {};
      return {
        id: item.id,
        author: top.authorDisplayName || "YouTube User",
        avatar: top.authorProfileImageUrl || "",
        text: decodeHtml(top.textDisplay || top.textOriginal || ""),
        publishedAt: top.publishedAt || "",
        likeCount: top.likeCount || 0,
      };
    });

    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json({ error: error.message, comments: [] }, { status: 500 });
  }
}
