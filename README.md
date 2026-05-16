# 📅 DayOff Tracking — NAFTAL HR System

> Internal HR dashboard for NAFTAL Algeria to manage employee day-off requests and attendance compliance.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-25-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/RamyRxr/DayOff-Tracking.git
cd DayOff-Tracking

# 2. Create PostgreSQL database with proper permissions
sudo -u postgres psql << EOF
CREATE DATABASE dayoff_db;
CREATE USER your_username WITH PASSWORD 'your_password' CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE dayoff_db TO your_username;
\c dayoff_db
GRANT ALL ON SCHEMA public TO your_username;
GRANT CREATE ON SCHEMA public TO your_username;
EOF

# 3. Setup environment variables
echo 'DATABASE_URL="postgresql://your_username:your_password@localhost:5432/dayoff_db"' > server/.env
echo 'PORT=3001' >> server/.env

# 4. Install dependencies
cd server && npm install
cd ../client && npm install

# 5. Run migrations and seed database
cd ../server
npx prisma migrate dev --name init
npx prisma db seed

# 6. Start the application
cd ..
chmod +x start.sh  # Make script executable
./start.sh

# 7. Open http://localhost:5173
# Login with PIN: 1234 (default admin)
# Superadmin PIN: 0147 (for settings)
```

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
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
- Employee search and filtering
- Visual status indicators (Active, At Risk, Blocked)
- Detailed employee view with full history

### 📆 Day-Off Management
- Record day-off requests with date range and reason
- Automatic work period calculation (20th to 19th of next month)
- Visual calendar grid showing current month day-offs
- Sandwich detection for non-declared working days
- Algerian work week support (Friday + Saturday = weekend)

### 🚫 Automatic Blocking System
- Smart blocking logic: (30 − total day-off days) < 16
- Multiple blocking reasons with translations
- Visual risk indicators when approaching limit
- Admin-only unblock functionality with PIN verification

### 🔔 Real-Time Notifications
- Event-based notification system (block, unblock, at-risk)
- Persistent storage with 7-day auto-expiry
- Read/unread tracking
- Relative time display (e.g., "Il y a 2 heures")
- Real-time updates across all pages

### 🎨 Modern UI/UX
- **Dark Mode**: Beautiful deep blue theme with smooth transitions
- **Responsive Design**: Mobile-friendly layout
- **Smooth Animations**: Fade-in, slide-in, and scale animations
- **Accessibility**: Keyboard navigation, ARIA labels, focus states
- **Visual Calendar**: FullCalendar integration with custom event rendering

### 🔐 Security
- Admin authentication with 4-digit PIN
- bcryptjs password hashing
- PIN verification for all write operations
- Session management with localStorage
- Protected routes and API endpoints
- Superadmin access control (PIN: 0147) for critical operations

### ⚙️ Settings & Administration
- **Employee Data Management**
  - Import employees from CSV/JSON files (60-employee samples included)
  - Bulk delete all employees with superadmin PIN
  - Required fields: matricule, firstName, lastName, email, phone, ssn, department, position, hireDate
  
- **Admin Management**
  - Create new admin accounts with custom 4-digit PINs
  - View all administrators
  - Delete admin accounts
  - PIN confirmation for security
  
- **Database Structure Viewer**
  - View all tables and columns in real-time
  - Add new columns with type selection (String, Int, BigInt, Float, Decimal, Boolean, DateTime, Date, Time, Json, Bytes)
  - Edit column names and types with instant UI updates
  - Delete columns with confirmation
  - Requires superadmin PIN (0147) to access

## 🛠 Tech Stack

### Frontend
- **React 18** — Modern UI library with hooks
- **Vite** — Lightning-fast build tool
- **Tailwind CSS v3** — Utility-first styling
- **React Router** — Client-side routing
- **i18next** — Internationalization framework
- **FullCalendar** — Calendar component
- **Lucide React** — Icon library
- **date-fns** — Date manipulation and formatting

### Backend
- **Node.js v25** — JavaScript runtime
- **Express** — Web framework
- **Prisma** — Type-safe ORM
- **bcryptjs** — Password hashing
- **CORS** — Cross-origin resource sharing

### Database
- **PostgreSQL** — Primary database (development & production)

## 📦 Installation

### Prerequisites
- **Node.js** v18 or higher
- **npm** or yarn package manager
- **PostgreSQL** 12 or higher

### 1. Clone the repository
```bash
git clone https://github.com/RamyRxr/DayOff-Tracking.git
cd DayOff-Tracking
```

### 2. PostgreSQL Database Setup

#### Install PostgreSQL (if not already installed)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
Download and install from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)

#### Create Database and User
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Inside PostgreSQL shell:
CREATE DATABASE dayoff_db;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dayoff_db TO your_username;

# Grant schema permissions (IMPORTANT for Prisma)
\c dayoff_db
GRANT ALL ON SCHEMA public TO your_username;
GRANT CREATE ON SCHEMA public TO your_username;

# Grant database creation permission (for shadow database)
ALTER USER your_username CREATEDB;

\q
```

**Example:**
```sql
CREATE DATABASE dayoff_db;
CREATE USER ramy WITH PASSWORD '2004';
GRANT ALL PRIVILEGES ON DATABASE dayoff_db TO ramy;

-- Connect to the database
\c dayoff_db

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO ramy;
GRANT CREATE ON SCHEMA public TO ramy;

-- Allow user to create databases (for Prisma shadow database)
ALTER USER ramy CREATEDB;
```

**Quick Copy-Paste (replace with your values):**
```bash
sudo -u postgres psql << EOF
CREATE DATABASE dayoff_db;
CREATE USER ramy WITH PASSWORD '2004' CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE dayoff_db TO ramy;
\c dayoff_db
GRANT ALL ON SCHEMA public TO ramy;
GRANT CREATE ON SCHEMA public TO ramy;
EOF
```

### 3. Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd ../client
npm install
```

### 4. Environment Variables Setup

#### `server/.env`
Create this file in the `server/` directory:

```env
# Database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Server port
PORT=3001

# Example:
# DATABASE_URL="postgresql://ramy:2004@localhost:5432/dayoff_db"
```

**Important:** Replace with your actual PostgreSQL credentials:
- `username` — Your PostgreSQL user
- `password` — Your PostgreSQL password
- `database_name` — Your database name (e.g., dayoff_db)

#### `client/.env` (Optional)
Create this file in the `client/` directory if API URL is different:

```env
VITE_API_URL=http://localhost:3001/api
```

### 5. Database Migration

Run Prisma migrations to create tables:

```bash
cd server
npx prisma migrate dev --name init
```

This will create all necessary tables: Employee, Admin, DayOff, Block

### 6. Seed Database (Optional)

Populate database with sample data:

```bash
npx prisma db seed
```

This creates:
- **3 admin users** with PIN `1234`
  - Mohamed Saidi (Admin RH)
  - Fatima Benali (Admin RH)
  - Ahmed Khelifi (Admin RH)
- **10 sample employees** with realistic Algerian names
- Sample day-off records and blocks

### 7. Start the Application

#### Option A: Use the startup script (Recommended)
```bash
# From the root directory
./start.sh
```

This will:
- Start backend server on port 3001
- Start frontend dev server on port 5173
- Display both URLs

#### Option B: Manual start (2 terminals)

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

### 8. Access the Application

Open your browser and navigate to:
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001/api](http://localhost:3001/api)

### 9. Login

Use any of the seeded admin accounts:
- **Default PIN:** `1234`
- **Admins:** Mohamed Saidi, Fatima Benali, Ahmed Khelifi

### 10. Superadmin Access

For advanced settings (database management):
- **Superadmin PIN:** `0147`
- Used for: Viewing database structure, deleting all employees, modifying schema

## 📁 Project Structure

```
DayOff-Tracking/
├── client/                      # React frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── api/                 # API client functions (Fetch only)
│   │   ├── components/          # Reusable UI components
│   │   ├── contexts/            # React contexts (Theme)
│   │   ├── hooks/               # Custom React hooks (business logic)
│   │   ├── locales/             # i18n translation files (fr/en/ar)
│   │   ├── pages/               # Page components
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx              # Root component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Express backend
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.js              # Database seeder
│   │   └── dev.db               # SQLite database (dev)
│   ├── src/
│   │   ├── controllers/         # Route handlers (business logic)
│   │   ├── routes/              # API route definitions
│   │   └── index.js             # Express app entry
│   ├── package.json
│   └── .env
│
├── .claude/                     # Claude Code AI rules
│   ├── rules/                   # Project-specific rules
│   └── skills/                  # Custom AI skills
│
├── employees-sample.csv         # 60-employee sample CSV for import testing
├── employees-sample.json        # 60-employee sample JSON for import testing
├── start.sh                     # Startup script (runs both servers)
├── .gitignore
├── CLAUDE.md                    # Project instructions
├── CLAUDE.local.md              # Personal overrides (not committed)
└── README.md                    # This file
```

## 📐 Business Rules

### Work Period Calculation
- Work period runs from **20th of current month** to **19th of next month**
- Example: Period = April 20, 2026 → May 19, 2026

### Minimum Working Days
- **Minimum required**: 16 working days per period
- **Total period days**: 30 days
- **Maximum day-off**: 14 days (30 − 16)

### Blocking Logic
```javascript
totalDaysOff = sum of all day-off days in current period
remainingWorkDays = 30 − totalDaysOff

if (remainingWorkDays < 16) {
  status = "BLOCKED"
} else if (remainingWorkDays === 16 || remainingWorkDays === 17) {
  status = "AT_RISK"
} else {
  status = "ACTIVE"
}
```

### Weekend Detection (Algeria)
- **Friday + Saturday** = Weekend
- Sunday to Thursday = Working days

### Sandwich Detection
- Detects non-declared working days between day-off dates
- Calculates: `realCalendarDays − declaredWorkingDays`
- Example: Day off April 1-5 declared as 3 days but spans 5 calendar days → 2 sandwich days

## 🔌 API Documentation

Base URL: `http://localhost:3001/api`

### Admins

#### Verify Admin PIN
```http
POST /api/admins/verify
Content-Type: application/json

{
  "adminId": "clx123abc",
  "pin": "1234"
}

Response 200:
{
  "id": "clx123abc",
  "name": "Mohamed Saidi",
  "role": "Admin RH"
}
```

### Employees

#### List All Employees
```http
GET /api/employees

Response 200:
[
  {
    "id": "clx456def",
    "matricule": "EMP001",
    "firstName": "Ahmed",
    "lastName": "Benali",
    "department": "IT",
    "hireDate": "2020-01-15T00:00:00.000Z",
    "status": "ACTIVE",
    "totalDaysOff": 5,
    "remainingWorkDays": 25
  }
]
```

#### Get Single Employee
```http
GET /api/employees/:id

Response 200:
{
  "id": "clx456def",
  "matricule": "EMP001",
  "firstName": "Ahmed",
  "lastName": "Benali",
  "department": "IT",
  "hireDate": "2020-01-15T00:00:00.000Z",
  "status": "ACTIVE",
  "totalDaysOff": 5,
  "remainingWorkDays": 25,
  "daysOff": [...],
  "blocks": [...]
}
```

#### Create Employee
```http
POST /api/employees
Content-Type: application/json

{
  "matricule": "EMP999",
  "firstName": "Fatima",
  "lastName": "Khelifi",
  "department": "RH",
  "hireDate": "2024-01-10"
}

Response 201:
{
  "id": "clx789ghi",
  ...
}
```

### Days Off

#### List Day-Off Records
```http
GET /api/daysoff?month=4&year=2026

Response 200:
[
  {
    "id": "clx111aaa",
    "employeeId": "clx456def",
    "startDate": "2026-04-10T00:00:00.000Z",
    "endDate": "2026-04-12T00:00:00.000Z",
    "totalDays": 3,
    "reason": "Congé annuel",
    "createdAt": "2026-04-01T10:00:00.000Z",
    "employee": {
      "id": "clx456def",
      "firstName": "Ahmed",
      "lastName": "Benali",
      "name": "Ahmed Benali",
      "avatar": "AB"
    }
  }
]
```

#### Add Day-Off
```http
POST /api/daysoff
Content-Type: application/json

{
  "employeeId": "clx456def",
  "startDate": "2026-04-20",
  "endDate": "2026-04-22",
  "totalDays": 3,
  "reason": "Congé annuel",
  "adminId": "clx123abc",
  "adminPin": "1234"
}

Response 201:
{
  "id": "clx222bbb",
  ...
}
```

### Blocks

#### Block Employee
```http
POST /api/blocks
Content-Type: application/json

{
  "employeeId": "clx456def",
  "reason": "Dépassement du quota de congés",
  "adminId": "clx123abc",
  "adminPin": "1234"
}

Response 201:
{
  "id": "clx333ccc",
  "employeeId": "clx456def",
  "reason": "Dépassement du quota de congés",
  "blockedAt": "2026-04-28T10:00:00.000Z",
  "unblockedAt": null
}
```

#### Unblock Employee
```http
PATCH /api/blocks/:id/unblock
Content-Type: application/json

{
  "adminId": "clx123abc",
  "adminPin": "1234"
}

Response 200:
{
  "id": "clx333ccc",
  "unblockedAt": "2026-04-28T11:00:00.000Z"
}
```

## 🚀 Development

### Coding Standards

#### Frontend Rules
- **API Calls**: Use Fetch API only (never Axios) — all calls in `/src/api/`
- **Business Logic**: All logic in `/src/hooks/` (never in pages or components)
- **Styling**: Tailwind CSS only (no inline styles or CSS files)
- **Icons**: Lucide React only
- **Modals**: Headless UI for all overlays
- **UI Labels**: French
- **Code**: English (variable names, function names, file names)

#### Backend Rules
- **ORM**: Prisma only (never raw SQL)
- **Route Prefix**: All routes prefixed with `/api`
- **Error Handling**: try/catch on every route
- **Response Format**: `{ data: ... }` or `{ error: "message" }`
- **PIN Verification**: bcryptjs.compare (never plain text)

### Common Tasks

#### Reset Database
```bash
cd server
npx prisma migrate reset
npx prisma db seed
```

#### Add a Database Migration
```bash
cd server
npx prisma migrate dev --name add_new_field
```

#### View Database
```bash
cd server
npx prisma studio
```

#### Build for Production
```bash
# Frontend
cd client
npm run build

# Backend
cd server
npm run build
```

## 🌐 Deployment

### Frontend (Vercel/Netlify)
1. Build: `npm run build` (in `client/`)
2. Deploy `client/dist/` folder
3. Set environment variable: `VITE_API_URL=https://your-backend.com/api`

### Backend (Railway/Render/Heroku)
1. Add PostgreSQL database
2. Update `server/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database"
   PORT=3001
   ```
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Start server:
   ```bash
   npm start
   ```

## 🐛 Troubleshooting

### Database Connection Issues

**Error: `connection refused` or `ECONNREFUSED`**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if stopped
sudo systemctl start postgresql
```

**Error: `password authentication failed`**
- Verify credentials in `server/.env`
- Check if user has proper permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE dayoff_db TO your_username;
```

### Prisma Migration Issues

**Error: `P3014 - Prisma Migrate could not create the shadow database`**

This means your PostgreSQL user doesn't have permission to create databases. Fix:

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Grant CREATEDB permission
ALTER USER your_username CREATEDB;
\q
```

**Error: `permission denied for schema public`**

Your user needs schema permissions:

```bash
sudo -u postgres psql -d dayoff_db << EOF
GRANT ALL ON SCHEMA public TO your_username;
GRANT CREATE ON SCHEMA public TO your_username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO your_username;
EOF
```

**Complete Permission Fix (if you're getting any permission errors):**
```bash
# Replace 'ramy' with your username and 'dayoff_db' with your database name
sudo -u postgres psql << EOF
ALTER USER ramy CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE dayoff_db TO ramy;
\c dayoff_db
GRANT ALL ON SCHEMA public TO ramy;
GRANT CREATE ON SCHEMA public TO ramy;
GRANT ALL ON ALL TABLES IN SCHEMA public TO ramy;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ramy;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ramy;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ramy;
EOF
```

Then retry migration:
```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
```

### Port Already in Use

**Error: `Port 3001 already in use`**
```bash
# Kill existing node processes
pkill -9 node

# Or find and kill specific process
lsof -i :3001
kill -9 <PID>
```

### Migration Issues

**Error: `Migration failed` or schema sync issues**
```bash
# Reset database and re-run migrations
cd server
npx prisma migrate reset
npx prisma migrate dev
npx prisma db seed
```

### Module Not Found

**Error: `Cannot find module`**
```bash
# Reinstall dependencies
cd server && rm -rf node_modules package-lock.json && npm install
cd ../client && rm -rf node_modules package-lock.json && npm install
```

### Import File Issues

**CSV/JSON import not working:**
- Ensure all required fields are present: `matricule`, `firstName`, `lastName`, `email`, `phone`, `ssn`, `department`, `position`, `hireDate`
- Check file encoding (should be UTF-8)
- Date format should be: `YYYY-MM-DD` (e.g., `2015-03-15`)
- Use provided sample files as reference

### Start Script Permission Denied

```bash
# Make start.sh executable
chmod +x start.sh

# Then run it
./start.sh
```

## 🤝 Contributing

This is an internal NAFTAL project. For feature requests or bug reports, contact the development team.

## 📄 License

Proprietary — NAFTAL Algeria © 2026

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

**Developed for NAFTAL Algeria** | Internal HR System | 2026
