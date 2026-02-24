// frontend/src/data/mockData.js
export const mockData = {
  students: {
    student1: {
      name: "Ivan Gunn",
      progressPercent: 62,
      creditsEarned: 76,
      creditsRequired: 122,

      alerts: {
        urgent: [
          "MATH 211 is a prerequisite for CS 361",
          "Overlapping classes: CS 411 and STAT 330"
        ],
        warnings: [
          "Heavy academic load for this semester"
        ],
        informative: [
          "Less than 10 minutes between class and weekly appointment"
        ]
      },

      plan: [
        { term: "Fall 2026", courses: ["CS 417", "CS 411", "STAT 330"], credits: 9 },
        { term: "Spring 2027", courses: ["CS 471", "CS 462", "Elective"], credits: 9 }
      ]
    },

    student2: {
      name: "Alyssa Chen",
      progressPercent: 41,
      creditsEarned: 50,
      creditsRequired: 122,
      alerts: [
        "CS 250 must be completed before CS 361",
        "Missing upper-level writing requirement",
      ],
      plan: [
        { term: "Fall 2026", courses: ["CS 250", "MATH 211", "ENGL 211C"], credits: 10 },
        { term: "Spring 2027", courses: ["CS 252", "STAT 330", "Elective"], credits: 9 },
      ],
    },

    student3: {
      name: "Marcus Reed",
      progressPercent: 78,
      creditsEarned: 95,
      creditsRequired: 122,
      alerts: [
        "Need 1 more Science elective",
      ],
      plan: [
        { term: "Fall 2026", courses: ["CS 361", "CS 330", "Elective"], credits: 9 },
        { term: "Spring 2027", courses: ["CS 410", "CS 411W", "CS 471"], credits: 9 },
      ],
    },
  },

  advisors: {
    advisor1: {
      name: "Dr. Patel",
      submissions: [
        { student: "Ivan Gunn", submitted: "Feb 13, 2026", status: "Pending" },
        { student: "Alyssa Chen", submitted: "Feb 12, 2026", status: "Needs changes" },
      ],
    },

    advisor2: {
      name: "Prof. Nguyen",
      submissions: [
        { student: "Marcus Reed", submitted: "Feb 10, 2026", status: "Pending" },
        { student: "Ivan Gunn", submitted: "Feb 09, 2026", status: "Approved" },
      ],
    },
  },
};