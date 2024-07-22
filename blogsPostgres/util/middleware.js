const logger = require('./logger')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method)
  logger.info('Path:  ', req.path)
  logger.info('Body:  ', req.body)
  logger.info('---')
  next()
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
  }

  next()
}


const extractUserFromToken = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1]
  const decodedToken = jwt.verify(token, process.env.SECRET)
  
  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid' })
  }
  
  req.user = await User.findByPk(decodedToken.id)
  
  if (!req.user) {
    return res.status(404).json({ error: 'user not found' })
  }
  next()
}

const userExtractor = (req, res, next) => {
  req.user = req.body.username
  next()
}

const authorExtractor = (req, res, next) => {
  req.author = req.body.author
  next()
}

const unknownEndpoint = (req, res, next) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(400).json({ error: error.message })
  } else if (error.name === 'TokenExpiredError') {
    return res.status(400).json({ error: 'token expired' })
  } else if (error.name === 'SequelizeValidationError') {
    const messages = error.errors.map(e => e.message)
    return res.status(400).json({ error: messages })
  } else if (error.name === 'NotFoundError') {
    return res.status(404).json({ error: error.message })
  } else if (error.name === 'NoPrivilegeError') {
    return res.status(401).json({ error: error.message })
  }
  next(error)
}

module.exports = {
  requestLogger,
  tokenExtractor,
  userExtractor,
  authorExtractor,
  unknownEndpoint,
  errorHandler,
  extractUserFromToken
}