import { create, findByPk, findAll } from '../models/User';
import { create as _create } from '../models/Student';
import { create as __create } from '../models/Advisor';
import { create as ___create } from '../models/Administrator';
import { hashPassword } from '../utils/hash';

/**
 * Create a new user with the given role
 * @param {Object} userData - { username, password, role, first_name, last_name, department/major, advisor_id }
 */
async function createUser(userData) {
    const { username, password, role } = userData;
    const password_hash = await hashPassword(password);

    // Create User entry
    const user = await create({ username, password_hash, role });

    // Create role-specific entry
    if (role === 'Student') {
        await _create({
            student_id: user.user_id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            major: userData.major,
            year: userData.year || 1,
            advisor_id: userData.advisor_id
        });
    } else if (role === 'Advisor') {
        await __create({
            advisor_id: user.user_id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            department: userData.department
        });
    } else if (role === 'Administrator') {
        await ___create({
            admin_id: user.user_id,
            first_name: userData.first_name,
            last_name: userData.last_name,
        });
    }

    return user;
}

/**
 * Delete a user by ID (and cascading role entry)
 * @param {Number} user_id
 */
async function deleteUser(user_id) {
    const user = await findByPk(user_id);
    if (!user) throw new Error('User not found');
    await user.destroy();
    return true;
}

/**
 * Get all users 
 * @param {String} role
 */
async function getUsers(role) {
    const where = role ? { role } : {};
    return await findAll({ where });
}

export default { createUser, deleteUser, getUsers };