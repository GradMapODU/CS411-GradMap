import { DataTypes } from 'sequelize';
import { define } from '../config/db';
import User from './User';
import Advisor from './Advisor';

const Student = define('Student', {
    student_id: { type: DataTypes.INTEGER, primaryKey: true },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    major: DataTypes.STRING,
    year: DataTypes.INTEGER,
    advisor_id: DataTypes.INTEGER
}, { timestamps: false });

Student.belongsTo(User, { foreignKey: 'student_id' });
Student.belongsTo(Advisor, { foreignKey: 'advisor_id' });

export default Student;