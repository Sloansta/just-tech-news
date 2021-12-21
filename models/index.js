const User = require('./User')
const Post = require('./Post')

Post.hasOne(User, {
    foreignKey: 'user_id'
})

module.exports = { User, Post }