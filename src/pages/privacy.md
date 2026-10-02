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
Cloudflare. Speech-to-text and the language model answer a request and discard it: they do not
store your audio, transcripts or memory. Two exceptions, stated plainly, and one thing you choose:

- Speaker recognition accepts a recording in parts, so it holds the audio on the server **for up to
  one hour** while the parts arrive and the job runs, then deletes it.
- The language-model server's **request logs** can currently include transcript text. They are
  operational logs on the server itself, not a database, not backed up, and gone when the server
  process is replaced. We are turning that logging off; this page will change when it is.
- **Backup, if you turn it on** — see below. It is the only place your memory is stored on our side,
  and it is encrypted so that we cannot read it.

## Backup

Backup is off until you turn it on. When it is on, your phone makes an encrypted copy of your memory
store — meetings, transcripts, facts, people, voiceprints and settings, but **not your recordings**
unless you include a particular recording yourself (at most ten) — and uploads it to our storage at
Cloudflare. The copy is encrypted on your phone with a key that never leaves your devices in a form
we can use: you keep a recovery code, and your phone's own backup (Google's, end-to-end encrypted
with your screen lock) can hold the key so a new phone of the same kind restores without the code.
**We cannot read your backups, and we cannot recover your code.**

A meeting you delete leaves our backups within 7 days of your next backup. Deleting your account
removes all of your backups immediately.

## What stays on your phone

Your memory store — meetings, people, facts, commitments, questions — your transcripts, and your
voiceprints. The store is encrypted with a key that lives in your phone's secure hardware. Voice
identification (matching a voice to a person you named) runs entirely on the phone; voiceprints
never leave it except inside your encrypted backup, if you turn backup on, which we cannot read.

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

Deleting a meeting in the app deletes it from your phone, and from our backups within 7 days of your
next backup. Apart from your encrypted backups, our servers hold no copy to delete, except a
speaker-recognition job still inside its one-hour window and the request logs described above.
Uninstalling the app destroys the phone's store encryption key and, with it, the store on that phone
(a backup, if you made one, stays restorable with your recovery code). **Settings → Delete account and
backups** removes your account and every backup at once; the memory on your phone stays. You can
also write to [hello@remana.ai](mailto:hello@remana.ai).

## This website

If you join the waitlist, we store the email address you give us, the time, and the page you gave it
on — nothing else — in a database we operate at Cloudflare, until you ask us to remove it. Web
Analytics on this site is cookieless and does not identify you. This site sets no cookies.

## Children

Remana is not intended for anyone under 16, and we do not knowingly hold their data.

## Contact

[hello@remana.ai](mailto:hello@remana.ai)

## Changes to this policy

- **2026-10-01** — encrypted backup (optional), its deletion window, and in-app account deletion.
- **2026-09-27** — first version, written for internal testing.

</div>
