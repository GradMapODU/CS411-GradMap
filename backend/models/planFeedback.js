module.exports = (sequelize, DataTypes) => {
    const PlanFeedback = sequelize.define('PlanFeedback', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        plan_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        advisor_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });

    return PlanFeedback;
};