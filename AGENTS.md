# intoaec-external-pages Agent Instructions

Public Next.js (Pages Router) app for external lead capture forms (V1 + V2).

## Scope

- Own only public routes: `/leadCapture*`, `/leadCaptureV2/[id]`, `/architectAvailableSlots*`, `/proposal/[leadProposalId]` (client-facing proposal view/accept/sign page), `/client-boq/[clientEstimateId]` (client-facing estimate view/accept/sign page), `/rfq-preview/[rfqid]` (vendor-facing RFQ view/comment page), `/po-preview/[poid]` (vendor-facing Purchase Order / Work Order view/comment page — one route/component handles both via the `isWorkOrder` data flag), `/change-order-preview/[changeOrderId]` (client-facing change order view/accept/sign page), `/client-report` (client-facing Client Report + Daily Log preview — query-param driven, `?clientReportId=<id>` or `?dailyLogId=<id>`, no dynamic path segment; one route/component handles both via the `isDailyLogPreview` flag).
- Admin builders stay in `intoaec-UI` (`/preferences/lead-capture`, `/lead-capture-v2`, architect availability prefs, proposal template/builder/analytics UI under `client/profile/proposal`, `leadmanager/profile/proposal`, `template-center/proposal`).
- Prefer fixing public capture / booking / proposal-viewing flows here; do not reintroduce auth-gated admin UI.

## Stack

- Next.js 14 Pages Router, React 18, MUI 5, TanStack Query, axios, ni18n/i18next, pullstate.

## Conventions

- Keep API calls on `useAxios` with `withAuth=false` for public endpoints; send `NEXT_PUBLIC_APIKEY`.
- Hydrate env via `/api/publicEnv` (same as intoaec-UI) so server `APIKEY` maps to `NEXT_PUBLIC_APIKEY` for FETCH_THEME / BIND_MACRO_VALUES.
- Resolve org via subdomain (`OrganizationDetailsProvider` / `GET_ORGANIZATION_WITH_DOMAIN`).
- Do not run `npm run type-check` or `npm run build` unless the user asks; when verifying locally, prefer focused fixes over full rebuilds if the user forbids build gates.
- Do not add unit tests unless explicitly requested.
- Keep locale keys in sync under `public/locales/*/translation.json` for any new user-facing strings.

## Env

Copy `.env.sample` → `.env`. Required public endpoints mirror intoaec-UI lead-capture usage (`LEADMANAGER`, `USERHUB`, `PROPOSAL`, `MEETANDNOTE`, `AECPOSTMAN`, `APIKEY`, maps key). Set either `APIKEY` or `NEXT_PUBLIC_APIKEY`; `/api/publicEnv` exposes `APIKEY` as `NEXT_PUBLIC_APIKEY` at runtime.

Proposal view/sign analytics (`REGISTER_PROPOSAL_ANALYTICS`) POST to `${VITE_AEC_PORTAL_URL}/api/add-to-queue` — this app has no server of its own (static Vite build), so the event is forwarded to `intoaec-UI`'s existing `/api/add-to-queue` route, which owns the AWS SQS credentials.

RFQ preview's PDF download (`RfqClientHeader`) fetches `${VITE_AEC_PORTAL_URL}/client-rfqexport?params=...` for the SSR HTML used to build the PDF, same forwarding pattern as the estimate preview above. Unlike `/createEstimatePreview`, `/client-rfqexport` is not yet CORS-enabled in intoaec-UI's `next.config.js` — that page will fail cross-origin until CORS headers are added there for that route. PO/WO preview's PDF download (`PoClientHeader` → `usePdfDownload`) is self-contained (clones the on-page DOM and posts straight to `VITE_AEC_CHATBOT_ENDPOINT`), so it needs no forwarding or CORS change.

Change order preview's PDF download (`ChangeOrderAcceptAndSignHeader` via the page's `handleDownloadPdf`) fetches `${VITE_AEC_PORTAL_URL}/createChangeOrderPreview?changeOrderId=...` for the SSR HTML, same forwarding pattern as the estimate/RFQ PDF flows above. Like `/client-rfqexport`, `/createChangeOrderPreview` is not yet CORS-enabled in intoaec-UI's `next.config.js` — that download will fail cross-origin until CORS headers are added there. The change order page's Stripe "Pay Now" link generation was ported as-is (self-contained USERHUB/apiKey calls), but it points at `/estimatePayments/checkout-payment`, which has not been ported into this app and is out of scope — that button will 404 until that flow is built here.

`/client-report`'s PDF download (`downloadClientReportPdf` in `features/ClientReport/utils/clientReportPdf.ts`) is self-contained like PO/WO's: it clones the on-page DOM (a hidden `pdfReportRef` element, same technique as the source), inlines computed styles and external resources, and posts straight to `${VITE_AEC_CHATBOT_ENDPOINT}/download-pdf` — no separate SSR page fetch, so it needs no CORS forwarding. Several of this page's admin-only next-auth-pulling hooks (`useCreateClientReport`, `useUpdateClientReport`, `useCreateDailyLog`, `useUpdateDailyLog`, `useFetchDailyLogTimesheets`, and the org-id/type `useSession()` fallback inside `useClientReportSchedules`/`useClientReportTasks`/`useClientReportInventory`/`useClientReportWorkers`/`useClientReportAttachmentUpload`) were dropped rather than ported, since they're only reachable from the admin "Save"/"Create" actions inside `PageLayout` — itself unreachable here, same as elsewhere in this app.
