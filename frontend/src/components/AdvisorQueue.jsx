import { useMemo, useState } from "react";

function StatusBadge({ status }) {
  const safe = status || "Unknown";
  const className = `statusBadge ${safe
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z-]/g, "")}`;

  return <span className={className}>{safe}</span>;
}

export default function AdvisorQueue({
  advisor,
  students,
  onApprovePlan,
  onRequestChanges,
}) {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(
    advisor?.submissions?.[0]?.id || ""
  );
  const [feedbackDraft, setFeedbackDraft] = useState("");

  const assignedStudents = useMemo(() => {
    if (!advisor?.assignedStudents || !students) return [];
    return advisor.assignedStudents
      .map((studentId) => ({
        id: studentId,
        ...students[studentId],
      }))
      .filter(Boolean);
  }, [advisor, students]);

  const submissionRows = useMemo(() => {
    if (!advisor?.submissions || !students) return [];

    return advisor.submissions
      .map((submission) => {
        const student = students[submission.studentId];
        if (!student) return null;

        const plan = (student.plan || []).find((p) => p.id === submission.planId);
        if (!plan) return null;

        return {
          ...submission,
          student,
          plan,
        };
      })
      .filter(Boolean);
  }, [advisor, students]);

  const selectedSubmission =
    submissionRows.find((row) => row.id === selectedSubmissionId) ||
    submissionRows[0] ||
    null;

  function handleSelectSubmission(row) {
    setSelectedSubmissionId(row.id);
    setFeedbackDraft(row.plan.advisorFeedback || "");
  }

  function handleApprove() {
    if (!selectedSubmission) return;

    onApprovePlan?.({
      advisorId: advisor.id,
      studentId: selectedSubmission.studentId,
      planId: selectedSubmission.planId,
      feedback: feedbackDraft.trim(),
    });
  }

  function handleRequestChanges() {
    if (!selectedSubmission) return;

    const trimmed = feedbackDraft.trim();
    if (!trimmed) {
      alert("Please add feedback before sending a plan back for changes.");
      return;
    }

    onRequestChanges?.({
      advisorId: advisor.id,
      studentId: selectedSubmission.studentId,
      planId: selectedSubmission.planId,
      feedback: trimmed,
    });
  }

  return (
    <section className="advisorDashboard">
      <div className="advisorSidebar">
        <section className="card">
          <h2>Advisor Dashboard</h2>
          <p className="muted">Signed in as {advisor?.name || "Advisor"}.</p>
        </section>

        <section className="card">
          <h3>Assigned Students</h3>

          <div className="list">
            {assignedStudents.length ? (
              assignedStudents.map((student) => (
                <div className="list__item advisorMiniCard" key={student.id}>
                  <div>
                    <b>{student.name}</b>
                    <br />
                    <small>
                      {student.major} • GPA {student.gpa} • {student.progressPercent}%
                      complete
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
                      <StatusBadge status={row.plan.advisorStatus || row.plan.status} />
                    </div>

                    <div className="advisorSubmissionBtn__meta">
                      <span>{row.plan.term}</span>
                      <span>
                        Submitted: {row.plan.submittedOn || "Not submitted"}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="muted">No submitted schedules available.</p>
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
                  {selectedSubmission.student.gpa} •{" "}
                  {selectedSubmission.student.creditsEarned}/
                  {selectedSubmission.student.creditsRequired} credits
                </p>
              </div>

              <StatusBadge
                status={
                  selectedSubmission.plan.advisorStatus ||
                  selectedSubmission.plan.status
                }
              />
            </div>

            <div className="advisorDetailGrid">
              <div className="advisorInfoBlock">
                <h3>Schedule Summary</h3>
                <p>
                  <b>Term:</b> {selectedSubmission.plan.term}
                </p>
                <p>
                  <b>Total Credits:</b> {selectedSubmission.plan.credits}
                </p>
                <p>
                  <b>Submitted On:</b>{" "}
                  {selectedSubmission.plan.submittedOn || "Not submitted"}
                </p>
                <p>
                  <b>Last Reviewed By:</b>{" "}
                  {selectedSubmission.plan.reviewedBy || "Not reviewed yet"}
                </p>
                <p>
                  <b>Last Reviewed On:</b>{" "}
                  {selectedSubmission.plan.reviewedOn || "Not reviewed yet"}
                </p>
              </div>

              <div className="advisorInfoBlock">
                <h3>Current Alerts</h3>

                {selectedSubmission.student.alerts?.urgent?.length ? (
                  <div className="alertGroup">
                    <b>Urgent</b>
                    <ul>
                      {selectedSubmission.student.alerts.urgent.map((item, i) => (
                        <li key={`urgent-${i}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {selectedSubmission.student.alerts?.warnings?.length ? (
                  <div className="alertGroup">
                    <b>Warnings</b>
                    <ul>
                      {selectedSubmission.student.alerts.warnings.map((item, i) => (
                        <li key={`warning-${i}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {selectedSubmission.student.alerts?.informative?.length ? (
                  <div className="alertGroup">
                    <b>Informational</b>
                    <ul>
                      {selectedSubmission.student.alerts.informative.map(
                        (item, i) => (
                          <li key={`info-${i}`}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                ) : null}

                {!selectedSubmission.student.alerts?.urgent?.length &&
                !selectedSubmission.student.alerts?.warnings?.length &&
                !selectedSubmission.student.alerts?.informative?.length ? (
                  <p className="muted">No alerts for this student.</p>
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

                {selectedSubmission.plan.courses?.map((course) => (
                  <div
                    className="advisorCourseTable__row"
                    key={`${selectedSubmission.plan.id}-${course.code}`}
                  >
                    <span>{course.code}</span>
                    <span>{course.title}</span>
                    <span>{course.credits}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="advisorFeedbackSection">
              <h3>Advisor Feedback</h3>

              <textarea
                className="input advisorTextarea"
                rows={6}
                value={feedbackDraft}
                onChange={(e) => setFeedbackDraft(e.target.value)}
                placeholder="Leave comments, revision notes, or approval notes here..."
              />

              <div className="advisorActionRow">
                <button className="btn primary" type="button" onClick={handleApprove}>
                  Approve Schedule
                </button>

                <button className="btn" type="button" onClick={handleRequestChanges}>
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