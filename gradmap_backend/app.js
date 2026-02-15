import express from 'express';
import { json } from 'body-parser';
import { sync } from './config/db';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import advisorRoutes from './routes/advisorRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// Middleware
app.use(json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/admins', adminRoutes);

// Test endpoint
app.get('/', (req, res) => {
    res.send('GradMap backend running');
});

const { hashPassword } = require('./utils/hash');
const User = require('./models/User');
const Administrator = require('./models/Administrator');

async function seedAdmin() {
    const exists = await User.findOne({ where: { username: 'admin' } });
    if (!exists) {
        const hashed = await hashPassword('Admin123!');
        const user = await User.create({ username: 'admin', password_hash: hashed, role: 'Administrator' });
        await Administrator.create({ admin_id: user.user_id, first_name: 'Default', last_name: 'Admin', access_level: 1 });
        console.log('Default admin created: username=admin, password=Admin123!');
    }
}


// Sync database and start server
const PORT = process.env.PORT || 3000;
sync({ alter: true }) // { force: true } to reset DB
    .then(async() => {
        console.log('Database synced.');

        await seedAdmin();
        
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('DB connection error:', err));