# DPK

Next.js application deployed to Cloudflare Workers with the OpenNext Cloudflare adapter.

## Local development

```bash
npm install
npm run dev
```

To build and preview in the Cloudflare Workers runtime:

```bash
npm run preview
```

## Deploy to Cloudflare

This app uses server rendering and an API route. Deploy it as a **Cloudflare Worker**, not a Cloudflare Pages project. Pages expects a static output directory such as `.vercel/output/static`; OpenNext instead generates `.open-next/worker.js` and `.open-next/assets`.

For a direct deployment from a configured Cloudflare account, run:

```bash
npm run deploy
```

For automatic deployments from GitHub, connect the repository through **Workers & Pages > Create application > Import a repository** (or connect the repository under an existing Worker at **Settings > Builds**). Configure:

- Root directory: `/`
- Production branch: `main`
- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx wrangler deploy`
- Worker name: `dashboard-next`, matching `name` in `wrangler.toml`

Do not set a Pages build output directory. Add application-specific runtime variables and secrets in the Worker settings before deploying.

See the [OpenNext Cloudflare guide](https://opennext.js.org/cloudflare/get-started) and [Cloudflare Workers Builds documentation](https://developers.cloudflare.com/workers/ci-cd/builds/) for details.
