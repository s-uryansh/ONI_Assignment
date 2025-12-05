# ONI Internship Assignment

This repository contains:
- Backend: oni_project (NestJS + Prisma)
- Frontend: oni_frontned (Next.js + React)
---

## 1) Prerequisites
- Node 24.11.1
- PostgreSQL (local or Supabase) for backend DATABASE_URL
- Docker (optional)
- Prisma CLI

---

## 2) Running backend (oni_project)

Run locally (development):
1. cd oni_project
2. npm install
3. copy `.env` from example and set DATABASE_URL, JWT_SECRET
4. Run dev server:
   npm run start:dev
   - Default port: `8000` configured in Nest app . Check src/main.ts

Run in Docker (simple):
- Build:
  docker build -t oni-backend .
- Run:
  docker run -e DATABASE_URL="postgresql://user:pass@host:5432/db" -e JWT_SECRET="yourjwt" -p 8000:8000 oni-backend

Docker + Postgres via docker-compose:
- Add a docker-compose.yml with services: backend, postgres (or use Supabase).

Using Supabase:
- Use Supabase project's DATABASE_URL in your .env.
- Ensure network access and passwords are correct.
- For local Prisma migrations against Supabase, run migrations as below (you may need to enable extension access depending on Supabase plan).

---

## 3) Prisma: migrations & seed (backend)
From /oni_project:
- Generate:
  npx prisma generate
- Create & apply migrations (dev):
  npx prisma migrate dev --name init
- Apply migrations:
  npx prisma migrate deploy
- Run seed:
  npx prisma db seed

Notes:
- Ensure DATABASE_URL points to the target DB before migrate.
- If using Supabase, double-check schema and permissions.

---

## 4) Running frontend (oni_frontned)

Run locally:
1. cd oni_frontned
2. npm install
3. Create .env.local (see example) and set NEXT_PUBLIC_NEST_URL to backend URL (e.g. http://localhost:8000)
4. npm run dev
   - Default: http://localhost:3000

Docker (simple):
- Build:
  docker build -t oni-frontend .
- Run:
  docker run -e NEXT_PUBLIC_NEST_URL="http://host.docker.internal:8000" -p 3000:3000 oni-frontend

When running frontend in a container, ensure backend is reachable (host.docker.internal or proper network).

---

## 5) Auth: how it works & testing protected routes

Auth design:
- Backend issues a JWT stored in an httpOnly cookie named `token`.
- Protected endpoints read cookie and validate token server-side.
- Some endpoints additionally verify that the requester id matches route params (e.g. borrow operations).

Common endpoints:
- POST /auth/signup  (public) — create user
- POST /auth/login   (public) — sets httpOnly cookie `token`
- POST /auth/logout  (protected) — clears cookie
- GET /auth/me       (protected) — returns current user (used by frontend to restore session)
- Example protected resource: GET /books/borrowed/all or GET /books/borrowed/user/:user_id

Testing with curl (cookie jar recommended)

1) Signup (public)
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"pass","fullName":"Alice"}'

2) Login and save cookies to a jar
curl -c cookies.txt -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"pass"}'

- `-c cookies.txt` saves Set-Cookie headers into cookies.txt.

3) Call protected endpoint using cookie jar
curl -b cookies.txt http://localhost:8000/auth/me
curl -b cookies.txt http://localhost:8000/books/borrowed/all

4) If an endpoint enforces requester.id === user_id (e.g. borrow), ensure you log in as that user and call:
curl -b cookies.txt -X POST http://localhost:8000/books/borrow/1/1

Notes:
- Use `-c` and `-b` together to persist and reuse cookies across requests.
- In browsers the cookie is set automatically on login and sent on subsequent requests.

If you need the raw token (not recommended for httpOnly cookies), inspect login response if backend returns token in body; prefer cookie approach.

---

## 6) Migrations, seed and testing flow (end-to-end)
1. Configure DATABASE_URL (.env)
2. Run npx prisma migrate dev --name init
3. Run npx prisma db seed (if seed script exists)
4. Start backend (npm run start:dev)
5. Start frontend with NEXT_PUBLIC_NEST_URL pointing to backend
6. Use UI or curl to signup/login and test protected endpoints as above

---

## 7) .env.example

Backend (.oni_project/.env)
- DATABASE_URL="postgresql://user:password@localhost:5432/oni_db"
- JWT_SECRET="replace-with-secure-secret"
# If frontend needs to call backend from dev:
Frontend (.oni_frontned/.env.local)
- NEXT_PUBLIC_NEST_URL="http://localhost:8000"
---

## 8) Assumptions & design notes
- JWT stored in httpOnly cookie named `token`. This is the primary session mechanism.
- Backend verifies token server-side and may check user.id matches route params where appropriate.
- Prisma is used for DB access; prisma/schema.prisma is the canonical schema.
- Seeding is optional and depends on prisma/seed configuration.
- In production, ensure secure cookie flags (Secure, SameSite) and HTTPS.
- When running with Supabase, use the provided DATABASE_URL and ensure you understand Supabase connection limits and extensions.

---
