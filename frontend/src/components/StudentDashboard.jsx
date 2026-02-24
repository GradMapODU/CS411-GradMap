export default function StudentDashboard({ student, onSubmitPlan }) {
  // Support BOTH shapes:
  // - old: student.alerts = string[]
  // - new: student.alerts = { informative:[], warnings:[], urgent:[] }
  const categorized =
    student?.alerts &&
    typeof student.alerts === "object" &&
    !Array.isArray(student.alerts);

  const informativeAlerts = categorized ? student.alerts.informative || [] : [];
  const warningAlerts = categorized ? student.alerts.warnings || [] : [];
  const urgentAlerts = categorized ? student.alerts.urgent || [] : [];

  const legacyAlerts = Array.isArray(student?.alerts) ? student.alerts : [];

  return (
    <section className="card">
      <h2>Student Dashboard</h2>
      <p>
        <b>{student.name}</b>
      </p>

      <div className="grid">
        <div className="panel">
          <h3>Progress</h3>
          <div className="progress">
            <div
              className="progress__bar"
              style={{ width: `${student.progressPercent}%` }}
            />
          </div>
          <p>
            <b>{student.progressPercent}%</b> complete • {student.creditsEarned} /{" "}
            {student.creditsRequired} credits
          </p>
        </div>

        <div className="panel">
          <h3>Alerts</h3>

          {/* New categorized alerts */}
          {categorized ? (
            <div className="alerts">
              {urgentAlerts.length > 0 && (
                <div className="alerts__group">
                  <div className="alerts__title alerts__title--urgent">
                    Urgent
                  </div>
                  <ul className="alerts__list">
                    {urgentAlerts.map((a, i) => (
                      <li key={`u-${i}`} className="alert alert--urgent">
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {warningAlerts.length > 0 && (
                <div className="alerts__group">
                  <div className="alerts__title alerts__title--warning">
                    Warnings
                  </div>
                  <ul className="alerts__list">
                    {warningAlerts.map((a, i) => (
                      <li key={`w-${i}`} className="alert alert--warning">
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {informativeAlerts.length > 0 && (
                <div className="alerts__group">
                  <div className="alerts__title">Informative</div>
                  <ul className="alerts__list">
                    {informativeAlerts.map((a, i) => (
                      <li key={`i-${i}`} className="alert alert--info">
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* If all 3 are empty */}
              {urgentAlerts.length === 0 &&
                warningAlerts.length === 0 &&
                informativeAlerts.length === 0 && (
                  <p className="muted">No alerts.</p>
                )}
            </div>
          ) : (
            // Old array fallback
            <ul>
              {legacyAlerts.length ? (
                legacyAlerts.map((a, i) => <li key={i}>{a}</li>)
              ) : (
                <li className="muted">No alerts.</li>
              )}
            </ul>
          )}
        </div>
      </div>

      <h3>Plan Builder (Mock)</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Term</th>
            <th>Courses</th>
            <th>Credits</th>
          </tr>
        </thead>
        <tbody>
          {student.plan.map((row, i) => (
            <tr key={i}>
              <td>{row.term}</td>
              <td>{row.courses.join(", ")}</td>
              <td>{row.credits}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="actions">
        <button className="btn primary" onClick={onSubmitPlan}>
          Submit Plan
        </button>
        <button className="btn" disabled>
          Export PDF (mock)
        </button>
      </div>
    </section>
  );
}