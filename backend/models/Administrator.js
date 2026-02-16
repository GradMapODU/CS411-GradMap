import { DataTypes } from 'sequelize';
import { define } from '../config/db';

const Administrator = define('Administrator', {
    admin_id: {type: DataTypes.INTEGER, primaryKey: true},
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
}, {timestamps: false});

export default Administrator;