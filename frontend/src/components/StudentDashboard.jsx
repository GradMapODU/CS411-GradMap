import { useMemo, useState } from "react";

const EMPTY_ARRAY = [];

function StatusBadge({ status }) {
  const safe = status || "Unknown";
  const className = `statusBadge ${safe
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z-]/g, "")}`;

  return <span className={className}>{safe}</span>;
}

function formatDisplayDate(value) {
  if (!value) return "—";

  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}

function normalizeStatus(status) {
  const s = String(status || "").trim();
  return s || "Draft";
}

function getPlanId(row, index) {
  return String(row?.id ?? `${row?.term ?? "term"}-${index}`);
}

function getPlanCoursesText(courses) {
  if (!Array.isArray(courses) || courses.length === 0) return "";

  return courses
    .map((course) => {
      if (typeof course === "string") return course;
      return course?.code || course?.title || "Untitled Course";
    })
    .join(", ");
}

function getPlanAlertLevel(plan, studentAlerts) {
  const alerts = plan?.alerts || studentAlerts || {};

  const infoCount = Array.isArray(alerts?.informative)
    ? alerts.informative.length
    : 0;
  const warnCount = Array.isArray(alerts?.warnings)
    ? alerts.warnings.length
    : 0;
  const urgCount = Array.isArray(alerts?.urgent) ? alerts.urgent.length : 0;

  if (urgCount > 0) return "urgent";
  if (warnCount > 0) return "warning";
  if (infoCount > 0) return "info";
  return "none";
}

function getPlanAlertTooltip(plan, studentAlerts) {
  const alerts = plan?.alerts || studentAlerts || {};
  const info = Array.isArray(alerts?.informative) ? alerts.informative : [];
  const warn = Array.isArray(alerts?.warnings) ? alerts.warnings : [];
  const urg = Array.isArray(alerts?.urgent) ? alerts.urgent : [];

  const parts = [];
  if (urg.length) parts.push(`Urgent: ${urg.join(" • ")}`);
  if (warn.length) parts.push(`Warnings: ${warn.join(" • ")}`);
  if (info.length) parts.push(`Informative: ${info.join(" • ")}`);

  return parts.join(" | ");
}

function getAdvisorReviewText(plan) {
  if (plan?.reviewedOn) return `Updated ${formatDisplayDate(plan.reviewedOn)}`;
  if (plan?.submittedOn) return `Submitted ${formatDisplayDate(plan.submittedOn)}`;
  return "Not submitted";
}

export default function StudentDashboard({ student, onSubmitPlan }) {
  const [selectedPlanIds, setSelectedPlanIds] = useState([]);

  const pctFromCredits =
    typeof student?.creditsEarned === "number" &&
    typeof student?.creditsRequired === "number" &&
    student.creditsRequired > 0
      ? (student.creditsEarned / student.creditsRequired) * 100
      : null;

  const progressPct =
    typeof pctFromCredits === "number"
      ? pctFromCredits
      : Number(student?.progressPercent ?? 0);

  const classification =
    progressPct < 25
      ? "Freshman"
      : progressPct < 50
        ? "Sophomore"
        : progressPct < 75
          ? "Junior"
          : "Senior";

  const major =
    student?.major || student?.program || student?.degreePlan || "Undeclared";

  const gpa =
    typeof student?.gpa === "number"
      ? student.gpa.toFixed(2)
      : student?.gpa
        ? String(student.gpa)
        : "N/A";

  // Determine which plans array to use: prefer student's plan submissions, otherwise grad plans
  // If the student has explicit plan submissions (used for submission workflow), use that first.
  // Otherwise, fall back to the student's gradPlans array, mapping plannedCredits into a credits field for display.
  const plans = useMemo(() => {
    const hasPlanArray = Array.isArray(student?.plan) && student.plan.length > 0;
    if (hasPlanArray) return student.plan;
    // fallback to gradPlans
    if (Array.isArray(student?.gradPlans)) {
      return student.gradPlans.map((p) => {
        // compute a credits field based on plannedCredits or sum of courses
        let credits = 0;
        if (typeof p.plannedCredits === "number") {
          credits = p.plannedCredits;
        } else if (Array.isArray(p.courses)) {
          credits = p.courses.reduce((sum, c) => sum + Number(c?.credits ?? 0), 0);
        }
        return {
          ...p,
          credits,
          // Provide a default status if not present on grad plan
          status: p.status || "Planned",
          submittedOn: p.submittedOn || "",
          reviewedBy: p.reviewedBy || "",
          reviewedOn: p.reviewedOn || "",
          advisorStatus: p.advisorStatus || "",
          advisorFeedback: p.advisorFeedback || "",
        };
      });
    }
    return EMPTY_ARRAY;
  }, [student]);

  const selectedPlans = useMemo(() => {
      const idSet = new Set(selectedPlanIds);
      return plans.filter((row, i) => idSet.has(getPlanId(row, i)));
    }, [plans, selectedPlanIds]);

    const selectedCount = selectedPlans.length;
    const selectedSinglePlan = selectedCount === 1 ? selectedPlans[0] : null;

    const alertsSourcePlans = useMemo(() => {
      return selectedCount > 0 ? selectedPlans : plans;
    }, [plans, selectedCount, selectedPlans]);

    const displayedPlanAlerts = useMemo(() => {
    const merged = { informative: [], warnings: [], urgent: [] };

    // No plans selected: show overall student alerts
    if (selectedCount === 0) {
      const sourceAlerts = student?.alerts || {};

      if (Array.isArray(sourceAlerts?.informative)) {
        merged.informative.push(...sourceAlerts.informative);
      }
      if (Array.isArray(sourceAlerts?.warnings)) {
        merged.warnings.push(...sourceAlerts.warnings);
      }
      if (Array.isArray(sourceAlerts?.urgent)) {
        merged.urgent.push(...sourceAlerts.urgent);
      }

      return merged;
    }

    // One or more plans selected: only use alerts that belong to those plans
    for (const plan of alertsSourcePlans) {
      const sourceAlerts = plan?.alerts || {};

      if (Array.isArray(sourceAlerts?.informative)) {
        merged.informative.push(...sourceAlerts.informative);
      }
      if (Array.isArray(sourceAlerts?.warnings)) {
        merged.warnings.push(...sourceAlerts.warnings);
      }
      if (Array.isArray(sourceAlerts?.urgent)) {
        merged.urgent.push(...sourceAlerts.urgent);
      }
    }

    merged.informative = Array.from(new Set(merged.informative));
    merged.warnings = Array.from(new Set(merged.warnings));
    merged.urgent = Array.from(new Set(merged.urgent));

    return merged;
  }, [alertsSourcePlans, selectedCount, student?.alerts]);

  const displayedUrgent = displayedPlanAlerts.urgent || [];
  const displayedWarnings = displayedPlanAlerts.warnings || [];
  const displayedInfo = displayedPlanAlerts.informative || [];

  const alertsTitle =
    selectedCount === 0
      ? "Alerts - All Plans"
      : selectedCount === 1
        ? `Alerts - ${selectedSinglePlan?.term ?? "Selected Plan"}`
        : "Alerts - Multiple Plans";

  const submittablePlans = selectedPlans.filter((plan) => {
    const status = normalizeStatus(plan?.status).toLowerCase();
    return (
      status === "draft" ||
      status === "awaiting submission" ||
      status === "needs changes"
    );
  });

  const canSubmit = submittablePlans.length > 0;
  const canExportPdf = selectedCount >= 1;
  const canDelete = selectedCount >= 1;
  const canEdit = selectedCount === 1;

  const submitLabel =
    submittablePlans.length > 1 ? "Submit Plan(s)" : "Submit Plan";
  const deleteLabel = selectedCount > 1 ? "Delete Plan(s)" : "Delete Plan";

  function toggleSelect(row, index) {
    const id = getPlanId(row, index);

    setSelectedPlanIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return Array.from(next);
    });
  }

  function clearSelection() {
    setSelectedPlanIds([]);
  }

  function handleSubmitSelected() {
    if (!submittablePlans.length) return;

    if (typeof onSubmitPlan === "function") {
      onSubmitPlan(submittablePlans);
    }
  }

  function handleEditSelected() {
    if (!selectedSinglePlan) return;
    console.log("Edit plan:", selectedSinglePlan);
  }

  function handleDeleteSelected() {
    if (!selectedPlans.length) return;
    console.log("Delete selected plans:", selectedPlans);
  }

  function handleExportSelectedPdf() {
    if (!selectedPlans.length) return;
    console.log("Export to PDF (mock):", selectedPlans);
  }

  return (
    <section className="card">
      <h2>Student Dashboard</h2>

      <div className="profileHeader">
        <div className="profileRow">
          <div className="avatar" aria-hidden="true">
            {getInitials(student?.name)}
          </div>

          <div className="profileMeta">
            <div className="profileName">{student?.name}</div>
            <div className="muted">
              {major} • {classification} • GPA: <b>{gpa}</b>
            </div>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="panel">
          <h3>Progress</h3>
          <div className="progress">
            <div className="progress__bar" style={{ width: `${progressPct}%` }} />
          </div>
          <p>
            <b>{Math.round(progressPct)}%</b> complete • {student?.creditsEarned ?? 0} /{" "}
            {student?.creditsRequired ?? 0} credits
          </p>
        </div>

        <div className="panel">
          <h3>{alertsTitle}</h3>

          <div className="alerts">
            {displayedUrgent.length > 0 && (
              <div className="alerts__group">
                <div className="alerts__title alerts__title--urgent">Urgent</div>
                <ul className="alerts__list">
                  {displayedUrgent.map((a, i) => (
                    <li key={`u-${i}`} className="alert alert--urgent">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {displayedWarnings.length > 0 && (
              <div className="alerts__group">
                <div className="alerts__title alerts__title--warning">Warnings</div>
                <ul className="alerts__list">
                  {displayedWarnings.map((a, i) => (
                    <li key={`w-${i}`} className="alert alert--warning">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {displayedInfo.length > 0 && (
              <div className="alerts__group">
                <div className="alerts__title">Informative</div>
                <ul className="alerts__list">
                  {displayedInfo.map((a, i) => (
                    <li key={`i-${i}`} className="alert alert--info">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {displayedUrgent.length === 0 &&
              displayedWarnings.length === 0 &&
              displayedInfo.length === 0 && <p className="ok">No alerts.</p>}
          </div>
        </div>
      </div>

      {selectedSinglePlan && (
        <section className="panel studentPlanFeedbackPanel">
          <div className="studentPlanFeedbackPanel__header">
            <div>
              <h3>Plan Review</h3>
              <div className="muted">{selectedSinglePlan.term}</div>
            </div>
            <StatusBadge
              status={selectedSinglePlan.advisorStatus || selectedSinglePlan.status}
            />
          </div>

          <div className="studentPlanFeedbackPanel__meta muted">
            <span>Submitted: {formatDisplayDate(selectedSinglePlan.submittedOn)}</span>
            <span>Reviewed by: {selectedSinglePlan.reviewedBy || "—"}</span>
            <span>Reviewed on: {formatDisplayDate(selectedSinglePlan.reviewedOn)}</span>
          </div>

          <div className="studentPlanFeedbackPanel__body">
            <h4>Advisor Feedback</h4>
            <p>
              {selectedSinglePlan.advisorFeedback ||
                "No advisor feedback has been posted for this plan yet."}
            </p>
          </div>
        </section>
      )}

      <h3>GradPlans</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Select</th>
            <th>Term</th>
            <th>Courses</th>
            <th>Credits</th>
            <th>Alerts</th>
            <th>Status</th>
            <th>Advisor Review</th>
          </tr>
        </thead>

        <tbody>
          {plans.map((row, i) => {
            const level = getPlanAlertLevel(row, student?.alerts);
            const id = getPlanId(row, i);
            const checked = selectedPlanIds.includes(id);
            const status = normalizeStatus(row?.status);

            return (
              <tr key={id}>
                <td>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelect(row, i)}
                    aria-label={`Select plan ${row.term}`}
                  />
                </td>

                <td>{row.term}</td>
                <td>{getPlanCoursesText(row.courses)}</td>
                <td>{row.credits}</td>

                <td>
                  {level !== "none" ? (
                    <span
                      className={`planAlert planAlert--${level}`}
                      title={getPlanAlertTooltip(row, student?.alerts) || undefined}
                      aria-label={`${level} alert`}
                    >
                      ▲
                    </span>
                  ) : (
                    <span className="planAlertOk" title="No alerts" aria-label="no alerts">
                      ✓
                    </span>
                  )}
                </td>

                <td>
                  <StatusBadge status={status} />
                </td>

                <td>
                  <div className="studentPlanReviewCell">
                    <small>{getAdvisorReviewText(row)}</small>
                  </div>
                </td>
              </tr>
            );
          })}

          {plans.length === 0 && (
            <tr>
              <td colSpan={7} className="muted">
                No plans found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="actions">
        <button
          className="btn primary"
          onClick={handleSubmitSelected}
          disabled={!canSubmit}
          title={
            !canSubmit
              ? "Select a Draft, Awaiting Submission, or Needs Changes plan."
              : undefined
          }
        >
          {submitLabel}
        </button>

        <button
          className="btn"
          onClick={handleEditSelected}
          disabled={!canEdit}
          title={!canEdit ? "Select exactly one plan to edit." : undefined}
        >
          Edit Plan
        </button>

        <button
          className="btn"
          onClick={handleDeleteSelected}
          disabled={!canDelete}
          title={!canDelete ? "Select at least one plan." : undefined}
        >
          {deleteLabel}
        </button>

        <button
          className="btn"
          onClick={handleExportSelectedPdf}
          disabled={!canExportPdf}
          title={!canExportPdf ? "Select at least one plan." : undefined}
        >
          Export PDF (mock)
        </button>

        {selectedCount > 0 && (
          <button className="btn" onClick={clearSelection}>
            Clear Selection
          </button>
        )}
      </div>
    </section>
  );
}
