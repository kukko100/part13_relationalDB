//Headers authorization and sessionId are sent through req.header in postman
const app = require('./app')


  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })