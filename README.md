# FlashDust Creator Website V9

## New in V9

- Replaces manual “Games I Play” list with recent Twitch broadcasts/VODs
- Shows current live Twitch game/category as “Playing Now”
- Adds `/api/twitch-videos` route for recent broadcasts
- Improves performance by disabling heavy blur orb animations
- Makes background motion clearer using cheap background-position animation
- Twitch chat no longer loads automatically; viewer opens it with a button

## Important

Twitch’s public API does not provide a clean “last games played” history endpoint. This version uses:
- Current live category/game from Twitch stream status
- Recent broadcast/VOD list from Twitch videos

This is the closest reliable public-data version without setting up a database to track games over time.
