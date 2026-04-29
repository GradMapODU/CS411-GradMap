# GradMap

Full-Stack Academic Advising Platform (React + Vite + Node.js + Express + MySQL)
GradMap is a role-based academic planning system for students, advisors, and administrators.
It supports graduation plan management, course registration, advisor scheduling, and program analytics — all backed by a live REST API and relational database.

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

Create a `.env` file in the `backend/` directory (see [Environment Variables](#environment-variables)), then start the server:

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

GradMap is a full-stack platform built to streamline the academic advising process. This version connects the React frontend to a live Express + MySQL backend. Core functionality includes:

- **JWT-based authentication** with role-specific access control
- **Students** can view their profile, browse the course catalogue, build graduation plans, check for schedule conflicts, and register for courses
- **Advisors** can view their assigned students, review submitted plans, and leave feedback
- **Admins** can create programs, upload courses, manage prerequisites, set semester offerings, and view demand analytics

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
- Node.js
- npm (comes with Node)
- MySQL database (local or hosted)

**Frontend**
- Node.js
- npm

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

> The backend will automatically seed a default admin account and demo users on first run if they don't already exist.

---

## API Routes

All routes are prefixed with `/api`.

### Auth — `/api/auth`
| Method | Endpoint    | Description              | Auth Required |
|--------|-------------|--------------------------|---------------|
| POST   | `/register` | Register a new user      | No            |
| POST   | `/login`    | Login and receive a JWT  | No            |

### Students — `/api/students`
All routes require a valid Student JWT.

| Method | Endpoint                        | Description                         |
|--------|---------------------------------|-------------------------------------|
| GET    | `/me`                           | Get current student's profile       |
| GET    | `/requirements`                 | Get degree requirements             |
| POST   | `/generate-semester`            | Auto-generate a semester plan       |
| GET    | `/plans/:plan_id/conflicts`     | Check a plan for schedule conflicts |
| GET    | `/plans/:plan_id/feedback`      | Get advisor feedback on a plan      |
| POST   | `/register`                     | Register for a course               |
| DELETE | `/plans/:plan_id`               | Delete a graduation plan            |

### Advisors — `/api/advisors`
All routes require a valid Advisor JWT.

| Method | Endpoint                        | Description                         |
|--------|---------------------------------|-------------------------------------|
| GET    | `/students`                     | Get all assigned students           |
| PUT    | `/plans/:plan_id`               | Approve or flag a student plan      |
| POST   | `/plans/:plan_id/feedback`      | Leave feedback on a student plan    |

### Admins — `/api/admins`
All routes require a valid Admin JWT.

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| POST   | `/programs`            | Create a new degree program          |
| POST   | `/courses`             | Upload a new course                  |
| POST   | `/program-courses`     | Add a course to a program            |
| POST   | `/semester-offerings`  | Set when a course is offered         |
| POST   | `/prerequisites`       | Define course prerequisites          |
| GET    | `/analytics/demand`    | View course demand analytics         |
| POST   | `/create-user`         | Create a user profile manually       |

### Courses — `/api/courses`
| Method | Endpoint | Description           |
|--------|----------|-----------------------|
| GET    | `/`      | Get all courses       |

---

## Demo Accounts

The backend seeds the following accounts on startup if they don't already exist:

| Role    | Username  | Password    |
|---------|-----------|-------------|
| Admin   | `admin`   | `Admin123!` |
| Student | `Student1`| `Student1!` |
| Student | `Student2`| `Student2!` |
| Advisor | `Advisor1`| `Advisor1!` |

---

## Recommended Extensions (in VS Code)

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

## Contributing

1. Create a new branch for your feature or fix
2. Keep frontend and backend concerns separated
3. Test your API changes before updating the frontend
4. Open a pull request with a clear description of what changed
