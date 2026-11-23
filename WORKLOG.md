# Work log

A day-by-day record of work done on PataPotea, built from the git commit history
across all branches (`git log --all`). Each entry lists the author, the branch the
commit was made on, and the commit message.

## 2 November 2026

- **lee9090-code** (branch `lee`): Initial commit. Project scaffold created.

## 8 November 2026

- **Wise Munene Mutuku** (branch `wise`): Scaffolded the full project structure for
  PataPotea (backend and frontend folders, base configuration).

## 10 November 2026

- **Wise Munene Mutuku** (branch `wise`): Finalised the folder structure.

## 16 November 2026

- **Wise Munene Mutuku** (branch `wise`): Implemented the `log_item` endpoint for
  guards (`POST /api/items`).
- **Wise Munene Mutuku** (branch `wise`): Implemented the `list_items` endpoint with
  text search and filters (`GET /api/items`).
- **Wise Munene Mutuku** (branch `wise`): Fixed a dependency bug by pinning
  SQLAlchemy to the 2.0.x line and setting the `psycopg2` driver explicitly in
  `DATABASE_URL`.
- **Wise Munene Mutuku** (branch `wise`): Implemented `get_item`, `update_status`,
  and the date range filter on item listing.
- **Wise Munene Mutuku** (branch `wise`): Implemented all claims endpoints: submit,
  list (mine and pending), review, and decide.
- **Wise Munene Mutuku** (branch `wise`): Implemented the `record_handover`
  endpoint.
- **lee9090-code** (branch `feature/backend-auth-admin`): Set up the initial
  database schema and migrations.

## 17 November 2026

- **Justin** (branch `justin`): Implemented the landing page and the browse found
  items page.
- **Justin** (branch `justin`): Implemented the public item detail page.
- **Justin** (branch `justin`): Implemented the how it works page.
- **Justin** (branch `justin`): Implemented the sign in page.
- **Justin** (branch `justin`): Implemented the authentication pages (sign up and
  sign in flow).
- **Justin** (branch `justin`): Improved the navbar navigation and the user menu.
- **Justin** (branch `justin`): Polished the footer layout.

## 18 November 2026

- **lee9090-code** (branch `feature/backend-auth-admin`): Implemented
  authentication and fixed user relationships in the data model.

## Per-person progress at this point

| Person | Branch | Scope | Status |
|---|---|---|---|
| Wise Munene Mutuku | `wise`, merged into `dev` | Items, claims, handover endpoints | Complete |
| lee9090-code | `feature/backend-auth-admin`, not yet merged | Auth, admin, database schema | In progress |
| Justin | `justin`, not yet merged | Public pages, authentication pages, navigation | In progress |
| Emmanuel | `Emmanuel` | Not started (only the initial scaffold commit) | Not started |
| ian | `ian` | Not started (only the initial scaffold commit) | Not started |

## How to keep this file current

Run the following from the project root and append any new rows by date:

```bash
git log --all --date=format:'%Y-%m-%d %H:%M' --pretty=format:'%ad|%an|%s' | sort
```
