# Lighthouse

Full-stack social network — Next.js (App Router), tRPC, Prisma, TypeScript. Boilerplate includes post-it notes CRUD as the base structure.

## Stack

- **Next.js 15** (App Router, React Server Components)
- **tRPC** — type-safe API
- **Prisma** — PostgreSQL ORM
- **Tailwind CSS v4**
- **TypeScript** (strict)

## Setup

1. Copy env and set your database URL:

   ```bash
   copy .env.example .env
   ```

   Edit `.env` and set `DATABASE_URL` (PostgreSQL).

2. Install and generate Prisma client:

   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   ```

3. Run dev server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). Home links to **Post-it notes**; there you can create, edit, and delete notes (full CRUD via tRPC + Prisma).

## Project structure (screens pattern)

- `src/app/` — routing and route handlers; `page.tsx` only does data fetching and delegates UI to screens.
- `src/screens/[page]/` — UI for each page (e.g. `screen.tsx`, `post-it-list.tsx`).
- `src/server/` — tRPC context, routers, Prisma; `src/server/trpc/routers/post-it.ts` is the post-it CRUD router.
- `src/lib/` — utils, SEO helpers (`lib/seo`).
- `prisma/schema.prisma` — PostIt model and DB schema.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run db:generate` — generate Prisma client
- `npm run db:push` — push schema to DB (no migrations)
- `npm run db:studio` — open Prisma Studio

## Conventions

See **CURSOR_RULES.md** for TypeScript style, screens pattern, SEO, accessibility, and testing.
