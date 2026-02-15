import { DataTypes } from 'sequelize';
import { define } from '../config/db';

const User = define('User', {
    user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Student', 'Advisor', 'Administrator'), allowNull: false }
}, { timestamps: false });

export default User;