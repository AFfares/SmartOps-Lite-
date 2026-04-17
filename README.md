# SmartOps Lite

Full-stack multi-tenant SaaS starter for industrial SMEs (ERP/CRM/HR/Production/Inventory + Storefront + AI).

## Requirements

- Node.js + npm
- Docker Desktop (for local PostgreSQL)

## Setup (local)

1. Create env file:

```bash
copy .env.example .env
```

2. Start PostgreSQL:

```bash
npm run db:up
```

3. Create tables and seed demo data:

```bash
npm run db:push
npm run db:seed
```

Reset + reseed (useful for demo mode):

```bash
npm run db:reset
```

If you prefer a migration-based workflow, first create migrations with:

```bash
npm run db:migrate -- --name init
```

Then you can reset via:

```bash
npm run db:migrate:reset
npm run db:seed
```

4. Run the app:

```bash
npm run dev
```

## Demo users (after seeding)

Password for all demo users: `Admin123!`

- Admin: `admin@smartops-lite.com`
- Employee: `employee1@smartops-lite.com`
- Customer: `customer1@smartops-lite.com`

## Portals

- Admin: `/admin/overview`
- Employee: `/employee/dashboard`
- Customer: `/customer/dashboard`
- Store index: `/store`
- Store (SmartOps Lite): `/store/smartops-lite`

## Cloudinary uploads (admin catalog)

Set these in `.env`:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Then open `/admin/catalog` and use **Add image / Set manual / Set video**.

## AI

Set one of these in `.env` to enable the assistant endpoints:

- `OPENROUTER_API_KEY` (preferred; supports Gemini/Claude/etc)
- or `OPENAI_API_KEY`

If both are set, the app will prefer OpenRouter.

## Quality checks

```bash
npm run lint
npm run build
```

## Troubleshooting

### Prisma enum mismatch (TaskStatus)

If you see: `invalid input value for enum "TaskStatus": "TODO"`, your database enum is out of sync (often after changing enum values in `prisma/schema.prisma` without resetting/migrating the DB).

- Dev (data loss): `npm run db:reset`
- Keep data: run the SQL in `prisma/sql/fix_taskstatus_enum.sql` against your database, then rerun `npm run db:seed`.
