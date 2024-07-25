const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const User = require('../models/user')
const Session = require('../models/session')

router.post('/', async (req, res) => {
  const body = req.body

  const user = await User.findOne({
    where: {
      username: body.username
    }
  })

  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'invalid username or password'
    })
  }
  let session = await Session.findOne({ where: { userId: user.id } })
  if (!session) {
    await Session.create({ userId: user.id, active: true });
    session = await Session.findOne({ where: { userId: user.id } })
  }

  if (user.disabled) {
    session.active = false
    await session.save()
    return res.status(401).json({
      error: 'account disabled, please contact admin'
    })
  }

  const userForToken = {
    username: user.username,
    id: user.id,
    sessionId: session.id
  }

  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: "1h" }
  )

  
  session.active = true
  await session.save()

  res
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = router