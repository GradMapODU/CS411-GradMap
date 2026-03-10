// frontend/data/mockData.js
// fake data for testing ui before backend exists
// not perfect (some students use legacy alerts array on purpose)

export const mockData = {
  students: {
    student1: {
      name: "Ivan Gunn",
      major: "Computer Science",
      progressPercent: 62,
      creditsEarned: 76,
      creditsRequired: 122,

      availability: {
        term: "Fall 2026",
        weeklyHours: {
          mon: [
            "8:00 AM",
            "9:00 AM",
            "10:00 AM",
            "11:00 AM",
            "12:00 PM",
            "1:00 PM",
            "6:00 PM",
            "7:00 PM",
          ],
          tue: [
            "10:00 AM",
            "11:00 AM",
            "12:00 PM",
            "1:00 PM",
            "2:00 PM",
            "3:00 PM",
            "4:00 PM",
          ],
          wed: [
            "8:00 AM",
            "9:00 AM",
            "10:00 AM",
            "1:00 PM",
            "2:00 PM",
            "3:00 PM",
          ],
          thu: [
            "8:00 AM",
            "9:00 AM",
            "10:00 AM",
            "11:00 AM",
            "12:00 PM",
            "1:00 PM",
            "2:00 PM",
          ],
          fri: [
            "12:00 PM",
            "1:00 PM",
            "2:00 PM",
            "3:00 PM",
            "4:00 PM",
            "5:00 PM",
          ],
        },
        blocks: [
          {
            id: "ivan-block-1",
            title: "Work Shift",
            day: "mon",
            start: "2:00 PM",
            end: "5:00 PM",
            repeats: "Weekly",
          },
          {
            id: "ivan-block-2",
            title: "Gym",
            day: "wed",
            start: "4:00 PM",
            end: "5:00 PM",
            repeats: "Weekly",
          },
          {
            id: "ivan-block-3",
            title: "Commute / Appointment",
            day: "fri",
            start: "10:00 AM",
            end: "11:00 AM",
            repeats: "One-time",
          },
        ],
      },

      alerts: {
        urgent: [
          "MATH 211 is a prerequisite for CS 361",
          "Overlapping classes: CS 411 and STAT 330",
        ],
        warnings: ["Heavy academic load for this semester"],
        informative: ["Less than 10 minutes between class and weekly appointment"],
      },

      plan: [
        {
          id: "plan-ivan-fall-2026",
          term: "Fall 2026",
          courses: ["CS 417", "CS 411", "STAT 330"],
          credits: 9,
          status: "Awaiting Review",

          alerts: {
            urgent: ["Overlapping classes: CS 411 and STAT 330"],
            warnings: ["Heavy academic load"],
            informative: [],
          },
        },
        {
          id: "plan-ivan-spring-2027",
          term: "Spring 2027",
          courses: ["CS 471", "CS 462", "Elective"],
          credits: 9,
          status: "In Progress",

          alerts: {
            urgent: [],
            warnings: [],
            informative: ["Elective slot used"],
          },
        },
        {
          id: "plan-ivan-fall-2024",
          term: "Fall 2024",
          courses: ["CS 250", "MATH 211", "ENGL 211C"],
          credits: 10,
          status: "Historical",

          alerts: {
            urgent: [],
            warnings: [],
            informative: [],
          },
        },
      ],
    },

    student2: {
      name: "Dani Brandt",
      major: "Cybersecurity",
      progressPercent: 41,
      creditsEarned: 50,
      creditsRequired: 122,

      availability: {
        term: "Spring 2026",
        weeklyHours: {
          mon: [
            "9:00 AM",
            "10:00 AM",
            "11:00 AM",
            "12:00 PM",
            "1:00 PM",
            "2:00 PM",
          ],
          tue: [
            "6:00 AM",
            "7:00 AM",
            "8:00 AM",
            "9:00 AM",
            "10:00 AM",
          ],
          wed: [
            "11:00 AM",
            "12:00 PM",
            "4:00 PM",
            "5:00 PM",
            "6:00 PM",
          ],
          thu: [
            "8:00 AM",
            "9:00 AM",
            "10:00 AM",
            "11:00 AM",
            "12:00 PM",
            "1:00 PM",
            "2:00 PM",
            "3:00 PM",
          ],
          fri: [
            "6:00 AM",
            "7:00 AM",
            "8:00 AM",
            "1:00 PM",
            "2:00 PM",
            "3:00 PM",
            "4:00 PM",
          ],
        },
        blocks: [
          {
            id: "dani-block-1",
            title: "Internship",
            day: "wed",
            start: "1:00 PM",
            end: "3:00 PM",
            repeats: "Weekly",
          },
          {
            id: "dani-block-2",
            title: "Doctor Appointment",
            day: "fri",
            start: "9:00 AM",
            end: "10:00 AM",
            repeats: "One-time",
          },
        ],
      },

      alerts: [
        "CS 250 must be completed before CS 361",
        "Missing upper-level writing requirement",
      ],

      plan: [
        {
          id: "plan-alyssa-fall-2026",
          term: "Fall 2026",
          courses: ["CS 250", "MATH 211", "ENGL 211C"],
          credits: 10,
          status: "Awaiting Submission",
        },
        {
          id: "plan-alyssa-spring-2027",
          term: "Spring 2027",
          courses: ["CS 252", "STAT 330", "Elective"],
          credits: 9,
          status: "Awaiting Submission",
        },
      ],
    },
  },

  advisors: {
    advisor1: {
      name: "Matthew Haydon",
      submissions: [
        { student: "Ivan Gunn", submitted: "Feb 13, 2026", status: "Pending" },
        { student: "Alyssa Chen", submitted: "Feb 12, 2026", status: "Needs changes" },
      ],
    },

    advisor2: {
      name: "Brice Bounds",
      submissions: [
        { student: "Marcus Reed", submitted: "Feb 10, 2026", status: "Pending" },
        { student: "Ivan Gunn", submitted: "Feb 09, 2026", status: "Approved" },
      ],
    },
  },

  admins: {
    admins: {
      name: "Prof. Sanober",
    },
  },
};