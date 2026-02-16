export default function StudentDashboard({ student, onSubmitPlan }) {
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
          <ul>
            {student.alerts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
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
