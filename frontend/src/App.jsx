// frontend/src/App.jsx
import { useState, useEffect } from "react";

import StudentDashboard from "./components/StudentDashboard.jsx";
import AdvisorQueue from "./components/AdvisorQueue.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import MyAvailabilityPage from "./components/MyAvailabilityPage.jsx";
import GradPlansPage from "./components/GradPlansPage.jsx";
import CourseCataloguePage from "./components/CourseCataloguePage.jsx";
import { getCourseCatalog } from "@api/courses.js";

import { mockData } from "./data/mockData.js";
import "./App.css";

import { getCurrentStudent, getRequirements } from "@api/students.js";
import { getStudents as getAdvisorStudents, updatePlan } from "@api/advisors.js";

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

  // backend-backed state
  const [_studentRequirements, setStudentRequirements] = useState(null);
  const [advisorStudents, setAdvisorStudents] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [courseCatalogue, setCourseCatalogue] = useState([]);

  
  // Load backend data whenever the session changes (login, role switch, etc.)
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
          const students = await getAdvisorStudents(token);
          setAdvisorStudents(students);
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
    setAdvisorStudents(null);
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

  function updateStudentPlan(studentId, planId, updater) {
    setAppData((prev) => {
      const student = prev.students?.[studentId];
      if (!student) return prev;

      const updatedPlans = (student.plan || []).map((plan) =>
        plan.id === planId ? updater(plan) : plan
      );

      const updatedGradPlans = Array.isArray(student.gradPlans)
        ? student.gradPlans.map((gp) => {
            const matchPlan = updatedPlans.find((p) => p.id === planId);
            if (!matchPlan) return gp;

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

  function updateStudentGradPlans(studentId, newGradPlans) {
    setAppData((prev) => {
      const student = prev.students?.[studentId];
      if (!student) return prev;

      const gradPlansArray = Array.isArray(newGradPlans) ? newGradPlans : [];
      const existingPlan = Array.isArray(student.plan) ? student.plan : [];

      const derivedPlan = gradPlansArray.map((gp) => {
        const match = existingPlan.find(
          (p) => p.id === gp.id || p.term === gp.term
        );

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

  async function handleApprovePlan({ advisorId, studentId, planId, feedback }) {
    const token = session?.token;

    if (token && planId) {
      try {
        await updatePlan(token, planId, "Approved", feedback || "Approved with no additional comments.");
      } catch (err) {
        console.error("Failed to approve plan:", err);
      }
    }

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

  async function handleRequestChanges({
    advisorId,
    studentId,
    planId,
    feedback,
  }) {
    const token = session?.token;

    if (token && planId) {
      try {
        await updatePlan(token, planId, "Needs Revision", feedback || "Please revise this plan.");
      } catch (err) {
        console.error("Failed to request plan changes:", err);
      }
    }

    const advisorName = appData.advisors?.[advisorId]?.name || "Advisor";
    const reviewedOn = getTodayString();

    updateStudentPlan(studentId, planId, (plan) => ({
      ...plan,
      status: "Needs Changes",
      advisorStatus: "Needs Changes",
      advisorFeedback: feedback || "Please revise this plan.",
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

  function handleEditPlan(planId) {
    if (!planId) return;
    setEditingPlanId(planId);
    setStudentPage("catalogue");
  }

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

  function handleAddCourseToGradPlan(studentId, planId, course) {
    const student = appData.students?.[studentId];
    if (!student || !course) return;

    const newGradPlans = Array.isArray(student.gradPlans)
      ? student.gradPlans.map((gp) => {
          if (gp.id === planId || gp.term === planId) {
            const existingCourses = Array.isArray(gp.courses) ? gp.courses : [];
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
    courseCatalogue.length > 0
      ? courseCatalogue
      : appData?.courseCatalog?.[studentRecord?.major] ||
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
            student={currentStudent || {}}
            token={session?.token}
            onSubmitPlan={handleSubmitPlan}
            onPlansChanged={async () => {
              if (!session?.token) return;
              try {
                const studentData = await getCurrentStudent(session.token);
                setCurrentStudent(studentData || null);
              } catch (err) {
                console.error("Failed to refresh student data:", err);
              }
            }}
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
            token={session?.token}
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
            advisorStudents={advisorStudents}
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
