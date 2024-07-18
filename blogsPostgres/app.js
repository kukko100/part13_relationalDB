const config = require('./util/config')
const express = require('express')
require('express-async-errors')
const app = express()

const blogsRouter = require('./controllers/blogs')
const middleware = require('./util/middleware')
const logger = require('./util/logger')

const { connectToDatabase } = require('./util/db')

logger.info('connecting to database')

app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const start = async () => {
    await connectToDatabase()
}

start()

module.exports = app