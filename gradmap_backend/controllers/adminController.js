import { create, destroy } from '../models/User';
import { hashPassword } from '../utils/hash';

export async function createUser(req, res) {
    const { username, password, role } = req.body;
    try {
        const password_hash = await hashPassword(password);
        const user = await create({ username, password_hash, role });
        res.json({ message: 'User created', user_id: user.user_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

export async function deleteUser(req, res) {
    const id = req.params.id;
    try {
        await destroy({ where: { user_id: id } });
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}