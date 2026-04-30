// frontend/src/App.jsx
import { useState, useEffect } from "react";

import StudentDashboard from "./components/StudentDashboard.jsx";
import AdvisorQueue from "./components/AdvisorQueue.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import MyAvailabilityPage from "./components/MyAvailabilityPage.jsx";
import GradPlansPage from "./components/GradPlansPage.jsx";
import CourseCataloguePage from "./components/CourseCataloguePage.jsx";
import ResourcesPage from "./components/ResourcesPage.jsx";
import { getCourseCatalog } from "@api/courses.js";

import { mockData } from "./data/mockData.js";
import "./App.css";

import { getCurrentStudent, getRequirements } from "@api/students.js";
import {
  getCurrentAdvisor,
  getMyStudents as getAdvisorStudents,
  reviewPlan,
} from "@api/advisors.js";

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
  const [view, setView] = useState("login");
  const [session, setSession] = useState(null);
  const [studentPage, setStudentPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [appData, setAppData] = useState(mockData);

  const [_studentRequirements, setStudentRequirements] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentAdvisor, setCurrentAdvisor] = useState(null);
  const [advisorData, setAdvisorData] = useState({ students: [], submissions: [] });
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [courseCatalogue, setCourseCatalogue] = useState([]);
  async function refreshAdvisorData() {
    if (!session?.token) return;
    try {
      const data = await getAdvisorStudents(session.token);
      setAdvisorData({
        students: Array.isArray(data?.students) ? data.students : [],
        submissions: Array.isArray(data?.submissions) ? data.submissions : [],
      });
    } catch (err) {
      console.error("Failed to refresh advisor data:", err);
    }
  }

  useEffect(() => {
    const token = session?.token;
    if (!token) return;

    async function loadBackendData() {
      try {
        if (session.roles?.includes("student")) {
          const studentData = await getCurrentStudent(token);
          setCurrentStudent(studentData || null);

          const requirements = await getRequirements(token);
          setStudentRequirements(requirements);
        }

        if (session.roles?.includes("advisor")) {
          const [advisorMe, students] = await Promise.all([
            getCurrentAdvisor(token),
            getAdvisorStudents(token),
          ]);
          setCurrentAdvisor(advisorMe || null);
          setAdvisorData({
            students: Array.isArray(students?.students) ? students.students : [],
            submissions: Array.isArray(students?.submissions) ? students.submissions : [],
          });
        }
      } catch (err) {
        console.error("Failed to load backend data:", err);
      }
    }

    loadBackendData();
  }, [session]);

  useEffect(() => {
    async function loadCourseCatalogue() {
      if (!session?.token) return;
      const major = currentStudent?.major;
      try {
        const courses = await getCourseCatalog(session.token, { major });
        setCourseCatalogue(Array.isArray(courses) ? courses : []);
      } catch (err) {
        console.error("Failed to load course catalogue:", err);
      }
    }
    loadCourseCatalogue();
  }, [session?.token, currentStudent?.major]);

  async function refreshStudent() {
    if (!session?.token) return;
    try {
      const studentData = await getCurrentStudent(session.token);
      setCurrentStudent(studentData || null);
    } catch (err) {
      console.error("Failed to refresh student data:", err);
    }
  }

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
    setCurrentStudent(null);
    setStudentRequirements(null);
    setCurrentAdvisor(null);
    setAdvisorData({ students: [], submissions: [] });
    setEditingPlanId(null);
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

  // ---------- Advisor actions (backend-backed) ----------

  async function handleApprovePlan({ planId, feedback }) {
    const token = session?.token;
    if (!token || !planId) return;

    try {
      await reviewPlan(token, planId, {
        status: "Approved",
        message: feedback || "",
      });
      await refreshAdvisorData();
    } catch (err) {
      console.error("Failed to approve plan:", err);
      alert(`Could not approve plan: ${err.message || "Unknown error"}`);
    }
  }

  async function handleRequestChanges({ planId, feedback }) {
    const token = session?.token;
    if (!token || !planId) return;

    try {
      await reviewPlan(token, planId, {
        status: "Needs Revision",
        message: feedback || "",
      });
      await refreshAdvisorData();
    } catch (err) {
      console.error("Failed to request plan changes:", err);
      alert(`Could not return plan: ${err.message || "Unknown error"}`);
    }
  }

  function handleEditPlan(planId) {
    if (!planId) return;
    setEditingPlanId(planId);
    setStudentPage("catalogue");
  }

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

  const activeRole = session?.activeRole || "student";
  const roles = session?.roles || ["student"];

  const catalogueCourses =
    courseCatalogue.length > 0
      ? courseCatalogue
      : [];

  const showStudentSidebar = activeRole === "student";

  const studentNavItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "gradplans", label: "GradPlans" },
    { id: "catalogue", label: "Course Catalogue" },
    { id: "availability", label: "My Availability" },
    { id: "advising", label: "Advising Hub" },
    { id: "resources", label: "Resources" },
  ];

  function goStudentPage(id) {
    setStudentPage(id);
    setMenuOpen(false);

    if (id !== "catalogue") setEditingPlanId(null);
  }

  function renderStudentPage() {
    switch (studentPage) {
      case "dashboard":
        return (
          <StudentDashboard
            student={currentStudent || {}}
            token={session?.token}
            onEditPlan={handleEditPlan}
            onPlansChanged={refreshStudent}
          />
        );
      case "gradplans":
        return (
          <GradPlansPage
            student={currentStudent || {}}
            token={session?.token}
            onEditPlan={(planId) => handleEditPlan(planId)}
            onPlansChanged={refreshStudent}
          />
        );

      case "catalogue":
        return (
          <CourseCataloguePage
            student={currentStudent || {}}
            token={session?.token}
            courses={catalogueCourses}
            editingPlanId={editingPlanId}
            onSelectPlan={(planId) => setEditingPlanId(planId)}
            onPlanSaved={async () => {
              setEditingPlanId(null);
              await refreshStudent();
            }}
          />
        );

      case "availability":
        return (
          <MyAvailabilityPage
            key={session?.username || "student"}
            student={currentStudent || {}}
            token={session?.token}
          />
        );

      case "advising":
        return <AdvisingHubPage />;

      case "resources":
        return <ResourcesPage token={session?.token} />;

      default:
        return null;
    }
  }

  return (
    <div>
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

          <div
            className={`sidebarOverlay ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(false)}
          />
        </>
      )}

      <main className={`layout ${showStudentSidebar ? "layoutWithSidebar" : ""}`}>
        {activeRole === "student" ? (
          renderStudentPage()
        ) : activeRole === "advisor" ? (
          <AdvisorQueue
            advisor={currentAdvisor}
            data={advisorData}
            onApprovePlan={handleApprovePlan}
            onRequestChanges={handleRequestChanges}
          />
        ) : (
          <AdminDashboard />
        )}
      </main>
    </div>
  );
}