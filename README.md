# UIU TDTS — Task Delegation and Tracking System

A full-stack project management and task tracking platform for the University of Innovation and Upliftment (UIU), built with React, TypeScript, Node.js/Express, and PostgreSQL/Prisma.

## Architecture

```
React (Vite) frontend  →  Express REST API  →  Auth + RBAC middleware  →  Services  →  Prisma ORM  →  PostgreSQL
```

- `client/` — React 18 + TypeScript + Tailwind CSS + Recharts
- `server/` — Node.js + Express + TypeScript + Prisma
- The frontend never talks to PostgreSQL directly; all data flows through the REST API.

## Requirements

- Node.js 18+ (tested on Node 24)
- PostgreSQL 14+ (tested on PostgreSQL 18)
- npm 9+ (this repo uses npm workspaces)

## 1. Install dependencies

From the repository root (installs both `client` and `server` workspaces):

```bash
npm install
```

## 2. Configure the database

Create a dedicated database and role (adjust as needed for your local Postgres setup):

```sql
CREATE ROLE uiu_tdts_app LOGIN PASSWORD 'choose_a_password';
CREATE DATABASE uiu_tdts OWNER uiu_tdts_app;
```

Copy the example environment file and fill in your own values:

```bash
cp server/.env.example server/.env
```

`server/.env`:

```env
DATABASE_URL="postgresql://uiu_tdts_app:choose_a_password@localhost:5432/uiu_tdts"
DIRECT_URL="postgresql://uiu_tdts_app:choose_a_password@localhost:5432/uiu_tdts"
JWT_SECRET="generate_a_long_random_string"
JWT_EXPIRES_IN="7d"
PORT=5000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
COOKIE_SECURE="false"
```

Never commit `server/.env` — it's already listed in `.gitignore`. Generate your own `JWT_SECRET` (e.g. `openssl rand -hex 32`); do not reuse the example value in production.

> Note: `prisma migrate dev` creates a temporary shadow database, which requires the app role to have `CREATEDB` privilege in development (`ALTER ROLE uiu_tdts_app CREATEDB;`). This is not required for `prisma migrate deploy` in production.

## 3. Set up the database schema and seed data

From the repository root:

```bash
npm run prisma:generate   # generate the Prisma client
npm run prisma:migrate    # create and apply migrations (dev)
npm run prisma:seed       # populate demo data
```

Or from `server/`:

```bash
cd server
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

The seed script is idempotent — it wipes and recreates all application data every time it runs, so it's safe to re-run.

## 4. Run in development

From the repository root, this starts both the API (port 5000) and the Vite dev server (port 5173) together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:server   # Express API on http://localhost:5000
npm run dev:client   # Vite dev server on http://localhost:5173 (proxies /api to the backend)
```

Visit **http://localhost:5173**.

## 5. Production build

```bash
npm run build
```

This type-checks and compiles the server to `server/dist/` and builds the client to `client/dist/`. To run the compiled server:

```bash
cd server
npm run start
```

Serve `client/dist/` with any static file host (or a reverse proxy in front of the Express API), pointing `CLIENT_URL`/CORS configuration at wherever the frontend is hosted.

## Demo accounts

All demo accounts are created by the seed script with bcrypt-hashed passwords — plaintext passwords are never stored.

| Name | Email | Password | Role |
|---|---|---|---|
| Dr. M. Asif | admin@uiu.edu | admin123 | Super Admin |
| Dr. Sara Ahmed | faculty@uiu.edu | faculty123 | Faculty |
| Rafiq Hasan | ta@uiu.edu | ta123 | Teaching Assistant |
| Ayesha Khan | ayesha@uiu.edu | pass123 | Team Leader |
| Sana Malik | sana@uiu.edu | pass123 | Team Leader |
| Zaid Rahman | zaid@uiu.edu | pass123 | Member |
| Omar Farooq | omar@uiu.edu | pass123 | Member |
| Nadia Hossain | nadia@uiu.edu | pass123 | Member |
| Bilal Ahmed | bilal@uiu.edu | pass123 | Member |

The internal database role for the last four accounts is `STUDENT`; the UI always displays this as **Member** (see `client/src/lib/roleLabels.ts` and `server/src/utils/roleLabels.ts` for the centralized mapping).

## Roles & permissions

| Internal role | Display name | Can manage roles/permissions? |
|---|---|---|
| SUPER_ADMIN | Super Admin | Yes — the only role that can |
| FACULTY | Faculty | No |
| TA | Teaching Assistant | No |
| LEADER | Team Leader | No |
| STUDENT | Member | No |

All authorization is enforced server-side (`server/src/services/permissions.ts` and `server/src/middleware/auth.ts`) — hiding a nav item or button in the UI is a convenience, never the security boundary. Unauthorized API requests return `403 Forbidden`.

## Database management

- **Prisma Studio** (visual DB browser): `npm run prisma:studio` (from root) or `npx prisma studio` (from `server/`)
- **Create a new migration** after editing `server/prisma/schema.prisma`: `npx prisma migrate dev --name <description>` (run from `server/`)
- **Re-seed demo data**: `npx prisma db seed` (from `server/`) — this resets all application data
- **Reset the database entirely** (drops and recreates, then re-seeds): `npx prisma migrate reset` (from `server/`)

## Project structure

```
server/
├── prisma/
│   ├── schema.prisma      # data model, enums, relations, indexes
│   ├── seed.ts            # demo data
│   └── migrations/
└── src/
    ├── config/            # env, Prisma client
    ├── controllers/       # thin HTTP handlers
    ├── services/          # business logic + RBAC (permissions.ts)
    ├── middleware/         # auth, RBAC guards, error handling
    ├── routes/
    ├── validators/        # zod request schemas
    └── utils/

client/
└── src/
    ├── api/               # typed fetch wrappers per resource
    ├── components/        # layout, modals, shared UI
    ├── context/           # auth + toast state
    ├── pages/             # landing, auth, and the 14 app pages
    └── lib/               # role labels, permissions mirror, constants
```

## Security notes

- Passwords are hashed with bcrypt; password hashes are never sent to the client (enforced by a response-redaction middleware as well as by not selecting the field).
- Authentication uses an HTTP-only JWT cookie; there is no client-side session state to tamper with.
- Public signup only allows the Member and Team Leader roles — Faculty, Teaching Assistant, and Super Admin accounts must be created or promoted by a Super Admin via Roles & Permissions.
- Secrets (`JWT_SECRET`, database credentials) are read from environment variables and are never hard-coded or exposed to the frontend.
