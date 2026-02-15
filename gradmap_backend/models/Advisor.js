import { DataTypes } from 'sequelize';
import { define } from '../config/db';
import User from './User';

const Advisor = define('Advisor', {
    advisor_id: { type: DataTypes.INTEGER, primaryKey: true },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    department: DataTypes.STRING
}, { timestamps: false });

Advisor.belongsTo(User, { foreignKey: 'advisor_id' });

export default Advisor;