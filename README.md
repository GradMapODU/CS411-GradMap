# GradMap

Full-Stack Academic Advising Platform (React + Vite + Node.js + Express + MySQL)
GradMap is a role-based academic planning system for students, advisors, and administrators.
It supports graduation plan management, course registration, advisor scheduling, and program analytics
- all backed by a live REST API and relational database.

---

## Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Demo Accounts](#demo-accounts)
- [Recommended Extensions](#recommended-extensions)
- [Contributing](#contributing)

---

## Quick Start

To run GradMap locally you'll need both the backend and frontend running at the same time.

### 1. Clone the repository

```bash
git clone <repository-url>
cd gradmap
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory then start the server:

```bash
node app.js
```

The API will be available at:
```
http://localhost:3000
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm run dev
```

The application will be available at:
```
http://localhost:5173
```

---

## Overview

GradMap is a full-stack platform built to streamline the academic advising process

- **Students** can view their profile, browse the course catalogue, build graduation plans, check for schedule conflicts, and register for courses
- **Advisors** can view their assigned students, review submitted plans, and leave feedback

---

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript (ES6+)
- ESLint

**Backend**
- Node.js
- Express
- Sequelize ORM
- MySQL
- bcrypt
- JSON Web Tokens (JWT)
- dotenv

---

## Project Structure
- (Tree)
```
gradmap/
  backend/
    controllers/
      adminController.js        -> Handles program/course/analytics admin actions
      advisorController.js      -> Handles advisor-facing plan review and student lookup
      authController.js         -> Handles login and registration logic
      courseController.js       -> Handles course catalog and registration
      studentController.js      -> Handles student plans, requirements, and conflicts
    middleware/
      auth.js                   -> JWT verification + role-based access control
    models/
      index.js                  -> Sequelize models and associations
      advisors.js
      students.js
      client.js
    routes/
      adminRoutes.js
      advisorRoutes.js
      authRoutes.js
      courseRoutes.js (implied)
      studentRoutes.js
    app.js                      -> Express app entry point, route mounting, DB seed
  frontend/
    public/
    src/
      components/               -> All major UI components
        AdvisorQueue.jsx
        CourseCataloguePage.jsx
        GradPlansPage.jsx
        LoginPage.jsx
        MyAvailabilityPage.jsx
        RegisterPage.jsx
        StudentDashboard.jsx
      data/
        mockData.js             -> Legacy mock data (still used for fallback/dev reference)
      App.jsx                   -> Role-based routing and layout logic
      main.jsx                  -> App entry point
    index.html
    package.json
    vite.config.js
```

---

## Requirements

**Backend**
- Node.js w/ npm
- MySQL database (local or hosted)

**Frontend**
- Node.js
- npm
- npm install jspdf jspdf-autotable     

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```env
DB_NAME=your_database_name
DB_USER=your_mysql_username
DB_PASS=your_mysql_password
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
PORT=3000
```
---

## API Routes

All routes are prefixed with `/api`.

### Auth — `/api/auth`
- POST /register — Register a new user (No auth required)
- POST /login — Login and receive a JWT (No auth required)
### Students — /api/students (Requires Student JWT)
- GET /me — Get current student's profile
- GET /requirements — Get degree requirements
- POST /generate-semester — Auto-generate a semester plan
- GET /plans/:plan_id/conflicts — Check a plan for schedule conflicts
- GET /plans/:plan_id/feedback — Get advisor feedback on a plan
- POST /register — Register for a course
- DELETE /plans/:plan_id — Delete a graduation plan
### Advisors — /api/advisors (Requires Advisor JWT)
- GET /students — Get all assigned students
- PUT /plans/:plan_id — Approve or flag a student plan
- POST /plans/:plan_id/feedback — Leave feedback on a student plan
### Courses — /api/courses
- GET / — Get all courses
### Demo Accounts
- Admin — admin / Admin123!
- Student — Student1 / Student1!
- Student — Student2 / Student2!
- Advisor — Advisor1 / Advisor1!

---

## Recommended Extensions for VS Code

My extension stack:

**Core**
- ESLint
- ES7+ React/Redux Snippets
- Prettier – Code Formatter

**Extras**
- Path Intellisense
- Auto Rename Tag
- npm Intellisense
- REST Client *(handy for testing API routes directly in VS Code)*

---
