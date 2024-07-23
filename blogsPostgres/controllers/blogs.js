const jwt = require('jsonwebtoken')
const router = require('express').Router()
const { Op } = require('sequelize')
const logger = require('../util/logger')

const { extractUserFromToken } = require('../util/middleware')

const { Blog, User } = require('../models')

router.get('/', async (req, res) => {
  let where = {}

  if (req.query.search) {
    where = {
      [Op.or]: [
        { title: { [Op.substring] : req.query.search } },
        { author: { [Op.substring] : req.query.search } }
      ]
    }
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    },
    where,
    order: [
      ['likes', 'DESC']
    ]
  })
  res.json(blogs)
})

router.post('/', extractUserFromToken, async (req, res) => {
    const blog = await Blog.create({ 
      ...req.body, 
      userId: req.user.id
    })

    return res.status(201).json(blog)
})

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  next()
}
  
router.get('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    res.json(req.blog)
  } else {
    const error = new Error('Blog not found')
    error.name = 'NotFoundError'
    throw error
  }
})
  
router.delete('/:id', blogFinder, extractUserFromToken, async (req, res) => {
  if (req.blog) {
    if (req.blog.userId === req.user.id) {
      await req.blog.destroy()
      res.status(204).end()
      logger.info(`Blog with a title: ${req.blog.title}, and id: ${req.blog.id}, has been removed from the database.`)
    } else {
      const error = new Error('Only the creator of the blog can delete it.')
      error.name = 'NoPrivilegeError'
      throw error
    }
    
  } else {
    const error = new Error('Blog not found')
    error.name = 'NotFoundError'
    throw error
  }
})

router.put('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    req.blog.likes = req.body.likes
    await req.blog.save()
    res.json(req.blog)
  } else {
    const error = new Error('Blog not found')
    error.name = 'NotFoundError'
    throw error
  }
})

module.exports = router