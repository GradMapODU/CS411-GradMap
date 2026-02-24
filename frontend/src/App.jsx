// frontend/src/App.jsx
// #region App Component
// Acts as the main "controller" for the GradMap frontend (mock prototype)
// RESPONSIBILITIES
// - Tracks authentication/navigation state (login, register, app)
// - Stores the active session (username + roles + active role)
// - Renders the correct page based on the current view/role
// - Wires child pages together with props + callbacks
//
// NOTES
// - This is FRONTEND ONLY (no real backend).
// - LoginPage/RegisterPage handle mock authentication logic.
// - StudentDashboard/AdvisorQueue/AdminDashboard are the role-based views.
// #endregion


// #region Imports
import { useState } from "react";

import StudentDashboard from "./components/StudentDashboard.jsx"; // Student view
import AdvisorQueue from "./components/AdvisorQueue.jsx";         // Advisor view
import LoginPage from "./components/LoginPage.jsx";              // Login view
import RegisterPage from "./components/RegisterPage.jsx";        // Registration view

import { mockData } from "./data/mockData.js";                   // Fake backend data
import "./App.css";                                              // App styling
// #endregion


// #region Placeholder Admin Dashboard
// In a real app, this would contain admin tools like:
// - user management
// - degree catalog editing
// - program requirements management
function AdminDashboard() {
  return (
    <section className="card">
      <h2>Admin View (Mock)</h2>
      <p className="muted">
        Placeholder for admin tools (user management, degree catalogs, etc.).
      </p>
    </section>
  );
}
// #endregion


// #region Main App Component
export default function App() {
  // #region State Management
  // view: controls which top-level page is being displayed
  // - "login"    => LoginPage
  // - "register" => RegisterPage
  // - "app"      => Main GradMap application shell
  const [view, setView] = useState("login");

  // session: stores who is logged in and what roles they have
  // Example:
  // {
  //   username: "student1",
  //   roles: ["student"],
  //   activeRole: "student"
  // }
  const [session, setSession] = useState(null);
  // #endregion

  // #region Session Handlers (Login/Logout/Role Switching)

  // Called by LoginPage when the user successfully signs in
  function loginSuccess(s) {
    setSession(s);
    setView("app");
  }

  // Clears session and returns user to login view
  function logout() {
    setSession(null);
    setView("login");
  }

  // Switches the currently active role (if the user has it)
  function switchRole(role) {
    if (!session) return; // no session => do nothing
    if (!session.roles.includes(role)) return; // role not owned => do nothing

    // Create a new session object with updated activeRole
    setSession({ ...session, activeRole: role });
  }

  // #endregion

  // #region Auth Views (Login / Register)
  // These are "early returns"—if we are on login or register,
  // we render those pages and skip rendering the main app.

  if (view === "login") {
    return (
      <div>
        <header className="topbar">
          <div className="brand">GradMap</div>
        </header>

        <main className="layout">
          <LoginPage
            onLoginSuccess={loginSuccess}
            onGoRegister={() => setView("register")}
          />
        </main>
      </div>
    );
  }

  if (view === "register") {
    return (
      <div>
        <header className="topbar">
          <div className="brand">GradMap</div>
        </header>

        <main className="layout">
          <RegisterPage
            onRegistered={() => setView("login")}
            onCancel={() => setView("login")}
          />
        </main>
      </div>
    );
  }

  // #endregion

  // #region Main App View (Role-Based Rendering)
  // If we got here, view === "app"

  // Safe defaults in case session is missing for any reason
  const activeRole = session?.activeRole || "student";
  const roles = session?.roles || ["student"];

  // Choose user-specific mock records based on username
  // Falls back to a default if the username isn't found in mockData
  const studentRecord =
    (session?.username && mockData.students?.[session.username]) ||
    mockData.students?.student1;

  const advisorRecord =
    (session?.username && mockData.advisors?.[session.username]) ||
    mockData.advisors?.advisor1;

  return (
    <div>
      {/* Header + Role Navigation */}
      <header className="topbar">
        <div className="brand">GradMap</div>

        <nav className="nav">
          {/* Student role button */}
          {roles.includes("student") && (
            <button
              className={`btn ${activeRole === "student" ? "active" : ""}`}
              onClick={() => switchRole("student")}
            >
              Student
            </button>
          )}

          {/* Advisor role button */}
          {roles.includes("advisor") && (
            <button
              className={`btn ${activeRole === "advisor" ? "active" : ""}`}
              onClick={() => switchRole("advisor")}
            >
              Advisor
            </button>
          )}

          {/* Admin role button */}
          {roles.includes("admin") && (
            <button
              className={`btn ${activeRole === "admin" ? "active" : ""}`}
              onClick={() => switchRole("admin")}
            >
              Admin
            </button>
          )}

          <div className="navSpacer" />

          {/* Logged-in user display */}
          <div className="userChip" title={session?.username}>
            {session?.username}
          </div>

          {/* Logout button */}
          <button className="btn" onClick={logout}>
            Logout
          </button>
        </nav>
      </header>

      {/* Role content */}
      <main className="layout">
        {activeRole === "student" ? (
          <StudentDashboard
            student={studentRecord}
            onSubmitPlan={() => alert("Mock: Plan submitted for advisor review!")}
          />
        ) : activeRole === "advisor" ? (
          <AdvisorQueue
            advisor={advisorRecord}
            onOpenSubmission={(name) => alert(`Mock: Opening submission for ${name}`)}
          />
        ) : (
          <AdminDashboard />
        )}
      </main>
    </div>
  );

  // #endregion
}
// #endregion
