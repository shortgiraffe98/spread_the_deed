module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Campaign", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
          },
          title: {
            type: DataTypes.STRING
          },
          description: {
            type: DataTypes.TEXT
          },
          goal_amount: {
            type: DataTypes.DECIMAL
          },
          raised_amount: {
            type: DataTypes.DECIMAL
          },
          start_date: {
            type: DataTypes.DATE
          },
          end_date: {
            type: DataTypes.DATE
          },
          status: {
            type: DataTypes.STRING
          },
          user_id: {
            type: DataTypes.INTEGER
          },
          createdAt: {
            allowNull: false,
            type: DataTypes.DATE
          },
          updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
          },
          comments_counter: {
            type: DataTypes.INTEGER
          }
    })
}