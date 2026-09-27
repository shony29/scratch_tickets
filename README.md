# Foil Lounge

A themed scratch ticket game played with poker chips, with accounts, friends, a leaderboard and live multiplayer rooms.

Play chips only. No cash value.

## Features

- **30 themed tickets** across six price tiers, each with its own game
- **Daily chest:** a slot machine that pays 3 to 100 chips once a day
- **Daily top-up:** anyone under 50 chips at the start of a new day goes back up to 50
- **Accounts:** sign up with email, password and a username. Progress follows you to any device.
- **Leaderboard:** rank by chips, biggest win or total won
- **Friends:** add friends by username, see who's online, send each other chips
- **Activity:** friends' big wins pop up live, plus a feed of wins and gifts
- **Live rooms:** open a room and invite friends or share the 5-letter code. You stay in the room until you leave, playing round after round. The host picks each game from inside the room. Everyone pays the entry into the pot, everyone scratches, and the highest ticket takes the pot. If nobody wins anything, everyone gets their chips back.
- **Tournaments:** 7 random tickets from a price level the host picks (Low 2–3, Mid 5–10, High 15–20). Everyone plays the same 7, and the highest total takes the pot. The host can shuffle the lineup before starting.
- **Room chat:** every room has its own chat. New messages pop up even while you're scratching.
- **Voice chat:** click **Join voice** in a room to talk with everyone else in voice. It connects browsers directly to each other, for up to 8 people.
- **Background music:** a relaxed lounge loop made live in the browser. Toggle it with the music-note button. It gets quieter while you're in voice chat.

The server decides every ticket prize and chest amount, so players can't give themselves chips by editing the page.

## Files

All files sit at the top level, with no folders.

| File | What it is |
|---|---|
| `index.html` | The page |
| `styles.css` | All the styles |
| `app.js` | The game, plus accounts, friends and rooms |
| `config.js` | Your Supabase details go here |
| `supabase.sql` | The database setup. You paste it into Supabase once. |
| `vercel.json` | Vercel settings |
| `favicon.svg` | The tab icon |
| `README.md` | This guide |

## Turning on online play (about 10 minutes)

Until this is done, the game runs in solo mode and saves in the browser.

### 1. Make a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up. The free plan is enough.
2. Click **New project**, give it a name, choose a database password (you won't need it again), and pick the region closest to you.
3. Wait a minute or two while it sets up.

### 2. Set up the database

1. In your project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase.sql`, copy everything in it, and paste it in.
4. Click **Run**. It should say "Success. No rows returned".

### 3. Adjust sign-in settings

1. Go to **Authentication → Sign In / Providers → Email**.
2. Turn **off** "Confirm email", then save. Players can then start right after signing up. Supabase's free email sending only allows a few emails an hour, so confirmation emails would get stuck.
3. Go to **Authentication → URL Configuration** and set **Site URL** to your game's address, for example `https://scratch-tickets.vercel.app`. This makes password-reset links come back to your game.

### 4. Connect the game

1. Go to **Project Settings → API Keys** (on some projects it's **Settings → API**).
2. Copy the **Project URL**. It's also under **Project Settings → Data API**, and it looks like `https://abcdxyz.supabase.co`.
3. Copy the **anon** or **publishable** key. It's safe for this key to be in the page. Never use the **service_role** or **secret** key.
4. Open `config.js`, paste both values between the quotes, and save:

```js
window.FOIL_CONFIG = {
  supabaseUrl: 'https://abcdxyz.supabase.co',
  supabaseAnonKey: 'eyJhbGciOi...',
};
```

5. Upload `config.js` to GitHub. Vercel will redeploy on its own.

Open the site, create an account, and you're in.

## Deploying

The site is plain static files, with no build step.

1. Upload the files to a GitHub repository.
2. Import the repository at [vercel.com/new](https://vercel.com/new) and leave the settings as they are (Framework Preset: **Other**).
3. Every change pushed to GitHub redeploys automatically.

## Notes

- Updating the database later: paste the newest `supabase.sql` into the SQL Editor and run it again. It updates in place and keeps everyone's accounts and chips.
- Rooms hold up to 8 players. If someone takes more than 2 minutes per game to finish, the others can close the round out. Scores are already decided when the round starts, so waiting doesn't change the result.
- Joining a room partway through a round means sitting that round out and playing in the next one. Leaving partway through a round forfeits that round's entry.
- Voice chat needs microphone permission. It works on most home and mobile networks. A small number of strict work or school networks block direct connections, and there voice won't connect, though chat still works.
- Gifts go only to friends, and you can send up to 1,000 chips at a time.
