const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("CampaignImage", {
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
    base64_image: {
        type: DataTypes.BLOB('medium'),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        default: Sequelize.NOW
    },
    updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        default: Sequelize.NOW
    },
    })
}
