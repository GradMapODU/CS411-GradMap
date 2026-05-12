import { useMemo, useState } from "react";
import { updatePlanCourses } from "@api/students.js";

function normalize(text) {
  return String(text || "").toLowerCase().trim();
}

function getLevelFromCode(code = "") {
  const match = String(code).match(/\b(\d{3})\b/);
  if (!match) return "other";
  return `${match[1][0]}00`;
}

function sortByCode(a, b) {
  return String(a.code).localeCompare(String(b.code), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

// Build a set of course codes the student has already completed.
// Mirrors the backend's definition: a planned course counts as completed
// when its status is "Completed".
function buildCompletedSet(student) {
  const plans = Array.isArray(student?.plan) ? student.plan : [];
  const completed = new Set();
  for (const plan of plans) {
    const courses = Array.isArray(plan?.courses) ? plan.courses : [];
    for (const c of courses) {
      if (c?.status === "Completed" && c?.code) {
        completed.add(c.code);
      }
    }
  }
  return completed;
}

// Given a course's prereq codes and the student's completed set, return
// { met, missing, satisfied } where satisfied is true iff missing is empty.
function evaluatePrereqs(course, completedCodes) {
  // Prefer the structured array; fall back to parsing the display string.
  let codes = Array.isArray(course?.prerequisiteCodes)
    ? course.prerequisiteCodes
    : null;

  if (!codes) {
    const raw = String(course?.prerequisites || "").trim();
    codes = raw && raw !== "None listed"
      ? raw.split(/[,;]/).map(s => s.trim()).filter(Boolean)
      : [];
  }

  const met = [];
  const missing = [];
  for (const code of codes) {
    (completedCodes.has(code) ? met : missing).push(code);
  }

  return { codes, met, missing, satisfied: missing.length === 0 };
}

function CourseCard({ course, editingPlan, onAddCourse, completedCodes }) {
  const isInPlan =
    editingPlan &&
    Array.isArray(editingPlan.courses) &&
    editingPlan.courses.some((c) => c.code === course.code);

  const { codes: prereqCodes, met, missing, satisfied } = evaluatePrereqs(
    course,
    completedCodes
  );
  const hasPrereqs = prereqCodes.length > 0;

  return (
    <article className="catalogCourseCard">
      <div className="catalogCourseCard__top">
        <div>
          <div className="catalogCourseCard__code">{course.code}</div>
          <h3 className="catalogCourseCard__title">{course.title}</h3>
        </div>

        <div className="catalogCourseCard__badges">
          <span className="catalogBadge">{course.credits} Credits</span>
          <span className="catalogBadge catalogBadge--soft">
            {course.level || getLevelFromCode(course.code)}
          </span>
        </div>
      </div>

      <p className="muted catalogCourseCard__desc">{course.description}</p>

      {Array.isArray(course.tags) && course.tags.length > 0 && (
        <div className="catalogTagRow">
          {course.tags.map((tag) => (
            <span key={`${course.code}-${tag}`} className="catalogTag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="catalogCourseCard__meta">
        <div>
          <span className="catalogLabel">Prerequisites:</span>{" "}
          {hasPrereqs ? (
            <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4 }}>
              {met.map((code) => (
                <span
                  key={`${course.code}-met-${code}`}
                  title="You have completed this prerequisite"
                  style={{
                    color: "#7ee2a8",
                    background: "rgba(46,204,113,.12)",
                    border: "1px solid rgba(46,204,113,.35)",
                    borderRadius: 4,
                    padding: "1px 6px",
                    fontSize: ".85rem",
                  }}
                >
                  ✓ {code}
                </span>
              ))}
              {missing.map((code) => (
                <span
                  key={`${course.code}-missing-${code}`}
                  title="You have not completed this prerequisite"
                  style={{
                    color: "#ff6b6b",
                    background: "rgba(255,77,77,.10)",
                    border: "1px solid rgba(255,77,77,.40)",
                    borderRadius: 4,
                    padding: "1px 6px",
                    fontSize: ".85rem",
                  }}
                >
                  ✗ {code}
                </span>
              ))}
            </span>
          ) : (
            <span className="muted">None listed</span>
          )}
        </div>

        <div>
          <span className="catalogLabel">Format:</span>{" "}
          <span className="muted">{course.format || "Lecture"}</span>
        </div>
      </div>

      {editingPlan && (
        <div style={{ marginTop: 8 }}>
          {isInPlan ? (
            <span
              className="catalogBadge"
              style={{
                color: "#7ee2a8",
                borderColor: "rgba(46,204,113,.35)",
                background: "rgba(46,204,113,.12)",
              }}
            >
              ✓ In Plan
            </span>
          ) : satisfied ? (
            <button
              className="btn primary gpBtn--small"
              onClick={() => onAddCourse?.(course)}
            >
              + Add to Plan
            </button>
          ) : (
            <button
              className="btn gpBtn--small"
              disabled
              title={`Missing prerequisite${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`}
              style={{
                opacity: 0.55,
                cursor: "not-allowed",
              }}
            >
              🔒 Prereqs not met
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function PlanEditPanel({ plan, onRemoveCourse, onSave, onCancel, saving }) {
  const courses = Array.isArray(plan?.courses) ? plan.courses : [];
  const totalCredits = courses.reduce(
    (sum, c) => sum + Number(c.credits || 0),
    0
  );

  return (
    <div className="catalogEditPanel panel">
      <div className="catalogEditPanel__header">
        <div>
          <h3 style={{ margin: 0 }}>
            Editing: {plan?.term || "Plan"}
          </h3>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: ".85rem" }}>
            {courses.length} course{courses.length !== 1 ? "s" : ""} •{" "}
            {totalCredits} credits
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn primary gpBtn--small"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "💾 Save"}
          </button>
          <button className="btn gpBtn--small" onClick={onCancel}>
            ✕ Cancel
          </button>
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="catalogEditPanel__courses">
          {courses.map((course, i) => (
            <div key={`edit-${course.code}-${i}`} className="catalogEditPanel__row">
              <div>
                <span className="catalogEditPanel__code">{course.code}</span>
                <span className="muted"> — {course.title}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="muted">{course.credits} cr</span>
                <button
                  className="btn gpBtn--small gpBtn--danger"
                  onClick={() => onRemoveCourse?.(course.code)}
                  title="Remove from plan"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted" style={{ padding: "8px 0" }}>
          No courses in this plan. Add courses from the catalogue below.
        </p>
      )}

      {totalCredits > 0 && totalCredits < 12 && (
        <p style={{ color: "#ffd54a", fontSize: ".85rem", marginTop: 8 }}>
          ⚠ Plan has only {totalCredits} credits. Consider adding more courses
          to meet the 12-credit minimum.
        </p>
      )}
      {totalCredits > 18 && (
        <p style={{ color: "#ff4d4d", fontSize: ".85rem", marginTop: 8 }}>
          ⚠ Plan exceeds 18 credits ({totalCredits}). This is a very heavy
          load.
        </p>
      )}
    </div>
  );
}

export default function CourseCataloguePage({
  student,
  token,
  courses = [],
  editingPlanId,
  onSelectPlan,
  onPlanSaved,
}) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [creditFilter, setCreditFilter] = useState("all");
  const [saving, setSaving] = useState(false);

  const major =
    student?.major || student?.program || student?.degreePlan || "Undeclared";


  const plans = useMemo(
    () => (Array.isArray(student?.plan) ? student.plan : []),
    [student?.plan]
  );

  // Set of course codes the student has completed — used to grade prereqs.
  const completedCodes = useMemo(() => buildCompletedSet(student), [student]);

  const editingPlan = useMemo(() => {
    if (!editingPlanId) return null;
    return plans.find((p) => p.id === editingPlanId) || null;
  }, [editingPlanId, plans]);


  const [localCourses, setLocalCourses] = useState([]);


  useState(() => {
    if (editingPlan) {
      setLocalCourses(
        Array.isArray(editingPlan.courses) ? [...editingPlan.courses] : []
      );
    }
  });


  useMemo(() => {
    if (editingPlan) {
      setLocalCourses(
        Array.isArray(editingPlan.courses) ? [...editingPlan.courses] : []
      );
    }
  }, [editingPlan]);


  const localPlan = editingPlan
    ? { ...editingPlan, courses: localCourses }
    : null;

  function handleAddCourse(course) {
    if (!editingPlan) return;
    const exists = localCourses.some((c) => c.code === course.code);
    if (exists) return;

    // Defense-in-depth: even if something bypasses the disabled button,
    // refuse to add a course whose prerequisites aren't met.
    const { missing, satisfied } = evaluatePrereqs(course, completedCodes);
    if (!satisfied) {
      alert(
        `Cannot add ${course.code}. Missing prerequisite${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`
      );
      return;
    }

    setLocalCourses((prev) => [
      ...prev,
      {
        code: course.code,
        title: course.title,
        credits: course.credits,
        status: "Planned",
      },
    ]);
  }

  function handleRemoveCourse(courseCode) {
    setLocalCourses((prev) => prev.filter((c) => c.code !== courseCode));
  }

  async function handleSavePlan() {
    if (!editingPlanId || !token) return;
    setSaving(true);
    try {
      await updatePlanCourses(token, editingPlanId, localCourses);

      if (typeof onSelectPlan === "function") onSelectPlan(null);
      if (typeof onPlanSaved === "function") await onPlanSaved();
    } catch (err) {
      alert(err.message || "Failed to save plan.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    if (typeof onSelectPlan === "function") onSelectPlan(null);
  }

  const allCourses = useMemo(() => {
    return Array.isArray(courses) ? [...courses].sort(sortByCode) : [];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const q = normalize(search);

    return allCourses.filter((course) => {
      const courseLevel = String(course.level || getLevelFromCode(course.code));

      const matchesSearch =
        !q ||
        normalize(course.code).includes(q) ||
        normalize(course.title).includes(q) ||
        normalize(course.description).includes(q) ||
        normalize(course.prerequisites).includes(q) ||
        (Array.isArray(course.tags) &&
          course.tags.some((tag) => normalize(tag).includes(q)));

      const matchesLevel =
        levelFilter === "all" ||
        normalize(courseLevel) === normalize(levelFilter);

      const matchesCredits =
        creditFilter === "all" || String(course.credits) === String(creditFilter);

      return matchesSearch && matchesLevel && matchesCredits;
    });
  }, [allCourses, search, levelFilter, creditFilter]);

  const totalCredits = useMemo(() => {
    return filteredCourses.reduce(
      (sum, course) => sum + Number(course.credits || 0),
      0
    );
  }, [filteredCourses]);

  return (
    <section className="card">
      <div className="catalogHero">
        <div>
          <h2>Course Catalogue</h2>
          <p className="muted catalogHero__subtitle">
            Browse {major} courses, review prerequisites, and search up classes.
            {editingPlan &&
              " Add or remove courses to update your plan."}
          </p>
        </div>

        <div className="catalogStats">
          <div className="catalogStat">
            <div className="catalogStat__value">{filteredCourses.length}</div>
            <div className="muted catalogStat__label">Courses Shown</div>
          </div>

          <div className="catalogStat">
            <div className="catalogStat__value">{totalCredits}</div>
            <div className="muted catalogStat__label">Visible Credits</div>
          </div>
        </div>
      </div>

      {localPlan && (
        <PlanEditPanel
          plan={localPlan}
          onRemoveCourse={handleRemoveCourse}
          onSave={handleSavePlan}
          onCancel={handleCancelEdit}
          saving={saving}
        />
      )}

      <div className="catalogToolbar panel">
        <div className="catalogToolbar__group catalogToolbar__group--search">
          <label className="catalogFieldLabel" htmlFor="catalog-search">
            Search
          </label>
          <input
            id="catalog-search"
            className="input"
            type="text"
            placeholder="Search CS 330, algorithms, web, machine learning..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="catalogToolbar__group">
          <label className="catalogFieldLabel" htmlFor="catalog-level">
            Level
          </label>
          <select
            id="catalog-level"
            className="input"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="100">100-level</option>
            <option value="200">200-level</option>
            <option value="300">300-level</option>
            <option value="400">400-level</option>
            <option value="500">500-level</option>
          </select>
        </div>

        <div className="catalogToolbar__group">
          <label className="catalogFieldLabel" htmlFor="catalog-credits">
            Credits
          </label>
          <select
            id="catalog-credits"
            className="input"
            value={creditFilter}
            onChange={(e) => setCreditFilter(e.target.value)}
          >
            <option value="all">Any Credits</option>
            <option value="1">1 Credit</option>
            <option value="3">3 Credits</option>
            <option value="4">4 Credits</option>
          </select>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="catalogGrid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.code}
              course={course}
              editingPlan={localPlan}
              onAddCourse={handleAddCourse}
              completedCodes={completedCodes}
            />
          ))}
        </div>
      ) : (
        <div className="panel">
          <p className="muted">
            No courses matched your filters. Try a different search term or clear
            a filter.
          </p>
        </div>
      )}
    </section>
  );
}