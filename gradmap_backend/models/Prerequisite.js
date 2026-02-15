import { DataTypes } from 'sequelize';
import { define } from '../config/db';
import Course from './Course';

const Prerequisite = define('Prerequisite', {
    course_id: { type: DataTypes.INTEGER, primaryKey: true },
    prerequisite_course_id: { type: DataTypes.INTEGER, primaryKey: true }
}, { timestamps: false });

Prerequisite.belongsTo(Course, { foreignKey: 'course_id' });
Prerequisite.belongsTo(Course, { foreignKey: 'prerequisite_course_id', as: 'prereq' });

export default Prerequisite;