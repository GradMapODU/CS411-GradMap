// frontend/data/mockData.js

// #region Mock Data
export const mockData = {
  // -------------------------------
  // #region Students
  // -------------------------------
  students: {
    student1: {
      name: "Jane Smith",
      major: "Computer Science",
      gpa: 3.67,
      progressPercent: 60,
      creditsEarned: 72,
      creditsRequired: 120,

      availability: {
        term: "Fall 2026",
        weeklyHours: {
          mon: ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM"],
          tue: ["8:00 AM", "9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM"],
          wed: ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM"],
          thu: ["8:00 AM", "9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM"],
          fri: ["10:00 AM", "11:00 AM", "12:00 PM"],
        },
        blocks: [
          {
            id: "jane-block-1",
            title: "Work",
            day: "tue",
            start: "6:00 AM",
            end: "8:00 AM",
            repeats: "Weekly",
          },
          {
            id: "jane-block-2",
            title: "Work",
            day: "wed",
            start: "6:00 AM",
            end: "8:00 AM",
            repeats: "Weekly",
          },
        ],
      },

      alerts: {
        informative: [
          "Less than 10 minutes between CS 305 and your advising block.",
        ],
        warnings: ["Heavy academic load projected for Spring 2027."],
        urgent: [],
      },

      gradPlans: [
        {
          id: "fall-2026",
          term: "Fall 2026",
          plannedCredits: 9,
          courses: [
            {
              code: "CS 301",
              title: "Discrete Mathematics",
              credits: 3,
              status: "Planned",
            },
            {
              code: "CS 305",
              title: "Software Engineering",
              credits: 3,
              status: "Enrolled",
            },
            {
              code: "MATH 230",
              title: "Calculus II",
              credits: 3,
              status: "Completed",
            },
          ],
        },
        {
          id: "spring-2027",
          term: "Spring 2027",
          plannedCredits: 12,
          courses: [
            {
              code: "CS 350",
              title: "Introduction to Networks",
              credits: 3,
              status: "Planned",
            },
            {
              code: "CS 381",
              title: "Introduction to Discrete Structures",
              credits: 3,
              status: "Planned",
            },
            {
              code: "STAT 300",
              title: "Statistics",
              credits: 3,
              status: "Planned",
            },
            {
              code: "PHIL 210",
              title: "Introduction to Ethics",
              credits: 3,
              status: "Planned",
            },
          ],
        },
        {
          id: "fall-2027",
          term: "Fall 2027",
          plannedCredits: 9,
          courses: [
            {
              code: "CS 410",
              title: "Professional Workforce Development",
              credits: 3,
              status: "Planned",
            },
            {
              code: "CS 417",
              title: "Computational Methods",
              credits: 3,
              status: "Planned",
            },
            {
              code: "CS 450",
              title: "Database Concepts",
              credits: 3,
              status: "Planned",
            },
          ],
        },
        {
          id: "spring-2028",
          term: "Spring 2028",
          plannedCredits: 6,
          courses: [
            {
              code: "CS 495",
              title: "Capstone Project",
              credits: 3,
              status: "Planned",
            },
            {
              code: "CS 470",
              title: "Operating Systems",
              credits: 3,
              status: "Planned",
            },
          ],
        },
      ],

      plan: [
        {
          id: "plan-jane-fall-2026",
          term: "Fall 2026",
          courses: [
            { code: "CS 301", title: "Discrete Mathematics", credits: 3 },
            { code: "CS 305", title: "Software Engineering", credits: 3 },
            { code: "MATH 230", title: "Calculus II", credits: 3 },
          ],
          credits: 9,
          status: "Submitted",
          submittedOn: "2026-02-13",
          advisorStatus: "Pending",
          advisorFeedback: "",
          reviewedBy: "",
          reviewedOn: "",
        },
        {
          id: "plan-jane-spring-2027",
          term: "Spring 2027",
          courses: [
            { code: "CS 350", title: "Introduction to Networks", credits: 3 },
            { code: "CS 381", title: "Discrete Structures", credits: 3 },
            { code: "STAT 300", title: "Statistics", credits: 3 },
            { code: "PHIL 210", title: "Ethics", credits: 3 },
          ],
          credits: 12,
          status: "Draft",
          submittedOn: "",
          advisorStatus: "",
          advisorFeedback: "",
          reviewedBy: "",
          reviewedOn: "",
        },
      ],

      courseSuggestions: [
        {
          code: "ENGL 102",
          title: "Composition II",
          credits: 3,
          reason: "Recommended next general education requirement",
        },
        {
          code: "CS 315",
          title: "Computer in Society",
          credits: 3,
          reason: "Fits your degree pathway next",
        },
        {
          code: "MATH 211",
          title: "Calculus III",
          credits: 4,
          reason: "Supports major core progression",
        },
      ],

      selectedDegreeProgramId: "bs-computer-science",
      completedCourses: ["CS 150", "CS 252", "CS 330", "MATH 163", "ENGL 110C"],
      degreeRequirementProgress: [
        {
          requirementId: "cs350",
          status: "planned",
          appliedCourses: ["CS 350"],
        },
        {
          requirementId: "cs-electives-upper-level",
          status: "in-progress",
          appliedCourses: ["CS 450", "CS 417", "CS 470"],
          appliedCredits: 9,
          remainingCredits: 3,
        },
      ],

      advisorNotes: {
        advisorName: "Matthew Haydon",
        message:
          "Hi Jane, remember to review the course catalogue for elective options for Spring 2027. Let's schedule a brief chat next week to finalize your plan.",
        date: "February 13, 2026",
      },
    },

    student2: {
      name: "Dani Brandt",
      major: "Cybersecurity",
      gpa: 3.41,
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
          tue: ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM"],
          wed: ["11:00 AM", "12:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"],
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

      alerts: {
        informative: [
          "Less than 10 minutes between class and internship on Wednesday.",
        ],
        warnings: ["Heavy academic load for next semester."],
        urgent: [
          "CS 250 must be completed before CS 361.",
          "Missing upper-level writing requirement.",
        ],
      },

      gradPlans: [
        {
          id: "spring-2026",
          term: "Spring 2026",
          plannedCredits: 10,
          courses: [
            {
              code: "CS 250",
              title: "Introduction to Programming with C++",
              credits: 4,
              status: "Planned",
            },
            {
              code: "MATH 211",
              title: "Calculus III",
              credits: 3,
              status: "Planned",
            },
            {
              code: "ENGL 211C",
              title: "Writing, Rhetoric, and Research",
              credits: 3,
              status: "Planned",
            },
          ],
        },
        {
          id: "fall-2026-dani",
          term: "Fall 2026",
          plannedCredits: 9,
          courses: [
            {
              code: "CS 252",
              title: "Introduction to Unix for Programmers",
              credits: 3,
              status: "Planned",
            },
            {
              code: "STAT 330",
              title: "Probability and Statistics",
              credits: 3,
              status: "Planned",
            },
            {
              code: "CYSE 300",
              title: "Introduction to Cybersecurity",
              credits: 3,
              status: "Planned",
            },
          ],
        },
        {
          id: "spring-2027-dani",
          term: "Spring 2027",
          plannedCredits: 9,
          courses: [
            {
              code: "CYSE 301",
              title: "Cyber Defense Fundamentals",
              credits: 3,
              status: "Planned",
            },
            {
              code: "CS 361",
              title: "Data Structures and Algorithms",
              credits: 3,
              status: "Planned",
            },
            {
              code: "COMM 200",
              title: "Public Speaking",
              credits: 3,
              status: "Planned",
            },
          ],
        },
      ],

      plan: [
        {
          id: "plan-dani-spring-2026",
          term: "Spring 2026",
          courses: [
            { code: "CS 250", title: "Intro to Programming", credits: 4 },
            { code: "MATH 211", title: "Calculus III", credits: 3 },
            { code: "ENGL 211C", title: "Writing & Research", credits: 3 },
          ],
          credits: 10,
          status: "Needs Changes",
          submittedOn: "2026-02-12",
          advisorStatus: "Needs Changes",
          advisorFeedback:
            "Please replace one course with a writing requirement and confirm CS 250 sequencing.",
          reviewedBy: "Matthew Haydon",
          reviewedOn: "2026-02-14",
        },
        {
          id: "plan-dani-fall-2026",
          term: "Fall 2026",
          courses: [
            { code: "CS 252", title: "Unix for Programmers", credits: 3 },
            { code: "STAT 330", title: "Probability & Statistics", credits: 3 },
            { code: "CYSE 300", title: "Intro to Cybersecurity", credits: 3 },
          ],
          credits: 9,
          status: "Awaiting Submission",
          submittedOn: "",
          advisorStatus: "",
          advisorFeedback: "",
          reviewedBy: "",
          reviewedOn: "",
        },
      ],

      courseSuggestions: [
        {
          code: "CS 250",
          title: "Introduction to Programming with C++",
          credits: 4,
          reason: "Needed before CS 361",
        },
        {
          code: "ENGL 211C",
          title: "Writing, Rhetoric, and Research",
          credits: 3,
          reason: "Supports writing requirement",
        },
        {
          code: "CYSE 300",
          title: "Introduction to Cybersecurity",
          credits: 3,
          reason: "Recommended major core course",
        },
      ],

      selectedDegreeProgramId: "bs-cybersecurity",
      completedCourses: ["ENGL 110C", "MATH 162M", "CS 150"],
      degreeRequirementProgress: [
        {
          requirementId: "cyse300",
          status: "planned",
          appliedCourses: ["CYSE 300"],
        },
        {
          requirementId: "cyse-analytics-or-network",
          status: "not-started",
          appliedCourses: [],
        },
      ],

      advisorNotes: {
        advisorName: "Matthew Haydon",
        message:
          "Focus on completing CS 250 as soon as possible so you can stay on track for CS 361. We should also review your upper-level writing requirement soon.",
        date: "February 14, 2026",
      },
    },
  },

  // #endregion ----------------------
  // -------------------------------
  // #region Degree Programs
  // Defines all courses and information used for an entire degree
  // ~ DegreeProgram - Represents a single academic degree program.
  //   This object is the root structure used by the planner. It defines how many semesters to generate,
  //   how many credits per semester, and what requirements must be satisfied.
  // ~~ id (string) - Unique identifier for the degree program (used by students and planner).
  // ~~ name (string) - Display name of the degree.
  // ~~ department (string) - Academic department offering the degree.
  // ~~ totalCreditsRequired (number) - Total credits required to graduate.
  // ~~ planningHorizonSemesters (number) - Number of semesters the planner should generate (typically 4).
  // ~~ defaultSemesterCreditTarget (number) - Target number of credits per semester.
  // ~~ requirementGroups (RequirementGroup[]) - Collection of grouped degree requirements.
  // ~~ sampleGeneratedPlan (GeneratedSemester[]) - Example generated plan used for UI/testing.

  degreePrograms: {
    "bs-computer-science": {
      id: "bs-computer-science",
      name: "B.S. Computer Science",
      department: "Computer Science",
      totalCreditsRequired: 120,
      planningHorizonSemesters: 4,
      defaultSemesterCreditTarget: 12,
      requirementGroups: [
        {
          id: "software-engineering-core",
          label: "Software Engineering Core",
          description: "Specific major requirements that must be completed exactly as listed.",
          requirements: [
            {
              id: "cs350",
              type: "exact-course",
              label: "CS 350 - Introduction to Software Engineering",
              minCourses: 1,
              minCredits: 3,
              allowedCourses: ["CS 350"],
            },
            {
              id: "cs410",
              type: "exact-course",
              label: "CS 410 - Professional Workforce Development I",
              minCourses: 1,
              minCredits: 3,
              allowedCourses: ["CS 410"],
            },
            {
              id: "cs411w",
              type: "exact-course",
              label: "CS 411W - Professional Workforce Development II",
              minCourses: 1,
              minCredits: 3,
              allowedCourses: ["CS 411W"],
            },
          ],
        },
        {
          id: "upper-level-electives",
          label: "Upper-Level Computer Science Electives",
          description: "Flexible requirement groups where several courses may satisfy the same rule.",
          requirements: [
            {
              id: "cs-electives-upper-level",
              type: "course-pool",
              label: "12 Credits - CS 300/400-level electives excluding CS 300T, CS 334 & 382",
              minCourses: 4,
              minCredits: 12,
              selectionRules: {
                department: "CS",
                levels: [300, 400],
                excludeCourses: ["CS 300T", "CS 334", "CS 382"],
                notes: [
                  "One of CS 450 or CS 418 is required. The other may also count as an elective.",
                  "CS 367 or CS 368 internship may be used when approved by the degree."
                ],
              },
              allowedCourses: [
                "CS 462",
                "CS 463",
                "CS 464",
                "CS 465",
                "CS 466",
                "CS 467",
                "CS 469",
                "CS 450",
                "CS 422",
                "CS 432",
                "CS 480",
                "CS 460",
                "CS 491",
                "CS 492",
                "CS 499W",
                "CS 455",
                "CS 472",
                "CS 486",
                "CS 487",
                "CS 476",
                "CS 312",
                "CS 418",
                "CS 431",
                "CS 441",
                "CS 478",
                "CS 488",
                "CS 367",
                "CS 368",
              ],
            },
            {
              id: "cs450-or-cs418",
              type: "choose-one",
              label: "One of CS 450 - Database Concepts or CS 418 - Web Programming",
              minCourses: 1,
              minCredits: 3,
              allowedCourses: ["CS 450", "CS 418"],
            },
          ],
        },
      ],
      sampleGeneratedPlan: [
        {
          id: "gen-cs-fall-2026",
          term: "Fall 2026",
          plannedCredits: 12,
          courses: ["CS 350", "CS 450", "CS 455", "CS 312"],
          satisfiesRequirementIds: ["cs350", "cs450-or-cs418", "cs-electives-upper-level"],
        },
        {
          id: "gen-cs-spring-2027",
          term: "Spring 2027",
          plannedCredits: 12,
          courses: ["CS 410", "CS 422", "CS 432", "CS 476"],
          satisfiesRequirementIds: ["cs410", "cs-electives-upper-level"],
        },
        {
          id: "gen-cs-fall-2027",
          term: "Fall 2027",
          plannedCredits: 12,
          courses: ["CS 411W", "CS 460", "CS 462", "CS 480"],
          satisfiesRequirementIds: ["cs411w", "cs-electives-upper-level"],
        },
        {
          id: "gen-cs-spring-2028",
          term: "Spring 2028",
          plannedCredits: 12,
          courses: ["CS 463", "CS 466", "CS 478", "CS 488"],
          satisfiesRequirementIds: ["cs-electives-upper-level"],
        },
      ],
    },

    "bs-cybersecurity": {
      id: "bs-cybersecurity",
      name: "B.S. Cybersecurity",
      department: "Cybersecurity",
      totalCreditsRequired: 120,
      planningHorizonSemesters: 4,
      defaultSemesterCreditTarget: 9,
      requirementGroups: [
        {
          id: "cyber-core",
          label: "Cybersecurity Core",
          requirements: [
            {
              id: "cyse300",
              type: "exact-course",
              label: "CYSE 300 - Introduction to Cybersecurity",
              minCourses: 1,
              minCredits: 3,
              allowedCourses: ["CYSE 300"],
            },
            {
              id: "cyse301",
              type: "exact-course",
              label: "CYSE 301 - Cyber Defense Fundamentals",
              minCourses: 1,
              minCredits: 3,
              allowedCourses: ["CYSE 301"],
            },
            {
              id: "cyse406",
              type: "exact-course",
              label: "CYSE 406 - Network Security",
              minCourses: 1,
              minCredits: 3,
              allowedCourses: ["CYSE 406"],
            },
          ],
        },
        {
          id: "cyber-track-flex",
          label: "Cyber Track Flex Requirement",
          requirements: [
            {
              id: "cyse-analytics-or-network",
              type: "course-pool",
              label: "Choose 6 credits from approved cybersecurity analytics or network-focused electives",
              minCourses: 2,
              minCredits: 6,
              allowedCourses: ["CYSE 425", "CYSE 406", "CS 469", "CS 455", "CS 472"],
            },
          ],
        },
      ],
      sampleGeneratedPlan: [
        {
          id: "gen-cyse-fall-2026",
          term: "Fall 2026",
          plannedCredits: 9,
          courses: ["CYSE 300", "CS 252", "STAT 330"],
          satisfiesRequirementIds: ["cyse300"],
        },
        {
          id: "gen-cyse-spring-2027",
          term: "Spring 2027",
          plannedCredits: 9,
          courses: ["CYSE 301", "CS 361", "COMM 200"],
          satisfiesRequirementIds: ["cyse301"],
        },
        {
          id: "gen-cyse-fall-2027",
          term: "Fall 2027",
          plannedCredits: 9,
          courses: ["CYSE 406", "CYSE 425", "CS 455"],
          satisfiesRequirementIds: ["cyse406", "cyse-analytics-or-network"],
        },
        {
          id: "gen-cyse-spring-2028",
          term: "Spring 2028",
          plannedCredits: 9,
          courses: ["CS 469", "CS 472", "ENGL 211C"],
          satisfiesRequirementIds: ["cyse-analytics-or-network"],
        },
      ],
    },
  },

  // #endregion ----------------------
  // -------------------------------
  // #region Advisors
  advisors: {
    advisor1: {
      id: "advisor1",
      name: "Matthew Haydon",
      assignedStudents: ["student1", "student2"],
      submissions: [
        {
          id: "submission-1",
          studentId: "student1",
          planId: "plan-jane-fall-2026",
        },
        {
          id: "submission-2",
          studentId: "student2",
          planId: "plan-dani-spring-2026",
        },
      ],
    },

    advisor2: {
      id: "advisor2",
      name: "Brice Bounds",
      assignedStudents: [],
      submissions: [],
    },
  },
  // #endregion ----------------------
  // -------------------------------
  // #region Admins
  admins: {
    admin1: {
      name: "Prof. Sanober",
    },
  },
  // #endregion ----------------------
  // -------------------------------
  // #region Course Catalog
  courseCatalog: {
    "Computer Science": [
      {
        code: "CS 112",
        title: "Information Literacy for Former Engineering Majors",
        credits: 1,
        level: "100",
        format: "Lecture",
        description:
          "Builds research, evaluation, and digital information skills with emphasis on security, policy, and ethical use of information.",
        prerequisites:
          "CEE 111 or ECE 111 or ENGT 111 or MAE 111 or MSIM 111",
        tags: ["Information Literacy", "Research", "Digital Ethics"],
      },
      {
        code: "CS 115",
        title: "Introduction to Computer Science with Python",
        credits: 1,
        level: "100",
        format: "Lecture + Lab",
        description:
          "Introduces computer science as a discipline and career path while using Python to solve beginner programming problems.",
        prerequisites: "None listed",
        tags: ["Python", "Intro CS", "Foundations"],
      },
      {
        code: "CS 120G",
        title: "Introduction to Information Literacy and Research",
        credits: 3,
        level: "100",
        format: "Lecture",
        description:
          "Covers finding, evaluating, managing, and presenting information using collaborative and productivity tools.",
        prerequisites: "None listed",
        tags: ["General Education", "Research", "Productivity Tools"],
      },
      {
        code: "CS 121G",
        title: "Introduction to Information Literacy and Research for Scientists",
        credits: 3,
        level: "100",
        format: "Lecture",
        description:
          "Focuses on information literacy for scientific work, including data analysis, presentation tools, and responsible information use.",
        prerequisites: "None listed",
        tags: ["General Education", "Science", "Research"],
      },
      {
        code: "CS 126G",
        title: "Honors: Introduction to Information Literacy and Research",
        credits: 3,
        level: "100",
        format: "Lecture",
        description:
          "Honors version of CS 120G for students in the Honors College.",
        prerequisites: "Honors College standing",
        tags: ["Honors", "General Education", "Research"],
      },
      {
        code: "CS 150",
        title: "Introduction to Programming with C++",
        credits: 4,
        level: "100",
        format: "Lecture + Lab",
        description:
          "Introduces problem solving, algorithm design, testing, and core C++ programming fundamentals.",
        prerequisites: "MATH 162M",
        tags: ["C++", "Programming", "Foundations"],
      },
      {
        code: "CS 151",
        title: "Introduction to Programming with Java",
        credits: 4,
        level: "100",
        format: "Lecture + Lab",
        description:
          "Introduces computational problem solving and software construction using Java.",
        prerequisites: "MATH 162M",
        tags: ["Java", "Programming", "Foundations"],
      },
      {
        code: "CS 153",
        title: "Introduction to Programming with Python",
        credits: 4,
        level: "100",
        format: "Lecture + Lab",
        description:
          "Covers beginner software development and problem solving using Python, including functions and core data structures.",
        prerequisites: "MATH 162M",
        tags: ["Python", "Programming", "Foundations"],
      },
      {
        code: "CS 170",
        title: "Introduction to Computer Architecture",
        credits: 3,
        level: "100",
        format: "Lecture",
        description:
          "Introduces computer organization, logic, arithmetic, instruction sets, system hierarchy, and performance basics.",
        prerequisites:
          "MATH 162M and a grade of C or better in CS 150, CS 151, CS 153, DASC 257, or ENGN 122",
        tags: ["Architecture", "Hardware", "Systems"],
      },
      {
        code: "CS 202G",
        title: "Information Literacy for Cybersecurity",
        credits: 3,
        level: "200",
        format: "Lecture",
        description:
          "Explores information literacy, ethics, and research practices with a cybersecurity focus.",
        prerequisites: "ENGL 110C",
        tags: ["Cybersecurity", "Research", "Information Literacy"],
      },
      {
        code: "CS 222",
        title: "Introduction to Digital Image Processing",
        credits: 3,
        level: "200",
        format: "Lecture",
        description:
          "Introduces image representation, filtering, enhancement, segmentation, transforms, and color image processing.",
        prerequisites: "None listed",
        tags: ["Image Processing", "Computer Vision", "Media"],
      },
      {
        code: "CS 250",
        title: "Programming with C++",
        credits: 4,
        level: "200",
        format: "Lecture + Lab",
        description:
          "Builds larger software systems in C++ with topics like classes, inheritance, dynamic structures, testing, and debugging.",
        prerequisites:
          "CS 150 or ENGN 122 with grade of C or better and MATH 163",
        tags: ["C++", "OOP", "Software Design"],
      },
      {
        code: "CS 251",
        title: "Programming with Java",
        credits: 4,
        level: "200",
        format: "Lecture + Lab",
        description:
          "Develops object-oriented programming and software design skills in Java using classes, inheritance, and common data structures.",
        prerequisites:
          "MATH 163 and a grade of C or better in CS 150, CS 151, CS 153, DASC 257, or ENGN 122",
        tags: ["Java", "OOP", "Software Design"],
      },
      {
        code: "CS 252",
        title: "Introduction to Unix for Programmers",
        credits: 1,
        level: "200",
        format: "Lecture + Lab",
        description:
          "Introduces Unix/Linux tools for programmers including shells, files, editors, compiling, debugging, SSH, git, and IDE workflows.",
        prerequisites:
          "A grade of C or better in CS 150, CS 151, CS 153, ENGN 122, DASC 257, or IT 205",
        tags: ["Unix", "Linux", "Developer Tools"],
      },
      {
        code: "CS 300T",
        title: "Computers in Society",
        credits: 3,
        level: "300",
        format: "Lecture",
        description:
          "Examines the social impact of computing, including ethics, intellectual property, security, and public policy issues.",
        prerequisites: "ENGL 110C",
        tags: ["Ethics", "Society", "Professional Issues"],
      },
      {
        code: "CS 312",
        title: "Internet Concepts",
        credits: 3,
        level: "300",
        format: "Lecture + Lab",
        description:
          "Introduces the Internet and the web, including protocols, publishing, search, communication, security, and internet culture.",
        prerequisites: "CS 252",
        tags: ["Internet", "Web", "Networking"],
      },
      {
        code: "CS 315",
        title: "Computer Science Undergraduate Colloquium",
        credits: 1,
        level: "300",
        format: "Seminar",
        description:
          "Speaker-based course exposing students to research areas, career paths, and scholarship opportunities in computer science.",
        prerequisites:
          "Junior/senior standing as a computer science major and C or better in CS 150, CS 151, CS 153, ENGN 122, or DASC 257",
        tags: ["Seminar", "Careers", "Professional Development"],
      },
      {
        code: "CS 330",
        title: "Object-Oriented Design and Programming",
        credits: 3,
        level: "300",
        format: "Lecture + Lab",
        description:
          "Covers object-oriented analysis and design, UML, multithreading, synchronization, and GUI development.",
        prerequisites:
          "CS 252 and a grade of C or better in CS 251 or CS 261",
        tags: ["OOP", "Design", "UML"],
      },
      {
        code: "CS 337",
        title: "OOP and Foreign Function Interfaces in Rust",
        credits: 3,
        level: "300",
        format: "Lecture + Lab",
        description:
          "Applies object-oriented patterns in Rust and introduces foreign function interfaces, including native Python library workflows.",
        prerequisites:
          "CS 252 and a C or better in CS 250, CS 251, CS 253, or ECE 250",
        tags: ["Rust", "OOP", "FFI"],
      },
      {
        code: "CS 350",
        title: "Introduction to Software Engineering",
        credits: 3,
        level: "300",
        format: "Lecture + Lab",
        description:
          "Team-based introduction to requirements, testing, documentation, issue tracking, version control, and agile development.",
        prerequisites:
          "CS 252 and a grade of C or better in CS 330 or CS 361",
        tags: ["Software Engineering", "Agile", "Team Projects"],
      },
      {
        code: "CS 355",
        title: "Principles of Programming Languages",
        credits: 3,
        level: "300",
        format: "Lecture + Lab",
        description:
          "Surveys programming language paradigms, type systems, syntax, modularity, and parallel programming.",
        prerequisites:
          "CS 252 and a grade of C or better in CS 250, CS 251, CS 253, or ECE 250",
        tags: ["Programming Languages", "Theory", "Language Design"],
      },
      {
        code: "CS 361",
        title: "Data Structures and Algorithms",
        credits: 3,
        level: "300",
        format: "Lecture + Lab",
        description:
          "Studies common abstract data types and the algorithms used to implement them, with time and space complexity analysis.",
        prerequisites:
          "CS 252, MATH 211, and a grade of C or better in CS 251 or CS 261",
        tags: ["Algorithms", "Data Structures", "Complexity"],
      },
      {
        code: "CS 381",
        title: "Introduction to Discrete Structures",
        credits: 3,
        level: "300",
        format: "Lecture",
        description:
          "Covers logic, proofs, sets, functions, induction, counting, relations, and graphs for computer science.",
        prerequisites:
          "MATH 163 and a grade of C or better in CS 150, CS 151, CS 153, DASC 257, or ENGN 122",
        tags: ["Discrete Math", "Logic", "Proofs"],
      },
      {
        code: "CS 390",
        title: "Introduction to Theoretical Computer Science",
        credits: 3,
        level: "300",
        format: "Lecture",
        description:
          "Introduces automata, formal languages, grammars, Turing machines, and unsolvable problems.",
        prerequisites:
          "A grade of C or better in CS 381 and in CS 250, CS 251, CS 253, or ECE 250",
        tags: ["Theory", "Automata", "Formal Languages"],
      },
      {
        code: "CS 402/502",
        title: "Formal Software Foundations",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Focuses on verified software, functional programming, theorem proving, proof automation, and certified code extraction.",
        prerequisites: "CS 381",
        tags: ["Formal Methods", "Verification", "Functional Programming"],
      },
      {
        code: "CS 410/510",
        title: "Professional Workforce Development I",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Project-centered professional course covering problem selection, feasibility, requirements, presentations, and documentation.",
        prerequisites: "Department/program standing as required",
        tags: ["Capstone Prep", "Professional Writing", "Project Planning"],
      },
      {
        code: "CS 411W/511",
        title: "Professional Workforce Development II",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Continues the project and professional documentation sequence with emphasis on formal communication and deliverables.",
        prerequisites:
          "A grade of C or better in ENGL 211C, ENGL 221C, or ENGL 231C and the required prior CS preparation",
        tags: ["Writing Intensive", "Professional Development", "Projects"],
      },
      {
        code: "CS 417/517",
        title: "Computational Methods and Software",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Studies algorithms and software used in scientific and numerical computing.",
        prerequisites:
          "MATH 316 and a grade of C or better in CS 250, CS 251, CS 253, or ECE 250",
        tags: ["Numerical Methods", "Scientific Computing", "Algorithms"],
      },
      {
        code: "CS 450",
        title: "Database Concepts",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Introduces relational database design, SQL, normalization, and data management concepts.",
        prerequisites: "CS 330 or permission of instructor",
        tags: ["Database", "SQL", "Data Management"],
      },
      {
        code: "CS 455",
        title: "Introduction to Networks and Communications",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Studies network architecture, protocols, communication models, and distributed connectivity.",
        prerequisites: "CS 361 or equivalent",
        tags: ["Networks", "Communications", "Systems"],
      },
      {
        code: "CS 460",
        title: "Computer Graphics",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Covers rendering, geometric modeling, transformations, and interactive graphics systems.",
        prerequisites: "CS 361",
        tags: ["Graphics", "Visualization", "Game Development"],
      },
      {
        code: "CS 462",
        title: "Cybersecurity Fundamentals",
        credits: 3,
        level: "400",
        format: "Lecture",
        description:
          "Surveys core cybersecurity principles including threats, risk, controls, and secure design.",
        prerequisites: "CS 361 or CYSE 300",
        tags: ["Cybersecurity", "Security", "Foundations"],
      },
      {
        code: "CS 463",
        title: "Cryptography for Cybersecurity",
        credits: 3,
        level: "400",
        format: "Lecture",
        description:
          "Introduces classical and modern cryptographic systems with applications to secure computing.",
        prerequisites: "CS 381",
        tags: ["Cryptography", "Cybersecurity", "Security"],
      },
      {
        code: "CS 464",
        title: "Networked Systems Security",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Focuses on securing networked systems through monitoring, hardening, and attack analysis.",
        prerequisites: "CS 455 or CYSE 301",
        tags: ["Security", "Networks", "Systems"],
      },
      {
        code: "CS 465",
        title: "Information Assurance",
        credits: 3,
        level: "400",
        format: "Lecture",
        description:
          "Explores policy, governance, risk management, and assurance practices for information systems.",
        prerequisites: "CS 462 or CYSE 300",
        tags: ["Information Assurance", "Policy", "Security"],
      },
      {
        code: "CS 466",
        title: "Principles and Practice of Cyber Defense",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Applies defensive cybersecurity techniques including monitoring, response, and hardening.",
        prerequisites: "CS 462 or CYSE 301",
        tags: ["Cyber Defense", "Blue Team", "Security"],
      },
      {
        code: "CS 467",
        title: "Introduction to Reverse Software Engineering",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Introduces reverse engineering workflows for binaries, malware analysis, and code recovery.",
        prerequisites: "CS 361",
        tags: ["Reverse Engineering", "Security", "Systems"],
      },
      {
        code: "CS 469",
        title: "Data Analytics for Cybersecurity",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Uses data analytics and visualization methods to identify and analyze cybersecurity events.",
        prerequisites: "STAT 330 and CS 361",
        tags: ["Analytics", "Cybersecurity", "Data Science"],
      },
      {
        code: "CS 472",
        title: "Network and Security",
        credits: 3,
        level: "400",
        format: "Lecture",
        description:
          "Examines advanced networking topics with emphasis on security models, attacks, and defenses.",
        prerequisites: "CS 455",
        tags: ["Networks", "Security", "Infrastructure"],
      },
      {
        code: "CS 476",
        title: "Systems Programming",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Builds low-level software using process control, memory management, concurrency, and OS interfaces.",
        prerequisites: "CS 252 and CS 361",
        tags: ["Systems", "Programming", "Operating Systems"],
      },
      {
        code: "CS 478",
        title: "Computational Geometry, Methods and Applications",
        credits: 3,
        level: "400",
        format: "Lecture",
        description:
          "Explores algorithms for geometric computation and their applications in modeling and analysis.",
        prerequisites: "CS 361 and MATH 211",
        tags: ["Geometry", "Algorithms", "Computation"],
      },
      {
        code: "CS 480",
        title: "Introduction to Artificial Intelligence",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Introduces intelligent agents, search, reasoning, and foundational artificial intelligence techniques.",
        prerequisites: "CS 361 and CS 381",
        tags: ["AI", "Intelligent Systems", "Data Science"],
      },
      {
        code: "CS 486",
        title: "Introduction to Parallel Computing",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Introduces parallel architectures, decomposition strategies, and parallel program design.",
        prerequisites: "CS 361",
        tags: ["Parallel Computing", "Systems", "Performance"],
      },
      {
        code: "CS 487",
        title: "Applied Parallel Computing",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Applies practical techniques for scalable parallel programming and performance tuning.",
        prerequisites: "CS 486",
        tags: ["Parallel Computing", "HPC", "Performance"],
      },
      {
        code: "CS 488",
        title: "Principles of Compiler Construction",
        credits: 3,
        level: "400",
        format: "Lecture",
        description:
          "Studies lexical analysis, parsing, semantic analysis, code generation, and compiler organization.",
        prerequisites: "CS 355",
        tags: ["Compilers", "Programming Languages", "Systems"],
      },
      {
        code: "CS 491",
        title: "Honors Research I",
        credits: 3,
        level: "400",
        format: "Independent Study",
        description:
          "Supports mentored honors research in computer science through proposal and initial investigation.",
        prerequisites: "Honors College standing and department approval",
        tags: ["Honors", "Research", "Independent Study"],
      },
      {
        code: "CS 492",
        title: "Honors Research II",
        credits: 3,
        level: "400",
        format: "Independent Study",
        description:
          "Continues honors research work with emphasis on analysis, writing, and final deliverables.",
        prerequisites: "CS 491",
        tags: ["Honors", "Research", "Independent Study"],
      },
      {
        code: "CS 499W",
        title: "Honors Thesis in Computer Science",
        credits: 3,
        level: "400",
        format: "Independent Study",
        description:
          "Culminating honors thesis experience focused on substantial written and technical work.",
        prerequisites: "CS 492 and Honors College standing",
        tags: ["Honors", "Thesis", "Writing Intensive"],
      },
      {
        code: "CS 367",
        title: "Computer Science Internship",
        credits: 3,
        level: "300",
        format: "Internship",
        description:
          "Supervised professional internship experience in computer science and related industry work.",
        prerequisites: "Department approval",
        tags: ["Internship", "Experiential Learning", "Professional"],
      },
      {
        code: "CS 368",
        title: "Computer Science Internship",
        credits: 3,
        level: "300",
        format: "Internship",
        description:
          "Advanced supervised internship experience with reflective and professional development components.",
        prerequisites: "Department approval",
        tags: ["Internship", "Experiential Learning", "Professional"],
      },
      {
        code: "CS 418",
        title: "Web Programming",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Covers modern web programming concepts including web servers, applications, and client/server interaction.",
        prerequisites: "A grade of C or better in CS 312 and CS 330",
        tags: ["Web", "Full Stack", "Internet"],
      },
      {
        code: "CS 431",
        title: "Web Server Design",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Examines server-side web systems, hosting architectures, APIs, and scalable web service design.",
        prerequisites: "CS 312 and CS 330",
        tags: ["Web", "Servers", "Backend"],
      },
      {
        code: "CS 432",
        title: "Web Science",
        credits: 3,
        level: "400",
        format: "Lecture",
        description:
          "Explores the web as a decentralized information system and studies its technical and social dimensions.",
        prerequisites:
          "A grade of C or better in CS 250, CS 251, CS 253, CS 260, CS 261, CS 263, or DASC 255",
        tags: ["Web", "Information Systems", "Decentralized Systems"],
      },
      {
        code: "CS 441",
        title: "App Development for Smart Devices",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Project-based course on designing and building applications for smart devices.",
        prerequisites: "CS 330 and either CS 251 or CS 261",
        tags: ["Mobile", "Apps", "Project-Based"],
      },
    ],

    Cybersecurity: [
      {
        code: "CYSE 200T",
        title: "Cybersecurity, Technology, and Society",
        credits: 3,
        level: "200",
        format: "Lecture",
        description:
          "Introduces cybersecurity as a discipline and explores its role in society, technology, and policy.",
        prerequisites: "None listed",
        tags: ["Cybersecurity", "Society", "Foundations"],
      },
      {
        code: "CYSE 300",
        title: "Introduction to Cybersecurity",
        credits: 3,
        level: "300",
        format: "Lecture",
        description:
          "Introduces core cybersecurity principles, threats, vulnerabilities, and defensive strategies.",
        prerequisites: "None listed",
        tags: ["Cybersecurity", "Security", "Foundations"],
      },
      {
        code: "CYSE 301",
        title: "Cyber Defense Fundamentals",
        credits: 3,
        level: "300",
        format: "Lecture + Lab",
        description:
          "Builds practical defensive security skills including monitoring, incident response, and system hardening.",
        prerequisites: "CYSE 300",
        tags: ["Cyber Defense", "Security", "Hands-On"],
      },
      {
        code: "CYSE 305",
        title: "Operating Systems and Systems Security",
        credits: 3,
        level: "300",
        format: "Lecture + Lab",
        description:
          "Examines operating systems concepts with emphasis on secure configuration and protection mechanisms.",
        prerequisites: "CS 252 or equivalent",
        tags: ["Operating Systems", "Security", "Systems"],
      },
      {
        code: "CYSE 406",
        title: "Network Security",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Studies secure network design, protocols, monitoring, and common network-based attacks and defenses.",
        prerequisites: "CYSE 301",
        tags: ["Network Security", "Defense", "Protocols"],
      },
      {
        code: "CYSE 425",
        title: "Cybersecurity Analytics",
        credits: 3,
        level: "400",
        format: "Lecture",
        description:
          "Applies analytics and data-driven methods to threat detection, response, and cybersecurity decision making.",
        prerequisites: "STAT 330 and CYSE 301",
        tags: ["Analytics", "Cybersecurity", "Data"],
      },
    ],
  },
  // #endregion ----------------------
  // -------------------------------
};
// #endregion ----------------------

