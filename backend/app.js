const express = require('express');
const { sequelize, User, Admin, Student, Advisor } = require('./models/index.js');
const bcrypt = require('bcrypt');
const authRoutes = require('./routes/authRoutes.js');
const studentRoutes = require('./routes/studentRoutes.js');
const advisorRoutes = require('./routes/advisorRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const courseRoutes = require('./routes/courseRoutes.js');
const resourceRoutes = require('./routes/resourceRoutes.js');
const app = express();

const { DataTypes } = require('sequelize');

// ── Resource model (defined here alongside other models) ──────────────────────
const Resource = sequelize.define('Resource', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:       { type: DataTypes.STRING(200),  allowNull: false },
  url:         { type: DataTypes.STRING(500),  allowNull: false },
  description: { type: DataTypes.TEXT },
  category:    { type: DataTypes.STRING(100) },
  icon:        { type: DataTypes.STRING(50) },
  is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: false, tableName: 'resources' });

// Make the model available to the controller
global._ResourceModel = Resource;

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/resources', resourceRoutes);

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
    { course_code: 'CS 252',     course_name: 'Introduction to Unix for Programmers',                   credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Provides hands-on experience with Unix/Linux operating systems, shells, scripting, and system tools.' },
    { course_code: 'CS 300T',    course_name: 'Technologies for 21st-Century Writing',                  credits: 3, category: 'General',  department: 'Computer Science', course_description: 'Prepares students for professional writing in technical environments, using digital tools and collaborative platforms.' },
    { course_code: 'CS 312',     course_name: 'Web Programming',                                        credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Covers HTML, CSS, JavaScript, and server-side technologies for building dynamic web applications.' },
    { course_code: 'CS 315',     course_name: 'Introduction to Database Systems',                       credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Introduces relational databases, SQL, database design, and basic concepts of data storage and retrieval.' },
    { course_code: 'CS 330',     course_name: 'Object-Oriented Programming and Design',                 credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Covers object-oriented concepts including design patterns, UML, testing, and advanced Java.' },
    { course_code: 'CS 350',     course_name: 'Introduction to Software Engineering',                   credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Introduces software development lifecycle, agile methods, requirements, design, testing, and project management.' },
    { course_code: 'CS 355',     course_name: 'Introduction to Computer Networks',                      credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Covers network architecture, protocols, TCP/IP, routing, and basic network security concepts.' },
    { course_code: 'CS 361',     course_name: 'Advanced Data Structures and Algorithms',                credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Studies advanced algorithms, complexity analysis, trees, graphs, sorting, and problem-solving strategies.' },
    { course_code: 'CS 381',     course_name: 'Discrete Structures',                                    credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Introduces mathematical structures for computer science including logic, sets, relations, graphs, and combinatorics.' },
    { course_code: 'CS 390',     course_name: 'Formal Languages and Automata',                          credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Covers automata theory, formal grammars, regular and context-free languages, and computability.' },
    { course_code: 'CS 410/510', course_name: 'Introduction to Artificial Intelligence',                credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Introduces search, knowledge representation, machine learning, and reasoning in AI systems.' },
    { course_code: 'CS 411W/511',course_name: 'Software Engineering II (Writing Intensive)',             credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Continues software engineering with emphasis on design documentation, team projects, and technical writing.' },
    { course_code: 'CS 418',     course_name: 'Introduction to Computer Graphics',                      credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Covers 2D/3D graphics programming, rendering pipelines, transformations, and OpenGL basics.' },
    { course_code: 'CS 431',     course_name: 'Theory of Computation',                                  credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Examines Turing machines, decidability, complexity classes, and the theoretical limits of computation.' },
    { course_code: 'CS 432',     course_name: 'Web Science',                                            credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Studies the architecture, graph structure, and algorithms underlying the World Wide Web and social networks.' },
    { course_code: 'CS 441',     course_name: 'Database Management Systems',                            credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Advanced topics in database systems including query optimization, transactions, concurrency, and NoSQL.' },
    { course_code: 'CS 450',     course_name: 'Operating Systems',                                      credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Covers process management, scheduling, memory, file systems, I/O, and security in operating systems.' },
    { course_code: 'CS 455',     course_name: 'Computer Architecture',                                  credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Examines processor design, instruction-level parallelism, memory hierarchy, and multicore architecture.' },
    { course_code: 'CS 460',     course_name: 'Cyber Attack and Defense',                               credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Covers offensive and defensive security concepts, penetration testing, and security analysis techniques.' },
    { course_code: 'CS 462',     course_name: 'Machine Learning',                                       credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Introduces supervised and unsupervised learning, neural networks, evaluation, and real-world applications.' },
    { course_code: 'CS 463',     course_name: 'Big Data Analytics',                                     credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Covers Hadoop, Spark, MapReduce, and analytics pipelines for processing large-scale datasets.' },
    { course_code: 'CS 467',     course_name: 'Computer Vision',                                        credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Studies image classification, object detection, segmentation, and deep learning methods for visual data.' },
    { course_code: 'CS 476',     course_name: 'Compiler Design',                                        credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Covers lexing, parsing, semantic analysis, code generation, and optimization in compiler construction.' },
    { course_code: 'CS 478',     course_name: 'Network Security',                                       credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Studies network threats, cryptography, firewalls, intrusion detection, and secure protocol design.' },
    { course_code: 'CS 480',     course_name: 'Senior Project I',                                       credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'First semester of the capstone senior design project involving requirements analysis and prototype development.' },
    { course_code: 'CS 481',     course_name: 'Senior Project II',                                      credits: 3, category: 'Core',     department: 'Computer Science', course_description: 'Completion and presentation of the senior design project developed in CS 480.' },
    { course_code: 'CS 486',     course_name: 'Distributed Systems',                                    credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Covers distributed architectures, consistency, fault tolerance, and cloud-based system design.' },
    { course_code: 'CS 487',     course_name: 'Blockchain and Decentralized Applications',              credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Explores blockchain technology, smart contracts, consensus mechanisms, and decentralized app development.' },
    { course_code: 'CS 488',     course_name: 'Cloud Computing',                                        credits: 3, category: 'Elective', department: 'Computer Science', course_description: 'Covers cloud service models, virtualization, containers, Kubernetes, and cloud-native application design.' },

    // ---------- Cybersecurity ----------
    { course_code: 'CYSE 200T',  course_name: 'Introduction to Cybersecurity',                          credits: 3, category: 'Core',     department: 'Cybersecurity', course_description: 'Introduces the cybersecurity landscape including threats, defenses, policy, ethics, and career paths.' },
    { course_code: 'CYSE 300',   course_name: 'Cyber Foundations',                                      credits: 3, category: 'Core',     department: 'Cybersecurity', course_description: 'Covers core cybersecurity principles: CIA triad, cryptography, access control, and risk management.' },
    { course_code: 'CYSE 301',   course_name: 'Ethical Hacking',                                        credits: 3, category: 'Core',     department: 'Cybersecurity', course_description: 'Teaches penetration testing methodology, reconnaissance, exploitation, and responsible disclosure practices.' },
    { course_code: 'CYSE 302',   course_name: 'Security Operations',                                    credits: 3, category: 'Core',     department: 'Cybersecurity', course_description: 'Covers SOC operations, SIEM tools, incident response, threat intelligence, and log analysis.' },
    { course_code: 'CYSE 400',   course_name: 'Advanced Network Security',                              credits: 3, category: 'Core',     department: 'Cybersecurity', course_description: 'Examines advanced firewall configurations, VPNs, IDS/IPS, zero trust, and network threat modeling.' },
    { course_code: 'CYSE 401',   course_name: 'Digital Forensics',                                      credits: 3, category: 'Elective', department: 'Cybersecurity', course_description: 'Covers forensic evidence collection, disk imaging, file recovery, and chain-of-custody for investigations.' },
    { course_code: 'CYSE 402',   course_name: 'Malware Analysis',                                       credits: 3, category: 'Elective', department: 'Cybersecurity', course_description: 'Studies static and dynamic analysis of malware, reverse engineering techniques, and sandbox tools.' },
    { course_code: 'CYSE 450',   course_name: 'Cybersecurity Policy and Law',                           credits: 3, category: 'General',  department: 'Cybersecurity', course_description: 'Examines legal frameworks, compliance standards (NIST, HIPAA, GDPR), and policy creation for cybersecurity.' },
    { course_code: 'CYSE 480',   course_name: 'Cybersecurity Capstone I',                               credits: 3, category: 'Core',     department: 'Cybersecurity', course_description: 'First part of the capstone experience; students develop a security-focused project proposal and prototype.' },
    { course_code: 'CYSE 481',   course_name: 'Cybersecurity Capstone II',                              credits: 3, category: 'Core',     department: 'Cybersecurity', course_description: 'Completion and defense of the capstone project begun in CYSE 480.' },
  ];

  for (const c of courses) {
    const exists = await Course.findOne({ where: { course_code: c.course_code } });
    if (!exists) {
      await Course.create(c);
    }
  }
  console.log('Demo courses seeded.');
}

async function seedDemoPlans() {
  const { Course, Plan, PlannedCourse } = require('./models/index.js');
 
  
  const courseRows = await Course.findAll();
  const C = {};
  for (const c of courseRows) C[c.course_code] = c;
 
  
  const semesterStart = {
    Fall:   (year) => new Date(`${year}-08-01`),
    Spring: (year) => new Date(`${year}-01-01`),
    Summer: (year) => new Date(`${year}-05-15`),
    Winter: (year) => new Date(`${year}-12-15`),
  };
 
  
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

    // Senior year — current semester
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

// ── Resource seed ─────────────────────────────────────────────────────────────
async function seedResources() {
  const count = await Resource.count();
  if (count > 0) return; // already seeded

  const resources = [
    // Registration
    {
      title: 'ODU Homepage',
      url: 'https://www.odu.edu',
      description: 'Official Old Dominion University website.',
      category: 'Registration',
      icon: '🏫',
    },
    {
      title: 'Student Registration',
      url: 'https://www.odu.edu/registration',
      description: 'Register for classes, view holds',
      category: 'Registration',
      icon: '📝',
    },
    {
      title: 'University Registrar',
      url: 'https://www.odu.edu/registrar',
      description: 'Transcripts, applications, and records.',
      category: 'Registration',
      icon: '🏛️',
    },
    {
      title: 'Course Schedules',
      url: 'https://www.odu.edu/registration/course-schedules',
      description: 'Browse course offerings by semester, campus, and department.',
      category: 'Registration',
      icon: '🗓️',
    },
    {
      title: 'Add / Drop / Withdraw',
      url: 'https://www.odu.edu/registration/how-to-register',
      description: 'Change your schedule each semester.',
      category: 'Registration',
      icon: '🔄',
    },
    {
      title: 'LEO Online',
      url: 'https://www.odu.edu/administrative-banner-systems/leo-online',
      description: 'View your schedule, grades, financial aid, and account balance.',
      category: 'Registration',
      icon: '🦁',
    },

    // Academic Planning
    {
      title: 'Academic Calendar',
      url: 'https://www.odu.edu/academics/calendar',
      description: 'Key dates: registration windows, finals, holidays, commencement, ect.',
      category: 'Academic Planning',
      icon: '📅',
    },
    {
      title: 'Course Catalogue',
      url: 'https://catalog.odu.edu/courses/',
      description: 'Full listof undergraduate and graduate courses with descriptions.',
      category: 'Academic Planning',
      icon: '📖',
    },
    {
      title: 'Academic Advising',
      url: 'https://www.odu.edu/advising',
      description: 'Connect with your academic advisor.',
      category: 'Academic Planning',
      icon: '🧭',
    },
    {
      title: 'Degree Works (Audit Offical)',
      url: 'https://degree.odu.edu',
      description: 'Track your degree progress and see what remain.',
      category: 'Academic Planning',
      icon: '✅',
    },
    {
      title: 'Transfer Credits',
      url: 'https://www.odu.edu/transfer/vccs-transfer-guide',
      description: 'Look up how transfer courses map to ODU equivalents.',
      category: 'Academic Planning',
      icon: '🔁',
    },

    // Student Services
    {
      title: 'Student Affairs',
      url: 'https://www.odu.edu/virginia-health-sciences/about-us/administrative-offices/student-affairs',
      description: 'Campus info, student organizations, and support services.',
      category: 'Student Services',
      icon: '🤝',
    },
    {
      title: 'ODU Libraries',
      url: 'https://www.odu.edu/library',
      description: 'Access research databases, e-books, journals, and study rooms.',
      category: 'Student Services',
      icon: '📚',
    },
    {
      title: 'Office of Disability Services',
      url: 'https://www.odu.edu/accessibility',
      description: 'Support for students with disabilities.',
      category: 'Student Services',
      icon: '♿',
    },
    {
      title: 'Career Development Services',
      url: 'https://www.odu.edu/career-leadership',
      description: 'Resume reviews, career fairs, job postings, and interview prep.',
      category: 'Student Services',
      icon: '💼',
    },
    {
      title: 'Writing Center',
      url: 'https://www.odu.edu/al/centers/writing-center',
      description: 'Free writing tutoring for all stages of the writing process.',
      category: 'Student Services',
      icon: '✍️',
    },

    // Financial Aid
    {
      title: 'Office of Financial Aid',
      url: 'https://www.odu.edu/financial-aid',
      description: 'Scholarships, grants, loans, work-study, and FAFSA guidance.',
      category: 'Financial Aid',
      icon: '💰',
    },
    {
      title: 'Student Accounts',
      url: 'https://www.odu.edu/finance/accounts-receivable',
      description: 'View and pay your tuition bill, set up payment plans.',
      category: 'Financial Aid',
      icon: '💳',
    },
    {
      title: 'Tuition Rates',
      url: 'https://www.odu.edu/tuition/rates',
      description: 'Current tuition, fees, housing, and meal plan cost estimates.',
      category: 'Financial Aid',
      icon: '🧾',
    },

    // IT & Campus Tools
    {
      title: 'IT Help Desk',
      url: 'https://www.odu.edu/technology-services/helpdesk',
      description: 'IT Tech support for Midas accounts, email, Wi-Fi, and software.',
      category: 'IT',
      icon: '🖥️',
    },
    {
      title: 'Canvas',
      url: 'https://www.odu.edu/technology-services/canvas',
      description: 'Access your course materials, assignments, and grades online.',
      category: 'IT',
      icon: '🖊️',
    },
    {
      title: 'ODU Email',
      url: 'https://www.odu.edu/technology-services/email',
      description: 'Access your ODU student email via Microsoft Outlook.',
      category: 'IT',
      icon: '📧',
    },
    {
      title: 'Software Downloads',
      url: 'https://www.odu.edu/technology-services/software-services',
      description: 'Free or Discounted software available to enrolled students.',
      category: 'IT',
      icon: '⬇️',
    },

    // Health
    {
      title: 'Student Health Services',
      url: 'https://www.odu.edu/studenthealth',
      description: 'On-campus medical care / health resources.',
      category: 'Health',
      icon: '🏥',
    },
    {
      title: 'Counseling Services',
      url: 'https://www.odu.edu/counselingservices',
      description: 'Free confidential counseling for students.',
      category: 'Health',
      icon: '🧠',
    },
    {
      title: 'Rec & Wellness Center',
      url: 'https://www.odu.edu/recreation-wellness',
      description: 'Fitness facilities, group classes, and wellness programs.',
      category: 'Health',
      icon: '🏋️',
    },
  ];

  await Resource.bulkCreate(resources);
  console.log(`Seeded ${resources.length} resources.`);
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
        await seedResources();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('DB connection error:', err));
