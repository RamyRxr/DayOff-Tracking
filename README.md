# 📅 DayOff Tracking — NAFTAL HR System

> Internal HR dashboard for NAFTAL Algeria to manage employee day-off requests and attendance compliance.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-25-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Business Rules](#-business-rules)
- [API Documentation](#-api-documentation)
- [Development](#-development)
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
- **SQLite** — Development database
- **PostgreSQL** — Production database (recommended)

## 📦 Installation

### Prerequisites
- Node.js v18 or higher
- npm or yarn package manager

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/DayOff-Tracking.git
cd DayOff-Tracking
```

### 2. Install dependencies

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

### 3. Database Setup

#### Create Prisma database
```bash
cd ../server
npx prisma migrate dev --name init
```

#### Seed with sample data
```bash
npx prisma db seed
```

This creates:
- 3 admin users with PIN `1234`
- 10 sample employees with realistic Algerian names
- Sample day-off records and blocks

### 4. Environment Variables

Create `.env` files:

#### `server/.env`
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3001
```

#### `client/.env`
```env
VITE_API_URL=http://localhost:3001/api
```

### 5. Start Development Servers

#### Terminal 1 — Backend
```bash
cd server
npm run dev
```

#### Terminal 2 — Frontend
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Login

Use any of the seeded admin accounts:
- **PIN**: `1234` (all admins)
- **Admins**: Mohamed Saidi, Fatima Benali, Ahmed Khelifi

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
