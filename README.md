# FixMyCity – Civic & Community Issue Management System

FixMyCity is a real-world, full-stack civic issue management platform that connects residents with municipal departments to report, triage, track, and resolve neighborhood problems—including damaged roads, overflowing garbage, broken streetlights, water pipeline leaks, and drainage issues.

---

## 🏛️ System Features & Highlights

### 1. Citizen Features
- **Notice & Report Issues:** Report neighborhood hazards with title, category, location, detailed description, and photo evidence.
- **Unique Complaint Tracking ID:** Automatic generation of human-readable IDs formatted as `FMC-YYYY-XXXXXX` (e.g., `FMC-2026-0C2083`).
- **Live Public Issue Tracker:** Track resolution progress with a 5-step interactive visual stepper:
  `Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` (or `Rejected`).
- **Immutable Audit History:** View every remark, status transition, timestamp, and field note logged by municipal staff.
- **My History Portal:** Direct access to all personal reports with real-time status badges.

### 2. Municipal Admin Desk
- **Executive Operations Dashboard:** Real-time metrics on total signals, pending triage, in-progress field work, and resolved issues.
- **Centralized Triage Queue:** Filter complaints by status or category, and search by tracking ID, title, or location.
- **Field Assignment & Routing:** Dispatch reports to municipal departments (Sanitation, Road, Water, Electricity, Drainage, General Civic) and assign specific inspectors/officers.
- **Resolution & Audit Remarks:** Publish updates that reflect immediately in the citizen's tracker.
- **Analytics & Statistics:** High-fidelity data visualization with Recharts (monthly influx trends, category breakdown, status distribution, and department workload).

---

## 🛠️ Technology Stack

- **Frontend:** React 19, React Router v7, Axios, Lucide React icons, Recharts, Tailwind CSS.
- **Backend:** Node.js, Express.js REST API, Multer (photo upload), JWT (JSON Web Tokens), bcryptjs (password hashing).
- **Database:** MySQL, `mysql2/promise` with parameterized queries, ACID transactions, and foreign key relations.
- **Embedded Adaptability:** Built-in zero-config database mode for seamless live preview while remaining 100% MySQL schema compliant.

---

## 📁 Project Architecture

```
FixMyCity/
│
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── components/          # Reusable UI (Navbar, Footer, Stepper, StatusBadge, etc.)
│   │   ├── pages/               # Citizen views (Home, ReportIssue, TrackIssue, MyHistory)
│   │   │   └── admin/           # Admin views (AdminDashboard, AdminQueue, ManageComplaint, Statistics)
│   │   ├── services/            # Axios API clients
│   │   ├── context/             # AuthContext (JWT & demo role switching)
│   │   ├── utils/               # Date formatters & helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── server/                      # Backend Node.js / Express application
│   ├── config/
│   │   └── db.js                # MySQL2 connection pool with automatic fallback
│   ├── controllers/             # authController, complaintController, adminController, departmentController
│   ├── routes/                  # authRoutes, complaintRoutes, adminRoutes, departmentRoutes
│   ├── middleware/              # JWT authMiddleware, role checks, multer uploadMiddleware
│   ├── utils/                   # ID generator (FMC-YYYY-XXXXXX)
│   ├── uploads/                 # Static photo storage directory
│   ├── server.js                # Express app setup and route mounting
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── fixmycity.sql            # Complete MySQL DDL & DML seed dataset
│
├── server.ts                    # Root full-stack dev server entry point
├── package.json
└── README.md
```

---

## 🗄️ Database Setup (MySQL)

1. Open your terminal or MySQL command-line client:
   ```bash
   mysql -u root -p
   ```
2. Import the schema and seed data:
   ```bash
   source database/fixmycity.sql;
   ```
   *(Or run: `mysql -u root -p < database/fixmycity.sql`)*

3. Configure your environment variables in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=fixmycity
   DB_PORT=3306
   JWT_SECRET=fixmycity-secret-key-2026-production
   PORT=3000
   ```

---

## 🚀 Running the Application

### Install Dependencies:
```bash
npm install
```

### Start Development Server:
```bash
npm run dev
```
The server runs on `http://localhost:3000` with both Express REST APIs and the React client.

### Demo Credentials:
- **Citizen Account:** `citizen@fixmycity.org` / `password123`
- **Municipal Admin:** `admin@fixmycity.org` / `password123`
- *(Use the one-click role switcher pill in the top-right navbar to toggle instantly between Citizen and Municipal Admin).*

---

## 📡 API Reference

### Auth
- `POST /api/auth/register` – Register a citizen account
- `POST /api/auth/login` – Login and obtain JWT token
- `GET /api/auth/me` – Current authenticated user details

### Citizen Complaints
- `POST /api/complaints` – Submit new complaint (title, category, location, description, photo)
- `GET /api/complaints/my` – Retrieve citizen's submitted complaints
- `GET /api/complaints/track/:complaintId` – Public tracking by complaint ID
- `GET /api/complaints/recent` – Public community pulse reports

### Municipal Administration
- `GET /api/admin/complaints` – All complaints with search (`?search=`), status (`?status=`), and category (`?category=`) filters
- `GET /api/admin/complaints/:id` – Detailed complaint dossier
- `POST /api/admin/complaints/:id/update` – Update status, assign department, assign officer, and append audit remark
- `GET /api/admin/statistics` – Aggregated operational metrics and chart series

---

## 📄 License
FixMyCity is open-source educational software built under the Apache-2.0 License.
