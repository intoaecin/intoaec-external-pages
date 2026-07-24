# intoaec-external-pages Agent Instructions

Public Next.js (Pages Router) app for external lead capture forms (V1 + V2).

## Scope

- Own only public routes: `/leadCapture*`, `/leadCaptureV2/[id]`.
- Admin builders stay in `intoaec-UI` (`/preferences/lead-capture`, `/lead-capture-v2`).
- Prefer fixing public capture flows here; do not reintroduce auth-gated admin UI.

## Stack

- Next.js 14 Pages Router, React 18, MUI 5, TanStack Query, axios, ni18n/i18next, pullstate.

## Conventions

- Keep API calls on `useAxios` with `withAuth=false` for public endpoints; send `NEXT_PUBLIC_APIKEY`.
- Resolve org via subdomain (`OrganizationDetailsProvider` / `GET_ORGANIZATION_WITH_DOMAIN`).
- Do not run `npm run type-check` or `npm run build` unless the user asks; when verifying locally, prefer focused fixes over full rebuilds if the user forbids build gates.
- Do not add unit tests unless explicitly requested.
- Keep locale keys in sync under `public/locales/*/translation.json` for any new user-facing strings.

## Env

Copy `.env.sample` → `.env`. Required public endpoints mirror intoaec-UI lead-capture usage (`LEADMANAGER`, `USERHUB`, `PROPOSAL`, `MEETANDNOTE`, `AECPOSTMAN`, `APIKEY`, maps key).
