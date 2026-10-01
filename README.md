# SpendFlow

A personal, single-user salary and expense planner. SpendFlow signs in with
your own Google account and uses a Google Sheet you own as its only database
— there is no backend server and no third-party database. It's built to be
deployed as a static site on GitHub Pages and used by exactly one person: you.

## 1. Project Overview

Every month, SpendFlow helps you answer three questions:

- What's my salary this month, and what's left after planned spending?
- Which recurring commitments (rent, loans, bills) are due, and have I paid
  them?
- What one-off things did I spend on, and am I overdue on anything?

You set up **presets** once (e.g. "Home Loan, ₹10,000/month, Jan–Jun 2027"),
and SpendFlow automatically generates the right line items for whatever month
you're viewing — no re-entering recurring expenses every month. Everything is
stored in a Google Sheet you control, so your financial data never touches a
third-party server.

## 2. Features

- **Google sign-in, single-user by design.** Only the one Google account you
  configure can ever see data — every other account is turned away with an
  explicit "Access denied" screen.
- **Recurring presets with start/end months.** A loan with a 6-month term and
  an indefinite rent payment use the exact same mechanism — just set
  (or omit) an end month. No special-cased "loan" logic anywhere.
- **Automatic, idempotent monthly generation.** Opening a month generates its
  regular items from active presets on the fly; re-opening it never creates
  duplicates (deterministic `presetId + month` IDs).
- **Paid / Pending / Overdue tracking**, with one-tap "Mark Paid" / "Mark
  Pending" — no page navigation required.
- **Real-time dashboard**: planned vs. paid vs. pending vs. overdue totals,
  completion percentages, and two lightweight breakdown charts.
- **Full preset CRUD** — create, edit, deactivate (never hard-deleted, since
  historical months may still reference a preset).
- **Mobile, tablet, and desktop layouts** from one responsive codebase —
  purpose-built mobile cards and bottom navigation, not a shrunk desktop UI.
- **Installable PWA.** Add SpendFlow to your phone's home screen for a
  full-screen, app-like launch — same app, same URL, no app store.
- **No backend.** Static React app + Google Sheets API + Google Identity
  Services. Deploys as plain static files.

## 3. Architecture

```
Browser (React SPA)
  │
  ├─ Google Identity Services  — OAuth sign-in, access token (in-memory only)
  │
  └─ Google Sheets API         — all reads/writes, using that access token
         │
         └─ Your Google Sheet  — the only datastore; you own and control it
```

There is no server component. The app is a static bundle served by GitHub
Pages; all authentication and data access happens directly from the browser
to Google's APIs using the signed-in user's own OAuth token. See
[Security notes](#security-notes) for what that does and doesn't protect
against.

Inside the app, the finance logic is deliberately split into a **pure layer**
and a **thin impure layer**:

```
src/services/
  financeEngine/   Pure functions: month math, status rules, totals,
                    preset-matching, monthly-item generation.
                    No network calls — fully unit-tested in isolation.
  googleSheets/     Auth, the Sheets API client, generic row CRUD, and one
                    typed repository per sheet tab. The only place that
                    talks to Google.
```

`monthService.ts` is the single seam where the two meet — it composes the
pure engine functions with the repositories. Everything above it (pages,
hooks, components) only ever calls `monthService`, never the repositories
or the Sheets client directly.

## 4. Technology Stack

| Layer   | Choice                                                     |
| ------- | ---------------------------------------------------------- |
| UI      | React 19, TypeScript (strict), Vite                        |
| Styling | Tailwind CSS v4 (`@theme` tokens), Lucide icons            |
| Routing | React Router (`HashRouter`, for static-host compatibility) |
| Auth    | Google Identity Services (OAuth 2.0 token client)          |
| Data    | Google Sheets API v4                                       |
| Quality | ESLint (flat config) + Prettier                            |
| Testing | Vitest + Testing Library                                   |
| PWA     | `vite-plugin-pwa` (Workbox-generated service worker)       |
| Hosting | GitHub Pages, deployed via GitHub Actions                  |

## 5. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and
   create a new project (or reuse a personal one).
2. **APIs & Services → Library** → enable the **Google Sheets API**.
3. **APIs & Services → OAuth consent screen**:
   - User type: **External**.
   - Fill in app name, support email, developer contact.
   - Scopes: `.../auth/spreadsheets` and `.../auth/userinfo.email`.
   - **Test users**: add your own Google account. While the app stays in
     "Testing" publishing status, only listed test users can sign in at
     all — this is what actually enforces "single user" at the Google
     layer, on top of the app's own email check.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized JavaScript origins**: add every origin you'll run the app
     from, e.g. `http://localhost:5173` for local dev and
     `https://<your-username>.github.io` for production (see
     [Google OAuth Setup](#6-google-oauth-setup) below for the exact value).
   - No redirect URI is needed — this app uses the token-client (implicit)
     flow, not a redirect-based one.
   - Copy the generated **Client ID**.

## 6. Google OAuth Setup

This app uses Google Identity Service's **token client**, requesting the
`spreadsheets` and `userinfo.email` scopes together in one grant — one
consent gives both Sheets API access and the email needed for the allow-list
check.

**The exact origin to register** in _Authorized JavaScript origins_ for a
GitHub Pages deployment is the origin only, **without** a path:

```
https://<your-github-username>.github.io
```

(Not `https://<your-username>.github.io/spendflow` — origins never include a
path. Add `http://localhost:5173` as a second origin for local development.)

Authentication flow summary (see `src/services/googleSheets/auth.ts`):

1. User clicks "Sign in with Google" → GIS token client requests the token.
2. The app fetches `userinfo.email` with that token.
3. The email is compared against `VITE_ALLOWED_GOOGLE_EMAIL`
   (case/whitespace-insensitive).
4. **Match** → `authorized`, the app loads. **No match** → the token is
   immediately revoked and the user sees "Access denied. This application
   is private."
5. The access token lives only in an in-memory module variable — never
   localStorage/sessionStorage. A page refresh clears it; signing in again
   is required. A `401` from the Sheets API triggers the same sign-out path
   with a "session expired" message.

## 7. Google Sheets Setup

Create one spreadsheet with 7 tabs — **Settings, Salary, RegularPresets,
MonthlyItems, ExtraItems, Months, Audit** — each with the exact header row
documented in
[docs/GOOGLE_SHEETS_SETUP.md](docs/GOOGLE_SHEETS_SETUP.md). That doc has the
full column-by-column reference; `docs/Sample-structure/SpendFlow Data.xlsx`
is a ready-made template with the headers and formatting already set up —
copy its tabs into your Google Sheet, or recreate them by hand.

No sharing step is needed: the app reads/writes using your own OAuth token,
not a service account, so owning the sheet with the same Google account you
sign in with is sufficient.

## 8. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
VITE_GOOGLE_CLIENT_ID=      # OAuth client ID from step 5
VITE_GOOGLE_SHEET_ID=       # spreadsheet ID from its URL (step 7)
VITE_ALLOWED_GOOGLE_EMAIL=  # the one Google account allowed to use this app
```

`.env`, `.env.local`, and all `.env.*` variants are git-ignored (only
`.env.example` is tracked) — never commit real values. For the GitHub Actions
deployment, the same three values are stored as **repository secrets**
instead (see [GitHub Pages Deployment](#11-github-pages-deployment)).

Vite only reads env files at startup — restart `npm run dev` after editing
`.env.local`.

## 9. Local Development

```bash
npm install
cp .env.example .env.local   # then fill in your own values
npm run dev
```

Other scripts:

| Script                 | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start the Vite dev server            |
| `npm run build`        | Type-check and build for production  |
| `npm run preview`      | Preview the production build locally |
| `npm run lint`         | Run ESLint                           |
| `npm run format`       | Format files with Prettier           |
| `npm run format:check` | Check formatting without writing     |
| `npm run test`         | Run the test suite once              |
| `npm run test:watch`   | Run tests in watch mode              |

## 10. Production Build

```bash
npm run build
```

Runs `tsc -b` (type-check, no emit) then `vite build`. Output goes to
`dist/`. The build is configured to emit asset paths under `/spendflow/`
(see `vite.config.ts`'s `base` option) — correct for GitHub Pages at
`https://<username>.github.io/spendflow/`, but it means `dist/` **won't**
serve correctly from a plain `file://` open or from a server root other than
that subpath. Use `npm run preview` to sanity-check the production build
locally (Vite serves it with the same base path).

## 11. GitHub Pages Deployment

1. **Push this repository to GitHub** as `spendflow` under your account.
2. **Repo Settings → Secrets and variables → Actions → New repository
   secret**, add all three:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_SHEET_ID`
   - `VITE_ALLOWED_GOOGLE_EMAIL`
3. **Repo Settings → Pages → Build and deployment → Source**: select
   **GitHub Actions** (not "Deploy from a branch").
4. Push to `main`. `.github/workflows/deploy.yml` runs automatically:
   installs dependencies, **lints, tests, and builds** — if any of those
   fail, the job stops and nothing deploys — then publishes `dist/` via
   GitHub's official Pages actions.
5. Your app is live at:

   ```
   https://<your-github-username>.github.io/spendflow/
   ```

6. Go back to [Google Cloud Console credentials](https://console.cloud.google.com/apis/credentials)
   and add that origin (`https://<your-github-username>.github.io`, no
   path) to the OAuth client's Authorized JavaScript origins if you haven't
   already — sign-in will fail with `redirect_uri_mismatch`-style errors
   until that's done.

You can also trigger a deploy manually from the Actions tab
(`workflow_dispatch`) without pushing a new commit.

## 12. Troubleshooting

**"Access blocked: has not completed the Google verification process" /
Error 403: access_denied**
The OAuth consent screen is in Testing mode and your account isn't on its
test-user list yet. Google Cloud Console → OAuth consent screen → Test
users → add your email. This is a Google-side block, before the app's own
allow-list check ever runs.

**Signed in successfully but see "Access denied. This application is
private."**
The email you authenticated with doesn't match `VITE_ALLOWED_GOOGLE_EMAIL`
exactly (this check is case/whitespace-insensitive but otherwise exact).
Check both values, and remember this env var is baked in at **build** time —
changing it requires a rebuild/redeploy, not just an env file edit.

**Sign-in works locally but fails on the deployed site (or vice versa)**
The two environments need separate entries in _Authorized JavaScript
origins_: `http://localhost:5173` for local dev, `https://<username>.github.io`
(origin only, no path) for production. Missing either one breaks sign-in in
that environment specifically.

**Blank page / 404 after a hard refresh or a shared deep link**
Shouldn't happen — the app uses `HashRouter`, so all routes live after a
`#` and never hit the server. If you do see this, confirm the GitHub Pages
source is set to "GitHub Actions" (not a branch), and that the deployed
`index.html` references `/spendflow/assets/...` (open dev tools → Network
tab) — if it references `/assets/...` instead, the build didn't pick up the
`base` config, usually because it wasn't built via `npm run build`.

**"Your Google session has expired. Please sign in again."**
Normal — the in-memory access token doesn't survive a page refresh, or
Google's token lifetime (~1 hour) elapsed. Sign in again.

**"The spreadsheet is unavailable" / "A required sheet tab was not found"**
Double-check `VITE_GOOGLE_SHEET_ID` against the ID in your sheet's URL, and
that every tab name in [docs/GOOGLE_SHEETS_SETUP.md](docs/GOOGLE_SHEETS_SETUP.md)
exists with that exact spelling (tab names and column order are
load-bearing — the app reads by position, not by header text).

**CI fails on `npm run lint` or `npm test` but passes locally**
Make sure your local `node_modules` is up to date (`npm ci`, not `npm
install`, matches what CI runs) and that you're not relying on a locally
installed global tool version.

**PWA install option isn't showing / manifest or service worker errors**
`npm run dev` doesn't register a service worker by design — build and serve
the production bundle (`npm run build && npm run preview`) to test PWA
behavior locally. In dev tools, check Application → Manifest and
Application → Service Workers for errors; the most common cause is testing
over plain HTTP on a non-localhost address (PWAs require HTTPS or
`localhost`).

---

## Mobile / PWA

SpendFlow is one responsive web app — not a separate mobile app — that can
also be **installed** from your phone's browser for a full-screen, app-like
experience. There is no App Store/Play Store listing; "installing" just
saves a shortcut that launches the same web app without browser chrome.

**Opening it on mobile:** visit the same URL
(`https://<your-github-username>.github.io/spendflow/`) in any modern mobile
browser — Chrome or Safari both work. No install is required to use it.

**Installing on Android (Chrome):**

1. Open the site in Chrome.
2. Tap the **install icon** in the address bar, or the **⋮** menu →
   **Install app** / **Add to Home screen**.
3. Alternatively, visit **Settings** inside SpendFlow — if your browser has
   signaled the app is installable, an **Install SpendFlow** button appears
   there too.
4. Confirm. SpendFlow now launches from your home screen in standalone mode
   (no address bar).

**Installing on iPhone/iPad (Safari):** iOS does not support one-tap
installation the way Android does — there is no programmatic install prompt
on iOS, by Apple's own design, so this is a manual flow:

1. Open the site in **Safari** (this only works in Safari, not Chrome-on-iOS).
2. Tap the **Share** icon (the square with an upward arrow).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add**. A SpendFlow icon appears on your home screen and opens in
   standalone mode.

**How the PWA relates to the web app:** it's the exact same application,
same code, same URL — installing just adds a home-screen icon and a
standalone window. Nothing about how it works, what it stores, or how it
authenticates changes based on whether it's "installed."

**The Google Sheet remains the source of truth either way.** The installed
app does not sync, store, or cache your financial data locally — every time
you open it, it reads live from your Google Sheet exactly as the browser
version does. The service worker only caches the app's static shell (its
code, not your data) so the app _opens_ a little faster and can show a clear
"offline" error instead of a blank page if your connection drops — it never
lets you work with stale numbers or pretends an action saved when it didn't.
See [Financial Data Safety](#financial-data-safety) for the full reasoning.

---

## Security Notes

- **Nothing server-side holds your data or credentials.** The app is a
  static bundle; every API call goes straight from your browser to Google
  using your own OAuth token.
- **The access token is never persisted** — no localStorage, no
  sessionStorage, no cookies. It lives in a module-level variable and is
  gone on refresh.
- **`VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_SHEET_ID`, and
  `VITE_ALLOWED_GOOGLE_EMAIL` are compiled into the public JS bundle** —
  unavoidable for a backend-less static SPA, and not a vulnerability by
  itself:
  - The Client ID is a public OAuth identifier by design (there's no client
    secret in this flow — a secret would be the actual sensitive thing, and
    this app never has one).
  - The Sheet ID alone grants no access — Google Sheets API still enforces
    the sheet's own sharing permissions and requires a valid OAuth token.
    **Keep your sheet's sharing setting private** (only you), not "anyone
    with the link."
  - The allow-listed email is a single string; knowing it doesn't help an
    attacker, since Google's own account system is what's being
    authenticated against.
- **Two independent gates stand between a stranger and your data**: (1)
  Google's OAuth consent screen only allows listed test users to complete
  sign-in at all, and (2) the app's own post-sign-in email check. Either one
  failing denies access.
- **Secrets that must never be committed**: a real `.env`/`.env.local`, any
  OAuth client _secret_ (this app's flow doesn't use one, but double-check
  before adding any feature that would), access/refresh tokens, and real
  financial data. `.gitignore` excludes all `.env*` except `.env.example`.
- **Repository secrets, not committed files**, hold these same three values
  for CI — see [GitHub Pages Deployment](#11-github-pages-deployment).

## Financial Data Safety

SpendFlow does not cache financial data beyond the current browser tab's
in-memory React state. There is no `localStorage`/`IndexedDB` persistence of
sheet data, and no offline data mode. Every page load re-reads from Google
Sheets, which remains the single source of truth. The tradeoff: the app is
unusable fully offline for anything financial, and every navigation that
generates monthly items makes a round trip to Google — acceptable for a
single-user, low-frequency personal finance tool, and a deliberate choice to
avoid a second place where sensitive financial data could linger or drift
out of sync with the sheet.

The PWA's service worker (added for installability — see
[Mobile / PWA](#mobile--pwa)) only precaches the **static app shell**: the
built JS/CSS/HTML and icons. It has **zero runtime-caching rules for any
Google API** — every Sheets/Auth request always goes to the live network,
every time, with no exceptions. Concretely: the service worker can make the
app's UI _open_ while offline, but it cannot and does not make a "Mark Paid"
or any other write look like it succeeded without Google actually confirming
it — a failed request surfaces as a friendly error, same as it would without
a service worker at all.

## Known Limitations

- **Single user only**, enforced by both Google's test-user list and the
  app's own allow-list check — not a multi-tenant product.
- **No offline support** — an active, authorized Google session is required
  for every data operation (see Financial Data Safety above).
- **No server-side validation** — all validation is client-side; a
  determined user editing the Google Sheet directly could enter malformed
  data (the app surfaces this as a friendly "couldn't read this row" error
  rather than crashing, but won't fix it for you).
- **OAuth consent screen stays in "Testing" mode** by design (that's what
  enforces single-user access) — Google expires test-user grants after a
  rolling window, occasionally requiring re-consent; this is expected, not
  a bug.
- **Access tokens don't survive a refresh** — re-authentication is required
  once per browser session, by design (see Security Notes).

## How to Use SpendFlow Every Month

1. **Open the app** and sign in with your Google account (if not already
   signed in).
2. **Check the month** shown in the Dashboard's month selector; use the
   arrows to navigate to the month you want (past months stay fully
   accessible — nothing is ever auto-deleted).
3. **Set that month's salary** by tapping the Salary card.
4. SpendFlow has already generated this month's **Regular Needs** from your
   active presets — review them, and tap **Mark Paid** as you pay each one
   (or **Mark Pending** if you tapped it by mistake).
5. Add any one-off spending via **+ Add Extra**, and mark those paid too as
   they're settled.
6. Check the **Overdue / Still Not Completed** section for anything past due
   — it's empty and calm when you're caught up.
7. When your recurring commitments change — a new bill, a loan that's been
   paid off, a subscription you've cancelled — go to **Presets** and create,
   edit, or deactivate the relevant preset (never delete one that any past
   month might still reference).
8. The Dashboard's summary cards, completion bars, and charts update
   immediately from your Google Sheet — there's nothing to "save" or "sync"
   separately.
