# PataPotea

Centralised lost-and-found web application for Strathmore University.

Students report lost items and browse items that have been handed in. Guards log found
items and verify claims against private details only the real owner would know. Admins
oversee guard accounts and keep a read-only audit trail. See
`PataPotea_Team_Onboarding.pdf` for the full team workflow explanation.

## Project structure

```
PataPotea/
├── backend/     Flask, SQLAlchemy and PostgreSQL API
├── frontend/    React, Vite, TypeScript and Tailwind CSS
└── docker-compose.yml   Local PostgreSQL and pgAdmin
```

## How it works

1. **Report**: a student searches found items, or posts a lost report.
2. **Match**: if a listed item looks right, the student submits a claim with private
   details (identifying marks, hidden contents, proof) that are never shown publicly.
3. **Verify**: a guard compares the claimant's private answers against the private
   details recorded when the item was logged, then approves or rejects the claim.
4. **Collect**: the owner brings their university ID, signs in person, and the guard
   records the handover. Only then does the item move to `collected`.

Every write (item logged, claim submitted or decided, handover recorded, guard
activated or deactivated) is written to an append-only audit log. Nothing in that log
is ever edited or deleted.

### Item status lifecycle
`in_store` to `claim_pending` to `approved` to `collected`, with `rejected` (claim
denied, item returns to `in_store`) and `unclaimed` as branches.

### Claim status lifecycle
`submitted` to `in_review` to `approved` or `rejected` to `collected` (the move to
`collected` happens through the handover endpoint, not the claim decision itself).

## User roles

| Role | Access |
|---|---|
| `student` / `staff` | Browse items, submit and track claims |
| `guard` | Log found items, review claims, record handovers |
| `admin` | Manage guard accounts, view all records and the audit log |

Guard and admin accounts are created by an admin. There is no public sign-up for them.

## Backend

Flask app in `backend/`. See [backend/README.md](backend/README.md) for setup
instructions (virtual environment, Docker Postgres, migrations) and the full API
reference.

Routes are split by owner:

| File | Owns | Status |
|---|---|---|
| `app/routes/items.py` | Found items (list, detail, log, status) | Done |
| `app/routes/claims.py` | Claims (submit, list, verify, decide) | Done |
| `app/routes/handover.py` | Physical collection | Done |
| `app/routes/auth.py` | Register, login, logout, profile | In progress |
| `app/routes/admin.py` | Guard accounts, stats, audit log | In progress |

## Frontend

React, Vite and TypeScript app in `frontend/`, styled with Tailwind CSS.

```bash
cd frontend
npm install
npm run dev
```

Pages are organised by audience under `src/pages/`: `public/`, `auth/`, `student/`,
`guard/`, `admin/`. API calls live in `src/services/`, with one file per backend
resource (`itemsService.ts`, `claimsService.ts`, `authService.ts`), and
`src/services/api.ts` holds the shared Axios instance (base URL and auth header).

## Git workflow

- `main`: production ready.
- `dev`: integration branch; feature branches merge here first.
- `<yourname>` or `feature/<name>`: one branch per person or feature.

```bash
# start new work
git checkout dev
git pull origin dev
git checkout -b your-branch-name

# finish work
git add <files>
git commit -m "feat: what you built"
git push origin your-branch-name
# open a pull request into dev on GitHub, or merge locally:
git checkout dev
git pull origin dev
git merge your-branch-name
git push origin dev
```

Rebase your feature branch onto the latest `dev` before merging if `dev` has moved on
since you branched, to avoid overwriting teammates' work that landed in the meantime.

## Deadline

2 December 2026.
