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

import { useState } from "react";

import StudentDashboard from "./components/StudentDashboard.jsx";
import AdvisorQueue from "./components/AdvisorQueue.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import MyAvailabilityPage from "./components/MyAvailabilityPage.jsx";
import GradPlansPage from "./components/GradPlansPage.jsx";
import CourseCataloguePage from "./components/CourseCataloguePage.jsx";

import { mockData } from "./data/mockData.js";
import "./App.css";

// ------------------------------
// Placeholders
// ------------------------------

function AdvisingHubPage() {
  return (
    <section className="card">
      <h2>Advising Hub</h2>
      <p className="muted">
        Placeholder: advisor info + contact (office hours, booking links, queue, notes).
      </p>
    </section>
  );
}

function ResourcesPage() {
  return (
    <section className="card">
      <h2>Resources</h2>
      <p className="muted">
        Placeholder: links to school resources (registrar, tutoring, financial aid, policies, etc.).
      </p>
    </section>
  );
}

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

export default function App() {
  // view: login | register | app
  const [view, setView] = useState("login");

  // session -> username, roles, activeRole
  const [session, setSession] = useState(null);

  // Student hamburger
  const [studentPage, setStudentPage] = useState("dashboard"); // dashboard|gradplans|catalogue|availability|advising|resources
  const [menuOpen, setMenuOpen] = useState(false);

  function loginSuccess(s) {
    setSession(s);
    setView("app");
    setStudentPage("dashboard");
    setMenuOpen(false);
  }

  function logout() {
    setSession(null);
    setView("login");
    setMenuOpen(false);
  }

  function switchRole(role) {
    if (!session) return;
    if (!session.roles.includes(role)) return;

    setSession({ ...session, activeRole: role });
    setMenuOpen(false);

    if (role === "student") setStudentPage("dashboard");
  }

  function getInitials(name = "") {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "?";
    const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + b).toUpperCase();
  }

  // ------------------------------
  // Auth views
  // ------------------------------
  if (view === "login") {
    return (
      <div>
        <header className="topbar">
          <div className="brand">GradMap</div>
        </header>

        <main className="layout">
          <LoginPage onLoginSuccess={loginSuccess} onGoRegister={() => setView("register")} />
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
          <RegisterPage onRegistered={() => setView("login")} onCancel={() => setView("login")} />
        </main>
      </div>
    );
  }

  // ------------------------------
  // Main app view
  // ------------------------------
  const activeRole = session?.activeRole || "student";
  const roles = session?.roles || ["student"];

  const studentRecord =
    (session?.username && mockData.students?.[session.username]) || mockData.students?.student1;

  const advisorRecord =
    (session?.username && mockData.advisors?.[session.username]) || mockData.advisors?.advisor1;

  const catalogueCourses =
    mockData?.courseCatalog?.[studentRecord?.major] ||
    mockData?.courseCatalog?.["Computer Science"] ||
    [];


  const showStudentSidebar = activeRole === "student";

  const studentNavItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "gradplans", label: "GradPlans" },
    { id: "catalogue", label: "Course Catalogue" },
    { id: "availability", label: "My Availability" }, // ✅ added
    { id: "advising", label: "Advising Hub" },
    { id: "resources", label: "Resources" },
  ];

  function goStudentPage(id) {
    setStudentPage(id);
    setMenuOpen(false);
  }

  function renderStudentPage() {
    switch (studentPage) {
      case "dashboard":
        return (
          <StudentDashboard
            student={studentRecord}
            onSubmitPlan={() => alert("Mock: Plan submitted for advisor review!")}
          />
        );
      case "gradplans":
        return <GradPlansPage student={studentRecord} />;
      case "catalogue":
        return (
          <CourseCataloguePage
            student={studentRecord}
            courses={catalogueCourses}
          />
        );
      case "availability":
        return (
          <MyAvailabilityPage
            key={session?.username || "student"}
            student={studentRecord}
          />
        );
      case "advising":
        return <AdvisingHubPage />;
      case "resources":
        return <ResourcesPage />;
      default:
        return null;
    }
  }

  return (
    <div>
      {/* Top bar */}
      <header className="topbar">
        <div className="topbarLeft">
          {showStudentSidebar && (
            <button
              className="btn hamburger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              ☰
            </button>
          )}
          <div className="brand">GradMap</div>
        </div>

        <nav className="nav">
          {roles.includes("student") && (
            <button
              className={`btn ${activeRole === "student" ? "active" : ""}`}
              onClick={() => switchRole("student")}
            >
              Student
            </button>
          )}

          {roles.includes("advisor") && (
            <button
              className={`btn ${activeRole === "advisor" ? "active" : ""}`}
              onClick={() => switchRole("advisor")}
            >
              Advisor
            </button>
          )}

          {roles.includes("admin") && (
            <button
              className={`btn ${activeRole === "admin" ? "active" : ""}`}
              onClick={() => switchRole("admin")}
            >
              Admin
            </button>
          )}

          <div className="navSpacer" />

          <div className="topUser">
            <div className="avatar avatarSm" aria-hidden="true">
              {getInitials(session?.username)}
            </div>
            <div className="userChip" title={session?.username}>
              {session?.username}
            </div>
          </div>

          <button className="btn" onClick={logout}>
            Logout
          </button>
        </nav>
      </header>

      {/* Student sidebar (only when activeRole === "student") */}
      {showStudentSidebar && (
        <>
          <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
            <div className="sidebarHeader">
              <div className="sidebarTitle">Student Menu</div>
              <button
                className="btn sidebarClose"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="sidebarLinks">
              {studentNavItems.map((item) => (
                <button
                  key={item.id}
                  className={`sideLink ${studentPage === item.id ? "active" : ""}`}
                  onClick={() => goStudentPage(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </aside>

          <div className={`sidebarOverlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />
        </>
      )}

      {/* Content */}
      <main className={`layout ${showStudentSidebar ? "layoutWithSidebar" : ""}`}>
        {activeRole === "student" ? (
          renderStudentPage()
        ) : activeRole === "advisor" ? (
          <AdvisorQueue advisor={advisorRecord} onOpenSubmission={(name) => alert(`Mock: Opening submission for ${name}`)} />
        ) : (
          <AdminDashboard />
        )}
      </main>
    </div>
  );
}