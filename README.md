# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Local development

```bash
npm install
npm run dev                       # the static site
npm run build && npx wrangler pages dev dist   # site + the waitlist Function against a LOCAL D1
```

For the Function locally: `npx wrangler d1 migrations apply remana-waitlist --local` once, and a
`.dev.vars` file (gitignored) containing `TURNSTILE_SECRET=1x0000000000000000000000000000000AA`
(Cloudflare's always-pass test secret; the form's matching test site key is the default in
`src/components/Waitlist.astro`). `npm test` runs vitest and the internal link check.

## Operations

- **Deployed how:** `remana-site` is a direct-upload Cloudflare Pages project. Every push to `main`
  deploys from CI (`.github/workflows/ci.yml`: the build that passed the tests is the one uploaded)
  using the repo secrets `CLOUDFLARE_API_TOKEN` (a token scoped to Account → Cloudflare Pages → Edit,
  nothing else) and `CLOUDFLARE_ACCOUNT_ID`. Pull requests build and test but never deploy. By hand,
  with the same two variables exported:
  `PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAFFBWo8mbSSlV_Qw npm run build && npx wrangler pages deploy dist --project-name remana-site --branch main`.
  Bindings (D1 for production and preview) come from `wrangler.toml`; `TURNSTILE_SECRET` is a Pages
  secret (`npx wrangler pages secret put`).
- **Export the waitlist:** `npx wrangler d1 execute remana-waitlist --remote --command "select * from waitlist" --json`
- **Rotate the Turnstile secret:** Cloudflare dashboard → Turnstile → the widget → rotate; then
  `npx wrangler pages secret put TURNSTILE_SECRET --project-name remana-site`; no redeploy needed.
- **Domains:** `remana.ai` and `www.remana.ai` are custom domains on the project (proxied CNAMEs to
  `remana-site.pages.dev`). `api.remana.ai` is the separate gateway Worker.
