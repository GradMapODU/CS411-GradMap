import { findOne } from '../models/User';
import { comparePassword } from '../utils/hash';
import { sign } from 'jsonwebtoken';

const SECRET_KEY = 'gradmap_demo_secret'; // for demo

export async function login(req, res) {
    const { username, password } = req.body;
    try {
        const user = await findOne({ where: { username } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const valid = await comparePassword(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid password' });

        const token = sign({ user_id: user.user_id, role: user.role }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ token, role: user.role, user_id: user.user_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}