# FlashDust Next.js Creator Website

Premium black/gold creator website for FlashDust.

## Features

- Latest 5 YouTube uploads from @FlashDust through the official YouTube API
- Twitch live-status check through the official Twitch API
- If Twitch is live, the hero media can show the Twitch player
- If Twitch is offline, the site shows a random latest YouTube upload
- Main channel, second channel, VOD channel, Twitch, and business email links
- Mobile-friendly black/gold design

## Local setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the keys.

## Required environment variables

```env
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=
YOUTUBE_HANDLE=FlashDust

TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
TWITCH_CHANNEL=flashdustwastaken
```

`YOUTUBE_CHANNEL_ID` is recommended. If omitted, the app tries to resolve the channel from the handle.

## Deploy

Recommended: Vercel.

1. Upload this project to GitHub.
2. Import it in Vercel.
3. Add the environment variables.
4. Deploy.
