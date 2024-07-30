const router = require('express').Router()
const { Read } = require('../models')
const Session = require('../models/session')
const { extractUserFromToken } = require('../util/middleware')

router.get('/', async (req, res) => {
  const reads = await Read.findAll({
  })
  res.json(reads)
})

router.get('/:id', async (req, res) => {
  const read = await Read.findByPk(req.params.id, {
    attributes: { exclude: ['id', 'userId', 'blogId'] }
  })
  if (read) {
    res.json(read)
  } else {
    const error = new Error('Read not found')
    error.name = 'NotFoundError'
    throw error
  }
})

router.post('/', extractUserFromToken, async (req, res) => {
  const session = await Session.findOne({ where: { userId: req.user.id }})
  if (!session.active) {
    const error = new Error('Only logged in users may add readings')
    error.name = 'NoPrivilegeError'
    throw error
  }
  const { blogId } = req.body
  await Read.create({ blogId: blogId, userId: req.user.id })
  res.status(200).send('reading created')
})

router.put('/:id', extractUserFromToken, async (req, res) => {
  const session = await Session.findOne({ where: { userId: req.user.id }})
  const read = await Read.findByPk(req.params.id)
  if (read && session.active) {
    if (req.user.id === read.userId || req.user.admin) {
      read.read = req.body.read
      await read.save()
      res.json(read)
    } else {
      const error = new Error('Only the owner can change his own reading list')
      error.name = 'NoPrivilegeError'
      throw error
    }
  } else {
    const error = new Error('Reading not found')
    error.name = 'NotFoundError'
    throw error
  }
})

module.exports = router