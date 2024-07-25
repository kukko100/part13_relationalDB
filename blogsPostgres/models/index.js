const Blog = require('./blog')
const User = require('./user')
const Read = require('./read')

User.hasMany(Blog)
Blog.belongsTo(User)

User.belongsToMany(Blog, { through: Read, as: 'reads' })
Blog.belongsToMany(User, { through: Read, as: 'readers' })

module.exports = {
  Blog,
  User,
  Read
}