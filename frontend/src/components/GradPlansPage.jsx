import React, { useState, useMemo } from "react";
import { generateSemester, deletePlan } from "@api/students.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


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


function buildCourseStatusMap(plans, completedCourses) {
  const rank = { completed: 3, enrolled: 2, "in progress": 2, planned: 1 };
  const map = new Map();

  const upsert = (rawCode, status, title) => {
    const code = normalizeCodeKey(rawCode);
    if (!code) return;
    const incomingRank = rank[status.toLowerCase()] ?? 0;
    const existing = map.get(code);
    const existingRank = existing ? rank[existing.status.toLowerCase()] ?? 0 : -1;
    if (incomingRank >= existingRank) {
      map.set(code, { code, title: title || existing?.title || "", status });
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

function categorizeRequirement(req) {
  const type = String(req?.requirement_type || req?.type || "").toLowerCase();
  const code = String(req?.course_code || req?.code || "").toUpperCase();


  if (/^[A-Z]+\s*4\d{2}W$/.test(code) || /capstone/i.test(req?.course_name || "")) {
    return "capstone";
  }

  if (type === "general") return "generalEducation";
  if (type === "core") return "majorCore";
  if (type === "elective") return "electives";

  return null;
}
function statusForRequirement(req, courseStatusMap) {
  const raw = String(req?.course_code || req?.code || "");
  if (!raw) return { bucket: "notCompleted", satisfyingCourses: [] };


  const tokens = raw.split("/").map((s) => s.trim()).filter(Boolean);
  const variants = [];
  let lastPrefix = "";
  for (const t of tokens) {
    const prefixMatch = t.match(/^([A-Za-z]+)\s*/);
    if (prefixMatch) {
      lastPrefix = prefixMatch[1].toUpperCase();
      variants.push(normalizeCodeKey(t));
    } else if (lastPrefix) {
      // Bare number token (e.g. "511") inherits the previous prefix.
      variants.push(normalizeCodeKey(`${lastPrefix} ${t}`));
    } else {
      variants.push(normalizeCodeKey(t));
    }
  }

  let best = null;
  const rankOf = (status) => {
    const s = String(status).toLowerCase();
    if (s.includes("completed")) return 3;
    if (s.includes("enrolled") || s.includes("progress")) return 2;
    if (s.includes("planned")) return 1;
    return 0;
  };
  for (const v of variants) {
    const m = courseStatusMap.get(v);
    if (!m) continue;
    if (!best || rankOf(m.status) > rankOf(best.status)) best = m;
  }
  if (!best) return { bucket: "notCompleted", satisfyingCourses: [] };

  const s = best.status.toLowerCase();
  if (s.includes("completed")) {
    return { bucket: "completed", satisfyingCourses: [best] };
  }
  if (s.includes("enrolled") || s.includes("planned") || s.includes("progress")) {
    return { bucket: "planned", satisfyingCourses: [best] };
  }
  return { bucket: "notCompleted", satisfyingCourses: [] };
}


function buildCategorizedRequirements(programOrDegree, plans, completedCourses) {
  const buckets = {
    generalEducation: [],
    majorCore: [],
    electives: [],
    interdisciplinary: [],
    capstone: [],
  };

  const courseStatusMap = buildCourseStatusMap(plans, completedCourses);


  const isLegacyShape =
    programOrDegree &&
    !Array.isArray(programOrDegree?.Courses) &&
    (Array.isArray(programOrDegree?.generalEducation) ||
      Array.isArray(programOrDegree?.majorCore) ||
      Array.isArray(programOrDegree?.electives) ||
      Array.isArray(programOrDegree?.interdisciplinary) ||
      Array.isArray(programOrDegree?.capstone));

  if (isLegacyShape) {
    const sections = [
      ["generalEducation", programOrDegree.generalEducation],
      ["majorCore", programOrDegree.majorCore],
      ["electives", programOrDegree.electives],
      ["interdisciplinary", programOrDegree.interdisciplinary],
      ["capstone", programOrDegree.capstone],
    ];
    for (const [key, items] of sections) {
      const list = Array.isArray(items) ? items : [];
      for (const item of list) {
        const label = typeof item === "string" ? item : item?.label || "";
        const codeMatch = label.match(/[A-Z]{2,4}\s?\d{3}[A-Z]?/);
        const code = codeMatch ? codeMatch[0].replace(/\s+/g, " ").toUpperCase() : "";
        const { bucket, satisfyingCourses } = statusForRequirement(
          { course_code: code, course_name: label },
          courseStatusMap
        );
        // For the legacy shape the section is already given to us; only the
        // status bucket inside that section is derived.
        buckets[key].push({ label, bucket, satisfyingCourses });
      }
    }
    return buckets;
  }

  const courses = Array.isArray(programOrDegree?.Courses)
    ? programOrDegree.Courses
    : [];

  for (const c of courses) {

    const joinRow = c?.Program_Course || c?.program_courses || c?.through || {};
    const req = {
      course_code: c?.course_code,
      course_name: c?.course_name,
      requirement_type: joinRow?.requirement_type,
    };
    const section = categorizeRequirement(req);
    if (!section || !buckets[section]) continue;

    const label = `${(c?.course_code || "").trim()}${
      c?.course_name ? ` - ${c.course_name}` : ""
    }`;
    const { bucket, satisfyingCourses } = statusForRequirement(req, courseStatusMap);
    buckets[section].push({ label, bucket, satisfyingCourses });
  }

  return buckets;
}

// Render one category (e.g. "Major Core") split into the three status
// sub-sections: Not Completed -> Planned -> Completed.
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
                <li key={`${title}-${g.key}-${i}`}>
                  <span className="reqItem__label">{it.label}</span>
                  {it.satisfyingCourses?.length > 0 && (
                    <span className="muted reqItem__via">
                      {" "}
                      ({it.satisfyingCourses.map((sc) => sc.code).join(", ")})
                    </span>
                  )}
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


export default function GradPlansPage({
  student,
  token,
  onEditPlan,
  onPlansChanged,
  requirements,
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
  // Warnings (yellow) — plan was created, but with caveats (e.g. missing
  // prereqs not yet scheduled). Distinct from generateError (red).
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
        const result = await generateSemester(token, { semester, year });

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


  const categorizedRequirements = useMemo(() => {
    const source = requirements || student?.degreeRequirements || null;
    return buildCategorizedRequirements(source, plans, student?.completedCourses);
  }, [requirements, student?.degreeRequirements, plans, student?.completedCourses]);

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

            <RequirementSection
              title="General Education"
              entries={categorizedRequirements.generalEducation}
            />
            <RequirementSection
              title="Major Core"
              entries={categorizedRequirements.majorCore}
            />
            <RequirementSection
              title="Electives"
              entries={categorizedRequirements.electives}
            />
            <RequirementSection
              title="Interdisciplinary"
              entries={categorizedRequirements.interdisciplinary}
            />
            <RequirementSection
              title="Capstone"
              entries={categorizedRequirements.capstone}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}