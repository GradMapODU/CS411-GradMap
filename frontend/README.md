# GradMap Frontend

React + Vite Application for the GradMap Scheduling Platform

The GradMap Frontend is the user interface layer of the GradMap system. It provides role-based dashboards and scheduling interactions for students, advisors, and administrators.

---

## Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Recommended Extensions](#recommended-extensions)
- [Environment Variables](#environment-variables)
- [Future Integration Plan](#future-integration-plan)
- [Contributing](#contributing)

---

## Quick Start

To run GradMap locally:5

### 1. Clone the repository

```bash
git clone <repository-url>
cd gradmap/frontend
```
2. Install dependencies
```bash
npm install
```
3. Start the development server
```bash
npm run dev
```

The application will be available at:
```bash
http://localhost:5173
```

## Overview

The GradMap Frontend is built using React and Vite to provide a fast, modern development experience with Hot Module Replacement (HMR).
This version is currently a mock prototype, meaning:
Authentication is simulated
Data is stored locally using mock data
No backend API is connected yet
Role-based UI logic is implemented client-side
The frontend is structured to allow seamless backend integration

## Tech Stack
- React
- Vite
- JavaScript (ES6+)
- ESLint

## Project Structure
```bash
frontend/
  public/
  src/
    assets/
    components/             ----->>> Contains all major UI components for the application
      AdvisorQueue.jsx
      LoginPage.jsx
      RegisterPage.jsx
      StudentDashboard.jsx
    data/                   ----->>> Contains mock data used to simulate backend
      mockData.js
    App.jsx                 ----->>> Controls role-based logic
    main.jsx                ----->>> App entry point
  index.html
  package.json
  vite.config.js
  ```

## Requirements

This project uses: 
- Node.js
- npm (comes with Node)

## Recommended Extensions (in VS Code)

My extension stack:

Core:
- ESLint
- ES7+ React/Redux Snippets
- Prettier – Code Formatter

Extras:
- Path Intellisense
- Auto Rename Tag
- npm Intellisense




