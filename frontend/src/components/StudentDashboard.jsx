import { useMemo, useState } from "react";

export default function StudentDashboard({ student, onSubmitPlan }) {
  // ---------- Progress + classification ----------
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

  // ---------- Major + GPA ----------
  const major =
    student?.major || student?.program || student?.degreePlan || "Undeclared";

  const gpa =
    typeof student?.gpa === "number"
      ? student.gpa.toFixed(2)
      : student?.gpa
      ? String(student.gpa)
      : "N/A";

  // ---------- per-plan alert levels ----------
  function getPlanAlertLevel(row) {
    const a = row?.alerts;

    const infoCount = Array.isArray(a?.informative) ? a.informative.length : 0;
    const warnCount = Array.isArray(a?.warnings) ? a.warnings.length : 0;
    const urgCount = Array.isArray(a?.urgent) ? a.urgent.length : 0;

    if (urgCount > 0) return "urgent";
    if (warnCount > 0) return "warning";
    if (infoCount > 0) return "info";
    return "none";
  }

  function getPlanAlertTooltip(row) {
    const a = row?.alerts;
    const info = Array.isArray(a?.informative) ? a.informative : [];
    const warn = Array.isArray(a?.warnings) ? a.warnings : [];
    const urg = Array.isArray(a?.urgent) ? a.urgent : [];

    const parts = [];
    if (urg.length) parts.push(`Urgent: ${urg.join(" • ")}`);
    if (warn.length) parts.push(`Warnings: ${warn.join(" • ")}`);
    if (info.length) parts.push(`Informative: ${info.join(" • ")}`);

    return parts.join(" | ");
  }

  // ---------- Selection state ----------
  const [selectedPlanIds, setSelectedPlanIds] = useState([]);

  function getPlanId(row, index) {
    return String(row?.id ?? `${row?.term ?? "term"}-${index}`);
  }

  const plans = useMemo(() => {
    const plan = student?.plan;
    return Array.isArray(plan) ? plan : [];
  }, [student?.plan]);

  const selectedPlans = useMemo(() => {
    const set = new Set(selectedPlanIds);
    return plans.filter((row, i) => set.has(getPlanId(row, i)));
  }, [selectedPlanIds, plans]);

  const selectedCount = selectedPlanIds.length;

  const canSubmit = selectedCount >= 1;
  const canExportPdf = selectedCount >= 1;
  const canDelete = selectedCount >= 1;
  const canEdit = selectedCount === 1;

  const submitLabel = selectedCount <= 1 ? "Submit Plan" : "Submit Plan(s)";
  const deleteLabel = selectedCount <= 1 ? "Delete Plan" : "Delete Plan(s)";

  function toggleSelect(row, index) {
    const id = getPlanId(row, index);

    setSelectedPlanIds((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return Array.from(set);
    });
  }

  function clearSelection() {
    setSelectedPlanIds([]);
  }

  // ---------- action handlers (mock-friendly) ----------
  function handleSubmitSelected() {
    if (!selectedPlans.length) return;

    if (typeof onSubmitPlan === "function") {
      onSubmitPlan(selectedPlans);
    } else {
      console.log("Submit selected plans:", selectedPlans);
    }
  }

  function handleEditSelected() {
    if (selectedCount !== 1) return;
    console.log("Edit plan:", selectedPlans[0]);
  }

  function handleDeleteSelected() {
    if (!selectedPlans.length) return;
    console.log("Delete selected plans:", selectedPlans);
  }

  function handleExportSelectedPdf() {
    if (!selectedPlans.length) return;
    console.log("Export to PDF (mock):", selectedPlans);
  }

  // ---------- helpers ----------
  function normalizeStatus(s) {
    const v = String(s || "").trim();
    if (!v) return "In Progress";
    return v;
  }

  function getInitials(name = "") {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "?";
    const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + b).toUpperCase();
  }

  function getStatusClass(status) {
    const s = normalizeStatus(status).toLowerCase();

    if (s.includes("histor")) return "status status--historical";
    if (s.includes("completed")) return "status status--completed";
    if (s.includes("awaiting review")) return "status status--review";
    if (s.includes("submitted")) return "status status--submitted";
    if (s.includes("awaiting submission")) return "status status--awaitsubmit";
    if (s.includes("in progress")) return "status status--progress";
    return "status";
  }

  // ---------- Alerts panel uses plans / selection ----------
  const alertsSourcePlans = useMemo(() => {
    if (selectedCount === 0) return plans;
    return selectedPlans;
  }, [selectedCount, plans, selectedPlans]);

  function mergePlanAlerts(plansList) {
    const merged = { informative: [], warnings: [], urgent: [] };

    for (const p of plansList) {
      const a = p?.alerts;

      if (Array.isArray(a?.informative)) merged.informative.push(...a.informative);
      if (Array.isArray(a?.warnings)) merged.warnings.push(...a.warnings);
      if (Array.isArray(a?.urgent)) merged.urgent.push(...a.urgent);
    }

    merged.informative = Array.from(new Set(merged.informative));
    merged.warnings = Array.from(new Set(merged.warnings));
    merged.urgent = Array.from(new Set(merged.urgent));

    return merged;
  }

  const displayedPlanAlerts = useMemo(() => {
    return mergePlanAlerts(alertsSourcePlans);
  }, [alertsSourcePlans]);

  const alertsTitle = useMemo(() => {
    if (selectedCount === 0) return "Alerts - All Plans";
    if (selectedCount === 1)
      return `Alerts - ${selectedPlans[0]?.term ?? "Selected Plan"}`;
    return "Alerts - Multiple Plans";
  }, [selectedCount, selectedPlans]);

  const displayedUrgent = displayedPlanAlerts.urgent || [];
  const displayedWarnings = displayedPlanAlerts.warnings || [];
  const displayedInfo = displayedPlanAlerts.informative || [];

  return (
    <section className="card">
      <h2>Student Dashboard</h2>

      {/* Profile header */}
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
          </tr>
        </thead>

        <tbody>
          {plans.map((row, i) => {
            const level = getPlanAlertLevel(row);
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
                <td>{Array.isArray(row.courses) ? row.courses.join(", ") : ""}</td>
                <td>{row.credits}</td>

                <td>
                  {level !== "none" ? (
                    <span
                      className={`planAlert planAlert--${level}`}
                      title={getPlanAlertTooltip(row) || undefined}
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
                  <span className={getStatusClass(status)}>{status}</span>
                </td>
              </tr>
            );
          })}

          {plans.length === 0 && (
            <tr>
              <td colSpan={6} className="muted">
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
          title={!canSubmit ? "Select at least one plan." : undefined}
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