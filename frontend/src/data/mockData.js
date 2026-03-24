// frontend/data/mockData.js
// fake data for testing ui before backend exists
// not perfect (some students use legacy alerts array on purpose)


// -------------------------------
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

      degreeRequirements: {
        generalEducation: [
          "ENGL 101",
          "ENGL 102",
          "HIST 100",
          "CHEM 110",
          "PHYS 201",
        ],
        majorCore: ["CS 101", "CS 301", "CS 305", "MATH 150", "MATH 230"],
        electives: ["PHIL 210", "STAT 300"],
        interdisciplinary: [],
        capstone: [],
      },

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

      degreeRequirements: {
        generalEducation: ["ENGL 101", "ENGL 102", "HIST 104", "MATH 162M"],
        majorCore: ["CS 250", "CS 252", "CS 361", "CYSE 300", "CYSE 301"],
        electives: ["STAT 330", "COMM 200"],
        interdisciplinary: [],
        capstone: [],
      },

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
        code: "CS 418/518",
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
        code: "CS 422/522",
        title: "Introduction to Machine Learning",
        credits: 3,
        level: "400",
        format: "Lecture + Lab",
        description:
          "Introduces practical machine learning methods with emphasis on core models, data handling, and applied problem solving.",
        prerequisites:
          "MATH 316, STAT 330, and a grade of C or better in CS 153 or CS 263",
        tags: ["Machine Learning", "AI", "Data"],
      },
      {
        code: "CS 432/532",
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
        code: "CS 433/533",
        title: "Web Security",
        credits: 3,
        level: "400",
        format: "Lecture",
        description:
          "Studies web security principles, common attacks, and defensive techniques for modern web systems.",
        prerequisites: "A grade of C or better in CS 312 and CS 330",
        tags: ["Security", "Web", "Cybersecurity"],
      },
      {
        code: "CS 441/541",
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
          "Covers practical defensive techniques, system hardening, and incident response fundamentals.",
        prerequisites: "CYSE 300",
        tags: ["Defense", "Security", "Hands-On"],
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
// #endregion
// -------------------------------


// Possible mock data for other thingys? Like course and degree plans 
// Course
// {
//   code: "CS 301",
//   title: "Discrete Mathematics",
//   credits: 3,
//   status: "Planned" // Planned | Enrolled | Completed | In Progress
// }

// GradPlan
// {
//   id: "fall-2026",
//   term: "Fall 2026",
//   plannedCredits: 9,
//   courses: [Course, Course]
// }

// Degree Requirements
// {
//   generalEducation: ["ENGL 101", "ENGL 102"],
//   majorCore: ["CS 101", "CS 301"],
//   electives: ["PHIL 210"],
//   interdisciplinary: [],
//   capstone: []
// }

// Advisor Note
// {
//   advisorName: "Dr. Emily Chen",
//   message: "...",
//   date: "October 26, 2024"
// }