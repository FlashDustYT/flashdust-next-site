# FlashDust Creator Website V5

## New in V5

- YouTube stats switch to Twitch stats when Twitch mode is selected
- Dynamic animated background glows
- Optional click sound effects toggle in the navbar
- Twitch chat embed panel when Twitch mode is selected
- YouTube activity panel when YouTube mode is selected
- Better Twitch status handling

## Notes

- Twitch chat embed works best on the production Vercel domain.
- YouTube uploaded videos do not have "recent chat." YouTube live chat is only available for livestreams/premieres.
- The sound effect is off by default. Visitors can turn it on with the speaker button.

## Environment variables

Required for YouTube:

```env
YOUTUBE_API_KEY=
YOUTUBE_HANDLE=FlashDust
```

Optional for faster YouTube lookup:

```env
YOUTUBE_CHANNEL_ID=
```

Required for Twitch live detection:

```env
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
TWITCH_CHANNEL=flashdustwastaken
```
