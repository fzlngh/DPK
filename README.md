# DPK

Next.js application deployed on Vercel.

## Local development

```bash
npm install
npm run dev
```

To run a production build locally:

```bash
npm run build
npm run start
```

## Deploy to Vercel

Import this repository into Vercel and keep the detected **Next.js** framework settings. Use the repository root as the root directory and `npm run build` as the build command; leave the output directory at its default. Configure `MIDTRANS_SERVER_KEY` and `NEXT_PUBLIC_BASE_URL` in the Vercel project environment settings for production payments and callbacks.
