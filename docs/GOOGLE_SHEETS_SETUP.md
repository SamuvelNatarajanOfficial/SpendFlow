# Google Sheet Structure

The exact tab and column layout SpendFlow expects. For Google Cloud / OAuth
setup and environment variables, see the main
[README](../README.md#5-google-cloud-setup).

## Create the spreadsheet

1. Create a new Google Sheet (sheets.new).
2. Rename it something like "SpendFlow Data".
3. Create the tabs below, each with the **exact** name and column headers in
   row 1. Column order matters — the app reads/writes by position, not by
   header name. (`docs/Sample-structure/SpendFlow Data.xlsx` has these tabs
   pre-built if you'd rather copy them than type them out.)
4. Copy the spreadsheet ID from its URL for `VITE_GOOGLE_SHEET_ID`:
   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`
5. Leave every tab with only its header row for now — the app treats a tab
   with zero data rows as "empty", not an error.

No sharing step is required: the app reads/writes with your own OAuth token,
not a service account, so owning the sheet with the account you sign in with
is enough. **Keep its sharing setting private (only you)** — see the
README's Security Notes for why.

### `Settings` (single row of app-wide settings)

| Column          | Type            | Notes                          |
| --------------- | --------------- | ------------------------------ |
| `Id`            | string          | UUID                           |
| `Currency`      | string          | e.g. `INR`                     |
| `MonthStartDay` | number          | Day of month a cycle starts on |
| `Timezone`      | string          | e.g. `Asia/Kolkata`            |
| `CreatedAt`     | ISO 8601 string | Set once                       |
| `UpdatedAt`     | ISO 8601 string | Updated on every save          |

### `Salary` (one row per month's salary — latest `UpdatedAt` wins if duplicated)

| Column      | Type            | Notes     |
| ----------- | --------------- | --------- |
| `Id`        | string          | UUID      |
| `Month`     | string          | `YYYY-MM` |
| `Amount`    | number          |           |
| `Notes`     | string          | Optional  |
| `CreatedAt` | ISO 8601 string |           |
| `UpdatedAt` | ISO 8601 string |           |

### `RegularPresets` (recurring commitments — rent, loans, bills, etc.)

| Column       | Type                                                        | Notes                                                        |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------------------ |
| `Id`         | string                                                      | UUID                                                         |
| `Name`       | string                                                      | e.g. "Home Loan"                                             |
| `Category`   | `HOME` / `LOAN` / `BILL` / `FAMILY` / `TRANSPORT` / `OTHER` |                                                              |
| `Amount`     | number                                                      | Monthly amount                                               |
| `StartMonth` | string                                                      | `YYYY-MM` — first month this preset applies                  |
| `EndMonth`   | string                                                      | `YYYY-MM`, or **empty** for an indefinite preset (e.g. rent) |
| `DueDay`     | number                                                      | Day of month (1–31); clamped to the month's length           |
| `Active`     | `TRUE`/`FALSE`                                              | Inactive presets stop generating items but are never deleted |
| `Notes`      | string                                                      | Optional                                                     |
| `CreatedAt`  | ISO 8601 string                                             |                                                              |
| `UpdatedAt`  | ISO 8601 string                                             |                                                              |

A loan of ₹10,000/month from Jan 2027 to Jun 2027 is just `StartMonth=2027-01`,
`EndMonth=2027-06` — no special-cased loan logic, it's the same preset
mechanism as rent or any other recurring item.

### `MonthlyItems` (regular items generated from presets for a given month)

| Column      | Type                                                        | Notes                                                      |
| ----------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| `Id`        | string                                                      | Deterministic: `{PresetId}__{Month}` — prevents duplicates |
| `Month`     | string                                                      | `YYYY-MM`                                                  |
| `PresetId`  | string                                                      | Foreign key to `RegularPresets.Id`                         |
| `Name`      | string                                                      |                                                            |
| `Category`  | `HOME` / `LOAN` / `BILL` / `FAMILY` / `TRANSPORT` / `OTHER` |                                                            |
| `Amount`    | number                                                      |                                                            |
| `Status`    | `PENDING` / `PAID` / `SKIPPED`                              | "Overdue" is computed, never stored                        |
| `DueDate`   | ISO 8601 date                                               |                                                            |
| `PaidDate`  | ISO 8601 date                                               | Empty until paid                                           |
| `Notes`     | string                                                      | Optional                                                   |
| `CreatedAt` | ISO 8601 string                                             |                                                            |
| `UpdatedAt` | ISO 8601 string                                             |                                                            |

### `ExtraItems` (one-time / additional expenses for a given month)

| Column      | Type                           | Notes                 |
| ----------- | ------------------------------ | --------------------- |
| `Id`        | string                         | UUID                  |
| `Month`     | string                         | `YYYY-MM`             |
| `Name`      | string                         |                       |
| `Amount`    | number                         |                       |
| `Status`    | `PENDING` / `PAID` / `SKIPPED` | "Overdue" is computed |
| `DueDate`   | ISO 8601 date                  |                       |
| `PaidDate`  | ISO 8601 date                  | Empty until paid      |
| `Notes`     | string                         | Optional              |
| `CreatedAt` | ISO 8601 string                |                       |
| `UpdatedAt` | ISO 8601 string                |                       |

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
