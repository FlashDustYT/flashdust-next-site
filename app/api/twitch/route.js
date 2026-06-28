import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const CHANNEL = process.env.TWITCH_CHANNEL || "flashdustwastaken";

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function getToken() {
  const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
  const res = await fetch(url, {
    method: "POST",
    cache: "no-store",
  });

  const data = await safeJson(res);

  if (!data.access_token) throw new Error("Could not get Twitch token.");
  return data.access_token;
}

async function getDecapiFallback() {
  try {
    const [uptimeRes, viewersRes, gameRes] = await Promise.all([
      fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(CHANNEL)}`, { cache: "no-store" }),
      fetch(`https://decapi.me/twitch/viewercount/${encodeURIComponent(CHANNEL)}`, { cache: "no-store" }),
      fetch(`https://decapi.me/twitch/game/${encodeURIComponent(CHANNEL)}`, { cache: "no-store" }),
    ]);

    const uptime = (await uptimeRes.text()).trim();
    const viewersText = (await viewersRes.text()).trim();
    const gameText = (await gameRes.text()).trim();

    const offline = !uptime || /offline|not live|doesn't exist|does not exist/i.test(uptime);
    const viewers = Number.parseInt(viewersText.replace(/[^\d]/g, ""), 10);

    return {
      live: !offline,
      configured: false,
      fallback: true,
      channel: CHANNEL,
      displayName: CHANNEL,
      viewers: Number.isFinite(viewers) ? viewers : 0,
      game: !offline && gameText && !/offline|not live/i.test(gameText) ? gameText : null,
      title: !offline ? "Live on Twitch" : null,
      checkedAt: new Date().toISOString(),
      message: !offline
        ? "Live status detected through fallback Twitch status check."
        : "Twitch appears offline from fallback status check.",
    };
  } catch (error) {
    return {
      live: false,
      configured: false,
      fallback: true,
      channel: CHANNEL,
      viewers: 0,
      checkedAt: new Date().toISOString(),
      error: error.message,
      message: "Twitch status could not be checked.",
    };
  }
}

export async function GET() {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json(await getDecapiFallback(), {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
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

    const userData = await safeJson(userRes);
    const streamData = await safeJson(streamRes);

    const user = userData?.data?.[0];
    const stream = streamData?.data?.[0];

    if (!stream) {
      const fallback = await getDecapiFallback();

      return NextResponse.json({
        ...fallback,
        configured: true,
        displayName: user?.display_name || fallback.displayName || CHANNEL,
        profileImage: user?.profile_image_url || null,
      }, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
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
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    const fallback = await getDecapiFallback();

    return NextResponse.json({
      ...fallback,
      configured: Boolean(CLIENT_ID && CLIENT_SECRET),
      error: error.message,
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  }
}
