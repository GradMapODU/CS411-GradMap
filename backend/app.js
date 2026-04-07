const express = require('express');
const { sequelize, User, Admin, Student, Advisor } = require('./models/index.js');
const bcrypt = require('bcrypt');
const authRoutes = require('./routes/authRoutes.js');
const studentRoutes = require('./routes/studentRoutes.js');
const advisorRoutes = require('./routes/advisorRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/admins', adminRoutes);

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
//#endregion

// Sync database and start server
const PORT = process.env.PORT || 3000;
sequelize.sync({ force: true }) // { force: true } to reset DB
    .then(async() => {
        console.log('Database synced.');

        await seedAdmin();
        await seedDemoUsers();
        await assignDemoAdvisors();
        
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('DB connection error:', err));