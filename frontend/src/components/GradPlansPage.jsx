import React, { useState, useMemo } from "react";
import { generateSemester, deletePlan } from "@api/students.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { evaluateProgram } from "./evaluateRequirements.js";
import { getProgramRequirements } from "./programRequirements.js";


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

function getVisibleCourses(plan) {
  const courses = Array.isArray(plan?.courses) ? plan.courses : [];
  return courses.filter((c) => c.code && c.code.trim());
}

function getPlanLabel(plan) {
  if (plan?.term && plan.term.trim()) return plan.term;
  if (plan?.id) return `Plan #${plan.id}`;
  return "Untitled Plan";
}

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

function summarizeSkipped(skipped) {
  const list = Array.isArray(skipped) ? skipped : [];
  const blockerCounts = new Map();
  const warningCounts = new Map();
  for (const s of list) {
    const reason = s?.reason || "Unknown reason";
    const target = s?.severity === "warning" ? warningCounts : blockerCounts;
    target.set(reason, (target.get(reason) || 0) + 1);
  }
  const fmt = (m) =>
    Array.from(m.entries())
      .map(([reason, n]) => `${n}× ${reason}`)
      .join("; ");
  return { blockers: fmt(blockerCounts), warnings: fmt(warningCounts) };
}

function buildFailureSummary(result, term) {
  const baseMsg = result?.message || `No plan created for ${term}.`;
  const { blockers } = summarizeSkipped(result?.skipped);
  return blockers ? `${term}: ${baseMsg} (${blockers})` : `${term}: ${baseMsg}`;
}

function buildWarningSummary(result, term) {
  const { warnings } = summarizeSkipped(result?.skipped);
  return warnings ? `${term}: ${warnings}` : "";
}


function normalizeCodeKey(raw) {
  return String(raw || "").replace(/\s+/g, " ").trim().toUpperCase();
}

function expandSlashVariants(rawCode) {
  const key = normalizeCodeKey(rawCode);
  if (!key.includes("/")) return [key];
  const out = [key];
  const tokens = key.split("/").map((s) => s.trim()).filter(Boolean);
  let lastPrefix = "";
  for (const t of tokens) {
    const pm = t.match(/^([A-Z]+)\s*/);
    if (pm) {
      lastPrefix = pm[1];
      out.push(normalizeCodeKey(t));
    } else if (lastPrefix) {
      out.push(normalizeCodeKey(`${lastPrefix} ${t}`));
    }
  }
  return [...new Set(out)];
}

function buildCourseStatusMap(plans, completedCourses) {
  const rank = { completed: 3, enrolled: 2, "in progress": 2, planned: 1 };
  const map = new Map();

  const upsert = (rawCode, status, title) => {
    const keys = expandSlashVariants(rawCode);
    if (keys.length === 0 || !keys[0]) return;
    const canonicalCode = keys[0];
    const incomingRank = rank[status.toLowerCase()] ?? 0;
    for (const k of keys) {
      const existing = map.get(k);
      const existingRank = existing ? rank[existing.status.toLowerCase()] ?? 0 : -1;
      if (incomingRank >= existingRank) {
        map.set(k, { code: canonicalCode, title: title || existing?.title || "", status });
      }
    }
  };

  for (const plan of Array.isArray(plans) ? plans : []) {
    for (const course of Array.isArray(plan?.courses) ? plan.courses : []) {
      upsert(course?.code, normalizeStatus(course?.status), course?.title);
    }
  }

  for (const code of Array.isArray(completedCourses) ? completedCourses : []) {
    upsert(code, "Completed");
  }

  return map;
}

function RequirementDetail({ entry }) {
  switch (entry.kind) {
    case "single":

      return null;

    case "chooseOne": {
      const codes = (entry.options || []).map((o) => o.code).join(" / ");
      return (
        <div className="reqItem__sub muted">
          Choose one: {codes}
          {entry.satisfyingCourses?.length > 0 && (
            <span className="reqItem__pick">
              {" "}
              · using {entry.satisfyingCourses[0].code}
            </span>
          )}
        </div>
      );
    }

    case "chooseOneGroup": {
      const groups = entry.groups || [];
      return (
        <div className="reqItem__sub muted">
          <div>Choose one combination:</div>
          <ul className="reqItem__groups">
            {groups.map((g, i) => {
              const isBest = i === 0;
              const codes = g.codes.join(" + ");
              const annot =
                g.completedCount === g.totalCount && g.totalCount > 0
                  ? "(complete)"
                  : g.plannedCount + g.completedCount === g.totalCount && g.totalCount > 0
                  ? "(in progress)"
                  : g.completedCount > 0 || g.plannedCount > 0
                  ? `(${g.completedCount + g.plannedCount}/${g.totalCount} so far)`
                  : "";
              return (
                <li
                  key={i}
                  className={isBest ? "reqItem__groupBest" : "reqItem__groupAlt"}
                >
                  {g.name ? `${g.name}: ` : ""}
                  {codes}
                  {annot ? " " + annot : ""}
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    case "chooseN": {
      const p = entry.progress || {};
      const target = p.target ?? 0;
      const done = p.completedCount ?? 0;
      const planned = p.plannedCount ?? 0;
      const pickedCodes = (entry.satisfyingCourses || []).map((s) => s.code).join(", ");
      return (
        <div className="reqItem__sub muted">
          {done} of {target} complete
          {planned > 0 ? `, ${planned} planned` : ""}
          {pickedCodes ? ` · ${pickedCodes}` : ""}
        </div>
      );
    }

    case "crossSatisfied": {
      const note = entry.note ? `${entry.note}: ` : "";
      const codes = (entry.satisfiedBy || []).join(", ");
      return (
        <div className="reqItem__sub muted">
          {note}
          {codes}
        </div>
      );
    }

    default:
      return null;
  }
}

function RequirementSection({ title, entries, emptyText }) {
  const list = Array.isArray(entries) ? entries : [];

  if (list.length === 0) {
    return (
      <div className="reqSection">
        <div className="reqSection__title">{title}</div>
        <p className="muted reqSection__empty">
          {emptyText || "No courses fulfilling this requirement yet."}
        </p>
      </div>
    );
  }

  const groups = [
    { key: "notCompleted", label: "Not Completed", className: "reqGroup--notCompleted" },
    { key: "planned",       label: "Planned",       className: "reqGroup--planned" },
    { key: "completed",     label: "Completed",     className: "reqGroup--completed" },
  ];

  return (
    <div className="reqSection">
      <div className="reqSection__title">{title}</div>
      {groups.map((g) => {
        const items = list.filter((it) => it.bucket === g.key);
        if (items.length === 0) return null;
        return (
          <div key={g.key} className={`reqGroup ${g.className}`}>
            <div className="reqGroup__header">{g.label}</div>
            <ul className="reqSection__list">
              {items.map((it, i) => (
                <li key={`${title}-${g.key}-${i}`} className="reqItem">
                  <div className="reqItem__main">
                    <span className="reqItem__label">{it.label}</span>
                    {it.kind === "single" && it.satisfyingCourses?.length > 0 && (
                      <span className="muted reqItem__via">
                        {" "}
                        ({it.satisfyingCourses.map((sc) => sc.code).join(", ")})
                      </span>
                    )}
                  </div>
                  <RequirementDetail entry={it} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
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


  const upcomingSemesters = useMemo(() => getUpcomingSemesters(4), []);
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [generateWarning, setGenerateWarning] = useState("");

  const [selectedPlanIds, setSelectedPlanIds] = useState([]);


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
    setGenerateWarning("");

    const created = [];

    const warningSummaries = [];

    try {
      for (const term of selectedSemesters) {
        const [semester, yearStr] = term.split(" ");
        const year = Number(yearStr);

        const result = await generateSemester(token, {
          semester,
          year,
          requirements: evaluatedProgram.program || undefined,
        });

        console.log("generateSemester result:", term, result);

        if (result?.plan_id == null) {

          throw new Error(buildFailureSummary(result, term));
        }
        created.push(term);

        const wsum = buildWarningSummary(result, term);
        if (wsum) warningSummaries.push(wsum);
      }
      setSelectedSemesters([]);
      if (warningSummaries.length) {
        setGenerateWarning(
          `Plans created with warnings: ${warningSummaries.join(" | ")}`
        );
      }
      if (typeof onPlansChanged === "function") await onPlansChanged();
    } catch (err) {
      const partial = created.length
        ? ` (Created ${created.length} of ${selectedSemesters.length}: ${created.join(", ")}.)`
        : "";
      setGenerateError(`${err.message || "Failed to generate plans."}${partial}`);

      if (warningSummaries.length) {
        setGenerateWarning(
          `Created with warnings: ${warningSummaries.join(" | ")}`
        );
      }

      if (created.length && typeof onPlansChanged === "function") {
        await onPlansChanged();
      }
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


  const editablePlans = plans.filter((p) => canEditPlan(p));
  const lockedPlans = plans.filter((p) => !canEditPlan(p));


  const evaluatedProgram = useMemo(() => {
    const program = getProgramRequirements(student?.major) || null;
    if (!program) return { program: null, result: { sections: [] } };
    const statusMap = buildCourseStatusMap(plans, student?.completedCourses);
    return { program, result: evaluateProgram(program, statusMap) };
  }, [student?.major, plans, student?.completedCourses]);

  const advisorNote = useMemo(() => {
    const candidates = plans
      .filter((p) => p?.advisorFeedback && String(p.advisorFeedback).trim() !== "")
      .map((p) => ({
        advisorName: p.reviewedBy || "Advisor",
        message: p.advisorFeedback,
        rawDate: p.reviewedOn || p.submittedOn || null,
        planTerm: p.term || "",
      }));

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => {
      const aT = a.rawDate ? new Date(a.rawDate).getTime() : 0;
      const bT = b.rawDate ? new Date(b.rawDate).getTime() : 0;
      return bT - aT;
    });

    const top = candidates[0];
    const formattedDate = top.rawDate
      ? new Date(top.rawDate).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

    return {
      advisorName: top.advisorName,
      message: top.message,
      date: formattedDate,
      planTerm: top.planTerm,
    };
  }, [plans]);

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

            {generateWarning && (
              <div
                style={{
                  marginTop: 8,
                  padding: "6px 8px",
                  fontSize: ".9rem",
                  background: "#fff8e1",
                  border: "1px solid #f0c14b",
                  borderRadius: 4,
                  color: "#8a6d3b",
                }}
              >
                ⚠ {generateWarning}
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

          <div className="panel" style={{ marginTop: 12 }}>
            <h3>Advisor Notes</h3>
            {advisorNote ? (
              <div className="advisorNoteCard">
                <div className="advisorNoteCard__author">
                  {advisorNote.advisorName || "Advisor"}
                  {advisorNote.planTerm && (
                    <span
                      className="muted"
                      style={{ fontWeight: "normal", marginLeft: 6 }}
                    >
                      · {advisorNote.planTerm}
                    </span>
                  )}
                </div>
                <p className="advisorNoteCard__message">
                  {advisorNote.message || "No note provided."}
                </p>
                <div className="muted advisorNoteCard__date">
                  {advisorNote.date || ""}
                </div>
              </div>
            ) : (
              <p className="muted">No advisor notes yet.</p>
            )}
          </div>
        </aside>


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


        <aside className="gradPlansRightCol">
          <div className="panel stickyPanel">
            <h3>Degree Requirements</h3>

            {evaluatedProgram.program ? (
              evaluatedProgram.result.sections.map((s) => (
                <RequirementSection
                  key={s.key}
                  title={s.title}
                  entries={s.entries}
                />
              ))
            ) : (
              <p className="muted">
                No structured requirements available for this program yet.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}