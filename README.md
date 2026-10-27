# Mohamed & Rawan — Engagement Invitation

Next.js 14 + TypeScript + Tailwind CSS + React Three Fiber / Drei + Framer Motion.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Edit the invitation

Everything (names, date/time, venue, Maps link, colors, copy, feature toggles) lives in
`src/config/invitation.ts`. Tailwind colors read from the same file.

- Countdown target: `event.startsAtISO` (Cairo is UTC+2 on 7 Nov 2026).
- Calendar download: `src/lib/ics.ts` builds an `.ics` with `TZID=Africa/Cairo` and Egypt's DST rules; no end time is set because none is confirmed.
- `features.scene3D = false` replaces the 3D scene with a static monogram panel.
- **RSVP** (name, attending, number of guests, optional note) posts to `/api/rsvp`, which appends one line per reply to
  `data/rsvps.txt` and then emails a Gmail notification. The guest sees "received" only after the line is written.
  To turn on Gmail notifications, copy `.env.example` to `.env.local` and fill in `GMAIL_USER` and a Gmail
  **App Password** (Google Account > Security > 2-Step Verification > App passwords), then restart.
  Saving to a .txt file needs a server with a persistent disk (your own PC/VPS running `npm start`, Render with a disk,
  Railway volume, etc.). Serverless hosts such as Vercel/Netlify do not keep written files.
  Includes a hidden anti-bot field and a simple per-IP rate limit. Max guests: `features.rsvp.maxGuests`.
- **Wishes wall**: guests who tick "Share my note on the wishes wall" have their RSVP note saved to
  `data/wishes.json` as *pending*. Nothing is public until you approve it, either with the one-click
  Approve / Hide links in the Gmail notification, or on the private page **/admin** (password = `ADMIN_PASSWORD`
  in `.env.local`). The Wishes section only appears once at least one wish is approved.
  Set `SITE_URL` once the site is online so the email links point to the real address.
- **Calendar**: Google Calendar and Outlook buttons open pre-filled events (7:00 PM, Africa/Cairo; no end time is
  confirmed, so start = end), and "Apple / Other" downloads the .ics file.
- **3D interaction**: tap/click the couple to make them twirl; drag sideways to turn the scene (vertical swipes still
  scroll the page). The sky changes from sunset to a starry night with a crescent moon over about 30 seconds.
  With reduced motion, the night scene is shown still.
- **Fonts** are self-hosted in `src/fonts` (OFL), so building needs no internet.
- `npm run build` clears `.next` first, because OneDrive sync can corrupt that folder.
- **Music**: put an audio file you have the rights to in `public/` and set `features.music.src` (e.g. `"/music.mp3"`).
  A small "Play music" button appears; it never autoplays.
- `features.cursor` toggles the rose ring cursor (desktop mouse only, native cursor stays visible).

## 3D scene

The bride, groom, gown (lace texture), arch, flowers and platform are fully procedural (Three.js primitives with
articulated arm groups), so there are **no external 3D models, textures or HDRIs to license**. Reflections use
procedural `Lightformer`s instead of a downloaded HDRI. The figures are stylized and faceless and are not likenesses
of the couple.

Performance: DPR is capped (1.75 high / 1.1 low), shadows/environment are disabled on weak devices (<=4 cores,
<=4 GB, or narrow screens), and the render loop is paused when the scene is offscreen or the tab is hidden.
Falls back gracefully without WebGL, on render errors, and with reduced motion (static final pose).

## Licenses

- Cormorant Garamond and Pinyon Script (Google Fonts, SIL Open Font License 1.1), loaded via `next/font`.
- three, @react-three/fiber, @react-three/drei, framer-motion, next, react, tailwindcss: MIT.
- `public/couple.jpg` is the couple's own childhood photo (cropped from the supplied invitation image), shown in the
  "Our Little Love Story" section and framed on an easel inside the 3D scene. Palette follows that image: blush pink,
  deep wine and sepia ivory.
