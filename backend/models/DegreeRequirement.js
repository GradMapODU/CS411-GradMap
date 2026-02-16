import { DataTypes } from 'sequelize';
import { define } from '../config/db';
import Course from './Course';

const DegreeRequirement = define('DegreeRequirement', {
    requirement_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    degree_program: DataTypes.STRING,
    course_id: DataTypes.INTEGER,
    required: DataTypes.BOOLEAN
}, { timestamps: false });

DegreeRequirement.belongsTo(Course, { foreignKey: 'course_id' });

export default DegreeRequirement;