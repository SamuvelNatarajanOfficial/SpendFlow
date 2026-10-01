# SpendFlow

Personal Salary & Expense Planner — a responsive personal finance dashboard for
tracking monthly salary, regular needs, and extra spending.

## Status

**Phase 2 — Google Authentication & Google Sheets Data Layer.** The app now
signs in with Google, restricts access to a single allow-listed account, and
has a typed Google Sheets service layer (repositories, row mapping, error
handling). The UI still runs on mock data — monthly calculations and wiring
the pages up to live spreadsheet data are Phase 3.

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
  components/   Reusable UI building blocks (ui, layout, shared, dashboard, auth)
  pages/        Route-level page components
  layouts/      Page shells composed from layout components
  hooks/        Shared React hooks
  context/      React context providers (AuthProvider)
  lib/          App configuration (navigation, etc.)
  types/        Shared TypeScript types
  data/         Isolated mock data layer (swap for Google Sheets later)
  services/
    googleSheets/   Auth, API client, generic sheet ops, typed repositories
  utils/        Formatting and small helpers
```

Mock data lives entirely in `src/data/mockData.ts` so it can be removed
cleanly once the pages are wired up to the repositories in
`src/services/googleSheets/repositories/`.
