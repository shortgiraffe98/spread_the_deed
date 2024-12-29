module.exports = (sequelize, DataTypes) => {
    return sequelize.define("DonateHistory", {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        validate: {
            notEmpty: true
        }
    },
    campaign_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    amount: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    donate_username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    creator_checked: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        validate: {
            notEmpty: true
        }
    }
    })
}