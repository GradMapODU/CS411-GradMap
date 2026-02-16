import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('gradmap_db', 'root', '1424042004', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});

export default sequelize;