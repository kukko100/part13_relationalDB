const router = require('express').Router()
const logger = require('../util/logger')

const { Blog } = require('../models')

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll()
  console.log(JSON.stringify(blogs, null, 2))
  res.json(blogs)
})
  
router.post('/', async (req, res) => {
    const blog = await Blog.create(req.body)
    return res.json(blog)
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
  
router.delete('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    await req.blog.destroy()
    res.status(204).end()
    logger.info(`Blog with a title: ${req.blog.title}, and id: ${req.blog.id}, has been removed from the database.`)
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