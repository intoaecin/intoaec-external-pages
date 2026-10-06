# intoaec-external-pages Agent Instructions

Public Next.js (Pages Router) app for external lead capture forms (V1 + V2).

## Scope

- Own only public routes: `/leadCapture*`, `/leadCaptureV2/[id]`, `/architectAvailableSlots*`, `/proposal/[leadProposalId]` (client-facing proposal view/accept/sign page), `/client-boq/[clientEstimateId]` (client-facing estimate view/accept/sign page), `/rfq-preview/[rfqid]` (vendor-facing RFQ view/comment page), `/po-preview/[poid]` (vendor-facing Purchase Order / Work Order view/comment page — one route/component handles both via the `isWorkOrder` data flag), `/change-order-preview/[changeOrderId]` (client-facing change order view/accept/sign page), `/progress-claim-preview/[progressClaimId]` (client-facing progress claim review/sign-and-accept/reject page), `/client-report` (client-facing Client Report + Daily Log preview — query-param driven, `?clientReportId=<id>` or `?dailyLogId=<id>`, no dynamic path segment; one route/component handles both via the `isDailyLogPreview` flag), `/subscription/checkout-payment` (external/token-based subscription checkout — real Stripe Elements card entry, plan review, billing summary; arrives via encrypted `?data=` query param, decrypted with `decryptAES`), `/subscription/addCard` (token-based add-payment-card iframe flow; arrives via encrypted `?token=`), `/subscription/payment-success` and `/subscription/payment-failed` (static outcome pages for the checkout flow).
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

Proposal / estimate / sales-order view, time-spent and download analytics (`REGISTER_*_ANALYTICS`) go through `useRegisterAnalytics`, which posts straight to the Proposal service's public events (`/lead-proposals`, `/lead-estimate`, `/lead-sales-order`) with the apiKey. There is no intoaec-UI `/api/add-to-queue` hop, so this app needs no AWS/SQS credentials.

All client-facing PDF downloads (proposal aside, which rasterises pages with `downloadProposalPdf`) are self-contained: they clone an on-page DOM element via `usePdfDownload` and post it to `${VITE_AEC_CHATBOT_ENDPOINT}/download-pdf`, with no intoaec-UI export page and no CORS dependency. RFQ (`RfqClientHeader`) and PO/WO (`PoClientHeader`) clone the visible `#rfq-preview-pdf` element. Estimate/sales order (`BoqAcceptAndSignInHeader` → `#estimate-pdf`) and change order (`#change-order-pdf`) clone an off-screen `pdf`/`printMode` render mounted next to the live preview. That render is the same component intoaec-UI's `/createEstimatePreview` and `/createChangeOrderPreview` render.

The change order page's Stripe "Pay Now" link generation was ported as-is (self-contained USERHUB/apiKey calls), but it points at `/estimatePayments/checkout-payment`, which has not been ported into this app and is out of scope. That button will 404 until that flow is built here.

`/client-report`'s PDF download (`downloadClientReportPdf` in `features/ClientReport/utils/clientReportPdf.ts`) is self-contained like PO/WO's: it clones the on-page DOM (a hidden `pdfReportRef` element, same technique as the source), inlines computed styles and external resources, and posts straight to `${VITE_AEC_CHATBOT_ENDPOINT}/download-pdf` — no separate SSR page fetch, so it needs no CORS forwarding. Several of this page's admin-only next-auth-pulling hooks (`useCreateClientReport`, `useUpdateClientReport`, `useCreateDailyLog`, `useUpdateDailyLog`, `useFetchDailyLogTimesheets`, and the org-id/type `useSession()` fallback inside `useClientReportSchedules`/`useClientReportTasks`/`useClientReportInventory`/`useClientReportWorkers`/`useClientReportAttachmentUpload`) were dropped rather than ported, since they're only reachable from the admin "Save"/"Create" actions inside `PageLayout` — itself unreachable here, same as elsewhere in this app.

The subscription checkout flow (`/subscription/checkout-payment`, `/subscription/addCard`, `/subscription/payment-success`, `/subscription/payment-failed`) is the first port in this app to use the real Stripe SDK — `@stripe/react-stripe-js` and `@stripe/stripe-js`, pinned to the same versions as `intoaec-UI`. `CheckoutPageHome.tsx` and its five `features/checkoutPage/*` sub-components (`ClientAndBilledToInformation`, `PaymentMethod`, `PlanDetails`, `ReviewAndSummary`) all pulled `useSession()` from `next-auth/react` in the source; every usage had (or, once dropped, is functionally equivalent to) an `externalData?.x` fallback already reachable from the encrypted `?data=` token payload, since `useSession()` never resolves a session on this public route anyway — see the port's commit/report for the line-by-line justification. `/subscription/addCard` decrypts a `?token=` query param via `decryptAES` for client info plus a per-org Stripe publish key, falling back to `NEXT_PUBLIC_STRIPE_PUBLISH_KEY` (mapped to `VITE_STRIPE_PUBLISH_KEY`) when the token doesn't carry one — that env var is intentionally left unset in `.env`/`.env.sample`, matching `intoaec-UI`'s own (also-unset) `NEXT_PUBLIC_STRIPE_PUBLISH_KEY`.

`/progress-claim-preview/[progressClaimId]` is a port of intoaec-UI's client accept page (`features/projectSchedule/progressClaim/external/ProgressClaimAcceptPage`): Summary (details, parties, statement), one accept sheet per phase (top-level schedules with no children share a single "Standalone Schedules" sheet), a Change Order tab, each line's attachments behind a paperclip button on its row in the phase sheet (there is no Attachments tab), the read-only Materials / Resources / Assets planner tabs (shown per the project's claim settings), a read-only Quantity planner tab (always shown; it has no setting), attendance-based wages on the Resources tab's schedule and worker rows (Procurement `GET_WAGE_DETAILS_BY_PROJECT_ID` / `GET_WORKER_WAGE_DETAILS_BY_SHIFT_ID`, called with the apiKey plus the claim's organization id/type and limited to the claim period), Sign & Accept, Reject with reason, and the Excel download (aec-botsync `/api/exports/excel`, via `VITE_BOTSYNC_AI` or, when that is unset, `VITE_AEC_CHATBOT_ENDPOINT`). The source fetches the claim in `getServerSideProps`; here `useFetchProgressClaimById(id, false)` makes the same apiKey-only `FETCH_PROGRESS_CLAIM_BY_ID` call from the browser, and only `SENT`/`ACCEPTED`/`REJECTED` claims render (anything else shows the fallback page).

The planner tabs bring in the read-only half of intoaec-UI's Planner (`features/projectSchedule/components`, `helpers`, `hooks`, `utils`, `types`, plus `worker-management/hooks/useGetShifts` for its types). Everything that needs a session, a socket or a mutation was trimmed rather than ported:

- `context/ScheduleProvider.tsx` — only the context, its type, the inert default and `useProjectSchedule`; the claim's `ProgressClaimScheduleProvider` fills it. The full provider (next-auth, socket.io, schedule/baseline mutations) is not here.
- `hooks/api/fetch-working-calendar.ts` — types, defaults and normalizers; `useFetchWorkingCalendar` returns the default calendar (the source hook is session-gated and resolves to the same defaults on its own client page).
- `components/createScheduleModal/ScheduleShiftGridCell.tsx` — attendance badge only, no `ShiftDayQuickEditor` popover.
- `hooks/usePlannerData.ts` — the `PlannerScheduleEntry` type only.
- `components/planner/PlannerMaterialTable.tsx` — no cost-catalog preload query (session-gated in the source), and without the `CustomTable` props this app's table lacks (`preserveHeaderOnSelection`, `isRowSelectionDisabled`, `rowSelectionDisabledTooltip`, `highlightRowsOnHover`).
- `hooks/useWorkloadGanttTimeline.ts` — imports `getSchedulePosition` from `helpers/schedulePositioning` directly; the `helpers/utils` barrel (schedule mutations, `clsx`) is not ported.
- Also trimmed from the first pass: `create-progress-claim.ts` (types only), `useChangeOrderClaimDraft.ts` (line type only), `progressClaimCache.ts` (single-claim cache only), `types/schedule.ts` (no `addDependency`), `ProgressClaimDetailsFields` (read-only), and `ProgressClaimLineAttachmentsViewDialog` (uses this app's `AttachmentPreviewTiles` instead of `AttachmentUploader`).

No packages were added (`next-auth` and `socket.io-client` stay out of this app).
