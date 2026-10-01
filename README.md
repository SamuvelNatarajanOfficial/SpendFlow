# SpendFlow

Personal Salary & Expense Planner — a responsive personal finance dashboard for
tracking monthly salary, regular needs, and extra spending.

## Status

**Phase 1 — Foundation & UI System.** This phase establishes the application
shell, design system, routing, and mock-data-driven UI. Google OAuth, Google
Sheets sync, and financial calculations are not implemented yet.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS (v4, `@theme` tokens)
- React Router
- Lucide icons
- ESLint + Prettier
- Vitest + Testing Library

## Getting Started

```bash
npm install
npm run dev
```

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
  components/   Reusable UI building blocks (ui, layout, shared, dashboard)
  pages/        Route-level page components
  layouts/      Page shells composed from layout components
  hooks/        Shared React hooks
  lib/          App configuration (navigation, etc.)
  types/        Shared TypeScript types
  data/         Isolated mock data layer (swap for Google Sheets later)
  utils/        Formatting and small helpers
```

Mock data lives entirely in `src/data/mockData.ts` so it can be removed
cleanly once the Google Sheets integration lands.
