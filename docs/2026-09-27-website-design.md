# remana.ai — website design

**Status:** proposed 2026-09-27. Track §3 of `docs/roadmaps/2026-09-27-next-tracks.md`.

**Request:** a website for the app and the company — for Play reviewers and the first dogfooders
first, and cheap enough to also carry a waitlist for early adopters and one page for investors.
Option B (Astro on Cloudflare Pages) chosen over hand-written HTML and over a site builder.

## What is already there

| piece | state (checked 2026-09-27) |
|---|---|
| `remana.ai` | registered at Namecheap, nameservers on Cloudflare. **The apex `A` record points at Namecheap's parking IP** (`162.255.119.11`); `www` is a CNAME to the parking page. HTTPS to the apex times out. |
| `api.remana.ai` | the auth gateway (Cloudflare Worker), live. Untouched by this work. |
| `admin@remana.ai` | delivered by Cloudflare Email Routing. The site's contact and support address. |
| brand | `docs/design/brand/` (three master SVGs), `docs/superpowers/specs/2026-09-20-remana-logo-design.md`, an org avatar and a 1280×640 social image exported this week |
| design system | `DESIGN.md`: tokens, Plus Jakarta Sans (the TTF is in the Android app at `apps/android/app/src/main/res/font/`), the four-state provenance mark |
| privacy facts | `ARCHITECTURE.md` → Data flow: audio to cloud Whisper and diarization, transcripts to a cloud LLM, memory on the device only; Google sign-in via Firebase; no ads, no analytics SDK in the app |
| a web app | none. `apps/web-console/` is a README, and the roadmap says not to let it become a V1 dependency |

## Goals and non-goals

**Goals, in order of why the site must exist at all:**
1. A **privacy policy** and **terms** at stable URLs — required by Play (listing + Data Safety) and by
   the App Store (privacy policy URL *and* a support URL) before anyone but the owner installs.
2. **What it is**, in one screen: the promise (it knows what was said and what it inferred), the
   mark, three real screenshots, store badges once the app is listed.
3. **A way in**: a waitlist whose emails we own, with spam protection and no third-party mailing
   service in the loop.
4. **Press** (the brand files) and **About** (the team and the thesis) — one page each; this is the
   whole of the "early adopters" and "investors" scope, added to the same site.

**Non-goals for v1:** accounts, anything that shows app data, a blog, a changelog, a cookie banner
(nothing on the site needs consent), i18n, a CMS, outbound email.

## Architecture

```
remana-labs/remana-site (public GitHub repo)
  └─ Astro 6, static output ──build──▶ Cloudflare Pages ──▶ https://remana.ai
        │                                   │
        │                                   ├─ /api/waitlist  Pages Function → Turnstile verify → D1 insert
        │                                   └─ Web Analytics (cookieless beacon)
        └─ GitHub Actions (GitHub-hosted): astro check + build + link check on every PR
```

- **Astro** because the content pages (privacy, terms, support, press, about) are Markdown under one
  layout, and it emits plain HTML with no client JavaScript unless a component asks for it. Cloudflare
  owns Astro since January; it stays MIT. Rejected: hand-written HTML (six pages of copy-pasted
  chrome, and every later page is another copy), Framer/Webflow (tokens and the policy would live in a
  vendor, monthly fee, no repo).
- **Cloudflare Pages** because the DNS is already there, the gateway is already there, and the free
  plan has no bandwidth cap. Deploys from the GitHub repo via Cloudflare's integration: every PR gets a
  preview URL, `main` goes to production.
- **Waitlist** = one Pages Function. `POST /api/waitlist` with `{email, turnstileToken}` → verify the
  token with Turnstile's siteverify → `INSERT INTO waitlist (email, created_at, source)` into a D1
  database bound to the Pages project → `{ok:true}`. Duplicate email is a no-op success. No
  confirmation email (Email Routing is inbound only; outbound needs another service — later, only if
  we ever send marketing mail, and then double opt-in). Export with `wrangler d1 execute`. Rejected:
  Buttondown/Mailchimp/Tally (a third party holds the list and must appear in the privacy policy).
- **Analytics:** Cloudflare Web Analytics — cookieless, no consent needed, and it is named in the
  privacy policy. Rejected: Google Analytics (would be the only tracker on a privacy-first site).
- **Fonts self-hosted** (the Plus Jakarta Sans TTF, subset to latin, `font-display: swap`). Rejected:
  Google Fonts (a third-party request per visitor, and a policy line we would rather not need).
- **Runners:** GitHub-hosted only. This repo is public; the org's self-hosted runners must never be
  attached to it (`docs/engineering/repo-transfer-checklist.md`).

**All of it is free**: Pages (500 builds/month, unlimited requests), Functions on the Workers free
plan (100k requests/day), D1 free tier, Turnstile, Web Analytics, GitHub Actions on a public repo,
Astro. The only cost is the domain renewal already paid.

## Pages

| path | purpose | source of copy |
|---|---|---|
| `/` | the promise, the mark, three screenshots, badges (hidden until listed), waitlist | this spec's copy section; screenshots captured from the S22 |
| `/privacy` | the privacy policy | written from `ARCHITECTURE.md` → Data flow, below |
| `/terms` | terms of use | short, plain |
| `/support` | support address, three FAQs (what leaves the phone, how to delete, sign-out keeps data) | the app's own copy in `auth/SignInMessage.kt`, `auth/AccountRow.kt` |
| `/press` | the mark and lockup as SVG/PNG, the colour values, one paragraph of usage rules | `docs/design/brand/README.md`, `DESIGN.md` → Brand mark |
| `/about` | who, and the thesis in five sentences | `docs/v2_roadmap.md` §0, rewritten for a reader outside the repo |
| `/.well-known/assetlinks.json` | Android App Links — reserved | filled once `ai.remana.app` has a Play App Signing certificate |
| `/.well-known/apple-app-site-association` | Universal Links — reserved | filled when iOS exists |
| `sitemap.xml`, `robots.txt`, OG image | search and link previews | the 1280×640 social image |

**Home copy, first draft (to be edited by the owner):**

> **remana** — *a meeting memory that knows what was said, and what it only inferred.*
>
> Record a meeting on your phone. Remana turns it into memory — the facts, the commitments, the open
> questions, per person — and marks every one of them: **said**, or **inferred**. Your memory stays on
> your phone. The cloud only does the listening.
>
> [Join the waitlist] · Android first · iOS later

The solid/hollow provenance mark is the visual argument: one section shows a real extracted item with
its mark and explains the two states in the app's own words ("From the transcript" / "Generated from
your memory" — `ProvenanceMark.kt`).

## Privacy policy — the content, not a template

Written from what the app does. Every sentence below must stay true, or the code changes first.

- **What is collected and where it goes.** Audio you record is sent to our speech-to-text and
  speaker-recognition services to produce a transcript. The transcript is sent to our language-model
  service to extract memory items. All three run on servers we operate, reached through
  `api.remana.ai` (Cloudflare). Speech-to-text and extraction process a request and keep nothing
  after it. Speaker recognition accepts a recording in parts, so it holds the audio on the server
  **for up to one hour** while the parts arrive and the job runs (`services/diarization/jobs.py`,
  `ttl_seconds = 3600`), then deletes it. No transcript or memory is stored on our servers.
- **What stays on your phone.** Your memory store (meetings, people, facts, commitments), your
  transcripts, and your voiceprints. The store is encrypted with a key held in your phone's secure
  hardware. Voice identification runs entirely on the phone; voiceprints never leave it.
- **Account.** Sign-in is Google, through Firebase Authentication. We hold your account identifier
  and email address to authorise access to the cloud services; nothing else. Signing out removes the
  token and leaves everything on your phone readable.
- **Third parties named:** Google (Firebase Authentication), Cloudflare (`remana.ai`, `api.remana.ai`,
  Web Analytics, Turnstile). No advertising, no analytics SDK in the app, no data sold or shared for
  profiling.
- **Deletion.** Deleting a meeting in the app deletes it from your phone; nothing about it exists
  server-side to delete. Uninstalling the app destroys the store's key and with it the store.
- **The website.** The waitlist stores the email you give us, when, and which page you gave it on —
  nothing else — in a database we operate at Cloudflare, until you ask us to remove it
  (`admin@remana.ai`). Web Analytics is cookieless and does not identify you.
- **Children, changes, contact.** Not for under-16s; dated change log at the bottom; `admin@remana.ai`.

**Three facts to make true or verify before the policy is published** (each is a sentence above):
1. The vLLM containers are started without `--disable-log-requests`
   (`docs/engineering/dgx-spark-vllm-runbook.md`), so request logs can carry transcript text for the
   life of the container. Add the flag to both `docker run` commands and the runbook; until then the
   policy cannot say "no transcript is retained".
2. The whisper container's retention is not visible from the repo (`docker/whisper-gb10` is a
   Dockerfile and an entrypoint). Confirm on the host that it writes no audio to disk.
3. The Cloudflare Worker's request logging is off by default; confirm nothing was enabled in the
   dashboard.

**Must be reviewed by a lawyer before the app has a public production listing.** For internal testing
with named dogfooders, the owner's own review is enough. The policy is versioned in the repo with a
date, and the change log is part of the page.

## Design

From `DESIGN.md`, not reinvented: the dark neutral environment (`#0B0D0E`, surfaces `#16191B` /
`#1F2325`), teal `#2DD4BF` as the single accent spent once per screen, `on-surface` `#F2F4F5`, the
4-px spacing scale, radii 8/12/18, Plus Jakarta Sans 400/500/600/700. A light theme via
`prefers-color-scheme` with the light seeds (`#0F766E` on `#FAFBFB`). Contrast floors as in
`DESIGN.md` (4.5:1 text, 3:1 non-text). Motion: none beyond hover/focus; `prefers-reduced-motion`
honoured. Phone-first layout; every page works at 360 px with a 16-px gutter.

The lockup rules from the logo spec apply: mark left of `remana`, wordmark in `on-surface`, never in
the accent; the mark alone as favicon (`favicon.svg`, `.ico` with the filled 16-px cut,
`apple-touch-icon` 180, manifest 192/512 + a maskable 512 with the mark inside the 409-px circle).

## Repository and CI

- `remana-labs/remana-site`, **public**, MIT for the code, "all rights reserved" for the brand assets
  and copy (a `LICENSE` and a `BRAND.md` line saying so).
- Layout: `src/pages/*.astro`, `src/content/*.md` for the Markdown pages, `src/layouts/Base.astro`,
  `src/styles/tokens.css` (the `DESIGN.md` values), `public/.well-known/`, `functions/api/waitlist.ts`,
  `wrangler.toml` (D1 binding, Turnstile secret as an env var), `.github/workflows/ci.yml`.
- CI on every PR and on `main`: `astro check`, `astro build`, an internal link check over `dist/`, and
  a test that the privacy policy contains a dated change-log entry no older than the last edit of the
  file (a policy page that changes silently is the failure this guards). Cloudflare builds previews
  per PR independently.
- Secrets: none in the repo. Turnstile secret and the D1 binding live in the Pages project settings.

## Verification

1. `astro build` clean; Lighthouse ≥ 95 on performance and accessibility for `/` and `/privacy` at
   phone width (run locally once, recorded in the PR).
2. Waitlist: submit from the preview URL → row appears via `wrangler d1 execute … "select * from
   waitlist"`; a submission without a Turnstile token is rejected with 400; a duplicate email returns
   `ok` and adds no row.
3. DNS: `https://remana.ai/` serves the site, `www` redirects to the apex, `api.remana.ai` unaffected
   (the gateway's health endpoint still answers).
4. The two `.well-known` URLs return their placeholder JSON with `Content-Type: application/json`.
5. `/privacy` and `/support` are what the Play Console and App Store Connect fields will point at;
   both render without JavaScript.

## Owner actions (only you can do these)

1. Cloudflare dashboard: connect `remana-labs/remana-site` to a new Pages project; create the D1
   database and the Turnstile widget (or approve me running `wrangler` with a scoped API token — say
   which); set the apex and `www` records. **Note the recovery rule from memory: the Cloudflare
   account stays on the Gmail address.**
2. Edit the copy: the home promise, the About page, the privacy policy's plain-English sentences.
3. Pick the three screenshots (I capture candidates from the S22).
4. Before production on Play: lawyer review of `/privacy` and `/terms`.

## What was rejected, and why

| option | why not |
|---|---|
| hand-written HTML | six pages of duplicated chrome; every future page (changelog, press updates) is another copy |
| Framer / Webflow | monthly cost, brand tokens and the policy in a vendor, no PR review, no repo |
| Next.js | a server runtime for a site with no server logic |
| third-party waitlist service | a third party holding the list, and a line in the privacy policy we would rather not need |
| Google Fonts / Google Analytics | third-party requests on a privacy-first site |
| a web app now | nothing to show: memory is device-bound (Track C decides otherwise, or not) |

## Sources

- [Cloudflare Pages free tier limits 2026](https://dev.to/david_viejo_4d48fdfa7cfff/cloudflare-pages-free-tier-limits-pricing-2026-1f8f), [Cloudflare free plan limits](https://infiniteagent.io/blog/cloudflare-review-2026/), [Turnstile pricing](https://prosopo.io/tools/cloudflare-turnstile-pricing/)
- [Astro in 2026 / the Cloudflare acquisition](https://dev.to/polliog/astro-in-2026-why-its-beating-nextjs-for-content-sites-and-what-cloudflares-acquisition-means-6kl), [Cloudflare Pages Static Forms plugin](https://developers.cloudflare.com/pages/functions/plugins/static-forms/)
- [Play Data safety section](https://support.google.com/googleplay/android-developer/answer/10787469), [Play data safety 2026 changes](https://respectlytics.com/blog/google-play-data-safety-guide/)
- [Apple App Review Guidelines §5.1.1](https://developer.apple.com/app-store/review/guidelines/), [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- [Universal & App Links 2026](https://dev.to/marko_boras_64fe51f7833a6/universal-deep-links-2026-complete-guide-36c4)
