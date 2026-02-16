export const mockData = {
  student: {
    name: "Ivan Gunn",
    progressPercent: 62,
    creditsEarned: 76,
    creditsRequired: 122,
    alerts: [
      "MATH 211 is a prerequisite for CS 361",
      "Need 1 more 300/400-level elective",
    ],
    plan: [
      { term: "Fall 2026", courses: ["CS 417", "CS 411", "STAT 330"], credits: 9 },
      { term: "Spring 2027", courses: ["CS 471", "CS 462", "Elective"], credits: 9 },
    ],
  },

  advisor: {
    submissions: [
      { student: "Ivan Gunn", submitted: "Feb 13, 2026", status: "Pending" },
      { student: "Student A", submitted: "Feb 12, 2026", status: "Needs changes" },
    ],
  },
};
