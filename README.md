# Foil Lounge

A themed scratch ticket game played with poker chips. Twenty tickets across four tiers, four ways to win, a daily treasure chest slot machine, and progress that saves in the browser.

Play chips only. No cash value.

## What's inside

- **20 themed tickets** in four tiers: 3, 5, 10 and 20 chips (five tickets each)
- **Four game types:** Match & Multiply, Match 3, Symbol Match and Head to Head
- **Daily chest:** a slot machine that pays 3 to 100 chips once a day
- **Daily top-up:** below 50 chips at the start of a new day, you go back up to 50
- **Saving:** chips, stats, recent tickets and any half-scratched ticket are kept in the browser's local storage
- Themed animations, sound effects (with a mute toggle) and a stats panel with reset

## Project layout

```
index.html          page markup
assets/styles.css   all styles
assets/app.js       game logic, animations and sound
favicon.svg
vercel.json         clean URLs, caching and security headers
```

No framework and no build step. It is a plain static site.

## Run it locally

```bash
npm run dev
```

Then open http://localhost:3000. Any static file server works too.

## Push to GitHub

```bash
git init
git add .
git commit -m "Foil Lounge"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/foil-lounge.git
git push -u origin main
```

## Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repository.
2. Leave the settings as they are. Framework preset: **Other**, no build command, output directory is the project root.
3. Click **Deploy**.

Every push to `main` redeploys automatically. You can also deploy from the terminal with `npx vercel`.

## Notes

- Progress lives in each visitor's own browser, so it doesn't carry between devices or browsers, and clearing site data resets it.
- Fonts load from Google Fonts. Everything else is self-contained.
