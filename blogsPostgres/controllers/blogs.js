const jwt = require('jsonwebtoken')
const router = require('express').Router()
const logger = require('../util/logger')

const { extractUserFromToken } = require('../util/middleware')

const { Blog, User } = require('../models')

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    }
  })
  res.json(blogs)
})

router.post('/', extractUserFromToken, async (req, res) => {
  try {
    const blog = await Blog.create({ 
      ...req.body, 
      userId: req.user.id
    })

    return res.status(201).json(blog)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'An error occurred while creating the blog' })
  }
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