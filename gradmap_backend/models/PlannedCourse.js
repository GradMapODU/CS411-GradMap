import { DataTypes } from 'sequelize';
import { define } from '../config/db';
import Course from './Course';
import Plan from './Plan';

const PlannedCourse = define('PlannedCourse', {
    plan_course_id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    plan_id: DataTypes.INTEGER,
    course_id: DataTypes.INTEGER,
    semester: DataTypes.STRING,
    year: DataTypes.INTEGER
}, {timestamps: false});

PlannedCourse.belongsTo(Course, {foreignKey: 'course_id'});
PlannedCourse.belongsTo(Plan, {foreignKey: 'plan_id'});

export default PlannedCourse;