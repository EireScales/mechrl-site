# Mech — Rocket League Coaching Site

Static single-page marketing site. No build step — deploy the directory as-is.

## Before deploying

1. **Replace Stripe links** in `index.html` — search for `STRIPE_LINK_` and replace each placeholder with your real Stripe Payment Link URL:
   - `STRIPE_LINK_1_DAY`
   - `STRIPE_LINK_3_DAY`
   - `STRIPE_LINK_1_WEEK`
   - `STRIPE_LINK_1_MONTH`
   - `STRIPE_LINK_3_MONTH`
   - `STRIPE_LINK_LIFETIME`

2. **Enable Discord Widget** (optional — for the live member count):
   - Go to your Discord server → Server Settings → Widget → Enable Server Widget
   - The site uses the Discord invite API (`/invites/83kE7ddq7F`) to fetch online member count. No extra setup needed if the invite is valid.

## Deploy to Vercel

### Option A — Vercel CLI
```bash
npm i -g vercel
vercel
```
Follow the prompts. Select "Other" as the framework. Output directory is the root (`.`).

### Option B — Vercel Dashboard (drag & drop)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Drag and drop this folder onto the page
3. Vercel detects it as a static site — no config needed beyond `vercel.json`

### Option C — GitHub integration
1. Push this directory to a GitHub repo
2. Import the repo on the Vercel dashboard
3. Framework preset: **Other**
4. Root directory: leave as default (repo root)
5. No build command, no output directory override needed

## Custom domain

In the Vercel dashboard → your project → Settings → Domains → add `mechrl.store`.

Add these DNS records at your registrar:
- `A` record: `@` → `76.76.21.21`
- `CNAME` record: `www` → `cname.vercel-dns.com`

## File overview

| File | Purpose |
|---|---|
| `index.html` | Entire site — all sections in one file |
| `styles.css` | Custom styles: cursor, boost trail, cards, animations |
| `script.js` | Discord fetch, scroll reveals, cursor, FAQ, price counter |
| `vercel.json` | Security headers, routing config |
