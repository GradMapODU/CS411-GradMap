import { DataTypes } from 'sequelize';
import { define } from '../config/db';
import User from './User';

const Plan = define('Plan', {
    plan_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    student_id: DataTypes.INTEGER,
    degree_program: DataTypes.STRING,
    create_date: DataTypes.DATE,
    status: DataTypes.ENUM( 'Archived', 'Approved'),
    term: DataTypes.STRING,
    day_of_week: DataTypes.STRING,
    time_start: DataTypes.TIME,
    time_end: DataTypes.TIME
}, {timestamps: false});

Plan.belongsTo(User, {foreignKey: 'student_id'});

export default Plan;