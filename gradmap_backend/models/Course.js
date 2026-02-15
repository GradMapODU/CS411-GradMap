import { DataTypes } from 'sequelize';
import { define } from '../config/db';

const Course = define('Course', {
    course_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    course_code: DataTypes.STRING,
    course_name: DataTypes.STRING,
    credits: DataTypes.INTEGER,
    department: DataTypes.STRING
}, { timestamps: false });

export default Course;