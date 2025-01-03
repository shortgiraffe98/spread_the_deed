const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Donation", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
          },
          description: {
            type: DataTypes.TEXT
          },
          amount: {
            type: DataTypes.DECIMAL,
            allowNull: false,
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
          campaign_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          creator_checked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
          }
    })
}
