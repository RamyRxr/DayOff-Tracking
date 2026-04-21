# DayOff-Tracking — NAFTAL HR System

## Project
Internal HR dashboard for NAFTAL Algeria.
Admins manage employee day-off requests and attendance compliance.

## Tech Stack
- Frontend: React 18 + Vite + Tailwind CSS v3
- HTTP: Fetch API only — never use Axios
- Calendar: FullCalendar
- Backend: Node.js + Express
- ORM: Prisma (never raw SQL)
- DB: SQLite (dev) → PostgreSQL (prod)
- Auth: bcryptjs for admin PIN hashing

## Core Business Rules
- Work period = 20th of current month → 19th of next month
- Minimum 16 working days required per period
- Block trigger: (30 − total day-off days) < 16
- Friday + Saturday = weekend (Algeria)
- Sandwich detection: real calendar days > declared working days
- Every write action requires: admin selected + 4-digit PIN entered

## Folder Rules
- All Fetch calls → /api/ folder only, never in components
- All business logic → /hooks/ folder only, never in pages
- Styling → Tailwind only, never inline styles or CSS files
- UI labels → French, variable names → English

## API Conventions
- Base URL: http://localhost:3001/api
- GET /api/employees — list
- GET /api/employees/:id — single
- POST /api/employees — create
- POST /api/daysoff — add day off
- POST /api/blocks — block employee
- PATCH /api/blocks/:id/unblock — unblock

## Do Not
- Never use Axios — Fetch API only
- Never write raw SQL — Prisma only
- Never put logic in React components — use hooks
- Never commit .env files
- Never modify prisma/dev.db directly
