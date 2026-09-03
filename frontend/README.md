# KrishiNayan Frontend

Next.js farmer/officer frontend for KrishiNayan.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001
NEXT_PUBLIC_ENABLE_OFFLINE_SW=false
```

Use `NEXT_PUBLIC_ENABLE_OFFLINE_SW=true` only when testing offline behavior
locally. Service workers can keep cached files around, so switch it back to
`false` after testing if you want normal dev refresh behavior.

## Offline Mode

The production app registers `/sw.js` as a PWA service worker. It caches the
main farmer journey pages, app assets, fonts, icons, the realistic field
background, and recent GET responses for weather, soil, profile, plots,
recovery, policy, alert and crop-health reads.

New disease scans still need the backend model. When the browser is offline,
the scan page now says that clearly instead of pretending to run inference.
