const express = require('express');
const { sequelize, User, Admin, Student, Advisor } = require('./models/index.js');
const bcrypt = require('bcrypt');
const authRoutes = require('./routes/authRoutes.js');
const studentRoutes = require('./routes/studentRoutes.js');
const advisorRoutes = require('./routes/advisorRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const courseRoutes = require('./routes/courseRoutes.js');
const app = express();


// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/courses', courseRoutes);

// Test endpoint
app.get('/', (req, res) => {
    res.send('GradMap backend running');
});


async function seedAdmin() {
    const exists = await User.findOne({ where: { username: 'admin' } });
    if (!exists) {
        const hashed = await bcrypt.hash('Admin123!', 10);
        const user = await User.create({  username: 'admin', password_hash: hashed, role: 'Admin' });
        await Admin.create({
             admin_id: user.user_id, 
             first_name: 'Default', 
             last_name: 'Admin', 
             access_level: 1 });
        console.log('Default admin created: username=admin, password=Admin123!');
    }
}

// #region Demo data
async function seedDemoUsers() {
  const demoUsers = [
    {
      username: 'Student1',
      password: 'Student1!',
      role: 'Student',
      profile: {
        first_name: 'Jane',
        last_name: 'Smith',
        major: 'Computer Science',
        year: 3,
        GPA: '3.67'
      }
    },
    {
      username: 'Student2',
      password: 'Student2!',
      role: 'Student',
      profile: {
        first_name: 'Dani',
        last_name: 'Brandt',
        major: 'Cybersecurity',
        year: 2,
        GPA: '3.41'
      }
    },
    {
      username: 'Advisor1',
      password: 'Advisor1!',
      role: 'Advisor',
      profile: {
        first_name: 'Matthew',
        last_name: 'Haydon',
        department: 'Computer Science'
      }
    },
    {
      username: 'Advisor2',
      password: 'Advisor2!',
      role: 'Advisor',
      profile: {
        first_name: 'Brice',
        last_name: 'Bounds',
        department: 'Cybersecurity'
      }
    }
  ];

  for (const entry of demoUsers) {
    const exists = await User.findOne({ where: { username: entry.username } });
    if (exists) continue;

    const hashed = await bcrypt.hash(entry.password, 10);

    const user = await User.create({
      username: entry.username,
      password_hash: hashed,
      role: entry.role
    });

    if (entry.role === 'Student') {
      await Student.create({
        student_id: user.user_id,
        first_name: entry.profile.first_name,
        last_name: entry.profile.last_name,
        major: entry.profile.major,
        year: entry.profile.year,
        GPA: entry.profile.GPA
      });
    }

    if (entry.role === 'Advisor') {
      await Advisor.create({
        advisor_id: user.user_id,
        first_name: entry.profile.first_name,
        last_name: entry.profile.last_name,
        department: entry.profile.department
      });
    }

    console.log(
      `Demo ${entry.role.toLowerCase()} created: username=${entry.username}, password=${entry.password}`
    );
  }
}

async function assignDemoAdvisors() {
  const advisor1User = await User.findOne({ where: { username: 'advisor1' } });
  const advisor2User = await User.findOne({ where: { username: 'advisor2' } });
  const student1User = await User.findOne({ where: { username: 'student1' } });
  const student2User = await User.findOne({ where: { username: 'student2' } });

  if (student1User && advisor1User) {
    await Student.update(
      { advisor_id: advisor1User.user_id },
      { where: { student_id: student1User.user_id } }
    );
  }

  if (student2User && advisor2User) {
    await Student.update(
      { advisor_id: advisor2User.user_id },
      { where: { student_id: student2User.user_id } }
    );
  }
}

async function seedDemoPrograms() {
  const { Program } = require('./models/index.js');

  const programs = [
    { name: 'Computer Science', total_credits_required: 120 },
    { name: 'Cybersecurity', total_credits_required: 120 },
  ];

  for (const p of programs) {
    const exists = await Program.findOne({ where: { name: p.name } });
    if (!exists) {
      await Program.create(p);
      console.log(`Demo program created: ${p.name}`);
    }
  }
}
async function seedDemoCourses() {
  const { Course } = require('./models/index.js');

  const courses = [
    // ---------- Computer Science ----------
    { course_code: 'CS 112',     course_name: 'Information Literacy for Former Engineering Majors',     credits: 1, category: 'General',  department: 'Computer Science', course_description: 'Builds research, evaluation, and digital information skills with emphasis on security, policy, and ethical use of information.' },
    { course_code: 'CS 115',     course_name: 'Introduction to Computer Science with Python',           credits: 1, category: 'Core',     department: 'Computer Science', course_description: 'Introduces computer science as a discipline and career path while using Python to solve beginner programming problems.' },
    { course_code: 'CS 120G',    course_name: 'Introduction to Information Literacy and Research',      credits: 3, category: 'General',  department: 'Computer Science', course_description: 'Covers finding, evaluating, managing, and presenting information using collaborative and productivity tools.' },
    { course_code: 'CS 121G',    course_name: 'Introduction to Information Literacy and Research for Scientists', credits: 3, category: 'General', department: 'Computer Science', course_description: 'Focuses on information literacy for scientific work, including data analysis, presentation tools, and responsible information use.' },
    { course_code: 'CS 126G',    course_name: 'Honors: Introduction to Information Literacy and Research', credits: 3, category: 'General', department: 'Computer Science', course_description: 'Honors version of CS 120G for students in the Honors College.' },
    { course_code: 'CS 150',     course_name: 'Introduction to Programming with C++',                   credits: 4, category: 'Core',     department: 'Computer Science', course_description: 'Introduces problem solving, algorithm design, testing, and core C++ programming fundamentals.' },
    { course_code: 'CS 151',     course_name: 'Introduction to Programming with Java',                  credits: 4, category: 'Core',     department: 'Computer Science', course_description: 'Introduces computational problem solving and software construction using Java.' },
    { course_code: 'CS 153',     course_name: 'Introduction to Programming with Python',                credits: 4, category: 'Core',     department: 'Computer Science', course_description: 'Covers beginner software development and problem solving using Python, including functions and core data structures.' },
    { course_code: 'CS 170',     course_name: 'Introduction to Computer Architecture',                  credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Introduces computer organization, logic, arithmetic, instruction sets, system hierarchy, and performance basics.' },
    { course_code: 'CS 202G',    course_name: 'Information Literacy for Cybersecurity',                 credits: 3, category: 'General',  department: 'Computer Science', course_description: 'Explores information literacy, ethics, and research practices with a cybersecurity focus.' },
    { course_code: 'CS 222',     course_name: 'Introduction to Digital Image Processing',               credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Introduces image representation, filtering, enhancement, segmentation, transforms, and color image processing.' },
    { course_code: 'CS 250',     course_name: 'Programming with C++',                                   credits: 4, category: 'Core',     department: 'Computer Science', course_description: 'Builds larger software systems in C++ with topics like classes, inheritance, dynamic structures, testing, and debugging.' },
    { course_code: 'CS 251',     course_name: 'Programming with Java',                                  credits: 4, category: 'Core',     department: 'Computer Science', course_description: 'Develops object-oriented programming and software design skills in Java using classes, inheritance, and common data structures.' },
    { course_code: 'CS 252',     course_name: 'Introduction to Unix for Programmers',                   credits: 1, category: 'Core',     department: 'Computer Science', course_description: 'Introduces Unix/Linux tools for programmers including shells, files, editors, compiling, debugging, SSH, git, and IDE workflows.' },
    { course_code: 'CS 300T',    course_name: 'Computers in Society',                                   credits: 3, category: 'General',  department: 'Computer Science', course_description: 'Examines the social impact of computing, including ethics, intellectual property, security, and public policy issues.' },
    { course_code: 'CS 312',     course_name: 'Internet Concepts',                                      credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Introduces the Internet and the web, including protocols, publishing, search, communication, security, and internet culture.' },
    { course_code: 'CS 315',     course_name: 'Computer Science Undergraduate Colloquium',              credits: 1, category: 'Elective', department: 'Computer Science', course_description: 'Speaker-based course exposing students to research areas, career paths, and scholarship opportunities in computer science.' },
    { course_code: 'CS 330',     course_name: 'Object-Oriented Design and Programming',                 credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Covers object-oriented analysis and design, UML, multithreading, synchronization, and GUI development.' },
    { course_code: 'CS 337',     course_name: 'OOP and Foreign Function Interfaces in Rust',            credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Applies object-oriented patterns in Rust and introduces foreign function interfaces, including native Python library workflows.' },
    { course_code: 'CS 350',     course_name: 'Introduction to Software Engineering',                   credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Team-based introduction to requirements, testing, documentation, issue tracking, version control, and agile development.' },
    { course_code: 'CS 355',     course_name: 'Principles of Programming Languages',                    credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Surveys programming language paradigms, type systems, syntax, modularity, and parallel programming.' },
    { course_code: 'CS 361',     course_name: 'Data Structures and Algorithms',                         credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Studies common abstract data types and the algorithms used to implement them, with time and space complexity analysis.' },
    { course_code: 'CS 367',     course_name: 'Computer Science Internship',                            credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Supervised professional internship experience in computer science and related industry work.' },
    { course_code: 'CS 368',     course_name: 'Computer Science Internship',                            credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Advanced supervised internship experience with reflective and professional development components.' },
    { course_code: 'CS 381',     course_name: 'Introduction to Discrete Structures',                    credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Covers logic, proofs, sets, functions, induction, counting, relations, and graphs for computer science.' },
    { course_code: 'CS 390',     course_name: 'Introduction to Theoretical Computer Science',           credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Introduces automata, formal languages, grammars, Turing machines, and unsolvable problems.' },
    { course_code: 'CS 402/502', course_name: 'Formal Software Foundations',                            credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Focuses on verified software, functional programming, theorem proving, proof automation, and certified code extraction.' },
    { course_code: 'CS 410/510', course_name: 'Professional Workforce Development I',                   credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Project-centered professional course covering problem selection, feasibility, requirements, presentations, and documentation.' },
    { course_code: 'CS 411W/511',course_name: 'Professional Workforce Development II',                  credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Continues the project and professional documentation sequence with emphasis on formal communication and deliverables.' },
    { course_code: 'CS 417/517', course_name: 'Computational Methods and Software',                     credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Studies algorithms and software used in scientific and numerical computing.' },
    { course_code: 'CS 418',     course_name: 'Web Programming',                                        credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Covers modern web programming concepts including web servers, applications, and client/server interaction.' },
    { course_code: 'CS 431',     course_name: 'Web Server Design',                                      credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Examines server-side web systems, hosting architectures, APIs, and scalable web service design.' },
    { course_code: 'CS 432',     course_name: 'Web Science',                                            credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Explores the web as a decentralized information system and studies its technical and social dimensions.' },
    { course_code: 'CS 441',     course_name: 'App Development for Smart Devices',                      credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Project-based course on designing and building applications for smart devices.' },
    { course_code: 'CS 450',     course_name: 'Database Concepts',                                      credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Introduces relational database design, SQL, normalization, and data management concepts.' },
    { course_code: 'CS 455',     course_name: 'Introduction to Networks and Communications',            credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Studies network architecture, protocols, communication models, and distributed connectivity.' },
    { course_code: 'CS 460',     course_name: 'Computer Graphics',                                      credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Covers rendering, geometric modeling, transformations, and interactive graphics systems.' },
    { course_code: 'CS 462',     course_name: 'Cybersecurity Fundamentals',                             credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Surveys core cybersecurity principles including threats, risk, controls, and secure design.' },
    { course_code: 'CS 463',     course_name: 'Cryptography for Cybersecurity',                         credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Introduces classical and modern cryptographic systems with applications to secure computing.' },
    { course_code: 'CS 464',     course_name: 'Networked Systems Security',                             credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Focuses on securing networked systems through monitoring, hardening, and attack analysis.' },
    { course_code: 'CS 465',     course_name: 'Information Assurance',                                  credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Explores policy, governance, risk management, and assurance practices for information systems.' },
    { course_code: 'CS 466',     course_name: 'Principles and Practice of Cyber Defense',               credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Applies defensive cybersecurity techniques including monitoring, response, and hardening.' },
    { course_code: 'CS 467',     course_name: 'Introduction to Reverse Software Engineering',           credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Introduces reverse engineering workflows for binaries, malware analysis, and code recovery.' },
    { course_code: 'CS 469',     course_name: 'Data Analytics for Cybersecurity',                       credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Uses data analytics and visualization methods to identify and analyze cybersecurity events.' },
    { course_code: 'CS 472',     course_name: 'Network and Security',                                   credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Examines advanced networking topics with emphasis on security models, attacks, and defenses.' },
    { course_code: 'CS 476',     course_name: 'Systems Programming',                                    credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Builds low-level software using process control, memory management, concurrency, and OS interfaces.' },
    { course_code: 'CS 478',     course_name: 'Computational Geometry, Methods and Applications',      credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Explores algorithms for geometric computation and their applications in modeling and analysis.' },
    { course_code: 'CS 480',     course_name: 'Introduction to Artificial Intelligence',                credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Introduces intelligent agents, search, reasoning, and foundational artificial intelligence techniques.' },
    { course_code: 'CS 486',     course_name: 'Introduction to Parallel Computing',                     credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Introduces parallel architectures, decomposition strategies, and parallel program design.' },
    { course_code: 'CS 487',     course_name: 'Applied Parallel Computing',                             credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Applies practical techniques for scalable parallel programming and performance tuning.' },
    { course_code: 'CS 488',     course_name: 'Principles of Compiler Construction',                    credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Studies lexical analysis, parsing, semantic analysis, code generation, and compiler organization.' },
    { course_code: 'CS 491',     course_name: 'Honors Research I',                                      credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Supports mentored honors research in computer science through proposal and initial investigation.' },
    { course_code: 'CS 492',     course_name: 'Honors Research II',                                     credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Continues honors research work with emphasis on analysis, writing, and final deliverables.' },
    { course_code: 'CS 499W',    course_name: 'Honors Thesis in Computer Science',                      credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Culminating honors thesis experience focused on substantial written and technical work.' },

    // ---------- Cybersecurity ----------
    { course_code: 'CYSE 200T', course_name: 'Cybersecurity, Technology, and Society',  credits: 3, category: 'Core',     department: 'Cybersecurity', course_description: 'Introduces cybersecurity as a discipline and explores its role in society, technology, and policy.' },
    { course_code: 'CYSE 300',  course_name: 'Introduction to Cybersecurity',           credits: 3, category: 'Core',     department: 'Cybersecurity', course_description: 'Introduces core cybersecurity principles, threats, vulnerabilities, and defensive strategies.' },
    { course_code: 'CYSE 301',  course_name: 'Cyber Defense Fundamentals',              credits: 3, category: 'Core',     department: 'Cybersecurity', course_description: 'Builds practical defensive security skills including monitoring, incident response, and system hardening.' },
    { course_code: 'CYSE 305',  course_name: 'Operating Systems and Systems Security',  credits: 3, category: 'Core',     department: 'Cybersecurity', course_description: 'Examines operating systems concepts with emphasis on secure configuration and protection mechanisms.' },
    { course_code: 'CYSE 406',  course_name: 'Network Security',                        credits: 3, category: 'Core',     department: 'Cybersecurity', course_description: 'Studies secure network design, protocols, monitoring, and common network-based attacks and defenses.' },
    { course_code: 'CYSE 425',  course_name: 'Cybersecurity Analytics',                 credits: 3, category: 'Elective', department: 'Cybersecurity', course_description: 'Applies analytics and data-driven methods to threat detection, response, and cybersecurity decision making.' },
  ];

  for (const def of courses) {
    const exists = await Course.findOne({ where: { course_code: def.course_code } });
    if (!exists) {
      await Course.create({
        ...def,
        seat_availability: 30,
      });
    }
  }

  console.log(`Demo courses seeded: ${courses.length}`);
}
async function seedDemoPlans() {
  const { Course, Plan, PlannedCourse } = require('./models/index.js');
 
  // Map "CS 250" -> Course row, so we can reference by code
  const courseRows = await Course.findAll();
  const C = {};
  for (const c of courseRows) C[c.course_code] = c;
 
  // Approximate calendar dates for "Plan creation" so the timeline is realistic
  const semesterStart = {
    Fall:   (year) => new Date(`${year}-08-01`),
    Spring: (year) => new Date(`${year}-01-01`),
    Summer: (year) => new Date(`${year}-05-15`),
    Winter: (year) => new Date(`${year}-12-15`),
  };
 
  // Helper: create one Plan for a single semester and bulk-insert its courses
  async function createSemesterPlan(studentUserId, degreeProgram, semester, year, planStatus, courses) {
    const plan = await Plan.create({
      student_id: studentUserId,
      degree_program: degreeProgram,
      status: planStatus,
      creation_date: semesterStart[semester]?.(year) ?? new Date(),
    });
 
    const rows = courses
      .map(([code, courseStatus, grade]) => ({
        plan_id: plan.plan_id,
        course_id: C[code]?.course_id,
        semester,
        year,
        status: courseStatus,
        grade: grade ?? null,
      }))
      .filter(row => row.course_id);  // skip unknown course codes silently
 
    if (rows.length) await PlannedCourse.bulkCreate(rows);
    return plan;
  }
 
  // ---------------------------------------------------------------------
  // Student1 — almost done
  // ---------------------------------------------------------------------
  const student1 = await User.findOne({ where: { username: 'Student1' } });
  if (student1) {
    // Freshman year
    await createSemesterPlan(student1.user_id, 'Computer Science', 'Fall', 2023, 'Historical', [
      ['CS 120G', 'Completed', 'A' ],
      ['CS 150',  'Completed', 'A-'],
      ['CS 170',  'Completed', 'B+'],
      ['CS 252',  'Completed', 'A' ],
      ['CS 115',  'Completed', 'A' ],
    ]);

    await createSemesterPlan(student1.user_id, 'Computer Science', 'Spring', 2024, 'Historical', [
      ['CS 250',  'Completed', 'A' ],
      ['CS 300T', 'Completed', 'B' ],
      ['CS 312',  'Completed', 'A-'],
      ['CS 222',  'Completed', 'A-'],
      ['CS 315',  'Completed', 'A' ],
    ]);

    // Sophomore year
    await createSemesterPlan(student1.user_id, 'Computer Science', 'Fall', 2024, 'Historical', [
      ['CS 330',  'Completed', 'B+'],
      ['CS 350',  'Completed', 'A' ],
      ['CS 381',  'Completed', 'A' ],
      ['CS 355',  'Completed', 'B+'],
      ['CS 460',  'Completed', 'A' ],
    ]);

    await createSemesterPlan(student1.user_id, 'Computer Science', 'Spring', 2025, 'Historical', [
      ['CS 361',      'Completed', 'A-'],
      ['CS 390',      'Completed', 'B' ],
      ['CS 410/510',  'Completed', 'A' ],
      ['CS 450',      'Completed', 'A-'],
      ['CS 455',      'Completed', 'B+'],
    ]);

    // Junior year
    await createSemesterPlan(student1.user_id, 'Computer Science', 'Fall', 2025, 'Historical', [
      ['CS 411W/511', 'Completed', 'A' ],
      ['CS 462',      'Completed', 'A' ],
      ['CS 463',      'Completed', 'B+'],
      ['CS 480',      'Completed', 'A' ],
      ['CS 418',      'Completed', 'A-'],
    ]);

    await createSemesterPlan(student1.user_id, 'Computer Science', 'Spring', 2026, 'Historical', [
      ['CS 476', 'Completed', 'A' ],
      ['CS 488', 'Completed', 'A' ],
      ['CS 441', 'Completed', 'A' ],
      ['CS 467', 'Completed', 'B+'],
      ['CS 486', 'Completed', 'A' ],
    ]);

    // Senior year — current semesterd
    await createSemesterPlan(student1.user_id, 'Computer Science', 'Fall', 2026, 'Approved', [
      ['CS 431', 'Enrolled', null],
      ['CS 478', 'Enrolled', null],
      ['CS 487', 'Enrolled', null],
      ['CS 432', 'Enrolled', null],
      ['CS 150', 'Planned',  null], 
    ]);
    await createSemesterPlan(student1.user_id, 'Computer Science', 'Spring', 2027, 'Draft', [
      ['CS 463', 'Planned', null],
      ['CS 480', 'Planned', null],
      ['CS 488', 'Planned', null],
    ]);
    console.log('Student1: seeded semester plans');
  }
 
  // ---------------------------------------------------------------------
  // Student2 — empty start (one Draft plan for next term)
  // ---------------------------------------------------------------------
  const student2 = await User.findOne({ where: { username: 'Student2' } });
  if (student2) {
    await createSemesterPlan(student2.user_id, 'Cybersecurity', 'Fall', 2026, 'Draft', [
      ['CYSE 200T', 'Planned', null],
      ['CYSE 300',  'Planned', null],
      ['CS 150',    'Planned', null],
      ['CS 252',    'Planned', null],
    ]);
 
    console.log('Student2: seeded 1 Draft plan for Fall 2026');
  }
}
async function seedDemoFeedback() {
  const { Plan, PlanFeedback } = require('./models/index.js');

  const advisor1 = await User.findOne({ where: { username: 'Advisor1' } });
  const student1 = await User.findOne({ where: { username: 'Student1' } });

  if (!advisor1 || !student1) return;

  // Find Student1's two current/upcoming plans (skip Historical)
  const fall2026 = await Plan.findOne({
    where: { student_id: student1.user_id, status: 'Approved' },
  });

  const spring2027 = await Plan.findOne({
    where: { student_id: student1.user_id, status: 'Draft' },
  });

  if (fall2026) {
    await PlanFeedback.create({
      plan_id: fall2026.plan_id,
      advisor_id: advisor1.user_id,
      message:
        "Approved your final semester. The 16-credit load is on the heavier side — make sure CS 487 doesn't conflict with your CS 411W hours. Reach out if you need to drop CS 150.",
    });
    console.log('Advisor feedback seeded for Student1 Fall 2026');
  }

  if (spring2027) {
    await PlanFeedback.create({
      plan_id: spring2027.plan_id,
      advisor_id: advisor1.user_id,
      message:
        "Please confirm your senior audit is on file with the registrar before you submit. Once you do, I'll review course selection.",
    });
    console.log('Advisor feedback seeded for Student1 Spring 2027');
  }
}
//#endregion

// Sync database and start server
const PORT = process.env.PORT || 3000;
sequelize.sync({ force: true }) // { force: true } to reset DB
    .then(async() => {
        console.log('Database synced.');

        await seedAdmin();
        await seedDemoUsers();
        await seedDemoPrograms();
        await seedDemoCourses();
        await assignDemoAdvisors();
        await seedDemoPlans(); 
        await seedDemoFeedback();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('DB connection error:', err));