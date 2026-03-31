const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
});



//Entities
const User = sequelize.define('User', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('Student', 'Advisor', 'Admin'), allowNull: false }
}, { timestamps: false });

const Student = sequelize.define('Student', {
    student_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: User, key: 'user_id' } },
    first_name: DataTypes.STRING(100),
    last_name: DataTypes.STRING(100),
    major: DataTypes.STRING(100),
    year: DataTypes.INTEGER,
    GPA: DataTypes.STRING(10),
    advisor_id: DataTypes.INTEGER
}, { timestamps: false });

const Advisor = sequelize.define('Advisor', {
    advisor_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: User, key: 'user_id' } },
    first_name: DataTypes.STRING(100),
    last_name: DataTypes.STRING(100),
    department: DataTypes.STRING(100)
}, { timestamps: false });

const Admin = sequelize.define('Administrator', {
    admin_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: User, key: 'user_id' } },
    first_name: DataTypes.STRING(100),
    last_name: DataTypes.STRING(100),
    access_level: DataTypes.INTEGER
}, { timestamps: false });

const Course = sequelize.define('Course', {
    course_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_code: DataTypes.STRING(10),
    course_name: DataTypes.STRING(100),
    credits: DataTypes.INTEGER,
    department: DataTypes.STRING(100),
    category: DataTypes.ENUM('Core', 'Elective', 'General'),
    difficulty: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
    course_description: DataTypes.TEXT,
    seat_availability: DataTypes.INTEGER,
}, { timestamps: false });

const TimeSlot = sequelize.define('Time_Slot', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: DataTypes.INTEGER,
    days: DataTypes.STRING(10), //"MWF", "TR"
    time_range: DataTypes.STRING(50) // "09:00-10:15"
}, { timestamps: false });

const Program = sequelize.define('Program', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING(100),
    total_credits_required: DataTypes.INTEGER
}, { timestamps: false, tableName: 'programs' });

const ProgramCourse = sequelize.define('Program_Course', {
    program_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: Program, key: 'id' } },
    course_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: Course, key: 'course_id' } },
    requirement_type: DataTypes.ENUM('Core', 'Elective', 'General') 
}, { timestamps: false, tableName: 'program_courses' });

const SemesterOffering = sequelize.define('Semester_Offering', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: DataTypes.INTEGER,
    semester: DataTypes.ENUM('Fall', 'Spring', 'Summer', 'Winter')
}, { timestamps: false, tableName: 'semester_offerings' });

const Prerequisite = sequelize.define('Prerequisite', {
    course_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: Course, key: 'course_id' } },
    prerequisite_course_id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: Course, key: 'course_id' } }
}, { timestamps: false, tableName: 'Prerequisites' });

const Plan = sequelize.define('Plan', {
    plan_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    student_id: DataTypes.INTEGER,
    degree_program: DataTypes.STRING(100),
    creation_date: DataTypes.DATE,
    status: { type: DataTypes.ENUM('Draft', 'Pending', 'Approved', 'Needs Revision'), defaultValue: 'Draft' },
}, { timestamps: false });

const PlannedCourse = sequelize.define('Planned_Course', {
    planned_course_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    plan_id: DataTypes.INTEGER,
    course_id: DataTypes.INTEGER,
    semester: DataTypes.STRING(10),
    year: DataTypes.INTEGER
}, { timestamps: false });

const PlanFeedback = sequelize.define('PlanFeedback', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    plan_id: DataTypes.INTEGER,
    advisor_id: DataTypes.INTEGER,
    message: DataTypes.TEXT,
}, { timestamps: false });

//Relationships
User.hasOne(Student, { foreignKey: 'student_id' });
User.hasOne(Advisor, { foreignKey: 'advisor_id' });
User.hasOne(Admin, { foreignKey: 'admin_id' });

Advisor.hasMany(Student, { foreignKey: 'advisor_id' });
Student.belongsTo(Advisor, { foreignKey: 'advisor_id' });

Student.hasMany(Plan, { foreignKey: 'student_id' });
Plan.belongsTo(Student, { foreignKey: 'student_id' });

Plan.hasMany(PlannedCourse, { foreignKey: 'plan_id' });
PlannedCourse.belongsTo(Plan, { foreignKey: 'plan_id' });

Course.hasMany(PlannedCourse, { foreignKey: 'course_id' });
PlannedCourse.belongsTo(Course, { foreignKey: 'course_id' });

Course.hasMany(TimeSlot, { foreignKey: 'course_id' });
TimeSlot.belongsTo(Course, { foreignKey: 'course_id' });

Plan.hasMany(PlanFeedback, { foreignKey: 'plan_id' });
PlanFeedback.belongsTo(Plan, { foreignKey: 'plan_id' });

Advisor.hasMany(PlanFeedback, { foreignKey: 'advisor_id' });
PlanFeedback.belongsTo(Advisor, { foreignKey: 'advisor_id' });

// Program to Course (Many-to-Many)
Program.belongsToMany(Course, { through: ProgramCourse, foreignKey: 'program_id' });
Course.belongsToMany(Program, { through: ProgramCourse, foreignKey: 'course_id' });

// Course to SemesterOffering (One-to-Many)
Course.hasMany(SemesterOffering, { foreignKey: 'course_id' });
SemesterOffering.belongsTo(Course, { foreignKey: 'course_id' });

// Course to Prerequisites 
Course.belongsToMany(Course, { 
    as: 'RequiredPrerequisites', 
    through: Prerequisite, 
    foreignKey: 'course_id', 
    otherKey: 'prerequisite_course_id' 
});

module.exports = { 
    sequelize, User, Student, Advisor, Admin, Course, 
    Plan, PlannedCourse, TimeSlot, Program, ProgramCourse, 
    SemesterOffering, Prerequisite, PlanFeedback 
};