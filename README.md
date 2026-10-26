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

- **No login by default, optional protection.** The app opens straight away.
  Turn on a username/password in Settings if you want one — it's stored in
  your Google Sheet's `Auth` tab and checked by your own Apps Script.
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
- **No server to host.** Static React app + a small Google Apps Script in
  your own sheet. Deploys as plain static files.

## 3. Architecture

```
Browser (React SPA)
  │  POST (JSON)
  └─ Google Apps Script web app  — bound to your sheet, runs as you
         │
         └─ Your Google Sheet    — the only datastore; you own and control it
```

The app is a static bundle served by GitHub Pages. All data access goes
through the Apps Script web app you deploy from your own spreadsheet
(`docs/apps-script/Code.gs`), which reads and writes the sheet as you — so
the browser needs no Google sign-in. See [Security notes](#security-notes)
for what that does and doesn't protect against.

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
| Auth    | Optional username/password, checked by Apps Script         |
| Data    | Google Sheets via a Google Apps Script web app             |
| Quality | ESLint (flat config) + Prettier                            |
| Testing | Vitest + Testing Library                                   |
| PWA     | `vite-plugin-pwa` (Workbox-generated service worker)       |
| Hosting | GitHub Pages, deployed via GitHub Actions                  |

## 5. Apps Script Setup

1. Create the spreadsheet (see [section 7](#7-google-sheets-setup)).
2. In the sheet: **Extensions → Apps Script**. Delete the sample code and
   paste in the contents of [docs/apps-script/Code.gs](docs/apps-script/Code.gs).
3. **Deploy → New deployment → type: Web app**:
   - **Execute as:** _Me_
   - **Who has access:** _Anyone_
4. Authorize the script when prompted, then copy the **Web app URL**
   (ends in `/exec`) into `VITE_APPS_SCRIPT_URL`.
5. After any later edit to `Code.gs`, use **Deploy → Manage deployments →
   Edit → New version** so the live URL picks up the change.

## 6. App Protection

By default the app opens with no login. In **Settings → App Protection** you
can enable a username/password. It is saved in the sheet's `Auth` tab (the
password as a salted SHA-256 hash; the tab is created for you if missing) and
verified by the Apps Script, which then issues a session token that the app
keeps for the browser tab's session and sends with every request. With
protection on, the script rejects every data request without a valid token.

"Anyone" access in step 3 above only means the URL is reachable without a
Google login — the script itself decides what to serve.

## 7. Google Sheets Setup

Create one spreadsheet with 8 tabs — **Settings, Salary, RegularPresets,
MonthlyItems, ExtraItems, Months, Audit, Auth** — each with the exact header row
documented in
[docs/GOOGLE_SHEETS_SETUP.md](docs/GOOGLE_SHEETS_SETUP.md). That doc has the
full column-by-column reference; `docs/Sample-structure/SpendFlow Data.xlsx`
is a ready-made template with the headers and formatting already set up —
copy its tabs into your Google Sheet, or recreate them by hand.

No sharing step is needed: the Apps Script runs as you, the sheet's owner.
**Keep the sheet itself private (only you).**

## 8. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
VITE_APPS_SCRIPT_URL=       # Apps Script web app URL (step 4 of Apps Script Setup)
```

`.env`, `.env.local`, and all `.env.*` variants are git-ignored (only
`.env.example` is tracked) — never commit real values. For the GitHub Actions
deployment, the same value is stored as a **repository secret** instead (see
[GitHub Pages Deployment](#11-github-pages-deployment)).

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
`dist/`. The build is configured to emit asset paths under `/SpendFlow/`
(see `vite.config.ts`'s `base` option) — correct for GitHub Pages at
`https://<username>.github.io/SpendFlow/`, but it means `dist/` **won't**
serve correctly from a plain `file://` open or from a server root other than
that subpath. Use `npm run preview` to sanity-check the production build
locally (Vite serves it with the same base path).

## 11. GitHub Pages Deployment

1. **Push this repository to GitHub** as `SpendFlow` under your account.
2. **Repo Settings → Secrets and variables → Actions → New repository
   secret**, add:
   - `VITE_APPS_SCRIPT_URL`
3. **Repo Settings → Pages → Build and deployment → Source**: select
   **GitHub Actions** (not "Deploy from a branch").
4. Push to `main`. `.github/workflows/deploy.yml` runs automatically:
   installs dependencies, **lints, tests, and builds** — if any of those
   fail, the job stops and nothing deploys — then publishes `dist/` via
   GitHub's official Pages actions.
5. Your app is live at:

   ```
   https://<your-github-username>.github.io/SpendFlow/
   ```

You can also trigger a deploy manually from the Actions tab
(`workflow_dispatch`) without pushing a new commit.

## 12. Troubleshooting

**"Missing VITE_APPS_SCRIPT_URL" / "unexpected response" / network error on load**
Check that `VITE_APPS_SCRIPT_URL` is set (it's baked in at **build** time, so
a deploy needs the repository secret), that the deployment's access is
**Anyone** and it executes as **Me**, and that you redeployed a **new
version** after editing `Code.gs`. Opening the URL in a browser should show
`SpendFlow script is running.`

**"The \"Auth\" tab was not found" or another missing tab**
Every tab in [docs/GOOGLE_SHEETS_SETUP.md](docs/GOOGLE_SHEETS_SETUP.md) must
exist with that exact spelling. The `Auth` tab is created automatically the
first time you save App Protection.

**Blank page / 404 after a hard refresh or a shared deep link**
Shouldn't happen — the app uses `HashRouter`, so all routes live after a
`#` and never hit the server. If you do see this, confirm the GitHub Pages
source is set to "GitHub Actions" (not a branch), and that the deployed
`index.html` references `/SpendFlow/assets/...` (open dev tools → Network
tab) — if it references `/assets/...` instead, the build didn't pick up the
`base` config, usually because it wasn't built via `npm run build`.

**Blank page on the deployed URL even though the Actions deploy succeeded**
GitHub Pages serves static assets case-sensitively. `vite.config.ts` hardcodes
the `base` path to match this repository's exact name — if you've renamed
the repository (or forked it under a different-cased name), update `base` in
`vite.config.ts` to match that exact casing and redeploy. A mismatch here
makes every asset request 404, so the JS bundle never loads and the page
stays blank with no visible error (check dev tools → Network tab for 404s
on `/assets/...` to confirm this is the cause).

**"Your session expired. Please log in again."**
With protection on, a login lasts up to 6 hours. Log in again.

**"The spreadsheet is unavailable" / "A required sheet tab was not found"**
Make sure the Apps Script is bound to the right spreadsheet, and
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
(`https://<your-github-username>.github.io/SpendFlow/`) in any modern mobile
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

- **The Apps Script URL is the key to your data when protection is off.**
  It is compiled into the public JS bundle, so anyone who finds it can read
  and write your sheet. Enable App Protection in Settings if the deployed
  site is public, and keep the sheet itself private (only you).
- **With protection on**, the script rejects every data request that lacks a
  session token from a successful login. Failed logins are rate-limited
  (10 failures, then a 10-minute lockout), and sessions expire after 6 hours.
- **Passwords are stored as a salted SHA-256 hash** in the `Auth` tab, never in
  plain text and never in the bundle. Anyone with edit access to the sheet
  can overwrite that tab, so keep the sheet private.
- **Secrets that must never be committed**: a real `.env`/`.env.local` and
  real financial data. `.gitignore` excludes all `.env*` except
  `.env.example`.
- **A repository secret, not a committed file**, holds the Apps Script URL for
  CI — see [GitHub Pages Deployment](#11-github-pages-deployment).

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
built JS/CSS/HTML and icons. It has **zero runtime-caching rules for the
Apps Script** — every data request always goes to the live network,
every time, with no exceptions. Concretely: the service worker can make the
app's UI _open_ while offline, but it cannot and does not make a "Mark Paid"
or any other write look like it succeeded without Google actually confirming
it — a failed request surfaces as a friendly error, same as it would without
a service worker at all.

## Known Limitations

- **Single user only** — one sheet, one optional login; not a multi-tenant
  product.
- **No offline support** — a live connection to the Apps Script is required
  for every data operation (see Financial Data Safety above).
- **No server-side validation** — all validation is client-side; a
  determined user editing the Google Sheet directly could enter malformed
  data (the app surfaces this as a friendly "couldn't read this row" error
  rather than crashing, but won't fix it for you).
- **The login is a convenience lock** — see Security Notes for what it does
  and doesn't protect.

## How to Use SpendFlow Every Month

1. **Open the app** (and log in, if you turned on App Protection).
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
