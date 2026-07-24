# intoaec-lead-capture

Public Next.js app for **external** lead capture forms extracted from `intoaec-UI`.

## Routes

| Path | Description |
|------|-------------|
| `/leadCapture` | V1 public form (org subdomain) |
| `/leadCapture/[projectSource]` | V1 with traffic source |
| `/leadCapture/thankYou` | V1 thank-you |
| `/leadCapture/customer-portal/[leadId]` | V1 legacy / portal prefill |
| `/leadCaptureV2/[leadCaptureV2Id]` | V2 public form |

Admin / preference builders stay in `intoaec-UI` (`/preferences/lead-capture`, `/lead-capture-v2`).

## Setup

```bash
cp .env.sample .env
# fill endpoints + API key from intoaec-UI env
npm install
npm run dev
```

Dev server defaults to port **3001**.

## Notes

- All routes are public (no auth middleware gate).
- Org is resolved from subdomain via `OrganizationDetailsProvider` (`GET_ORGANIZATION_WITH_DOMAIN`).
- Point org custom domains / reverse proxy at this app for `/leadCapture*` and `/leadCaptureV2*`.
