# intoaec-external-pages

Public Vite + React application for external lead capture and architect booking flows.

## Public routes

| Path | Description |
| --- | --- |
| `/leadCapture` | V1 public form resolved from the organization subdomain |
| `/leadCapture/:projectSource` | V1 form with a traffic source |
| `/leadCapture/thankYou` | V1 confirmation page |
| `/leadCapture/customer-portal/:leadId` | V1 customer-portal prefill flow |
| `/leadCaptureV2/:leadCaptureV2Id` | V2 public form |
| `/architectAvailableSlots` | Public architect consultation booking |
| `/architectAvailableSlots/:projectId` | Booking for an existing lead/project |
| `/architectAvailableSlots/thankYou` | Booking confirmation |

Admin and preference builders remain in `intoaec-UI`.

## Local development

```bash
cp .env.sample .env
npm install
npm run dev
```

The development server runs on `http://localhost:3001`. Vite exposes values from
the local `.env` through its development-only `/runtime-env.json` middleware.
`APIKEY` is mapped to `NEXT_PUBLIC_APIKEY` when the latter is absent.

## Runtime configuration

Production configuration is loaded from `/runtime-env.json` before any route or
API request renders. This keeps the `dist/` bundle environment-independent.
Replace `dist/runtime-env.json` during deployment with a JSON object using the
existing names, for example:

```json
{
  "NEXT_PUBLIC_LEADMANAGER_ENDPOINT": "https://leadmanager.example.com",
  "NEXT_PUBLIC_USERHUB_ENDPOINT": "https://userhub.example.com",
  "NEXT_PUBLIC_MEETANDNOTE_ENDPOINT": "https://meetandnote.example.com",
  "NEXT_PUBLIC_PROPOSAL_ENDPOINT": "https://proposal.example.com",
  "NEXT_PUBLIC_AECPOSTMAN_ENDPOINT": "https://postman.example.com",
  "NEXT_PUBLIC_APIKEY": "public-api-key",
  "NEXT_PUBLIC_GOOGLE_MAP_APIKEY": "maps-key",
  "NEXT_PUBLIC_WEBSITE_URL": "https://www.example.com",
  "NEXT_PUBLIC_INTOAEC_LOGO": "https://assets.example.com/logo.svg",
  "NEXT_PUBLIC_DEFAULT_ORGANIZATION_TYPE": "ARCHITECT",
  "NEXT_PUBLIC_CURRENT_ENV": "production"
}
```

The API key is already sent by the public browser application and must not be
treated as a server secret. Never commit a populated production configuration.

## Build

```bash
npm run build
npm run preview
```

The static deployment artifact is `dist/`. Source maps are disabled.

## S3 and CloudFront

1. Build the app, replace `dist/runtime-env.json`, and upload the contents of
   `dist/` to a private S3 bucket.
2. Use the S3 REST origin with CloudFront Origin Access Control; do not use the
   public S3 website endpoint.
3. Attach a CloudFront Function on **viewer request** to serve the SPA shell for
   clean public URLs:

```js
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var prefixes = ["/leadCapture", "/leadCaptureV2", "/architectAvailableSlots"];
  var isAppRoute = uri === "/";

  for (var i = 0; i < prefixes.length && !isAppRoute; i += 1) {
    isAppRoute = uri === prefixes[i] || uri.indexOf(prefixes[i] + "/") === 0;
  }

  var lastSegment = uri.substring(uri.lastIndexOf("/") + 1);
  if (isAppRoute && lastSegment.indexOf(".") === -1) {
    request.uri = "/index.html";
  }

  return request;
}
```

4. Use caching-disabled policies for the default behavior and
   `/runtime-env.json`. Add cache-optimized behaviors for `/assets/*` and
   `/images/*`; Vite asset filenames are content-hashed.
5. Invalidate `/index.html` and `/runtime-env.json` after deployment.
6. Configure the required wildcard/custom domains in CloudFront, ACM, and DNS.
   Organization lookup uses the first hostname segment, so the original viewer
   `Host` must reach the application unchanged.

API services must allow the deployed organization origins through CORS.
