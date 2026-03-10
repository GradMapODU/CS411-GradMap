import { useMemo } from "react";

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}

function formatCredits(value) {
  const n = Number(value ?? 0);
  return `${n} credit hour${n === 1 ? "" : "s"}`;
}

function normalizeStatus(status) {
  const s = String(status || "").trim();
  return s || "Planned";
}

function getCourseStatusClass(status) {
  const s = normalizeStatus(status).toLowerCase();

  if (s.includes("completed")) return "gpStatus gpStatus--completed";
  if (s.includes("enrolled")) return "gpStatus gpStatus--enrolled";
  if (s.includes("in progress")) return "gpStatus gpStatus--progress";
  if (s.includes("planned")) return "gpStatus gpStatus--planned";
  return "gpStatus";
}

function sumPlanCredits(plan) {
  if (typeof plan?.plannedCredits === "number") return plan.plannedCredits;
  if (!Array.isArray(plan?.courses)) return 0;
  return plan.courses.reduce((sum, course) => sum + Number(course?.credits ?? 0), 0);
}

function RequirementSection({ title, items, emptyText }) {
  const list = Array.isArray(items) ? items : [];

  return (
    <div className="reqSection">
      <div className="reqSection__title">{title}</div>
      {list.length > 0 ? (
        <ul className="reqSection__list">
          {list.map((item, i) => (
            <li key={`${title}-${i}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted reqSection__empty">{emptyText || "No courses fulfilling this requirement yet."}</p>
      )}
    </div>
  );
}

function CourseRow({ course }) {
  return (
    <div className="gpCourseCard">
      <div className="gpCourseCard__left">
        <div className="gpCourseCard__code">{course?.code || "TBD 000"}</div>
        <div className="gpCourseCard__name">{course?.title || "Untitled Course"}</div>
        <div className="muted gpCourseCard__credits">{Number(course?.credits ?? 0)} Credits</div>
      </div>

      <div className="gpCourseCard__right">
        <span className={getCourseStatusClass(course?.status)}>
          {normalizeStatus(course?.status)}
        </span>
      </div>
    </div>
  );
}

function FullPlanCard({ plan, highlight }) {
  const credits = sumPlanCredits(plan);
  const courses = Array.isArray(plan?.courses) ? plan.courses : [];

  return (
    <section className={`gpPlanCard ${highlight ? "gpPlanCard--highlight" : ""}`}>
      <div className="gpPlanCard__header">
        <div>
          <h3 className="gpPlanCard__title">{plan?.term || "Upcoming Semester"}</h3>
          <div className="muted gpPlanCard__subtitle">{formatCredits(credits)}</div>
        </div>
      </div>

      <div className="gpPlanCard__body">
        {courses.length > 0 ? (
          courses.map((course, i) => <CourseRow key={`${plan?.id ?? plan?.term}-${i}`} course={course} />)
        ) : (
          <p className="muted">No courses in this GradPlan yet.</p>
        )}
      </div>
    </section>
  );
}

function MiniPlanCard({ plan }) {
  const credits = sumPlanCredits(plan);
  const courses = Array.isArray(plan?.courses) ? plan.courses : [];

  return (
    <section className="gpMiniPlanCard">
      <div className="gpMiniPlanCard__top">
        <div className="gpMiniPlanCard__term">{plan?.term || "Upcoming Semester"}</div>
        <div className="muted gpMiniPlanCard__credits">{formatCredits(credits)}</div>
      </div>

      <div className="gpMiniPlanCard__list">
        {courses.length > 0 ? (
          courses.map((course, i) => (
            <div key={`${plan?.id ?? plan?.term}-mini-${i}`} className="gpMiniPlanCard__item">
              <div>
                <div className="gpMiniPlanCard__code">{course?.code || "TBD 000"}</div>
                <div className="muted gpMiniPlanCard__name">{course?.title || "Untitled Course"}</div>
              </div>
              <span className={getCourseStatusClass(course?.status)}>
                {normalizeStatus(course?.status)}
              </span>
            </div>
          ))
        ) : (
          <p className="muted">No courses yet.</p>
        )}
      </div>
    </section>
  );
}

export default function GradPlansPage({ student }) {
  const major =
    student?.major || student?.program || student?.degreePlan || "Undeclared";

  const gpa =
    typeof student?.gpa === "number"
      ? student.gpa.toFixed(2)
      : student?.gpa
      ? String(student.gpa)
      : "N/A";

  const gradPlans = useMemo(() => {
    const rows = Array.isArray(student?.gradPlans)
      ? student.gradPlans
      : Array.isArray(student?.plan)
      ? student.plan
      : [];

    return rows;
  }, [student]);

  const currentPlan = gradPlans[0] || null;
  const nextPlan = gradPlans[1] || null;
  const remainingPlans = gradPlans.slice(2);

  const suggestions = Array.isArray(student?.courseSuggestions)
    ? student.courseSuggestions
    : [];

  const degree = student?.degreeRequirements || {};
  const advisorNote = student?.advisorNotes || null;

  return (
    <section className="card">
      <h2>GradPlans</h2>

      <div className="gradPlansLayout">
        <aside className="gradPlansLeftCol">
          <div className="panel stickyPanel">
            <h3>Course Suggestions</h3>
            {suggestions.length > 0 ? (
              <div className="gpSuggestionList">
                {suggestions.map((course, i) => (
                  <div key={`suggestion-${i}`} className="gpSuggestionCard">
                    <div className="gpSuggestionCard__code">{course?.code || "TBD 000"}</div>
                    <div className="gpSuggestionCard__title">{course?.title || "Untitled Course"}</div>
                    <div className="muted gpSuggestionCard__meta">
                      {Number(course?.credits ?? 0)} Credits
                      {course?.reason ? ` • ${course.reason}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No course suggestions available yet.</p>
            )}
          </div>
        </aside>

        <main className="gradPlansCenterCol">
          <div className="panel gpProfileCard">
            <div className="gpProfileCard__avatar" aria-hidden="true">
              {getInitials(student?.name)}
            </div>
            <div className="gpProfileCard__name">{student?.name || "Student Name"}</div>
            <div className="muted gpProfileCard__meta">
              {major} • GPA: <b>{gpa}</b>
            </div>
          </div>

          {currentPlan && <FullPlanCard plan={currentPlan} highlight />}
          {nextPlan && <FullPlanCard plan={nextPlan} />}

          {remainingPlans.length > 0 && (
            <div className="gpMiniPlansWrap">
              <h3>Future GradPlans</h3>
              <div className="gpMiniPlansGrid">
                {remainingPlans.map((plan, i) => (
                  <MiniPlanCard key={`${plan?.id ?? plan?.term ?? "plan"}-${i}`} plan={plan} />
                ))}
              </div>
            </div>
          )}

          {!currentPlan && !nextPlan && remainingPlans.length === 0 && (
            <div className="panel">
              <p className="muted">No GradPlans found for this student.</p>
            </div>
          )}
        </main>

        <aside className="gradPlansRightCol">
          <div className="panel stickyPanel">
            <h3>Degree Requirements</h3>

            <RequirementSection
              title="General Education"
              items={degree?.generalEducation}
              emptyText="No courses fulfilling this requirement yet."
            />

            <RequirementSection
              title="Major Core"
              items={degree?.majorCore}
              emptyText="No courses fulfilling this requirement yet."
            />

            <RequirementSection
              title="Electives"
              items={degree?.electives}
              emptyText="No courses fulfilling this requirement yet."
            />

            <RequirementSection
              title="Interdisciplinary Requirements"
              items={degree?.interdisciplinary}
              emptyText='No courses fulfilling this requirement yet.'
            />

            <RequirementSection
              title="Capstone Project"
              items={degree?.capstone}
              emptyText='No courses fulfilling this requirement yet.'
            />
          </div>

          <div className="panel" style={{ marginTop: 12 }}>
            <h3>Advisor Notes</h3>

            {advisorNote ? (
              <div className="advisorNoteCard">
                <div className="advisorNoteCard__author">{advisorNote?.advisorName || "Advisor"}</div>
                <p className="advisorNoteCard__message">{advisorNote?.message || "No note provided."}</p>
                <div className="muted advisorNoteCard__date">{advisorNote?.date || ""}</div>
              </div>
            ) : (
              <p className="muted">No advisor notes yet.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
