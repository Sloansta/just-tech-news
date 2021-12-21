const { Model, DataTypes } = require('sequelize')
const sequelize = require('../config/connection')
const bcrypt = require('bcrypt')

// create the user model

class User extends Model {
    // set up method to run on instance data (per user) to check password
    checkPassword(loginPw) {
        return bcrypt.compareSync(loginPw, this.password)
    }
}

// define table columbs and confirguration

User.init(
    {
        // define an id column
        id: {
            // user the special Sequelize DataTypes object provide what type of data it is
            type: DataTypes.INTEGER,

            // this is the equivalent of SQL's NOT NULL option
            allowNull: false,

            // instruct that this is the primary key
            primaryKey: true,

            // turn on auto increment
            autoIncrement: true
        },

        // define username column
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },

        // define an email column
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            // there cannot be any duplicate email values in this table
            unique: true,
            // if allowNull is set to false, we can run our data through validator
            validate: {
                isEmail: true
            }
        },

        // define password column
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                // this means the password must be at least four characters long
                len: [4]
            }
        }
    },
    {
        // TABLE CONFIGURATION OPTIONS GO HERE 

        // hooks that encrypt the users password for more security
        hooks: {
           async beforeCreate(newUserData) {
                newUserData.password = await bcrypt.hash(newUserData.password, 10)
                return newUserData
            },

            // setup beforeUpdate lifecycle "hook" functionality
            async beforeUpdate(updatedUserData) {
                updatedUserData.password = await bcrypt.hash(updatedUserData.password, 10)
                return updatedUserData
            }
        },

        // pass in our imported sequelize connection
        sequelize,

        // don't automatically create createdAt/updateAt timestamp fields
        timestamps: false,

        // don't pluralize name of database table
        freezTableName: true,

        // use underscores instead of camel-casing
        underscored: true,

        // make it so our model name stays lowercase in the database
        modelName: 'user'
    }
)

module.exports = User