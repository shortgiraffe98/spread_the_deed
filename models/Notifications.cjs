const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Notification", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
          },
          user_id: {
            allowNull: false,
            type: DataTypes.INTEGER
          },
          type: {
            allowNull: false,
            type: DataTypes.TEXT
          },
          transaction_id: {
            allowNull: false,
            type: DataTypes.INTEGER
          },
          createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW
          },
          updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW
          },
          creator_checked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
          }
    })
}