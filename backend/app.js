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

const Resource = sequelize.define('Resource', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:       { type: DataTypes.STRING(200),  allowNull: false },
  url:         { type: DataTypes.STRING(500),  allowNull: false },
  description: { type: DataTypes.TEXT },
  category:    { type: DataTypes.STRING(100) },
  icon:        { type: DataTypes.STRING(50) },
  is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: false, tableName: 'resources' });



global._ResourceModel = Resource;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/resources', resourceRoutes);


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

  const advisor1User = await User.findOne({ where: { username: 'Advisor1' } });
  const student1User = await User.findOne({ where: { username: 'Student1' } });
  const student2User = await User.findOne({ where: { username: 'Student2' } });


  if (student1User && advisor1User) {
    await Student.update(
      { advisor_id: advisor1User.user_id },
      { where: { student_id: student1User.user_id } }
    );
    console.log('Assigned Student1 -> Advisor1');
  }

  if (student2User && advisor1User) {
    await Student.update(
      { advisor_id: advisor1User.user_id },
      { where: { student_id: student2User.user_id } }
    );
    console.log('Assigned Student2 -> Advisor1');
  }
}

async function seedDemoPrograms() {
  const { Program, Course, ProgramCourse } = require('./models/index.js');

  const programs = [
    { name: 'Computer Science', total_credits_required: 120 },
    { name: 'Cybersecurity', total_credits_required: 120 },
  ];

  const CS_FOUNDATION_FOR_CYBER = ['CS 150', 'CS 170', 'CS 250', 'CS 350', 'CS 381'];

  const SHARED_DEPARTMENTS = ['Mathematics', 'English', 'Communication',
                              'Philosophy', 'History', 'Psychology',
                              'Art', 'Physics'];

  for (const p of programs) {
    const [program] = await Program.findOrCreate({
      where: { name: p.name },
      defaults: p,
    });

    const majorCourses = await Course.findAll({ where: { department: p.name } });


    const sharedCourses = await Course.findAll({
      where: { department: SHARED_DEPARTMENTS },
    });

    let foundationCourses = [];
    if (p.name === 'Cybersecurity') {
      foundationCourses = await Course.findAll({
        where: { course_code: CS_FOUNDATION_FOR_CYBER },
      });
    }

    const allForThisProgram = [...majorCourses, ...sharedCourses, ...foundationCourses];

    let linked = 0;
    for (const c of allForThisProgram) {
      const [, created] = await ProgramCourse.findOrCreate({
        where: { program_id: program.id, course_id: c.course_id },
        defaults: {
          program_id: program.id,
          course_id: c.course_id,
          requirement_type: c.category || 'Elective',
        },
      });
      if (created) linked++;
    }

    console.log(`Linked ${linked} courses to program "${p.name}" ` +
                `(${majorCourses.length} major + ${sharedCourses.length} shared` +
                (foundationCourses.length ? ` + ${foundationCourses.length} foundation` : '') + `).`);
  }
}


async function seedDemoCourses() {
  const { Course } = require('./models/index.js');

  const courses = [

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

    { course_code: 'MATH 211',   course_name: 'Calculus I',                                             credits: 4, category: 'Core',     department: 'Mathematics', course_description: 'Limits, continuity, derivatives, and integrals of single-variable functions with applications to science and engineering.' },
    { course_code: 'MATH 212',   course_name: 'Calculus II',                                            credits: 4, category: 'Core',     department: 'Mathematics', course_description: 'Techniques and applications of integration, sequences, series, and an introduction to differential equations.' },
    { course_code: 'MATH 316',   course_name: 'Introductory Linear Algebra',                           credits: 3, category: 'Core',     department: 'Mathematics', course_description: 'Vector spaces, matrices, linear transformations, eigenvalues, and applications used throughout computer science.' },
    { course_code: 'STAT 330',   course_name: 'Introduction to Probability and Statistics',            credits: 3, category: 'Core',     department: 'Mathematics', course_description: 'Probability theory, common distributions, statistical inference, hypothesis testing, and regression for scientists.' },

    { course_code: 'ENGL 110C',  course_name: 'English Composition',                                   credits: 3, category: 'General',  department: 'English',       course_description: 'Foundational composition course covering academic argument, source evaluation, drafting, and revision. Grade of C or better required for graduation.' },
    { course_code: 'ENGL 211C',  course_name: 'Advanced Composition',                                  credits: 3, category: 'General',  department: 'English',       course_description: 'Continues academic writing with longer research-based assignments, source synthesis, and audience-aware rhetoric.' },
    { course_code: 'COMM 101R',  course_name: 'Public Speaking',                                       credits: 3, category: 'General',  department: 'Communication', course_description: 'Theory and practice of public speaking: audience analysis, argument structure, delivery, and informative/persuasive presentations.' },


    { course_code: 'PHIL 110P',  course_name: 'Philosophy and Ethics',                                 credits: 3, category: 'General',  department: 'Philosophy',    course_description: 'Introduction to ethical theory and applied ethics, examining moral reasoning across personal, professional, and technological contexts.' },
    { course_code: 'HIST 100H',  course_name: 'Interpreting the Past: Western Civilization',           credits: 3, category: 'General',  department: 'History',       course_description: 'Survey of major political, social, and cultural developments in Western civilization with attention to historical methodology.' },
    { course_code: 'PSYC 201S',  course_name: 'Introduction to Psychology',                            credits: 3, category: 'General',  department: 'Psychology',    course_description: 'Survey of human behavior, cognition, development, and social processes. Satisfies the Human Behavior General Education category.' },
    { course_code: 'ARTH 121A',  course_name: 'Human Creativity in the Visual Arts',                   credits: 3, category: 'General',  department: 'Art',           course_description: 'Examines the visual arts as a form of human creativity through historical and cross-cultural perspectives.' },
    { course_code: 'ENGL 112L',  course_name: 'Introduction to Literature',                            credits: 3, category: 'General',  department: 'English',       course_description: 'Reading and interpretation of fiction, poetry, and drama with attention to genre conventions and literary criticism.' },

    { course_code: 'PHYS 231N',  course_name: 'University Physics I',                                  credits: 4, category: 'General',  department: 'Physics',       course_description: 'Calculus-based mechanics: kinematics, Newton\'s laws, energy, momentum, rotation, and oscillations. First in the Nature of Science sequence.' },
    { course_code: 'PHYS 232N',  course_name: 'University Physics II',                                 credits: 4, category: 'General',  department: 'Physics',       course_description: 'Calculus-based electromagnetism, waves, and optics. Second in the Nature of Science sequence.' },
  ];

  for (const c of courses) {
    const exists = await Course.findOne({ where: { course_code: c.course_code } });
    if (!exists) {
      await Course.create(c);
    }
  }
  console.log('Demo courses seeded.');
}

async function seedOfferings() {
  const { Course, TimeSlot, SemesterOffering } = require('./models/index.js');


  const existingSlots = await TimeSlot.count();
  if (existingSlots > 0) {
    console.log(`Offerings already seeded (${existingSlots} time slots). Skipping.`);
    return;
  }

  const SEMESTERS = ['Fall', 'Spring'];
  const YEAR = new Date().getFullYear();

  const MWF_PATTERNS = [
    { days: 'MWF', time_range: '08:00-08:50' },
    { days: 'MWF', time_range: '09:00-09:50' },
    { days: 'MWF', time_range: '10:00-10:50' },
    { days: 'MWF', time_range: '11:00-11:50' },
    { days: 'MWF', time_range: '12:00-12:50' },
    { days: 'MWF', time_range: '13:00-13:50' },
    { days: 'MWF', time_range: '14:00-14:50' },
    { days: 'MWF', time_range: '15:00-15:50' },
  ];

  const TR_PATTERNS = [
    { days: 'TR', time_range: '08:00-09:15' },
    { days: 'TR', time_range: '09:30-10:45' },
    { days: 'TR', time_range: '11:00-12:15' },
    { days: 'TR', time_range: '12:30-13:45' },
    { days: 'TR', time_range: '14:00-15:15' },
    { days: 'TR', time_range: '15:30-16:45' },
  ];

  const SINGLE_DAY_PATTERNS = [
    { days: 'W', time_range: '12:00-14:50' },
    { days: 'M', time_range: '15:00-17:50' },
    { days: 'F', time_range: '13:00-15:50' },
    { days: 'T', time_range: '16:00-18:30' },
    { days: 'R', time_range: '17:00-19:30' },
  ];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const pad3 = (n) => String(n).padStart(3, '0');

  function sectionCountFor(course) {
    if (course.category === 'Core') return 3;
    if (course.category === 'Elective') return 2;
    if (course.category === 'General') return Math.random() < 0.5 ? 2 : 1;
    return 2;
  }

  function buildSectionMeetings() {
    const primary = Math.random() < 0.6 ? pick(MWF_PATTERNS) : pick(TR_PATTERNS);
    const meetings = [primary];
    if (Math.random() < 0.2) {
      meetings.push(pick(SINGLE_DAY_PATTERNS));
    }
    return meetings;
  }

  const courses = await Course.findAll();
  if (courses.length === 0) {
    console.log('No courses found — skipping offerings seed.');
    return;
  }

  let totalSlots = 0;
  let totalOfferings = 0;

  for (const course of courses) {
    const numSections = sectionCountFor(course);

    for (const semester of SEMESTERS) {
      await SemesterOffering.findOrCreate({
        where: { course_id: course.course_id, semester },
        defaults: { course_id: course.course_id, semester },
      });
      totalOfferings++;

      for (let s = 1; s <= numSections; s++) {
        const sectionNumber = pad3(s);
        const meetings = buildSectionMeetings();

        for (const meeting of meetings) {
          await TimeSlot.create({
            course_id: course.course_id,
            section_number: sectionNumber,
            semester,
            year: YEAR,
            days: meeting.days,
            time_range: meeting.time_range,
          });
          totalSlots++;
        }
      }
    }
  }

  console.log(
    `Offerings seeded: ${totalOfferings} semester offerings, ${totalSlots} time slots ` +
    `across ${courses.length} courses (${SEMESTERS.join(', ')} ${YEAR}).`
  );
}

async function seedPrerequisites() {
  const { Course, Prerequisite } = require('./models/index.js');

  const existing = await Prerequisite.count();
  if (existing > 0) {
    console.log(`Prerequisites already seeded (${existing} edges). Skipping.`);
    return;
  }

  const PREREQ_PAIRS = [

    ['CS 250',     'CS 150'],


    ['CS 312',     'CS 252'],
    ['CS 315',     'CS 252'],
    ['CS 330',     'CS 252'],
    ['CS 350',     'CS 252'],
    ['CS 355',     'CS 252'],
    ['CS 361',     'CS 252'],


    ['CS 330',     'CS 250'],
    ['CS 361',     'CS 250'],


    ['CS 350',     'CS 330'],
    ['CS 410/510', 'CS 330'],
    ['CS 411W/511','CS 330'],
    ['CS 411W/511','CS 350'],
    ['CS 441',     'CS 330'],
    ['CS 418',     'CS 330'],
    ['CS 432',     'CS 330'],
    ['CS 476',     'CS 330'],


    ['CS 450',     'CS 361'],
    ['CS 462',     'CS 361'],
    ['CS 463',     'CS 361'],
    ['CS 467',     'CS 361'],
    ['CS 486',     'CS 361'],
    ['CS 488',     'CS 361'],


    ['CS 390',     'CS 381'],
    ['CS 431',     'CS 381'],


    ['CS 455',     'CS 170'],


    ['CS 432',     'CS 312'],
    ['CS 487',     'CS 312'],


    ['CS 460',     'CS 355'],
    ['CS 478',     'CS 355'],


    ['CS 480',     'CS 411W/511'],
    ['CS 481',     'CS 480'],


    ['CYSE 300',   'CYSE 200T'],
    ['CYSE 301',   'CYSE 300'],
    ['CYSE 302',   'CYSE 300'],
    ['CYSE 400',   'CYSE 300'],
    ['CYSE 401',   'CYSE 302'],
    ['CYSE 402',   'CYSE 301'],
    ['CYSE 480',   'CYSE 400'],
    ['CYSE 481',   'CYSE 480'],


    ['MATH 212',   'MATH 211'],
    ['MATH 316',   'MATH 211'],
    ['STAT 330',   'MATH 211'],
    ['PHYS 232N',  'PHYS 231N'],


    ['ENGL 211C',  'ENGL 110C'],
    ['ENGL 112L',  'ENGL 110C'],
  ];


  const codes = new Set();
  for (const [a, b] of PREREQ_PAIRS) { codes.add(a); codes.add(b); }
  const courses = await Course.findAll({ where: { course_code: Array.from(codes) } });
  const idByCode = new Map(courses.map(c => [c.course_code, c.course_id]));

  let inserted = 0, skipped = 0;
  for (const [code, prereqCode] of PREREQ_PAIRS) {
    const courseId = idByCode.get(code);
    const prereqId = idByCode.get(prereqCode);
    if (!courseId || !prereqId || courseId === prereqId) {
      skipped++;
      continue;
    }
    await Prerequisite.create({
      course_id: courseId,
      prerequisite_course_id: prereqId,
    });
    inserted++;
  }

  console.log(
    `Prerequisites seeded: ${inserted} edges` +
    (skipped ? `, ${skipped} skipped (course not in catalog)` : '')
  );
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
      .filter(row => row.course_id);

    if (rows.length) await PlannedCourse.bulkCreate(rows);
    return plan;
  }

  const student1 = await User.findOne({ where: { username: 'Student1' } });
  if (student1) {

    await createSemesterPlan(student1.user_id, 'Computer Science', 'Fall', 2024, 'Historical', [
      ['ENGL 110C', 'Completed', 'A-'],
      ['MATH 211',  'Completed', 'B+'],   
      ['CS 150',    'Completed', 'A-'],   
      ['PSYC 201S', 'Completed', 'A' ],   
    ]);

    await createSemesterPlan(student1.user_id, 'Computer Science', 'Spring', 2025, 'Historical', [
      ['ENGL 211C', 'Completed', 'A' ],
      ['MATH 212',  'Completed', 'B' ],   
      ['CS 170',    'Completed', 'B+'],   
      ['CS 250',    'Completed', 'A' ],   
      ['CS 252',    'Completed', 'A-'],   
    ]);

    await createSemesterPlan(student1.user_id, 'Computer Science', 'Fall', 2025, 'Historical', [
      ['MATH 316',  'Completed', 'B+'],   
      ['CS 330',    'Completed', 'B+'],   
      ['CS 121G',   'Completed', 'A' ],   
      ['COMM 101R', 'Completed', 'A-'],   
      ['PHYS 231N', 'Completed', 'B' ],   
    ]);

    await createSemesterPlan(student1.user_id, 'Computer Science', 'Spring', 2026, 'Historical', [
      ['STAT 330',  'Completed', 'A-'],   
      ['CS 361',    'Completed', 'A-'],   
      ['CS 381',    'Completed', 'A' ],   
      ['HIST 100H', 'Completed', 'B+'],   
      ['PHYS 232N', 'Completed', 'B' ],   
    ]);

    await createSemesterPlan(student1.user_id, 'Computer Science', 'Fall', 2026, 'Approved', [
      ['CS 315',      'Enrolled', null],   
      ['CS 350',      'Enrolled', null],   
      ['CS 355',      'Enrolled', null],   
      ['ARTH 121A',   'Enrolled', null],   
      ['ENGL 112L',   'Enrolled', null],  
    ]);


    await createSemesterPlan(student1.user_id, 'Computer Science', 'Spring', 2027, 'Pending', [
      ['CS 390',    'Planned', null],   
      ['CS 410/510','Planned', null],   
      ['CS 411W/511','Planned', null], 
      ['PHIL 110P', 'Planned', null],   
    ]);

    await createSemesterPlan(student1.user_id, 'Computer Science', 'Fall', 2027, 'Draft', [
      ['CS 480',    'Planned', null],  
      ['CS 450',    'Planned', null],   
    ]);

    console.log('Student1: seeded 4 Historical + 1 Approved + 1 Pending + 1 Draft plans');
  }

  const student2 = await User.findOne({ where: { username: 'Student2' } });
  if (student2) {
    await createSemesterPlan(student2.user_id, 'Cybersecurity', 'Fall', 2026, 'Pending', [
      ['CYSE 200T', 'Planned', null],
      ['CS 150',    'Planned', null],
      ['ENGL 110C', 'Planned', null],
      ['MATH 211',  'Planned', null],
    ]);

    console.log('Student2: seeded 1 Pending plan for Fall 2026');
  }
}

async function seedDemoFeedback() {
  const { Plan, PlanFeedback } = require('./models/index.js');

  const advisor1 = await User.findOne({ where: { username: 'Advisor1' } });
  const student1 = await User.findOne({ where: { username: 'Student1' } });

  if (!advisor1) return;

  if (student1) {
    const approved = await Plan.findOne({
      where: { student_id: student1.user_id, status: 'Approved' },
    });
    if (approved) {
      await PlanFeedback.create({
        plan_id: approved.plan_id,
        advisor_id: advisor1.user_id,
        message:
          "Approved. Strong junior-fall load — CS 315/350/355 together is heavy " +
          "but you've got the prereqs for it. Keep ARTH and ENGL for lighter weeks. " +
          "Plan to take CS 410/411W together in Spring; we'll talk capstone in March.",
      });
      console.log('Advisor feedback seeded for Student1 Fall 2026 (Approved)');
    }
  }
}

async function seedStudent1Availability() {
  const { StudentAvailability } = require('./models/index.js');

  const student1 = await User.findOne({ where: { username: 'Student1' } });
  if (!student1) return;

  const existing = await StudentAvailability.count({
    where: { student_id: student1.user_id },
  });
  if (existing > 0) {
    console.log(`Student1 availability already seeded (${existing} rows). Skipping.`);
    return;
  }

  const slots = [
    { day: 'M', start_time: '13:00', end_time: '21:00' },
    { day: 'W', start_time: '13:00', end_time: '21:00' },
    { day: 'F', start_time: '13:00', end_time: '21:00' },

    { day: 'T', start_time: '08:00', end_time: '13:00' },
    { day: 'R', start_time: '08:00', end_time: '13:00' },
  ];

  await StudentAvailability.bulkCreate(
    slots.map(s => ({ student_id: student1.user_id, ...s }))
  );
  console.log(`Student1: seeded ${slots.length} availability windows`);
}


async function seedResources() {
  const count = await Resource.count();
  if (count > 0) return;

  const resources = [

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

const PORT = process.env.PORT || 3000;
sequelize.sync({ force: true })
  .then(async () => {
    console.log('Database synced.');

    await seedAdmin();
    await seedDemoUsers();
    await seedDemoCourses();
    await seedDemoPrograms();
    await seedOfferings();
    await seedPrerequisites();
    await assignDemoAdvisors();
    await seedDemoPlans();
    await seedDemoFeedback();
    await seedStudent1Availability();
    await seedResources();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));