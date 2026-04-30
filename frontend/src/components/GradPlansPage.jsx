import React, { useState, useMemo } from "react";
import { generateSemester, deletePlan } from "@api/students.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}

function formatCredits(value) {
  const n = Number(value ?? 0);
  return `${n} credit${n === 1 ? "" : "s"}`;
}

function normalizeStatus(status) {
  return String(status || "").trim() || "Planned";
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
  if (typeof plan?.credits === "number") return plan.credits;
  if (typeof plan?.plannedCredits === "number") return plan.plannedCredits;
  if (!Array.isArray(plan?.courses)) return 0;
  return plan.courses.reduce((sum, c) => sum + Number(c?.credits ?? 0), 0);
}

function canEditPlan(plan) {
  const s = normalizeStatus(plan?.status || plan?.advisorStatus).toLowerCase();
  return (
    s !== "approved" &&
    s !== "historical" &&
    s !== "submitted" &&
    s !== "pending"
  );
}

/** Visible courses — filter out ghost rows that have no code */
function getVisibleCourses(plan) {
  const courses = Array.isArray(plan?.courses) ? plan.courses : [];
  return courses.filter((c) => c.code && c.code.trim());
}

/** Display label for a plan — use term if present, otherwise fall back */
function getPlanLabel(plan) {
  if (plan?.term && plan.term.trim()) return plan.term;
  if (plan?.id) return `Plan #${plan.id}`;
  return "Untitled Plan";
}

/**
 * Compute the next N semester labels starting from today.
 */
function getUpcomingSemesters(count = 4) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  let startSem, startYear;
  if (month < 7) {
    startSem = "Fall";
    startYear = year;
  } else {
    startSem = "Spring";
    startYear = year + 1;
  }

  const results = [];
  let sem = startSem;
  let y = startYear;
  for (let i = 0; i < count; i++) {
    results.push(`${sem} ${y}`);
    if (sem === "Fall") {
      sem = "Spring";
      y += 1;
    } else {
      sem = "Fall";
    }
  }
  return results;
}

/* ─── Sub-components ───────────────────────────────────────────────────────── */

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

function SavedPlanCard({
  plan,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
  onExportPdf,
}) {
  const visibleCourses = getVisibleCourses(plan);
  const credits = sumPlanCredits(plan);
  const editable = canEditPlan(plan);
  const status = normalizeStatus(plan?.status || plan?.advisorStatus);
  const label = getPlanLabel(plan);

  return (
    <section
      className={`gpSavedPlanCard ${isSelected ? "gpSavedPlanCard--selected" : ""}`}
      onClick={() => onSelect?.(plan.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect?.(plan.id);
      }}
    >
      <div className="gpSavedPlanCard__header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect?.(plan.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${label}`}
          />
          <h4 className="gpSavedPlanCard__term">{label}</h4>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className={`statusBadge ${status.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {status}
          </span>
          <span className="muted">{formatCredits(credits)}</span>
        </div>
      </div>

      <div className="gpSavedPlanCard__body">
        {visibleCourses.length > 0 ? (
          <div className="gpSavedPlanCard__courseList">
            {visibleCourses.map((course, i) => (
              <div
                key={`${plan.id}-c-${i}`}
                className="gpSavedPlanCard__courseRow"
              >
                <span className="gpSavedPlanCard__courseCode">
                  {course.code}
                </span>
                <span className="muted gpSavedPlanCard__courseTitle">
                  {course.title}
                </span>
                <span className="muted">{course.credits} cr</span>
                <span className={getCourseStatusClass(course.status)}>
                  {normalizeStatus(course.status)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No courses in this plan.</p>
        )}
      </div>

      <div
        className="gpSavedPlanCard__actions"
        onClick={(e) => e.stopPropagation()}
      >
        {editable && (
          <>
            <button
              className="btn gpBtn--small"
              onClick={() => onEdit?.(plan.id)}
            >
              Edit
            </button>
            <button
              className="btn gpBtn--small gpBtn--small"
              onClick={() => onDelete?.(plan.id)}
            >
              Delete
            </button>
          </>
        )}
        <button
          className="btn gpBtn--small"
          onClick={() => onExportPdf?.(plan)}
        >
          Export PDF
        </button>
      </div>
    </section>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────────────── */

export default function GradPlansPage({
  student,
  token,
  onEditPlan,
  onPlansChanged,
}) {
  const major = student?.major || "Undeclared";
  const gpa =
    typeof student?.gpa === "number"
      ? student.gpa.toFixed(2)
      : student?.gpa
      ? String(student.gpa)
      : "N/A";

  const plans = useMemo(() => {
    return Array.isArray(student?.plan) ? student.plan : [];
  }, [student?.plan]);

  // ── Generate state ──
  const upcomingSemesters = useMemo(() => getUpcomingSemesters(4), []);
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  // ── Saved plan selection ──
  const [selectedPlanIds, setSelectedPlanIds] = useState([]);

  // Filter out semesters that already have a plan with that term
  // Only filter on non-empty terms so leftover empty plans don't block anything
  const availableSemesters = useMemo(() => {
    const existingTerms = new Set(
      plans
        .map((p) => (p.term || "").trim())
        .filter(Boolean)
    );
    return upcomingSemesters.filter((s) => !existingTerms.has(s));
  }, [upcomingSemesters, plans]);

  function toggleSemester(sem) {
    setSelectedSemesters((prev) => {
      if (prev.includes(sem)) return prev.filter((s) => s !== sem);
      if (prev.length >= 4) return prev;
      return [...prev, sem];
    });
  }

  function togglePlanSelection(planId) {
    setSelectedPlanIds((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId]
    );
  }

  async function handleGenerate() {
    if (selectedSemesters.length === 0) return;
    setGenerating(true);
    setGenerateError("");

    try {
      await generateSemester(token, { semesters: selectedSemesters });
      setSelectedSemesters([]);
      if (typeof onPlansChanged === "function") await onPlansChanged();
    } catch (err) {
      setGenerateError(err.message || "Failed to generate plans.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeletePlan(planId) {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await deletePlan(token, planId);
      if (typeof onPlansChanged === "function") await onPlansChanged();
    } catch (err) {
      alert(err.message || "Failed to delete plan.");
    }
  }

  function handleEditPlan(planId) {
    if (typeof onEditPlan === "function") onEditPlan(planId);
  }

  function handleExportPdf(plan) {
    const doc = new jsPDF();
    const visibleCourses = getVisibleCourses(plan);
    const credits = sumPlanCredits(plan);
    const status = normalizeStatus(plan.status);
    const label = getPlanLabel(plan);

    doc.setFontSize(18);
    doc.text("GradMap — Graduation Plan", 14, 20);

    doc.setFontSize(12);
    doc.text(`Student: ${student?.name || "Student"}`, 14, 32);
    doc.text(`Major: ${major}`, 14, 40);
    doc.text(`Semester: ${label}`, 14, 48);
    doc.text(`Status: ${status}`, 14, 56);
    doc.text(`Total Credits: ${credits}`, 14, 64);

    if (visibleCourses.length > 0) {
      autoTable(doc, {
        startY: 74,
        head: [["Course Code", "Title", "Credits", "Status"]],
        body: visibleCourses.map((c) => [
          c.code || "",
          c.title || "",
          String(c.credits || 0),
          normalizeStatus(c.status),
        ]),
        theme: "grid",
        headStyles: { fillColor: [79, 124, 255] },
      });
    } else {
      doc.text("No courses in this plan.", 14, 74);
    }

    const filename = `GradPlan_${label.replace(/[^a-zA-Z0-9]+/g, "_")}.pdf`;
    doc.save(filename);
  }

  // Split plans into editable vs locked
  const editablePlans = plans.filter((p) => canEditPlan(p));
  const lockedPlans = plans.filter((p) => !canEditPlan(p));

  const degree = student?.degreeRequirements || {};
  const advisorNote = student?.advisorNotes || null;

  const generateBtnLabel =
    selectedSemesters.length === 0
      ? "Select semesters above"
      : generating
      ? "Generating…"
      : `Generate ${selectedSemesters.length} Plan${selectedSemesters.length !== 1 ? "s" : ""}`;

  return (
    <section className="card">
      <h2>GradPlans</h2>

      <div className="gradPlansLayout">
        {/* ── Left Column: Generate ── */}
        <aside className="gradPlansLeftCol">
          <div className="panel stickyPanel">
            <h3>Generate Plans</h3>
            <p className="muted" style={{ marginTop: 0, fontSize: ".9rem" }}>
              Select up to 4 upcoming semesters to auto-generate a course plan
              based on your <b>{major}</b> degree requirements. Courses are
              selected by lowest course number first, targeting 12–15 credits
              per semester.
            </p>

            {availableSemesters.length > 0 ? (
              <div className="gpSemesterCheckboxes">
                {availableSemesters.map((sem) => (
                  <label key={sem} className="gpSemesterCheckbox">
                    <input
                      type="checkbox"
                      checked={selectedSemesters.includes(sem)}
                      onChange={() => toggleSemester(sem)}
                    />
                    <span>{sem}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="muted">
                All upcoming semesters already have plans.
              </p>
            )}

            {generateError && (
              <div className="error" style={{ marginTop: 8, fontSize: ".9rem" }}>
                {generateError}
              </div>
            )}

            <button
              className="btn primary"
              style={{ marginTop: 12, width: "100%" }}
              disabled={selectedSemesters.length === 0 || generating}
              onClick={handleGenerate}
            >
              {generateBtnLabel}
            </button>
          </div>
        </aside>

        {/* ── Center Column: Saved Plans ── */}
        <main className="gradPlansCenterCol">
          <div className="panel gpProfileCard">
            <div className="gpProfileCard__avatar" aria-hidden="true">
              {getInitials(student?.name)}
            </div>
            <div className="gpProfileCard__name">
              {student?.name || "Student Name"}
            </div>
            <div className="muted gpProfileCard__meta">
              {major} • GPA: <b>{gpa}</b>
            </div>
          </div>

          {/* Editable Plans */}
          <div className="panel" style={{ marginBottom: 12 }}>
            <h3>
              Current Plans{" "}
              <span className="muted" style={{ fontWeight: 400, fontSize: ".9rem" }}>
                ({editablePlans.length})
              </span>
            </h3>

            {editablePlans.length > 0 ? (
              <div className="gpSavedPlans">
                {editablePlans.map((plan) => (
                  <SavedPlanCard
                    key={plan.id}
                    plan={plan}
                    isSelected={selectedPlanIds.includes(plan.id)}
                    onSelect={togglePlanSelection}
                    onDelete={handleDeletePlan}
                    onEdit={handleEditPlan}
                    onExportPdf={handleExportPdf}
                  />
                ))}
              </div>
            ) : (
              <p className="muted">
                No editable plans. Generate new ones using the panel on the
                left.
              </p>
            )}
          </div>

          {/* Locked / Historical Plans */}
          {lockedPlans.length > 0 && (
            <div className="panel">
              <h3>
                Approved &amp; Historical Plans{" "}
                <span className="muted" style={{ fontWeight: 400, fontSize: ".9rem" }}>
                  ({lockedPlans.length})
                </span>
              </h3>
              <div className="gpSavedPlans">
                {lockedPlans.map((plan) => (
                  <SavedPlanCard
                    key={plan.id}
                    plan={plan}
                    isSelected={selectedPlanIds.includes(plan.id)}
                    onSelect={togglePlanSelection}
                    onDelete={handleDeletePlan}
                    onEdit={handleEditPlan}
                    onExportPdf={handleExportPdf}
                  />
                ))}
              </div>
            </div>
          )}

          {plans.length === 0 && (
            <div className="panel">
              <p className="muted">
                No GradPlans found. Use the generator on the left to create your
                first plan.
              </p>
            </div>
          )}
        </main>

        {/* ── Right Column: Requirements + Advisor Notes ── */}
        <aside className="gradPlansRightCol">
          <div className="panel stickyPanel">
            <h3>Degree Requirements</h3>

            <RequirementSection
              title="General Education"
              items={degree?.generalEducation}
            />
            <RequirementSection title="Major Core" items={degree?.majorCore} />
            <RequirementSection title="Electives" items={degree?.electives} />
            <RequirementSection
              title="Interdisciplinary"
              items={degree?.interdisciplinary}
            />
            <RequirementSection title="Capstone" items={degree?.capstone} />
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
