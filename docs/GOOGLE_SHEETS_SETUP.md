# Google Sheets Setup

SpendFlow is single-user: one Google account, one spreadsheet. This document
covers creating that spreadsheet and the Google Cloud / OAuth configuration
needed to connect to it.

## 1. Create the spreadsheet

1. Create a new Google Sheet (sheets.new).
2. Rename it something like "SpendFlow Data".
3. Create the tabs below, each with the **exact** name and column headers in
   row 1. Column order matters — the app reads/writes by position, not by
   header name.
4. Copy the spreadsheet ID from its URL for later:
   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`

### `Settings` (single row of app-wide settings)

| Column          | Type            | Notes                          |
| --------------- | --------------- | ------------------------------ |
| `Id`            | string          | UUID                           |
| `Currency`      | string          | e.g. `INR`                     |
| `MonthStartDay` | number          | Day of month a cycle starts on |
| `Timezone`      | string          | e.g. `Asia/Kolkata`            |
| `CreatedAt`     | ISO 8601 string | Set once                       |
| `UpdatedAt`     | ISO 8601 string | Updated on every save          |

### `Salary` (one row per month's salary)

| Column          | Type            | Notes                      |
| --------------- | --------------- | -------------------------- |
| `Id`            | string          | UUID                       |
| `MonthId`       | string          | Foreign key to `Months.Id` |
| `Amount`        | number          |                            |
| `EffectiveDate` | ISO 8601 date   |                            |
| `Notes`         | string          | Optional                   |
| `CreatedAt`     | ISO 8601 string |                            |
| `UpdatedAt`     | ISO 8601 string |                            |

### `RegularPresets` (reusable recurring-expense templates)

| Column          | Type            | Notes                       |
| --------------- | --------------- | --------------------------- |
| `Id`            | string          | UUID                        |
| `Name`          | string          | e.g. "Rent"                 |
| `DefaultAmount` | number          |                             |
| `SortOrder`     | number          | Controls display order      |
| `Active`        | `TRUE`/`FALSE`  | Inactive presets are hidden |
| `CreatedAt`     | ISO 8601 string |                             |
| `UpdatedAt`     | ISO 8601 string |                             |

### `MonthlyItems` (actual regular expenses for a given month)

| Column      | Type                           | Notes                              |
| ----------- | ------------------------------ | ---------------------------------- |
| `Id`        | string                         | UUID                               |
| `MonthId`   | string                         | Foreign key to `Months.Id`         |
| `PresetId`  | string                         | Foreign key to `RegularPresets.Id` |
| `Name`      | string                         |                                    |
| `Amount`    | number                         |                                    |
| `Status`    | `paid` / `pending` / `overdue` |                                    |
| `DueDate`   | ISO 8601 date                  |                                    |
| `PaidDate`  | ISO 8601 date                  | Empty until paid                   |
| `Notes`     | string                         | Optional                           |
| `CreatedAt` | ISO 8601 string                |                                    |
| `UpdatedAt` | ISO 8601 string                |                                    |

### `ExtraItems` (one-time / additional expenses for a given month)

| Column      | Type                           | Notes                      |
| ----------- | ------------------------------ | -------------------------- |
| `Id`        | string                         | UUID                       |
| `MonthId`   | string                         | Foreign key to `Months.Id` |
| `Name`      | string                         |                            |
| `Amount`    | number                         |                            |
| `Status`    | `paid` / `pending` / `overdue` |                            |
| `DueDate`   | ISO 8601 date                  |                            |
| `PaidDate`  | ISO 8601 date                  | Empty until paid           |
| `Notes`     | string                         | Optional                   |
| `CreatedAt` | ISO 8601 string                |                            |
| `UpdatedAt` | ISO 8601 string                |                            |

### `Months` (one row per calendar month)

| Column      | Type            | Notes                        |
| ----------- | --------------- | ---------------------------- |
| `Id`        | string          | UUID                         |
| `Year`      | number          | e.g. `2027`                  |
| `Month`     | number          | `1`–`12`                     |
| `Label`     | string          | e.g. "January 2027"          |
| `Closed`    | `TRUE`/`FALSE`  | Locks the month once settled |
| `CreatedAt` | ISO 8601 string |                              |
| `UpdatedAt` | ISO 8601 string |                              |

### `Audit` (append-only change log)

| Column       | Type            | Notes                             |
| ------------ | --------------- | --------------------------------- |
| `Id`         | string          | UUID                              |
| `Timestamp`  | ISO 8601 string |                                   |
| `Action`     | string          | e.g. `create`, `update`, `delete` |
| `EntityType` | string          | e.g. `MonthlyItem`                |
| `EntityId`   | string          |                                   |
| `Details`    | string          | Free-text description             |

> Leave every tab with only its header row for now — the app treats a tab
> with zero data rows as "empty", not an error.

## 2. Google Cloud setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create
   a new project (or reuse an existing personal one).
2. **APIs & Services → Library**: enable the **Google Sheets API**.
3. **APIs & Services → OAuth consent screen**:
   - User type: **External** (or **Internal** if you use Google Workspace).
   - Fill in the required app name, support email, and developer contact.
   - Scopes: add `.../auth/spreadsheets` and `.../auth/userinfo.email`.
   - **Test users**: add your own Google account email. While the consent
     screen is in "Testing" mode, only listed test users can sign in — which
     is exactly the single-user restriction this app wants.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized JavaScript origins**: add the URLs you'll run the app from,
     e.g. `http://localhost:5173` for local dev and your GitHub Pages URL
     for production.
   - No redirect URI is needed — this app uses the token-client (implicit)
     flow, not a redirect-based flow.
   - Copy the generated **Client ID**.

## 3. Share the spreadsheet

Since the app reads/writes using your own OAuth token (not a service
account), no sharing step is required beyond owning the sheet with the same
Google account you'll sign in with.

## 4. Configure the app

Copy `.env.example` to `.env.local` and fill in:

```
VITE_GOOGLE_CLIENT_ID=<OAuth client ID from step 2>
VITE_GOOGLE_SHEET_ID=<spreadsheet ID from step 1>
VITE_ALLOWED_GOOGLE_EMAIL=<the one Google account allowed to use this app>
```

Restart the dev server after editing `.env.local` — Vite only reads env
files at startup.
