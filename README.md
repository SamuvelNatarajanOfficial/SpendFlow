# SpendFlow

Personal Salary & Expense Planner — a responsive personal finance dashboard for
tracking monthly salary, regular needs, and extra spending.

## Status

**Phase 3 — Monthly Finance Engine.** The app is fully wired to live Google
Sheets data: salary, recurring presets (with start/end months — loans and
rent work the same way), generated monthly items, extra items, paid/pending/
overdue status, and month-level totals are all real and persisted. Presets
support full CRUD (deactivate, never delete). Opening a month is idempotent —
re-opening it never creates duplicate items for the same preset.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS (v4, `@theme` tokens)
- React Router
- Google Identity Services + Google Sheets API
- Lucide icons
- ESLint + Prettier
- Vitest + Testing Library

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in your own values
npm run dev
```

See [docs/GOOGLE_SHEETS_SETUP.md](docs/GOOGLE_SHEETS_SETUP.md) for the full
Google Cloud, OAuth, and spreadsheet setup walkthrough.

## Scripts

| Script                 | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Start the Vite dev server           |
| `npm run build`        | Type-check and build for production |
| `npm run preview`      | Preview the production build        |
| `npm run lint`         | Run ESLint                          |
| `npm run format`       | Format files with Prettier          |
| `npm run format:check` | Check formatting without writing    |
| `npm run test`         | Run the test suite once             |
| `npm run test:watch`   | Run tests in watch mode             |

## Project Structure

```
src/
  components/   Reusable UI building blocks (ui, layout, shared, dashboard, presets, auth)
  pages/        Route-level page components
  layouts/      Page shells composed from layout components
  hooks/        Shared React hooks (month navigation, month data loading)
  context/      React context providers (AuthProvider)
  lib/          App configuration (navigation, etc.)
  types/        Shared TypeScript types (sheets.ts = persisted schema)
  services/
    googleSheets/    Auth, API client, generic sheet ops, typed repositories
    financeEngine/   Pure month/status/total calculations + orchestration
  utils/        Formatting and small helpers
```

`src/services/financeEngine/` has no network calls — `month.ts`,
`statusEngine.ts`, `presetMatching.ts`, `monthlyItemGeneration.ts` and
`totals.ts` are pure functions, unit-tested directly. `monthService.ts` is
the only impure layer, composing those functions with the Google Sheets
repositories.
