import { useState } from "react";

function StatusBadge({ status }) {
  const safe = status || "Unknown";
  const className = `statusBadge ${safe
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z-]/g, "")}`;

  return <span className={className}>{safe}</span>;
}

function formatDisplayDate(value) {
  if (!value) return "";
  const str = String(value);
  const d = str.includes("T") ? new Date(str) : new Date(`${str}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdvisorQueue({
  advisor,
  data,
  onApprovePlan,
  onRequestChanges,
}) {
  
  const students = Array.isArray(data?.students) ? data.students : [];
  const submissions = Array.isArray(data?.submissions) ? data.submissions : [];

  // Lookup 
  const studentsById = {};
  for (const s of students) studentsById[s.student_id] = s;

  
  const submissionRows = submissions
    .map((sub) => {
      const student = studentsById[sub.studentId];
      if (!student) return null;
      const plan = (student.plan || []).find((p) => p.id === sub.planId);
      if (!plan) return null;
      return { ...sub, student, plan };
    })
    .filter(Boolean);

  const [explicitSelectedId, setExplicitSelectedId] = useState("");

  const [feedbackOverride, setFeedbackOverride] = useState(null);

  const selectedSubmission =
    submissionRows.length === 0
      ? null
      : submissionRows.find((row) => row.id === explicitSelectedId) ||
        submissionRows[0];

  const feedbackDraft =
    feedbackOverride !== null
      ? feedbackOverride
      : selectedSubmission?.plan?.advisorFeedback || "";

  function handleSelectSubmission(row) {
    setExplicitSelectedId(row.id);
    setFeedbackOverride(null); 
  }

  function handleFeedbackChange(e) {
    setFeedbackOverride(e.target.value);
  }

  function handleApprove() {
    if (!selectedSubmission) return;
    onApprovePlan?.({
      studentId: selectedSubmission.studentId,
      planId: selectedSubmission.planId,
      feedback: feedbackDraft.trim(),
    });
    setFeedbackOverride(null);
  }

  function handleRequestChanges() {
    if (!selectedSubmission) return;
    const trimmed = feedbackDraft.trim();
    if (!trimmed) {
      alert("Please add feedback before sending a plan back for changes.");
      return;
    }
    onRequestChanges?.({
      studentId: selectedSubmission.studentId,
      planId: selectedSubmission.planId,
      feedback: trimmed,
    });
    setFeedbackOverride(null);
  }

  return (
    <section className="advisorDashboard">
      <div className="advisorSidebar">
        <section className="card">
          <h2>Advisor Dashboard</h2>
          <p className="muted">
            Signed in as {advisor?.name || "Advisor"}
            {advisor?.department ? ` • ${advisor.department}` : ""}.
          </p>
        </section>

        <section className="card">
          <h3>Assigned Students</h3>

          <div className="list">
            {students.length ? (
              students.map((student) => (
                <div className="list__item advisorMiniCard" key={student.student_id}>
                  <div>
                    <b>{student.name}</b>
                    <br />
                    <small>
                      {student.major} • GPA {student.gpa || "—"}
                      {student.progressPercent != null
                        ? ` • ${Math.round(student.progressPercent)}% complete`
                        : ""}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted">No assigned students yet.</p>
            )}
          </div>
        </section>

        <section className="card">
          <h3>Submitted Schedules</h3>

          <div className="list">
            {submissionRows.length ? (
              submissionRows.map((row) => {
                const isSelected = row.id === selectedSubmission?.id;
                return (
                  <button
                    key={row.id}
                    type="button"
                    className={`advisorSubmissionBtn ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => handleSelectSubmission(row)}
                  >
                    <div className="advisorSubmissionBtn__top">
                      <strong>{row.student.name}</strong>
                      <StatusBadge status={row.plan.status} />
                    </div>

                    <div className="advisorSubmissionBtn__meta">
                      <span>{row.plan.term || "—"}</span>
                      <span>
                        Submitted: {formatDisplayDate(row.plan.submittedOn) || "—"}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="muted">No submitted schedules to review.</p>
            )}
          </div>
        </section>
      </div>

      <section className="card advisorDetailCard">
        {!selectedSubmission ? (
          <>
            <h2>Submission Detail</h2>
            <p className="muted">Select a submitted schedule to review.</p>
          </>
        ) : (
          <>
            <div className="advisorDetailHeader">
              <div>
                <h2>{selectedSubmission.student.name}</h2>
                <p className="muted">
                  {selectedSubmission.student.major} • GPA{" "}
                  {selectedSubmission.student.gpa || "—"} •{" "}
                  {selectedSubmission.student.creditsEarned}/
                  {selectedSubmission.student.creditsRequired ?? "—"} credits
                </p>
              </div>

              <StatusBadge status={selectedSubmission.plan.status} />
            </div>

            <div className="advisorDetailGrid">
              <div className="advisorInfoBlock">
                <h3>Schedule Summary</h3>
                <p>
                  <b>Term:</b> {selectedSubmission.plan.term || "—"}
                </p>
                <p>
                  <b>Total Credits:</b> {selectedSubmission.plan.credits}
                </p>
                <p>
                  <b>Submitted On:</b>{" "}
                  {formatDisplayDate(selectedSubmission.plan.submittedOn) ||
                    "Not submitted"}
                </p>
                <p>
                  <b>Last Reviewed By:</b>{" "}
                  {selectedSubmission.plan.reviewedBy || "Not reviewed yet"}
                </p>
                <p>
                  <b>Last Reviewed On:</b>{" "}
                  {formatDisplayDate(selectedSubmission.plan.reviewedOn) ||
                    "Not reviewed yet"}
                </p>
              </div>

              <div className="advisorInfoBlock">
                <h3>Current Alerts</h3>

                {selectedSubmission.plan.alerts?.urgent?.length ? (
                  <div className="alertGroup">
                    <b>Urgent</b>
                    <ul>
                      {selectedSubmission.plan.alerts.urgent.map((item, i) => (
                        <li key={`urgent-${i}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {selectedSubmission.plan.alerts?.warnings?.length ? (
                  <div className="alertGroup">
                    <b>Warnings</b>
                    <ul>
                      {selectedSubmission.plan.alerts.warnings.map((item, i) => (
                        <li key={`warning-${i}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {selectedSubmission.plan.alerts?.informative?.length ? (
                  <div className="alertGroup">
                    <b>Informational</b>
                    <ul>
                      {selectedSubmission.plan.alerts.informative.map((item, i) => (
                        <li key={`info-${i}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {!selectedSubmission.plan.alerts?.urgent?.length &&
                !selectedSubmission.plan.alerts?.warnings?.length &&
                !selectedSubmission.plan.alerts?.informative?.length ? (
                  <p className="muted">No alerts for this plan.</p>
                ) : null}
              </div>
            </div>

            <section className="advisorCoursesSection">
              <h3>Planned Courses</h3>

              <div className="advisorCourseTable">
                <div className="advisorCourseTable__head">
                  <span>Code</span>
                  <span>Title</span>
                  <span>Credits</span>
                </div>

                {(selectedSubmission.plan.courses || []).map((course, idx) => (
                  <div
                    className="advisorCourseTable__row"
                    key={`${selectedSubmission.plan.id}-${course.code}-${idx}`}
                  >
                    <span>{course.code}</span>
                    <span>{course.title}</span>
                    <span>{course.credits}</span>
                  </div>
                ))}

                {(selectedSubmission.plan.courses || []).length === 0 && (
                  <div className="advisorCourseTable__row">
                    <span className="muted">No courses on this plan.</span>
                  </div>
                )}
              </div>
            </section>

            <section className="advisorFeedbackSection">
              <h3>Advisor Feedback</h3>

              <textarea
                className="input advisorTextarea"
                rows={6}
                value={feedbackDraft}
                onChange={handleFeedbackChange}
                placeholder="Leave comments, revision notes, or approval notes here..."
              />

              <div className="advisorActionRow">
                <button
                  className="btn primary"
                  type="button"
                  onClick={handleApprove}
                >
                  Approve Schedule
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={handleRequestChanges}
                >
                  Return for Changes
                </button>
              </div>
            </section>
          </>
        )}
      </section>
    </section>
  );
}