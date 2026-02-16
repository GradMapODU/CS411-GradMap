
export default function AdvisorQueue({ advisor, onOpenSubmission }) {
  return (
    <section className="card">
      <h2>Advisor View</h2>
      <p>Student submissions waiting for review:</p>

      <div className="list">
        {advisor.submissions.map((s, i) => (
          <div className="list__item" key={i}>
            <div>
              <b>{s.student}</b>
              <br />
              <small>
                Submitted: {s.submitted} • Status: {s.status}
              </small>
            </div>

            <button className="btn" onClick={() => onOpenSubmission(s.student)}>
              Open
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
