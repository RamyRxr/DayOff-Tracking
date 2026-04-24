Read CLAUDE.md in this project.
You are building Phase 2: the complete backend with PostgreSQL + Prisma + Express.
Do NOT touch any frontend files inside client/src/
Only work in the server/ folder.

After each major step, STOP and print a clear message telling me exactly what
I need to do manually on my machine before you continue.
Format those messages like this:

╔══════════════════════════════════════════════╗
║  ACTION REQUIRED — do this before continuing ║
╠══════════════════════════════════════════════╣
║  [exact steps I need to do]                  ║
╚══════════════════════════════════════════════╝

Then wait for me to confirm before moving to the next step.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — Check what is already built
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before writing anything, read every file inside server/ completely.
List what already exists:
- Which routes exist
- What the current Prisma schema looks like
- What database is currently configured (SQLite or PostgreSQL)
- What packages are already in server/package.json
- What is in server/.env or server/.env.example

Print a summary of what you found, then move to Step 2.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — Install PostgreSQL on the machine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Do NOT write any code yet.
Just print this ACTION REQUIRED message:

╔══════════════════════════════════════════════════════════════════╗
║  ACTION REQUIRED — Install PostgreSQL                            ║
╠══════════════════════════════════════════════════════════════════╣
║  You need to install PostgreSQL on your machine.                 ║
║                                                                  ║
║  You are on Arch Linux. Run these commands in your terminal:     ║
║                                                                  ║
║  1. Install PostgreSQL:                                          ║
║     sudo pacman -S postgresql                                    ║
║                                                                  ║
║  2. Initialize the database cluster:                             ║
║     sudo -u postgres initdb -D /var/lib/postgres/data            ║
║                                                                  ║
║  3. Start and enable the PostgreSQL service:                     ║
║     sudo systemctl enable postgresql                             ║
║     sudo systemctl start postgresql                              ║
║                                                                  ║
║  4. Verify it is running:                                        ║
║     sudo systemctl status postgresql                             ║
║     (you should see "active (running)")                          ║
║                                                                  ║
║  5. Type "done" when PostgreSQL is running.                      ║
╚══════════════════════════════════════════════════════════════════╝

Wait for me to say "done" before continuing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — Create the PostgreSQL database and user
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Do NOT write any code yet.
Print this ACTION REQUIRED message:

╔══════════════════════════════════════════════════════════════════╗
║  ACTION REQUIRED — Create the database                           ║
╠══════════════════════════════════════════════════════════════════╣
║  Run these commands in your terminal:                            ║
║                                                                  ║
║  1. Open the PostgreSQL shell as the postgres system user:       ║
║     sudo -u postgres psql                                        ║
║                                                                  ║
║  2. Inside the psql shell, run these 4 commands exactly:         ║
║                                                                  ║
║     CREATE DATABASE dayoff_db;                                   ║
║     CREATE USER dayoff_user WITH PASSWORD 'dayoff_pass_2024';    ║
║     GRANT ALL PRIVILEGES ON DATABASE dayoff_db TO dayoff_user;   ║
║     \q                                                           ║
║                                                                  ║
║  3. Verify the connection works:                                 ║
║     psql -h localhost -U dayoff_user -d dayoff_db -W             ║
║     (enter password: dayoff_pass_2024)                           ║
║     (you should see: dayoff_db=>)                                ║
║     Type \q to exit.                                             ║
║                                                                  ║
║  4. Type "done" when the connection test works.                  ║
╚══════════════════════════════════════════════════════════════════╝

Wait for me to say "done" before continuing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — Update Prisma to use PostgreSQL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Now write code:

A. Update server/prisma/schema.prisma:
Change the datasource provider from "sqlite" to "postgresql":

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

Keep the generator block exactly as it is.

B. Update or create server/.env:
Set the DATABASE_URL connection string:
DATABASE_URL="postgresql://dayoff_user:dayoff_pass_2024@localhost:5432/dayoff_db"

Also make sure these are in server/.env:
PORT=3001
NODE_ENV=development

C. Update or create server/.env.example (safe to commit):
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/dayoff_db"
PORT=3001
NODE_ENV=development

D. Make sure server/.gitignore includes:
.env
node_modules/
uploads/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — Write the complete Prisma schema
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write the full schema in server/prisma/schema.prisma.
If a schema already exists, compare it to what is needed below
and update it — do not delete anything that is already correct.

Required models:

model Employee {
  id          String    @id @default(uuid())
  matricule   String    @unique
  firstName   String
  lastName    String
  email       String    @unique
  phone       String?
  department  String
  position    String
  status      String    @default("actif")
  hireDate    DateTime
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  daysOff     DayOff[]
  blocks      Block[]
}

model Admin {
  id        String   @id @default(uuid())
  name      String
  role      String
  pinHash   String
  createdAt DateTime @default(now())
  blocks    Block[]  @relation("BlockedBy")
  unblocks  Block[]  @relation("UnblockedBy")
}

model DayOff {
  id            String    @id @default(uuid())
  employeeId    String
  employee      Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  startDate     DateTime
  endDate       DateTime
  type          String
  reason        String?
  justification String?
  createdAt     DateTime  @default(now())
}

model Block {
  id              String    @id @default(uuid())
  employeeId      String
  employee        Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  adminId         String
  admin           Admin     @relation("BlockedBy", fields: [adminId], references: [id])
  reason          String
  description     String?
  isActive        Boolean   @default(true)
  unblockReason   String?
  unblockDescription String?
  unblockedById   String?
  unblockedBy     Admin?    @relation("UnblockedBy", fields: [unblockedById], references: [id])
  unblockedAt     DateTime?
  createdAt       DateTime  @default(now())
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — Install dependencies and run migration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
First check server/package.json for existing dependencies.
If @prisma/client and prisma are not present, add them.

Then print this ACTION REQUIRED message:

╔══════════════════════════════════════════════════════════════════╗
║  ACTION REQUIRED — Install deps and run migration                ║
╠══════════════════════════════════════════════════════════════════╣
║  Run these commands in your terminal from the server/ folder:    ║
║                                                                  ║
║  cd server                                                       ║
║  npm install                                                     ║
║  npx prisma migrate dev --name init                              ║
║                                                                  ║
║  You should see:                                                 ║
║  "Your database is now in sync with your schema."               ║
║                                                                  ║
║  If you see an error:                                            ║
║  - "connection refused" → PostgreSQL is not running              ║
║    Fix: sudo systemctl start postgresql                          ║
║  - "password authentication failed" → wrong credentials         ║
║    Fix: re-run Step 3 to recreate the user                       ║
║  - "database does not exist" → re-run Step 3                     ║
║                                                                  ║
║  Type "done" when migration succeeds.                            ║
╚══════════════════════════════════════════════════════════════════╝

Wait for me to say "done" before continuing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7 — Write the seed file
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create or replace server/prisma/seed.js with realistic data.

The seed must create:

ADMINS (3):
- Mohammed Saïd, role: "Directeur RH", PIN: "1234"
- Fatima Zohra, role: "RH Sénior", PIN: "5678"
- Ahmed Bachir, role: "RH Junior", PIN: "9999"
Hash all PINs with bcryptjs before saving:
  const bcrypt = require('bcryptjs')
  const hash = await bcrypt.hash('1234', 10)

EMPLOYEES (60):
Use realistic Algerian names.
Departments: Production, Logistique, Administration, Maintenance, Qualité, Sécurité
10 employees per department.
Each employee:
- matricule: NAF-XXXX format, unique 4-digit number, padded with zeros
- email: prenom.nom@naftal.dz (lowercase, no spaces)
- phone: +213 XX XX XX XX
- hireDate: random date between 2015 and 2022
- status: "actif" for most, "bloque" for 8 of them

DAY-OFF RECORDS:
For each employee, generate between 3 and 12 day-off records for the
current work period (20th of last month to 19th of this month).
Use types: "Congé annuel", "Congé maladie", "Congé sans solde", "Autre"
Make sure date ranges are within the current work period.
Avoid creating ranges that overlap for the same employee.

BLOCK RECORDS:
For the 8 employees with status "bloque":
Create one active block record each.
adminId: use one of the 3 seeded admins
reason: one of "Absences non justifiées", "Dépassement du quota de congés"
isActive: true

Add this to server/package.json if not already there:
"prisma": {
  "seed": "node prisma/seed.js"
}

Then print:

╔══════════════════════════════════════════════════════════════════╗
║  ACTION REQUIRED — Run the seed                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  From the server/ folder run:                                    ║
║                                                                  ║
║  npx prisma db seed                                              ║
║                                                                  ║
║  You should see no errors and a success message.                 ║
║                                                                  ║
║  Then verify the data:                                           ║
║  npx prisma studio                                               ║
║  (opens a browser at http://localhost:5555)                      ║
║  Check that Employees, Admins, DayOffs, Blocks tables are full.  ║
║                                                                  ║
║  Type "done" when data looks correct.                            ║
╚══════════════════════════════════════════════════════════════════╝

Wait for me to say "done" before continuing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 8 — Write the business logic utilities
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create server/src/utils/period.js with these exact functions:

// Returns { start: Date, end: Date } for the current work period
// Work period = 20th of last month → 19th of current month
function getCurrentPeriod() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  let start, end
  if (day >= 20) {
    start = new Date(year, month, 20)
    end = new Date(year, month + 1, 19)
  } else {
    start = new Date(year, month - 1, 20)
    end = new Date(year, month, 19)
  }
  start.setHours(0,0,0,0)
  end.setHours(23,59,59,999)
  return { start, end }
}

// Returns true if a date is Friday (5) or Saturday (6)
// Algeria weekend = Friday + Saturday
function isWeekend(date) {
  const day = new Date(date).getDay()
  return day === 5 || day === 6
}

// Count working days between two dates (inclusive), excluding Fri + Sat
function countWorkingDays(startDate, endDate) {
  let count = 0
  const current = new Date(startDate)
  current.setHours(0,0,0,0)
  const end = new Date(endDate)
  end.setHours(0,0,0,0)
  while (current <= end) {
    if (!isWeekend(current)) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

// Count calendar days between two dates (inclusive)
function countCalendarDays(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  start.setHours(0,0,0,0)
  end.setHours(0,0,0,0)
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
}

// Sandwich detection: true if the range spans a weekend
// meaning the employee declared fewer working days than calendar days consumed
function isSandwich(startDate, endDate) {
  const working = countWorkingDays(startDate, endDate)
  const calendar = countCalendarDays(startDate, endDate)
  return calendar > working
}

// Returns true if employee should be blocked
// Block when remaining working days would fall below 16
// (30 - daysUsed) < 16 means daysUsed > 14
function shouldBlock(daysUsed) {
  return (30 - daysUsed) < 16
}

// Count how many working days have elapsed since period start (up to today)
function workingDaysElapsed() {
  const { start } = getCurrentPeriod()
  const today = new Date()
  return countWorkingDays(start, today)
}

module.exports = {
  getCurrentPeriod,
  isWeekend,
  countWorkingDays,
  countCalendarDays,
  isSandwich,
  shouldBlock,
  workingDaysElapsed
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 9 — Write the Express server entry point
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create or update server/src/index.js:

const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const employeesRouter = require('./routes/employees')
const adminsRouter = require('./routes/admins')
const daysOffRouter = require('./routes/daysoff')
const blocksRouter = require('./routes/blocks')
const uploadRouter = require('./routes/upload')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/employees', employeesRouter)
app.use('/api/admins', adminsRouter)
app.use('/api/daysoff', daysOffRouter)
app.use('/api/blocks', blocksRouter)
app.use('/api/upload', uploadRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 10 — Write all route and controller files
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create server/src/lib/prisma.js (singleton client):
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
module.exports = prisma

─── EMPLOYEES ───
Create server/src/routes/employees.js
Create server/src/controllers/employeesController.js

Routes:
GET    /api/employees
  - Return all employees with current period stats
  - For each employee include:
    • daysUsed: total working days off in current period (sum of all DayOff records)
    • daysWorked: working days elapsed in period so far
    • daysAvailable: 30 - daysUsed
    • isAtRisk: (30 - daysUsed) < 16 && not already blocked
    • activeBlock: the active Block record if status is "bloque", otherwise null
  - Sort by updatedAt descending (most recently modified first)

GET    /api/employees/:id
  - Return single employee with:
    • all DayOff records for current period
    • active block record if any
    • same stats as list (daysUsed, daysWorked, daysAvailable, isAtRisk)

POST   /api/employees
  - Body: { firstName, lastName, email, phone, department, position, hireDate, matricule }
  - Validate all required fields
  - Check matricule uniqueness
  - Check email uniqueness
  - Return created employee

─── ADMINS ───
Create server/src/routes/admins.js
Create server/src/controllers/adminsController.js

Routes:
GET  /api/admins
  - Return all admins WITHOUT pinHash field
  - Return: id, name, role, createdAt only

POST /api/admins/verify-pin
  - Body: { adminId, pin }
  - Find admin by adminId
  - Use bcryptjs.compare(pin, admin.pinHash)
  - If valid: return { data: { valid: true, adminName: admin.name } }
  - If invalid: return { data: { valid: false } }
  - NEVER return the pinHash in any response
  - NEVER compare plain text — always use bcryptjs.compare

─── DAYS OFF ───
Create server/src/routes/daysoff.js
Create server/src/controllers/daysoffController.js

Routes:
GET  /api/daysoff
  - Optional query param: ?employeeId=xxx
  - If employeeId provided: return only that employee's records
  - Otherwise return all records for current period
  - Sort by createdAt descending

POST /api/daysoff
  - Body: { employeeId, startDate, endDate, type, reason, justification }
  - Validate all required fields (employeeId, startDate, endDate, type)
  - Parse startDate and endDate as Date objects
  - Check employee exists
  - Calculate workingDays = countWorkingDays(startDate, endDate)
  - Detect sandwich: sandwichDetected = isSandwich(startDate, endDate)
  - Get all existing daysOff for this employee in current period
  - Calculate total daysUsed (including the new one)
  - Create the DayOff record in a Prisma transaction
  - Check shouldBlock(totalDaysUsed):
    If true AND employee is not already blocked:
      - Create a Block record automatically
        reason: "Dépassement du quota de congés"
        description: "Blocage automatique — seuil de 16 jours atteint"
        adminId: use the first admin in the database
      - Update employee status to "bloque"
      - autoBlocked = true
    Else:
      - If (30 - totalDaysUsed) < 16: update employee status to "a_risque"
      - autoBlocked = false
  - Update employee updatedAt
  - Return: { data: { dayOff, sandwichDetected, workingDays, autoBlocked } }

─── BLOCKS ───
Create server/src/routes/blocks.js
Create server/src/controllers/blocksController.js

Routes:
GET  /api/blocks
  - Optional query param: ?active=false to get all, default returns only isActive=true
  - Include employee info (firstName, lastName, matricule, department, email, phone)
  - Include admin info (name, role) for blockedBy
  - Sort by createdAt descending

POST /api/blocks
  - Body: { employeeId, adminId, reason, description }
  - Validate all required fields
  - Check employee exists and is not already blocked
  - Verify admin exists
  - Create Block record with isActive: true
  - Update employee status to "bloque"
  - Return: { data: block }

PATCH /api/blocks/:id/unblock
  - Body: { adminId, unblockReason, unblockDescription }
  - Validate blockId exists and isActive is true
  - Set: isActive: false, unblockReason, unblockDescription, unblockedById: adminId, unblockedAt: now
  - Update employee status to "actif"
  - Return: { data: updatedBlock }

─── UPLOAD ───
Create server/src/routes/upload.js
Install multer if not present.

POST /api/upload
  - Accept single file field named "file"
  - Allowed MIME types: application/pdf, image/jpeg, image/png
  - Max file size: 5MB (5 * 1024 * 1024 bytes)
  - Save to server/uploads/ folder (create if not exists)
  - Filename: timestamp-originalname (to avoid collisions)
  - Return: { data: { filename, path: /uploads/filename, size } }
  - Reject invalid types with 400 error: { error: "Type de fichier non autorisé" }
  - Reject oversized files with 400 error: { error: "Fichier trop volumineux (max 5 Mo)" }

ALL CONTROLLERS must follow this pattern:
- Wrap everything in try/catch
- Success: res.json({ data: result }) or res.status(201).json({ data: result })
- Error: res.status(code).json({ error: message })
- Log errors with console.error before sending response
- Use Prisma only — no raw SQL anywhere

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 11 — Start the server and test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Make sure server/package.json has these scripts:
"scripts": {
  "dev": "nodemon src/index.js",
  "start": "node src/index.js",
  "prisma:studio": "prisma studio"
}

Make sure nodemon is in devDependencies.
If not: add it.

Then print:

╔══════════════════════════════════════════════════════════════════╗
║  ACTION REQUIRED — Start the server                              ║
╠══════════════════════════════════════════════════════════════════╣
║  From the server/ folder run:                                    ║
║                                                                  ║
║  npm run dev                                                     ║
║                                                                  ║
║  You should see:                                                 ║
║  "Server running on http://localhost:3001"                       ║
║                                                                  ║
║  Then test the health endpoint in your browser or terminal:      ║
║  curl http://localhost:3001/api/health                           ║
║                                                                  ║
║  You should get:                                                 ║
║  {"status":"ok","timestamp":"..."}                               ║
║                                                                  ║
║  Type "done" when the server is running.                         ║
╚══════════════════════════════════════════════════════════════════╝

Wait for me to say "done" before continuing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 12 — Test all API endpoints
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create server/test-api.sh with curl tests for every endpoint.
Make it executable and run it.

The test file must test:
1.  GET  /api/health                         → expect { status: "ok" }
2.  GET  /api/admins                         → expect array of 3 admins, no pinHash
3.  POST /api/admins/verify-pin              → { adminId: first_admin_id, pin: "1234" } → valid: true
4.  POST /api/admins/verify-pin              → { adminId: first_admin_id, pin: "0000" } → valid: false
5.  GET  /api/employees                      → expect array of 60 employees with stats
6.  GET  /api/employees/:id                  → single employee with daysOff and stats
7.  POST /api/employees                      → create new employee, expect 201
8.  GET  /api/daysoff                        → all day-off records
9.  GET  /api/daysoff?employeeId=:id         → filtered records
10. POST /api/daysoff                        → add day off, check autoBlocked field
11. GET  /api/blocks                         → active blocks only
12. GET  /api/blocks?active=false            → all blocks
13. POST /api/blocks                         → block an employee
14. PATCH /api/blocks/:id/unblock            → unblock an employee

Print the result of each test clearly:
✅ Test X passed — [endpoint]
❌ Test X FAILED — [endpoint] — [error message]

After running all tests print a summary:
X/14 tests passed

If any test fails, fix the bug immediately and re-run the test.
Do not move on until all 14 tests pass.

Then print:

╔══════════════════════════════════════════════════════════════════╗
║  ACTION REQUIRED — Verify all tests pass                         ║
╠══════════════════════════════════════════════════════════════════╣
║  From the server/ folder run:                                    ║
║                                                                  ║
║  chmod +x test-api.sh && ./test-api.sh                           ║
║                                                                  ║
║  All 14 tests must pass before Phase 2 is complete.              ║
║                                                                  ║
║  Type "done" when you see 14/14 tests passed.                    ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 13 — Final commit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When all 14 tests pass:

1. Make sure server/.env is in .gitignore
2. Make sure server/uploads/ is in .gitignore
3. Make sure server/prisma/dev.db is in .gitignore (old SQLite file)
4. Delete server/prisma/dev.db if it still exists

Run:
git add -A
git commit -m "feat: complete backend — PostgreSQL, Prisma, all API routes, seed data, tests"

Then print a final summary:

╔══════════════════════════════════════════════════════════════════╗
║  ✅ PHASE 2 COMPLETE                                              ║
╠══════════════════════════════════════════════════════════════════╣
║  What was built:                                                 ║
║  • PostgreSQL database: dayoff_db                                ║
║  • Prisma schema: Employee, Admin, DayOff, Block                 ║
║  • Seed data: 60 employees, 3 admins, day-offs, blocks           ║
║  • Business logic: period calc, sandwich detection, block rules  ║
║  • REST API: 14 endpoints, all tested and passing                ║
║  • File upload: multer, PDF/JPG/PNG, max 5MB                     ║
║                                                                  ║
║  Next: Connect the frontend to this API (Phase 3)                ║
║  Frontend runs on: http://localhost:5173                         ║
║  Backend runs on:  http://localhost:3001                         ║
╚══════════════════════════════════════════════════════════════════╝