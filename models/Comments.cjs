module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Comment", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
          },
          user_id: {
            type: DataTypes.INTEGER
          },
          comment: {
            type: DataTypes.TEXT
          },
          campaign_id: {
            type: DataTypes.INTEGER
          },
          createdAt: {
            allowNull: false,
            type: DataTypes.DATE
          },
          updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
          }
    })
}