import { hash as _hash, compare } from 'bcrypt';

const SALT_ROUNDS = 10;

// Hash a plain password
async function hashPassword(password) {
    return await _hash(password, SALT_ROUNDS);
}

// Compare plain password with hash
async function comparePassword(password, hash) {
    return await compare(password, hash);
}

export default { hashPassword, comparePassword };