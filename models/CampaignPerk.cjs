module.exports = (sequelize, DataTypes) => {
    return sequelize.define("CampaignPerk", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
          },
          title: {
            allowNull: false,
            type: DataTypes.STRING
          },
          amount: {
            allowNull: false,
            type: DataTypes.DECIMAL
          },
          base64_image: {
            allowNull: false,
            type: DataTypes.BLOB('medium')
          },
          campaign_id: {
            allowNull: false,
            type: DataTypes.INTEGER
          }
    })
}