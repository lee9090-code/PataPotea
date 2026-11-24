# PataPotea backend

Flask, SQLAlchemy and PostgreSQL API.

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Start PostgreSQL through Docker (stop any local Postgres on port 5432 first):

```bash
sudo docker-compose up -d    # run from the project root, not from backend/
```

Run migrations and start the server:

```bash
flask db upgrade
python run.py
```

The API runs at `http://localhost:5000`.

### Why `sqlalchemy==2.0.35` is pinned

`requirements.txt` pins SQLAlchemy to the 2.0.x line. Without the pin, pip resolves to
2.1.x, which changes how `postgresql+psycopg2://` URLs are resolved internally and
breaks Flask-SQLAlchemy 3.1.1 with `ModuleNotFoundError: No module named 'psycopg'`,
even though `.env` explicitly specifies the `psycopg2` driver. Do not remove the pin
without testing `flask db migrate` and `python run.py` against the newer version
first.

## Authentication

All protected routes expect `Authorization: Bearer <access_token>` from
`POST /api/auth/login`. Role checks are enforced by the `@role_required(*roles)`
decorator in `app/utils/decorators.py`.

## API reference

All request bodies are JSON unless noted as multipart. All responses are JSON.

### Auth (`app/routes/auth.py`, owned by Person 1)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | none | Create a student or staff account |
| POST | `/api/auth/login` | none | Returns `{ accessToken, user }` |
| POST | `/api/auth/logout` | none | Stateless; the client discards the token |
| GET | `/api/auth/me` | any | Current user's profile |

### Items (`app/routes/items.py`, owned by Person 2)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/items` | none | List items. Query parameters: `q` (text search), `category`, `area`, `date_range` (`YYYY-MM-DD,YYYY-MM-DD`) |
| GET | `/api/items/<id>` | none | A single item's public fields |
| POST | `/api/items` | guard | Log a found item (multipart: `category`, `publicDescription`, `locationFound`, `dateFound`, optional `photo`, `privateDetails`, `finderName`, `finderContact`) |
| PATCH | `/api/items/<id>/status` | guard, admin | Body: `{ status }`, one of `in_store`, `claim_pending`, `approved`, `collected`, `unclaimed` |

Public item fields only. `private_details`, `finder_name` and `finder_contact` never
appear in `to_public_dict()` and are only read directly by guard and admin only
endpoints.

### Claims (`app/routes/claims.py`, owned by Person 2)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/claims` | any | Submit a claim (multipart: `itemId`, `identifyingMarks`, `hiddenDetails`, `lostWhenWhere`, optional `proof` file) |
| GET | `/api/claims/mine` | any | The caller's own claims |
| GET | `/api/claims/pending` | guard, admin | Claims with status `submitted` or `in_review` |
| GET | `/api/claims/<id>` | guard, admin | The claimant's private answers next to the item's stored private record |
| PATCH | `/api/claims/<id>/decision` | guard | Body: `{ decision: "approved" or "rejected", reason }` (`reason` is required when rejecting) |

A claimant is limited to `MAX_CLAIM_ATTEMPTS` (3) submissions per item, defined in
`app/models/claim.py`. Submitting a claim sets the item to `claim_pending`, reserving
it so that nobody else can claim it while it is under review. Rejecting a claim frees
the item back to `in_store`. Approving a claim does not mark the item collected; that
only happens at handover.

### Handover (`app/routes/handover.py`, owned by Person 2)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/handover/<claim_id>` | guard | Body: `{ idChecked: true, signatureData }`. Requires the claim to already be `approved`. Sets both the claim and the item to `collected`. |

### Admin (`app/routes/admin.py`, owned by Person 1)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | admin | Dashboard counts and weekly chart data |
| GET | `/api/admin/guards` | admin | List guard accounts |
| POST | `/api/admin/guards` | admin | Invite a guard |
| PATCH | `/api/admin/guards/<id>` | admin | Edit a guard's name or email |
| PATCH | `/api/admin/guards/<id>/activate` | admin | Re-enable a guard account |
| PATCH | `/api/admin/guards/<id>/deactivate` | admin | Disable desk access, keeping the audit history |
| GET | `/api/admin/items-claims` | admin | All items and claims, filterable and exportable |
| GET | `/api/admin/audit-log` | admin | Paginated, filterable audit trail |

## Data model

- **User**: `role` is one of `student`, `staff`, `guard`, `admin`.
- **Item**: a found item. Public fields (category, description, location, date,
  photo, status) compared with staff only fields (`private_details`, `finder_name`,
  `finder_contact`).
- **Claim**: one claim attempt on one item by one user. The claimant's private answers
  (`identifying_marks`, `hidden_details`, `lost_when_where`, `proof_url`) are compared
  by a guard against the item's `private_details`.
- **Handover**: the physical collection record, holding the ID check, the signature
  and the timestamp. One to one with an approved claim.
- **AuditLog**: append-only. Every write operation logs `action`, `actor_id`,
  `record_type`, `record_id`, and an optional `detail` string.

Human-readable references (`PT-0264` for items, `CL-0081` for claims) are generated by
`next_reference()` in `app/utils/helpers.py`.

## Tests

```bash
cd backend
source venv/bin/activate
python -m pytest
```

## Known limitations

- The admin dashboard weekly charts are a placeholder in the frontend. The
  `/api/admin/stats` endpoint already returns a `weeklyBreakdown` array, but the
  chart rendering has not been built yet.
- The `/api/admin/stats` endpoint uses `func.date_trunc`, a Postgres only
  function. It runs correctly against the project's Postgres database but
  fails under the SQLite test database, so it is not covered by an automated
  test, only by its role check.
- No load testing or accessibility audit has been carried out against any
  part of the system.
