// frontend/src/App.jsx
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

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [view, setView] = useState("login");
  const [session, setSession] = useState(null);
  const [studentPage, setStudentPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [appData, setAppData] = useState(mockData);

  // When editing a grad plan in the catalogue, we store which plan ID is currently being edited.
  // This enables navigating to the Course Catalogue page with a selected plan.
  const [editingPlanId, setEditingPlanId] = useState(null);

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

  function updateStudentPlan(studentId, planId, updater) {
    setAppData((prev) => {
      const student = prev.students?.[studentId];
      if (!student) return prev;

      // Update the submission plan array
      const updatedPlans = (student.plan || []).map((plan) =>
        plan.id === planId ? updater(plan) : plan
      );

      // Also propagate status-related changes back into gradPlans so that
      // other views (e.g., GradPlansPage) reflect advisor actions like approval
      const updatedGradPlans = Array.isArray(student.gradPlans)
        ? student.gradPlans.map((gp) => {
            // find the corresponding plan entry
            const matchPlan = updatedPlans.find((p) => p.id === planId);
            // If no match or term mismatch, return gp unchanged
            if (!matchPlan) return gp;
            // update fields only if gp represents same term or id
            if (gp.id === matchPlan.id || gp.term === matchPlan.term) {
              return {
                ...gp,
                status: matchPlan.status,
                advisorStatus: matchPlan.advisorStatus,
                advisorFeedback: matchPlan.advisorFeedback,
                submittedOn: matchPlan.submittedOn,
                reviewedBy: matchPlan.reviewedBy,
                reviewedOn: matchPlan.reviewedOn,
              };
            }
            return gp;
          })
        : student.gradPlans;

      return {
        ...prev,
        students: {
          ...prev.students,
          [studentId]: {
            ...student,
            plan: updatedPlans,
            gradPlans: updatedGradPlans,
          },
        },
      };
    });
  }

  /**
   * Update the gradPlans array for a given student. Accepts the student ID
   * and the new plans array. Returns a new appData state with the updated
   * gradPlans. If the student is not found, the previous state is returned.
   *
   * This helper allows children like GradPlansPage to persist plan edits
   * back into the shared appData so other views (e.g., Dashboard) reflect
   * modifications immediately.
   *
   * @param {string} studentId - The key identifying the student in appData.students
   * @param {Array} newGradPlans - The updated gradPlans array
   */
  function updateStudentGradPlans(studentId, newGradPlans) {
    setAppData((prev) => {
      const student = prev.students?.[studentId];
      if (!student) return prev;

      const gradPlansArray = Array.isArray(newGradPlans) ? newGradPlans : [];

      // Build a corresponding "plan" array for submission purposes
      const existingPlan = Array.isArray(student.plan) ? student.plan : [];
      const derivedPlan = gradPlansArray.map((gp) => {
        // Find an existing plan entry by id or term to preserve metadata
        const match = existingPlan.find(
          (p) => p.id === gp.id || p.term === gp.term
        );
        // Compute credits: prefer plannedCredits, else sum of course credits
        let credits = gp.plannedCredits;
        if (credits == null) {
          if (Array.isArray(gp.courses)) {
            credits = gp.courses.reduce(
              (sum, c) => sum + Number(c?.credits ?? 0),
              0
            );
          } else {
            credits = 0;
          }
        }
        return {
          id: match?.id || gp.id || `plan-${gp.term}`,
          term: gp.term,
          courses: Array.isArray(gp.courses) ? gp.courses : [],
          credits,
          status: match?.status || gp.status || "Planned",
          submittedOn: match?.submittedOn || gp.submittedOn || "",
          advisorStatus: match?.advisorStatus || gp.advisorStatus || "",
          advisorFeedback: match?.advisorFeedback || gp.advisorFeedback || "",
          reviewedBy: match?.reviewedBy || gp.reviewedBy || "",
          reviewedOn: match?.reviewedOn || gp.reviewedOn || "",
        };
      });

      return {
        ...prev,
        students: {
          ...prev.students,
          [studentId]: {
            ...student,
            gradPlans: gradPlansArray,
            plan: derivedPlan,
          },
        },
      };
    });
  }

  function handleApprovePlan({ advisorId, studentId, planId, feedback }) {
    const advisorName = appData.advisors?.[advisorId]?.name || "Advisor";
    const reviewedOn = getTodayString();

    updateStudentPlan(studentId, planId, (plan) => ({
      ...plan,
      status: "Approved",
      advisorStatus: "Approved",
      advisorFeedback: feedback || "Approved with no additional comments.",
      reviewedBy: advisorName,
      reviewedOn,
    }));
  }

  function handleRequestChanges({ advisorId, studentId, planId, feedback }) {
    const advisorName = appData.advisors?.[advisorId]?.name || "Advisor";
    const reviewedOn = getTodayString();

    updateStudentPlan(studentId, planId, (plan) => ({
      ...plan,
      status: "Needs Changes",
      advisorStatus: "Needs Changes",
      advisorFeedback: feedback,
      reviewedBy: advisorName,
      reviewedOn,
    }));
  }

  function handleSubmitPlan() {
    if (!session?.username) return;

    const studentId = session.username;
    const student = appData.students?.[studentId];
    if (!student) return;

    const firstDraftPlan = (student.plan || []).find(
      (p) => p.status === "Draft" || p.status === "Awaiting Submission"
    );

    if (!firstDraftPlan) {
      alert("No draft or awaiting-submission plan found.");
      return;
    }

    updateStudentPlan(studentId, firstDraftPlan.id, (plan) => ({
      ...plan,
      status: "Submitted",
      advisorStatus: "Pending",
      submittedOn: getTodayString(),
      advisorFeedback: "",
      reviewedBy: "",
      reviewedOn: "",
    }));
  }

  /**
   * Set the editing plan ID and navigate to the course catalogue page.
   * @param {string} planId - The ID of the plan to edit
   */
  function handleEditPlan(planId) {
    if (!planId) return;
    setEditingPlanId(planId);
    setStudentPage("catalogue");
  }

  /**
   * Submit a specific grad plan to the advisor. This mirrors the submission
   * logic in handleSubmitPlan but for a single plan.
   * @param {string} studentId - Student ID key in appData
   * @param {string} planId - Plan ID to submit
   */
  function handleSubmitSpecificPlan(studentId, planId) {
    if (!studentId || !planId) return;
    updateStudentPlan(studentId, planId, (plan) => ({
      ...plan,
      status: "Submitted",
      advisorStatus: "Pending",
      submittedOn: getTodayString(),
      advisorFeedback: "",
      reviewedBy: "",
      reviewedOn: "",
    }));
  }

  /**
   * Clear all courses from a specific grad plan, setting plannedCredits to 0.
   * @param {string} studentId - Student ID key in appData
   * @param {string} planId - Plan ID to clear
   */
  function handleClearGradPlan(studentId, planId) {
    const student = appData.students?.[studentId];
    if (!student) return;
    const newGradPlans = Array.isArray(student.gradPlans)
      ? student.gradPlans.map((gp) => {
          if (gp.id === planId || gp.term === planId) {
            return {
              ...gp,
              courses: [],
              plannedCredits: 0,
            };
          }
          return gp;
        })
      : [];
    updateStudentGradPlans(studentId, newGradPlans);
  }

  /**
   * Add a course to a specific grad plan. If the course is already present
   * (matched by course code), it will not be added again. Planned credits
   * are recalculated.
   * @param {string} studentId - Student ID key in appData
   * @param {string} planId - Plan ID to modify
   * @param {Object} course - Course object containing at least code, title, credits
   */
  function handleAddCourseToGradPlan(studentId, planId, course) {
    const student = appData.students?.[studentId];
    if (!student || !course) return;
    const newGradPlans = Array.isArray(student.gradPlans)
      ? student.gradPlans.map((gp) => {
          if (gp.id === planId || gp.term === planId) {
            const existingCourses = Array.isArray(gp.courses) ? gp.courses : [];
            // avoid adding duplicates based on course code
            const alreadyExists = existingCourses.some(
              (c) => c.code === course.code
            );
            if (alreadyExists) return gp;
            const updatedCourses = [
              ...existingCourses,
              {
                code: course.code,
                title: course.title,
                credits: course.credits,
                status: "Planned",
              },
            ];
            const totalCredits = updatedCourses.reduce(
              (sum, c) => sum + Number(c.credits ?? 0),
              0
            );
            return {
              ...gp,
              courses: updatedCourses,
              plannedCredits: totalCredits,
            };
          }
          return gp;
        })
      : [];
    updateStudentGradPlans(studentId, newGradPlans);
  }

  /**
   * Remove a course from a specific grad plan by its course code.
   * Planned credits are recalculated accordingly.
   * @param {string} studentId - Student ID key in appData
   * @param {string} planId - Plan ID to modify
   * @param {string} courseCode - Code of the course to remove
   */
  function handleRemoveCourseFromGradPlan(studentId, planId, courseCode) {
    const student = appData.students?.[studentId];
    if (!student || !courseCode) return;
    const newGradPlans = Array.isArray(student.gradPlans)
      ? student.gradPlans.map((gp) => {
          if (gp.id === planId || gp.term === planId) {
            const existingCourses = Array.isArray(gp.courses) ? gp.courses : [];
            const updatedCourses = existingCourses.filter(
              (c) => c.code !== courseCode
            );
            const totalCredits = updatedCourses.reduce(
              (sum, c) => sum + Number(c.credits ?? 0),
              0
            );
            return {
              ...gp,
              courses: updatedCourses,
              plannedCredits: totalCredits,
            };
          }
          return gp;
        })
      : [];
    updateStudentGradPlans(studentId, newGradPlans);
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

  const studentRecord =
    (session?.username && appData.students?.[session.username]) ||
    appData.students?.student1;

  const advisorRecord =
    (session?.username && appData.advisors?.[session.username]) ||
    appData.advisors?.advisor1;

  const catalogueCourses =
    appData?.courseCatalog?.[studentRecord?.major] ||
    appData?.courseCatalog?.["Computer Science"] ||
    [];

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
  }

  function renderStudentPage() {
    switch (studentPage) {
      case "dashboard":
        return (
          <StudentDashboard
            student={studentRecord}
            onSubmitPlan={handleSubmitPlan}
          />
        );
      case "gradplans":
        return (
          <GradPlansPage
            student={studentRecord}
            degreeProgram={
              appData.degreePrograms?.[studentRecord?.selectedDegreeProgramId] || null
            }
            editingPlanId={editingPlanId}
            onUpdateGradPlans={(newPlans) => {
              const sid = session?.username || "student1";
              updateStudentGradPlans(sid, newPlans);
            }}
            onEditPlan={(planId) => {
              handleEditPlan(planId);
            }}
            onSubmitPlan={(planId) => {
              const sid = session?.username || "student1";
              handleSubmitSpecificPlan(sid, planId);
            }}
            onClearPlan={(planId) => {
              const sid = session?.username || "student1";
              handleClearGradPlan(sid, planId);
            }}
          />
        );
      case "catalogue":
        return (
          <CourseCataloguePage
            student={studentRecord}
            courses={catalogueCourses}
            editingPlanId={editingPlanId}
            onSelectPlan={(planId) => setEditingPlanId(planId)}
            onAddCourseToPlan={(planId, course) => {
              const sid = session?.username || "student1";
              handleAddCourseToGradPlan(sid, planId, course);
            }}
            onRemoveCourseFromPlan={(planId, courseCode) => {
              const sid = session?.username || "student1";
              handleRemoveCourseFromGradPlan(sid, planId, courseCode);
            }}
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
            advisor={advisorRecord}
            students={appData.students}
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