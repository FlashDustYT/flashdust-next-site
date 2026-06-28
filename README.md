# FlashDust Creator Website V13

## New in V13

- Creator website pricing updated to **1 month free, then $5/month**.
- Added a Creator Websites section for the future creator-site hub.
- Twitch live detection now has a fallback checker when Twitch API credentials are missing or stale.
- Removed/updated wording around old creator hub phrasing.
- FlashArcade references were checked; this package does not include FlashArcade text in the source.

## Twitch setup

The site now tries:
1. Official Twitch API using `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`.
2. Fallback live status check if those credentials are missing or fail.

For best reliability, keep these set in Vercel:

```env
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
TWITCH_CHANNEL=flashdustwastaken
```
