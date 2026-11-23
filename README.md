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
