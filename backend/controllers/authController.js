const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Student, Advisor, Admin } = require('../models');

exports.register = async (req, res) => {
    try {
        const { username, password, role, first_name, last_name, major, department } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({ username, password_hash: hashedPassword, role });

        if (role === 'Student') await Student.create({ student_id: user.user_id, first_name, last_name, major });
        if (role === 'Advisor') await Advisor.create({ advisor_id: user.user_id, first_name, last_name, department });
        if (role === 'Admin') await Admin.create({ admin_id: user.user_id, first_name, last_name, access_level: 1 });

        res.status(201).json({ message: `${role} registered successfully` });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role });
    } catch (error) { res.status(500).json({ error: error.message }); }
    
};

