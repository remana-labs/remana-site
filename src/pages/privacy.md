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
- **People's names** go with them: the names of the people in your meetings, including names from
  your calendar and contacts if you connected them. When a calendar invitee has no name, their email
  address is used as the name. Contacts' phone numbers and email addresses are not sent.

These services run on servers we operate, reached through `api.remana.ai`, which is fronted by
Cloudflare. Speech-to-text and the language model answer a request and discard it: they do not
store your audio, transcripts or memory, and the language model's logs record request counts and
speed, **not your text**. The exceptions, stated plainly, and one thing you choose:

- Speaker recognition accepts a recording in parts. It holds the audio while the parts arrive and
  the job runs, and deletes it as soon as the job ends, or after **one hour** if the job has not run
  by then; an upload that stops halfway is deleted an hour after its last part. The result — who spoke when, and a voice signature per speaker so your phone can match
  voices to people — is kept for up to one hour so your phone can collect it, and only your account
  can read it.
- **On iPhone**, a finished recording is processed by our meeting service: it receives the audio,
  turns it into a transcript and memory, and holds that until your phone collects it. It deletes it
  then, and at the latest after 72 hours. Deleting your account removes anything it is still holding
  for you, at once.
- **Backup, if you turn it on** — see below. It is encrypted so that we cannot read it. Apart from
  the two above, it is the only place your memory is kept on our side.

## Backup

Backup is off until you turn it on. When it is on, your phone makes an encrypted copy of your memory
store — meetings, transcripts, facts, people, voiceprints and settings, but **not your recordings**
unless you include a particular recording yourself (at most ten) — and uploads it to our storage at
Cloudflare. The copy is encrypted on your phone with a key that never leaves your devices in a form
we can use: you keep a recovery code, and your phone's own backup (Google's, end-to-end encrypted
with your screen lock) can hold the key so a new phone of the same kind restores without the code.
**We cannot read your backups, and we cannot recover your code.**

Each backup also carries a few unencrypted labels so that we can store and list it: when it was
made, its size, the app version and platform, a random identifier for the device that made it, and
the phone's model name (for example "SM-S901B" — never the name you gave your phone).

A meeting you delete leaves our backups within 7 days of your next backup. Deleting your account
removes all of your backups immediately.

## What stays on your phone

Your memory store — meetings, people, facts, commitments, questions — your transcripts, and your
voiceprints (the voices you have named). The store is encrypted with a key that lives in your phone's
secure hardware. Voice
identification (matching a voice to a person you named) runs entirely on the phone; voiceprints
never leave it except inside your encrypted backup, if you turn backup on, which we cannot read.

## Your account

Sign-in is with Google, through Firebase Authentication. We hold your account identifier and email
address, and use them only to authorise your phone's access to the services above. Signing out
removes the access token from the phone and leaves everything already on it readable. Capture,
search and on-device briefings keep working without an account.

## Asking by voice

If you ask Remana a question by speaking, Android turns your voice into text **on the phone**; the
microphone button only appears on phones that can do that. On iPhone, Apple's speech recognition
does it, and Apple may process the audio on its servers.

## Third parties

- **Google** — Firebase Authentication for sign-in.
- **Apple** — speech recognition for spoken questions on iPhone (see above).
- **Hugging Face** — the app downloads its on-device models from Hugging Face when it first needs
  them, which shows Hugging Face your IP address. Nothing about you or your meetings is sent.
- **Cloudflare** — hosts this website and `api.remana.ai`, provides the spam check on the waitlist
  form (Turnstile) and cookieless analytics for this website (Web Analytics).

There is no advertising, no analytics or tracking SDK inside the app, and nothing is sold or shared
for profiling.

## Deleting your data

Deleting a meeting in the app deletes it from your phone, and from our backups within 7 days of your
next backup. Apart from your encrypted backups, our servers hold no copy to delete, except a
speaker-recognition job still inside its one-hour window and, on iPhone, a meeting our meeting
service has not handed back yet (72 hours at most; deleting your account removes it at once).
Uninstalling the app destroys the phone's store encryption key and, with it, the store on that phone
(a backup, if you made one, stays restorable with your recovery code). **Settings → Delete account and
backups** removes your account and every backup at once; the memory on your phone stays. You can
also write to [hello@remana.ai](mailto:hello@remana.ai).

## This website

If you join the waitlist, we store the email address you give us, the time, and the page you gave it
on — nothing else — in a database we operate at Cloudflare, until you ask us to remove it. Web
Analytics on this site is cookieless and does not identify you. This site sets no cookies.

## Children

Remana is not intended for anyone under 18, and we do not knowingly hold their data.

## Contact

[hello@remana.ai](mailto:hello@remana.ai)

## Changes to this policy

- **2026-10-11** — what goes with your questions (people's names, including from your calendar and
  contacts); the iPhone meeting service; speaker recognition's one-hour limit and who can read its
  result; the language-model logs no longer include text; asking by voice; Hugging Face model
  downloads; backup labels; minimum age 18.
- **2026-10-01** — encrypted backup (optional), its deletion window, and in-app account deletion.
- **2026-09-27** — first version, written for internal testing.

</div>
