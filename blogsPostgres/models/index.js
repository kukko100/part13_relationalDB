const Blog = require('./blog')
const User = require('./user')

// Set up associations
User.hasMany(Blog)
Blog.belongsTo(User)

// Function to sync models
const syncModels = async () => {
  try {
    await User.sync({ alter: true })
    await Blog.sync({ alter: true })
    console.log('Models synced successfully')
  } catch (error) {
    console.error('Error syncing models:', error)
  }
}

// Export models and sync function
module.exports = {
  Blog, 
  User,
  syncModels
}