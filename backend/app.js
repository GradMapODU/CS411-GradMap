const express = require('express');
const {sequelize, User, Admin} = require('./models/index.js');
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


// Sync database and start server
const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }) // { force: true } to reset DB
    .then(async() => {
        console.log('Database synced.');

        await seedAdmin();
        
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('DB connection error:', err));