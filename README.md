# 📅 DaysTrack — Day-Off Dashboard

> Modern HR dashboard for tracking employee days off, attendance periods and automatic quota blocking.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-25-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="DaysTrack dashboard" width="85%">
</p>

## 📸 Screenshots

| Dashboard | Dark Mode |
| :---: | :---: |
| <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="100%"> | <img src="docs/screenshots/dashboard-dark.png" alt="Dark mode dashboard" width="100%"> |

| Employees | Calendar |
| :---: | :---: |
| <img src="docs/screenshots/employees.png" alt="Employees" width="100%"> | <img src="docs/screenshots/calendar.png" alt="Calendar" width="100%"> |

| Blocked | Settings | Login |
| :---: | :---: | :---: |
| <img src="docs/screenshots/blocked.png" alt="Blocked employees" width="100%"> | <img src="docs/screenshots/settings.png" alt="Settings" width="100%"> | <img src="docs/screenshots/login.png" alt="Login" width="100%"> |

## 📋 Table of Contents

- [Screenshots](#-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Business Rules](#-business-rules)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🌍 Multilingual Support
- **3 Languages**: French, English, Arabic
- **RTL Support**: Full right-to-left layout for Arabic
- **Database Translation**: All database values (departments, blocking reasons) are translated dynamically

### 👥 Employee Management
- Complete employee profiles with matricule, department, and hire date
- Employee search, sorting and status filtering
- Visual status indicators (Active, At Risk, Blocked)
- Detailed employee view with full day-off history

### 📆 Day-Off Management
- Record day-off requests with a date range and leave type
- Automatic work period calculation (20th → 19th of the following month)
- Visual calendar grid of the current month's day-offs
- Sandwich detection for undeclared working days
- Weekend handling: **Friday + Saturday = weekend**

### 🚫 Automatic Blocking System
- Smart blocking logic: `(30 − total day-off days) < 16`
- Multiple blocking reasons with translations
- Visual risk indicators when the quota is approached
- Admin-only unblock with PIN verification

### 🔔 Real-Time Notifications
- Event-based notifications (block, unblock, at-risk)
- Persistent storage with 7-day auto-expiry
- Read/unread tracking with relative timestamps
- Live updates across all pages

### 🎨 Modern UI/UX
- **Dark Mode**: Deep navy theme with smooth transitions
- **Responsive Design**: Mobile-friendly layout
- **Smooth Animations**: Fade-in, slide-in and scale animations
- **Accessibility**: Keyboard navigation, ARIA labels, focus states

### 🔐 Security
- Admin authentication with a 4-digit PIN
- bcryptjs password hashing and server-side PIN verification
- Session management with `sessionStorage`
- Protected routes and API endpoints
- Superadmin PIN (`0147`) for critical operations

### ⚙️ Settings & Administration
- **Employee Data Management**
  - Import employees from CSV/JSON (60-employee samples included)
  - Bulk delete all employees with the superadmin PIN
  - Required fields: `matricule`, `firstName`, `lastName`, `email`, `phone`, `ssn`, `department`, `position`, `hireDate`
- **Admin Management**
  - Create admin accounts with custom 4-digit PINs, list and delete them
  - PIN confirmation on every sensitive action
- **Database Structure Viewer**
  - Inspect all tables and columns in real time
  - Add, rename and delete columns with instant UI updates
  - Guarded by the superadmin PIN

## 🛠 Tech Stack

### Frontend
- **React 18** — UI library
- **Vite** — build tool and dev server
- **Tailwind CSS v3** — utility-first styling
- **React Router** — client-side routing
- **i18next** — internationalization (fr / en / ar)
- **FullCalendar** — calendar components
- **Lucide React** — icons
- **date-fns** — date manipulation

### Backend
- **Node.js** — runtime
- **Express** — web framework
- **Prisma** — type-safe ORM
- **bcryptjs** — password hashing
- **PDFKit / docxtemplater** — document generation

### Database
- **PostgreSQL** — primary database (development and production)

## 🚀 Quick Start

**Prerequisites:** Node.js v18+, npm, PostgreSQL 12+

```bash
# 1. Clone the repository
git clone https://github.com/RamyRxr/DayOff-Tracking.git
cd DayOff-Tracking

# 2. Setup PostgreSQL (replace the password with your own)
sudo -u postgres psql -c "CREATE USER dayoff_user WITH PASSWORD 'your_secure_password' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE daysoff_db OWNER dayoff_user;"
sudo -u postgres psql -d daysoff_db -c "GRANT ALL ON SCHEMA public TO dayoff_user;"
sudo -u postgres psql -d daysoff_db -c "GRANT CREATE ON SCHEMA public TO dayoff_user;"
sudo -u postgres psql -d daysoff_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dayoff_user;"
sudo -u postgres psql -d daysoff_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dayoff_user;"

# 3. Configure environment variables
echo 'DATABASE_URL="postgresql://dayoff_user:your_secure_password@localhost:5432/daysoff_db"' > server/.env
echo 'PORT=3001' >> server/.env

# 4. Install dependencies
cd server && npm install
cd ../client && npm install
cd ..

# 5. Run migrations and seed the database
cd server
npx prisma migrate dev --name init
npx prisma db seed
cd ..

# 6. Start the application
chmod +x start.sh
./start.sh

# 7. Open http://localhost:5173
# Admin PIN: 1234   ·   Superadmin PIN: 0147
```

**Troubleshooting Quick Start:**

```bash
# 1. PostgreSQL is running
sudo systemctl status postgresql

# 2. User has CREATEDB permission (required by Prisma migrations)
sudo -u postgres psql -c "\du dayoff_user"
# → "Create DB" must appear in the Attributes column

# 3. Database exists
sudo -u postgres psql -c "\l" | grep daysoff_db

# 4. Connection string is correct
cat server/.env
```

**Common issues:**

- **"permission denied to create database"** → user is missing `CREATEDB` (step 2)
- **"permission denied for schema public"** → missing schema grants (step 2)
- **"Port already in use"** → `pkill -9 node`
- **"Cannot find module"** → reinstall: `cd server && npm install && cd ../client && npm install`

## 📦 Installation

### Prerequisites
- **Node.js** v18 or higher
- **npm**
- **PostgreSQL** 12 or higher

### 1. Clone the repository
```bash
git clone https://github.com/RamyRxr/DayOff-Tracking.git
cd DayOff-Tracking
```

### 2. PostgreSQL setup

**Install PostgreSQL (if needed):**

**Ubuntu/Debian**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (Homebrew)**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Windows** — download from [postgresql.org](https://www.postgresql.org/download/windows/)

**Create the user and database:**

```bash
sudo -u postgres psql << 'EOF'
-- User with CREATEDB permission (required by Prisma)
CREATE USER dayoff_user WITH PASSWORD 'your_secure_password' CREATEDB;

-- Database owned by that user
CREATE DATABASE daysoff_db OWNER dayoff_user;

-- Connect to it
\c daysoff_db

-- Permissions required for migrations and seeding
GRANT ALL ON SCHEMA public TO dayoff_user;
GRANT CREATE ON SCHEMA public TO dayoff_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dayoff_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dayoff_user;

-- Verify
\du dayoff_user
EOF
```

Verify the setup:
```bash
sudo -u postgres psql -c "\du"
# dayoff_user should show "Create DB" in the Attributes column
```

### 3. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Environment variables

**`server/.env`**
```env
DATABASE_URL="postgresql://dayoff_user:your_secure_password@localhost:5432/daysoff_db"
PORT=3001
```

**`client/.env`** *(only if the API is not on `localhost:3001`)*
```env
VITE_API_URL=http://localhost:3001/api
```

### 5. Database migration

```bash
cd server
npx prisma migrate dev --name init
```

Creates the `Employee`, `Admin`, `DayOff` and `Block` tables.

### 6. Seed the database

```bash
npx prisma db seed
```

This creates:
- **3 admin accounts**
  - Ramy Test — PIN `1234`
  - Rey Test — PIN `5678`
  - Rxr Test — PIN `1010`
- **60 employees** across 6 departments with European sample data (`@daystrack.eu`)
- No day-off records — a clean slate for testing

### 7. Start the application

**Option A — startup script (recommended)**
```bash
./start.sh
```

**Option B — two terminals**
```bash
# Terminal 1 — backend (port 3001)
cd server && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm run dev
```

### 8. Access the application

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001/api](http://localhost:3001/api)

### 9. Login

Pick any seeded admin and enter its PIN (default: `1234`).

### 10. Superadmin access

Advanced settings (database structure, bulk delete) require the **superadmin PIN: `0147`**.

## 📁 Project Structure

```
DayOff-Tracking/
├── client/                      # React frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── api/                 # API client functions (Fetch only)
│   │   ├── components/          # Reusable UI components
│   │   ├── contexts/            # React contexts (Theme, Admin)
│   │   ├── hooks/               # Custom hooks (all business logic)
│   │   ├── i18n/                # Translation files (fr / en / ar)
│   │   ├── pages/               # Page components
│   │   ├── utils/               # Date, status and period utilities
│   │   ├── App.jsx              # Root component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Express backend
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── migrations/          # SQL migrations
│   │   └── seed.js              # Database seeder
│   ├── scripts/                 # Reset / maintenance scripts
│   ├── src/
│   │   ├── controllers/         # Route handlers (business logic)
│   │   ├── routes/              # API route definitions
│   │   ├── utils/               # PDF/DOCX generation, period logic
│   │   └── index.js             # Express entry point
│   ├── package.json
│   └── .env
│
├── docs/
│   └── screenshots/             # README screenshots
│
├── employees-sample.csv         # 60-employee sample CSV for import testing
├── employees-sample.json        # 60-employee sample JSON for import testing
├── start.sh                     # Startup script (runs both servers)
├── .gitignore
└── README.md                    # This file
```

## 📐 Business Rules

### Work Period Calculation
- The work period runs from the **20th of the current month** to the **19th of the next month**
- Example: `20 Sep 2026 → 19 Oct 2026`

### Minimum Working Days
- **Minimum required:** 16 working days per period
- **Total period days:** 30
- **Maximum day-off:** 14 days (30 − 16)

### Blocking Logic
```javascript
totalDaysOff = sum of day-off days in the current period
remainingWorkDays = 30 − totalDaysOff

if (remainingWorkDays < 16) {
  status = "BLOCKED"
} else if (remainingWorkDays === 16 || remainingWorkDays === 17) {
  status = "AT_RISK"
} else {
  status = "ACTIVE"
}
```

### Weekend Detection
- **Friday + Saturday** = weekend
- Sunday to Thursday = working days

### Sandwich Detection
- Detects undeclared working days between day-off dates
- Formula: `realCalendarDays − declaredWorkingDays`
- Example: a day off declared as 3 days but spanning 5 calendar days → 2 sandwich days

## 🔌 API Documentation

Base URL: `http://localhost:3001/api`

### Admins

#### List admins
```http
GET /api/admins

Response 200:
{
  "data": [
    { "id": "clx001", "name": "Ramy Test", "role": "HR Admin" }
  ]
}
```

#### Verify admin PIN
```http
POST /api/admins/verify-pin
Content-Type: application/json

{ "adminId": "clx001", "pin": "1234" }

Response 200:
{ "data": { "valid": true, "adminName": "Ramy Test" } }
```

### Employees

#### List all employees
```http
GET /api/employees

Response 200:
{
  "data": [
    {
      "id": "clx456def",
      "matricule": "DTK-1001",
      "firstName": "Lucas",
      "lastName": "Martin",
      "email": "lucas.martin@daystrack.eu",
      "department": "Production",
      "hireDate": "2015-03-15T00:00:00.000Z",
      "status": "actif",
      "daysUsed": 0,
      "daysAvailable": 30
    }
  ]
}
```

#### Get a single employee
```http
GET /api/employees/:id
```

#### Create an employee
```http
POST /api/employees
Content-Type: application/json

{
  "matricule": "DTK-1061",
  "firstName": "Chloé",
  "lastName": "Laurent",
  "email": "chloe.laurent@daystrack.eu",
  "phone": "+33 6 12 34 56 78",
  "department": "Qualité",
  "position": "Contrôleur qualité",
  "hireDate": "2024-01-10"
}
```

#### Import / bulk delete (superadmin)
```http
POST /api/employees/import      # multipart CSV or JSON upload
POST /api/employees/delete-all  # requires { "superadminPin": "0147" }
```

### Days Off

#### List day-off records
```http
GET /api/daysoff
GET /api/daysoff?employeeId=clx456def

Response 200:
{
  "data": [
    {
      "id": "clx111aaa",
      "employeeId": "clx456def",
      "startDate": "2026-09-22T12:00:00.000Z",
      "endDate": "2026-09-24T12:00:00.000Z",
      "type": "Congé annuel",
      "reason": "annual"
    }
  ]
}
```

#### Add a day-off
```http
POST /api/daysoff
Content-Type: application/json

{
  "employeeId": "clx456def",
  "startDate": "2026-09-22",
  "endDate": "2026-09-24",
  "type": "Congé annuel",
  "adminId": "clx001"
}
```

### Blocks

#### Block an employee
```http
POST /api/blocks
Content-Type: application/json

{
  "employeeId": "clx456def",
  "reason": "Dépassement du quota de congés",
  "adminId": "clx001"
}
```

#### Unblock an employee
```http
PATCH /api/blocks/:id/unblock
Content-Type: application/json

{ "adminId": "clx001" }
```

#### Documents
```http
GET /api/pdf/block/:blockId      # blocking note (PDF)
GET /api/pdf/unblock/:blockId    # unblocking note (PDF)
```

### Database (superadmin)

All routes require the `X-Superadmin-Pin: 0147` header.

```http
GET  /api/database/schema
POST /api/database/add-column
POST /api/database/edit-column
POST /api/database/delete-column
```

## 🚀 Development

### Coding standards

#### Frontend
- **API calls**: Fetch API only (never Axios) — all calls live in `/src/api/`
- **Business logic**: all logic in `/src/hooks/` (never in pages or components)
- **Styling**: Tailwind CSS only (no inline styles or CSS files)
- **Icons**: Lucide React only
- **Modals**: Headless UI for overlays
- **UI labels**: French · **Code identifiers**: English

#### Backend
- **ORM**: Prisma only (never raw SQL)
- **Route prefix**: everything under `/api`
- **Error handling**: try/catch on every route
- **Response format**: `{ data: ... }` or `{ error: "message" }`
- **PIN verification**: `bcryptjs.compare` (never plain text)

### Common tasks

```bash
# Reset and reseed the database
cd server
npx prisma migrate reset
npx prisma db seed

# Add a migration
npx prisma migrate dev --name add_new_field

# Browse the database
npx prisma studio

# Production build
cd client && npm run build
cd ../server && npm run build
```

## 🐛 Troubleshooting

### Database connection refused
```bash
# macOS
brew services start postgresql@16

# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Password authentication failed
- Verify the credentials in `server/.env`
- Check the grants:
```sql
GRANT ALL PRIVILEGES ON DATABASE daysoff_db TO dayoff_user;
```

### `P3014 — Prisma Migrate could not create the shadow database`
Your user lacks `CREATEDB`:
```bash
sudo -u postgres psql -c "ALTER USER dayoff_user CREATEDB;"
```

### `permission denied for schema public`
```bash
sudo -u postgres psql -d daysoff_db << EOF
GRANT ALL ON SCHEMA public TO dayoff_user;
GRANT CREATE ON SCHEMA public TO dayoff_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dayoff_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dayoff_user;
EOF
```

Then retry:
```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
```

### Port already in use
```bash
lsof -i :3001       # find the PID
kill -9 <PID>
# or simply
pkill -9 node
```

### Migration failed / schema out of sync
```bash
cd server
npx prisma migrate reset
npx prisma migrate dev
npx prisma db seed
```

### Module not found
```bash
cd server && rm -rf node_modules package-lock.json && npm install
cd ../client && rm -rf node_modules package-lock.json && npm install
```

### Import file issues
- All required fields must be present: `matricule`, `firstName`, `lastName`, `email`, `phone`, `ssn`, `department`, `position`, `hireDate`
- File encoding must be UTF-8
- Dates must use `YYYY-MM-DD` (e.g. `2015-03-15`)
- Use the provided sample files as a reference

### Start script permission denied
```bash
chmod +x start.sh
./start.sh
```

## 🌐 Deployment

### Frontend (Vercel / Netlify)
1. Build: `npm run build` (in `client/`)
2. Deploy the `client/dist/` folder
3. Set `VITE_API_URL=https://your-backend.com/api`

### Backend (Railway / Render / Heroku)
1. Add a PostgreSQL database
2. Set `server/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database"
   PORT=3001
   ```
3. Run migrations: `npx prisma migrate deploy`
4. Start: `npm start`

## 🤝 Contributing

Issues and pull requests are welcome. For feature requests or bug reports, open an issue on the repository.

## 📄 License

Proprietary — DaysTrack © 2026

---

## 🙏 Acknowledgments

Built with modern web technologies:
- React Team for React 18
- Vercel for Vite
- Tailwind Labs for Tailwind CSS
- Prisma Team for Prisma ORM
- i18next Team for i18next
- FullCalendar Team for FullCalendar

---

**DaysTrack** | Day-Off Dashboard | 2026
