module.exports = (sequelize, DataTypes) => {
    return sequelize.define("User", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        username: {
            primaryKey: true,
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        profile_image: {
            type: DataTypes.BLOB("medium"),
        },
        avatar: {
            type: DataTypes.BLOB("medium"),
        },
        country: {
            type: DataTypes.STRING,
        },
        city: {
            type: DataTypes.STRING,
        },
        short_description: {
            type: DataTypes.STRING,
        },
        firstname: {
            type: DataTypes.STRING,
        },
        lastname: {
            type: DataTypes.STRING,
        },
        about_me: {
            type: DataTypes.TEXT,
        },
        contributions_counter: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        campaigns_counter: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        comments_counter: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        unread_notifications: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    })
}
