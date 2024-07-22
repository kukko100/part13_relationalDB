const app = require('./app')
const { Blog, User, syncModels } = require('./models')

syncModels().then(() => {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch(error => {
  console.error('Unable to sync models:', error)
})