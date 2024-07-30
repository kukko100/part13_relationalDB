const router = require('express').Router()
const Session = require('../models/session')
const { extractUserFromToken } = require('../util/middleware')

router.post('/', extractUserFromToken, async (req, res) => {
  const userFromToken = req.user
  const session = await Session.findOne({ where: { userId: userFromToken.id } })
  if (!session.active) {
    const error = new Error('You have already logged out or are not logged in.')
    error.name = 'NotLoggedInError'
    throw error
  }
  session.active = false
  await session.save()
  res.status(200).send('user logged out')
})

module.exports = router