import React, { useState, useEffect } from "react";

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
  return plan.courses.reduce(
    (sum, course) => sum + Number(course?.credits ?? 0),
    0
  );
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
        <p className="muted reqSection__empty">
          {emptyText || "No courses fulfilling this requirement yet."}
        </p>
      )}
    </div>
  );
}

function CourseRow({ course }) {
  return (
    <div className="gpCourseCard">
      <div className="gpCourseCard__left">
        <div className="gpCourseCard__code">{course?.code || "TBD 000"}</div>
        <div className="gpCourseCard__name">
          {course?.title || "Untitled Course"}
        </div>
        <div className="muted gpCourseCard__credits">
          {Number(course?.credits ?? 0)} Credits
        </div>
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
          courses.map((course, i) => (
            <CourseRow key={`${plan?.id ?? plan?.term}-${i}`} course={course} />
          ))
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
            <div
              key={`${plan?.id ?? plan?.term}-mini-${i}`}
              className="gpMiniPlanCard__item"
            >
              <div>
                <div className="gpMiniPlanCard__code">{course?.code || "TBD 000"}</div>
                <div className="muted gpMiniPlanCard__name">
                  {course?.title || "Untitled Course"}
                </div>
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

// Card used in the "Current Grad Plans" section. Displays summary
// of a saved grad plan with action buttons.
function SavedPlanCard({ plan, onEditPlan, onSubmitPlan, onClearPlan }) {
  const credits = sumPlanCredits(plan);
  const courses = Array.isArray(plan?.courses) ? plan.courses : [];
  const id = plan?.id ?? plan?.term;
  return (
    <section className="gpSavedPlanCard">
      <div className="gpSavedPlanCard__header">
        <h4 className="gpSavedPlanCard__term">{plan?.term || "Semester"}</h4>
        <div className="muted gpSavedPlanCard__credits">{formatCredits(credits)}</div>
      </div>
      <div className="gpSavedPlanCard__body">
        {courses.length > 0 ? (
          <ul className="gpSavedPlanCard__courses" style={{ listStyle: 'none', padding: 0 }}>
            {courses.map((course, i) => (
              <li key={`${id}-course-${i}`} style={{ marginBottom: 4 }}>
                <strong>{course.code}</strong> – {course.credits} credits – {normalizeStatus(course.status)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No courses in this plan.</p>
        )}
      </div>
      <div className="gpSavedPlanCard__actions" style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <button
          type="button"
          onClick={() => onSubmitPlan?.(plan?.id ?? plan?.term)}
        >
          Submit to advisor
        </button>
        <button
          type="button"
          onClick={() => onEditPlan?.(plan?.id ?? plan?.term)}
        >
          Edit Plan
        </button>
        <button
          type="button"
          onClick={() => onClearPlan?.(plan?.id ?? plan?.term)}
        >
          Clear Plan
        </button>
        <button
          type="button"
          onClick={() => {
            // Export logic placeholder – could implement PDF export in future
            console.log('Exporting plan', plan);
          }}
        >
          Export Plan
        </button>
      </div>
    </section>
  );
}

export default function GradPlansPage({
  student,
  degreeProgram,
  editingPlanId,
  onUpdateGradPlans,
  onEditPlan,
  onSubmitPlan,
  onClearPlan,
}) {
  const major =
    student?.major || student?.program || student?.degreePlan || "Undeclared";

  const gpa =
    typeof student?.gpa === "number"
      ? student.gpa.toFixed(2)
      : student?.gpa
      ? String(student.gpa)
      : "N/A";

  const [gradPlansState, setGradPlansState] = useState(() => {
    const rows = Array.isArray(student?.gradPlans)
      ? student.gradPlans
      : Array.isArray(student?.plan)
      ? student.plan
      : [];
    return [...rows];
  });

  // Sync local gradPlans state when student prop updates
  // This ensures that actions taken elsewhere (e.g., clearing or submitting a plan)
  // are reflected on this page.
  useEffect(() => {
    const rows = Array.isArray(student?.gradPlans)
      ? student.gradPlans
      : Array.isArray(student?.plan)
      ? student.plan
      : [];
    setGradPlansState([...rows]);
  }, [student?.gradPlans, student?.plan]);

  const currentPlan = gradPlansState[0] || null;
  const nextPlan = gradPlansState[1] || null;
  const remainingPlans = gradPlansState.slice(2);

  const suggestions = Array.isArray(student?.courseSuggestions)
    ? student.courseSuggestions
    : [];

  const sampleGeneratedPlan = Array.isArray(degreeProgram?.sampleGeneratedPlan)
    ? degreeProgram.sampleGeneratedPlan
    : [];

  const [selectedGenerateIds, setSelectedGenerateIds] = useState([]);
  const [generatedPlans, setGeneratedPlans] = useState([]);

  function toggleGenerateSelection(planId) {
    setSelectedGenerateIds((prev) => {
      const idx = prev.indexOf(planId);
      if (idx === -1) return [...prev, planId];
      return prev.filter((id) => id !== planId);
    });
  }

  function generateSelectedPlans() {
    const selected = sampleGeneratedPlan.filter((p) =>
      selectedGenerateIds.includes(p.id)
    );

    const newPlans = selected.map((p) => {
      const courses = Array.isArray(p.courses)
        ? p.courses.map((c) => {
            if (typeof c === "string") {
              const sug = suggestions.find((s) => s.code === c) || {};
              return {
                code: c,
                title: sug.title || c,
                credits: sug.credits || 0,
                status: "Planned",
              };
            }

            return {
              code: c?.code || c,
              title: c?.title || c?.code || "",
              credits: c?.credits || 0,
              status: "Planned",
            };
          })
        : [];

      return {
        id: p.id,
        term: p.term,
        plannedCredits: p.plannedCredits,
        courses,
      };
    });

    setGeneratedPlans(newPlans);
  }

  function saveGeneratedPlans(overwrite = false) {
    // Compute the updated plans array outside of setState so we can
    // synchronously persist changes via onUpdateGradPlans.
    const updated = (() => {
      const plans = [...gradPlansState];
      generatedPlans.forEach((newPlan) => {
        const existingIndex = plans.findIndex(
          (p) => p.term === newPlan.term || p.id === newPlan.id
        );
        if (existingIndex !== -1) {
          if (overwrite) {
            plans[existingIndex] = { ...plans[existingIndex], ...newPlan };
          }
        } else {
          plans.push(newPlan);
        }
      });
      return plans;
    })();

    setGradPlansState(updated);
    if (typeof onUpdateGradPlans === "function") {
      onUpdateGradPlans(updated);
    }
    // Clear generated state after saving
    setGeneratedPlans([]);
    setSelectedGenerateIds([]);
  }


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
                    <div className="gpSuggestionCard__code">
                      {course?.code || "TBD 000"}
                    </div>
                    <div className="gpSuggestionCard__title">
                      {course?.title || "Untitled Course"}
                    </div>
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

          <div className="panel" style={{ marginBottom: 12 }}>
            <h3>Generate New GradPlans</h3>
            {sampleGeneratedPlan.length > 0 ? (
              <div>
                <p>Select which semesters to generate:</p>
                <div className="gpGenerateList">
                  {sampleGeneratedPlan.map((plan, i) => (
                    <div key={`gen-opt-${plan.id || i}`} className="gpGenerateOption">
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedGenerateIds.includes(plan.id)}
                          onChange={() => toggleGenerateSelection(plan.id)}
                        />
                        {plan.term} ({plan.plannedCredits} credits)
                      </label>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={generateSelectedPlans}
                  disabled={selectedGenerateIds.length === 0}
                  style={{ marginTop: 8 }}
                >
                  Generate Selected
                </button>

                {generatedPlans.length > 0 && (
                  <div className="gpGeneratedPreview" style={{ marginTop: 12 }}>
                    <h4>Generated Plan Preview</h4>
                    <div className="gpMiniPlansGrid">
                      {generatedPlans.map((gp, gi) => (
                        <MiniPlanCard
                          key={`preview-${gp.id || gp.term}-${gi}`}
                          plan={gp}
                        />
                      ))}
                    </div>
                    <div className="gpGenerateActions" style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => saveGeneratedPlans(true)}
                        style={{ marginRight: 6 }}
                      >
                        Overwrite Existing
                      </button>
                      <button
                        type="button"
                        onClick={() => saveGeneratedPlans(false)}
                      >
                        Save and Append
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="muted">No sample plans available for this degree.</p>
            )}
          </div>

          {/* Current saved grad plans list */}
          <div className="panel" style={{ marginBottom: 12 }}>
            <h3>Current Grad Plans</h3>
            {gradPlansState.length > 0 ? (
              <div className="gpSavedPlans">
                {gradPlansState.map((plan, i) => (
                  <SavedPlanCard
                    key={`saved-${plan.id || plan.term}-${i}`}
                    plan={plan}
                    onEditPlan={onEditPlan}
                    onSubmitPlan={onSubmitPlan}
                    onClearPlan={onClearPlan}
                  />
                ))}
              </div>
            ) : (
              <p className="muted">No saved Grad Plans.</p>
            )}
          </div>

          {currentPlan && <FullPlanCard plan={currentPlan} highlight />}
          {nextPlan && <FullPlanCard plan={nextPlan} />}

          {remainingPlans.length > 0 && (
            <div className="gpMiniPlansWrap">
              <h3>Future GradPlans</h3>
              <div className="gpMiniPlansGrid">
                {remainingPlans.map((plan, i) => (
                  <MiniPlanCard
                    key={`${plan?.id ?? plan?.term ?? "plan"}-${i}`}
                    plan={plan}
                  />
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
              emptyText="No courses fulfilling this requirement yet."
            />

            <RequirementSection
              title="Capstone Project"
              items={degree?.capstone}
              emptyText="No courses fulfilling this requirement yet."
            />
          </div>

          <div className="panel" style={{ marginTop: 12 }}>
            <h3>Advisor Notes</h3>

            {advisorNote ? (
              <div className="advisorNoteCard">
                <div className="advisorNoteCard__author">
                  {advisorNote?.advisorName || "Advisor"}
                </div>
                <p className="advisorNoteCard__message">
                  {advisorNote?.message || "No note provided."}
                </p>
                <div className="muted advisorNoteCard__date">
                  {advisorNote?.date || ""}
                </div>
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