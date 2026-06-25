# FlashDust Creator Website V8

## New in V8

- Adds a "Games I Play" button in Twitch mode
- Shows current live Twitch game as "Playing Now" when live
- Adds editable `GAMES_I_PLAY` list in `app/page.jsx`
- Improves performance by making background animation lighter
- Makes background motion more visible with subtle drifting gold lines

## Editing games

Open `app/page.jsx` and edit:

```js
const GAMES_I_PLAY = [
  { name: "Fortnite", note: "Customs, creative, or squads", link: "https://www.twitch.tv/flashdustwastaken" },
  ...
];
```

## Notes

Twitch's API can show your current live category/game. It does not reliably expose a simple "last 5 games played" list without heavier tracking, so this version uses a clean editable list plus current live game.
