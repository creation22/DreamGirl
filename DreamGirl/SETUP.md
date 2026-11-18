# DreamHer setup

Portraits are drawn by [Surplus Intelligence](https://www.surplusintelligence.ai) and stored,
with the public gallery, in Supabase. The browser never sees either key: everything goes
through the Vercel functions in `api/`.

## 1. Supabase (database + image storage)

1. Create a free project at supabase.com.
2. SQL Editor > New query > paste all of `supabase/schema.sql` > Run.
   This creates the `portraits`, `visitors` and `prompt_log` tables, the totals functions and a
   public `portraits` storage bucket. Re-running the whole file is safe (everything is
   `if not exists` / `or replace`); the notes at the bottom list what to drop if you set this
   up before the three-per-IP limit.
3. Project Settings > API: copy the **Project URL** and a **secret key**
   (`sb_secret_...`, or the legacy `service_role` key).

## 2. Vercel environment variables

Project > Settings > Environment Variables:

| Name | Value | Required |
|---|---|---|
| `SURPLUS_API_KEY` | Surplus API key (`inf_...`) | yes |
| `SUPABASE_URL` | `https://<project>.supabase.co` | yes |
| `SUPABASE_SECRET_KEY` | the Supabase secret key | yes |
| `IP_HASH_SALT` | any long random string | recommended |
| `LIMIT_PER_IP` | portraits one IP may ever draw, default `3` | no |
| `SURPLUS_IMAGE_MODELS` | models to try in order, default `venice-z-image-turbo,venice-flux-1.1,flux.2-klein-4b` | no |
| `TURNSTILE_SECRET_KEY` + `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile keys (free) for the bot check; both or neither | recommended |
| `GITHUB_TOKEN` | any GitHub token (no scopes), raises the star counter's GitHub limit from 60 to 5,000 calls an hour; the count is cached for a minute, so it's rarely needed | no |

Redeploy after adding them.

## 3. Run locally

```bash
npm install
npm run build && npx vite preview   # http://localhost:4173, with the api/ routes
```

Without `SUPABASE_URL` set, the local server uses a throwaway in-memory gallery. Without
`SURPLUS_API_KEY`, it returns sample pictures with made-up prices so the UI can be tried.
Set the variables in your shell (not in a committed file) to test against the real services.

## The photograph

The landing page is built on one black-and-white photo (`public/night/bg.jpg`); the
app inside (quiz, result, gallery) uses the white neobrutalist look. To swap the photo:

```bash
python scripts/prepare_night.py path/to/photo.jpg
```

It writes a black-and-white copy sized for the web.
`scripts/dev-samples/` holds the sample portraits local test mode uses without a Surplus key.

## Moderating

Typed answers that mention minors or explicit content are refused in the quiz and again on
the server. Every prompt asks for a clothed, safe-for-work portrait. Three reports from
different visitors hide a portrait. To hide something by hand, see the bottom of
`supabase/schema.sql`.

## Prompt log

Every request to draw a portrait is kept in the `prompt_log` table: the ten answers, the exact prompt sent to Surplus, the username as typed, a hashed IP, and what happened (`drawn`, `blocked`, `limited`, `failed`, `invalid`). Blocked and failed requests are kept too. Read it in Supabase (Table Editor, or the queries at the bottom of `supabase/schema.sql`). Running locally without Supabase, it goes to `.dev-data/prompt_log.jsonl` instead.

## The limit: three portraits per IP

There's no login, so a visitor is their IP — hashed with `IP_HASH_SALT`, never stored raw
(`visitorHash` in `api/_lib/http.js`). Each IP gets **3 portraits, for good**, and that's the
only limit: no per-hour burst, no daily reset, no spending cap.

- **Where it's enforced:** `api/generate.js` counts that IP's rows in `portraits` before
  drawing anything, and refuses at 3. Removed and hidden portraits still count — the row
  stays behind on purpose.
- **Where the visit is noted:** `/api/quota`, which the site calls on load. It upserts the
  hashed IP into `visitors` (`visits`, `first_seen`, `last_seen`) and answers with
  `{used, limit, remaining}`, so the landing page can show what's left and grey out the
  button. The server still does the real check — the browser's copy is only for show.
- **Changing it:** set `LIMIT_PER_IP` and redeploy. To clear one IP, delete its rows from
  `portraits` (see the notes at the bottom of `supabase/schema.sql`).
- **What it doesn't stop:** a new IP is a new visitor, so mobile data, a VPN or a proxy gets
  3 more. The bot check is what makes that expensive at scale — **Cloudflare Turnstile**,
  free at dash.cloudflare.com → Turnstile → Add site (domain `dreamher.vercel.app`, mode
  Managed). Put the site key in `VITE_TURNSTILE_SITE_KEY` and the secret in
  `TURNSTILE_SECRET_KEY`, then redeploy. Real visitors almost never see it. Until both keys
  are set, the check is off and nothing but the per-IP count stands between a script and the
  Surplus bill.
