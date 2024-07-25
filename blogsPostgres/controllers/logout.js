const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const User = require('../models/user')
const Session = require('../models/session')
const { extractUserFromToken } = require('../util/middleware')

router.post('/', extractUserFromToken, async (req, res) => {
  const userFromToken = req.user

  const user = await User.findOne({
    where: {
      username: userFromToken.username
    }
  })

  const session = await Session.findOne({ where: { userId: userFromToken.id } })
  if (!session.active) {
    const error = new Error('You have already logged out or are not logged in.')
    error.name = 'NotLoggedInError'
    throw error
  }
  if (session) {
    session.active = false
    await session.save()
  } else {
    await Session.create({ userId: user.id, active: false });
  }

  res.status(200).send('user logged out')
})

module.exports = router