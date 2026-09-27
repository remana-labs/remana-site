---
layout: ../layouts/Base.astro
title: Privacy
description: What Remana records, what leaves your phone, what stays on it, and how to delete it.
---

# Privacy policy

<div class="prose">

Remana is a meeting memory. This page says, in plain words, what the app collects, where it goes,
and what you can do about it. Every sentence here describes how the software works today; if the
software changes, this page changes first, with a dated entry at the bottom.

## What Remana does

You record a meeting on your phone. Remana turns the recording into a transcript, then into memory:
facts, commitments and open questions, attributed to the people who said them. Each item is marked
as either **said** (it appears in the transcript) or **inferred** (Remana derived it), so you can
always tell the two apart.

## What leaves your phone, and where it goes

- **The audio you record** is sent to our speech-to-text service to produce a transcript, and to our
  speaker-recognition service to tell voices apart.
- **The transcript** is sent to our language-model service to extract memory items, and, when you
  ask for a briefing or ask Remana a question, the relevant parts of your memory are sent to it to
  produce the answer.

All three services run on servers we operate, reached through `api.remana.ai`, which is fronted by
Cloudflare. Speech-to-text and the language model process a request and keep nothing after it.
Speaker recognition accepts a recording in parts, so it holds the audio on the server **for up to one
hour** while the parts arrive and the job runs, then deletes it. No transcript and no memory is
stored on our servers.

## What stays on your phone

Your memory store — meetings, people, facts, commitments, questions — your transcripts, and your
voiceprints. The store is encrypted with a key that lives in your phone's secure hardware. Voice
identification (matching a voice to a person you named) runs entirely on the phone; **voiceprints
never leave it.**

## Your account

Sign-in is with Google, through Firebase Authentication. We hold your account identifier and email
address, and use them only to authorise your phone's access to the services above. Signing out
removes the access token from the phone and leaves everything already on it readable. Capture,
search and on-device briefings keep working without an account.

## Third parties

- **Google** — Firebase Authentication for sign-in.
- **Cloudflare** — hosts this website and `api.remana.ai`, provides the spam check on the waitlist
  form (Turnstile) and cookieless analytics for this website (Web Analytics).

There is no advertising, no analytics or tracking SDK inside the app, and nothing is sold or shared
for profiling.

## Deleting your data

Deleting a meeting in the app deletes it from your phone; nothing about it exists on our servers to
delete. Uninstalling the app destroys the store's encryption key and, with it, the store. To have
your account identifier and email removed, write to [hello@remana.ai](mailto:hello@remana.ai).

## This website

If you join the waitlist, we store the email address you give us, the time, and the page you gave it
on — nothing else — in a database we operate at Cloudflare, until you ask us to remove it. Web
Analytics on this site is cookieless and does not identify you. This site sets no cookies.

## Children

Remana is not intended for anyone under 16, and we do not knowingly hold their data.

## Contact

[hello@remana.ai](mailto:hello@remana.ai)

## Changes to this policy

- **2026-09-27** — first version, written for internal testing.

</div>
