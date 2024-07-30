const router = require('express').Router()
const bcrypt = require('bcrypt')
const { User, Blog } = require('../models')
const { extractUserFromToken } = require('../util/middleware')
const Session = require('../models/session')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: [
      {
        model: Blog,
        as: 'blogs',
        attributes: { exclude: ['userId'] }
      },
      {
        model: Blog,
        as: 'reads',
        through:{
          attributes:['id', 'read']
        },
        attributes: { exclude: ['userId']}
      } 
    ]
  })
  res.json(users)
})

router.post('/', async (req, res) => {
  const { password } = req.body
  if (password.length < 3) {
      return res.status(400).json({
          error: 'password too short, must be 3 chars or longer'
      })
  }
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const user = await User.build({ ...req.body, passwordHash })
  const savedUser = await user.save()
  await Session.create({ userId: user.id, active: false })
  res.status(201).json(savedUser)
})

router.put('/:username', extractUserFromToken, async (req, res) => {
  const { username } = req.params;
  const { newUsername, action, disabled } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!action) {
    return res.status(400).json({ error: 'Action for user management not given...'})
  }
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const sessionTarget = await Session.findOne({ where: { userId: user.id }})
  const sessionManager = await Session.findOne({ where: { userId: req.user.id }})
  if (!sessionManager.active) {
    return res.status(401).json({ error: 'Must be logged in to perform these operations '})
  }
  if (req.user.username !== username && !req.user.admin) {
    return res.status(401).json({ error: 'You must either be logged in as the user who is being changed or the admin.'})
  }
  if (action === 'changeUsername') {
    if (!newUsername || newUsername.length < 3) {
      return res.status(400).json({ error: 'New username is required' });
    }
    const existingUser = await User.findOne({ where: { username: newUsername } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }
    user.username = newUsername
    await user.save()
  } else if (action === 'disableEnable') {
    if (req.user.admin && sessionManager.active) {
      user.disabled = disabled
      await user.save()
      sessionTarget.active = false
      await sessionTarget.save()
    } else {
      res.status(401).json({ error: 'disabling or enabling users needs admin priviledges'})
    }
  }
  res.json({ message: 'User updated successfully', user });
});

router.get('/:id', async (req, res) => {
  let where = {}
  if (req.query.readsearch) {
    where = { read: req.query.readsearch }
  }
  const user = await User.findByPk(req.params.id, {
    include: [
      {
        model: Blog,
        as: 'blogs',
        attributes: { exclude: ['userId'] }
      },
      {
        model: Blog,
        as: 'reads',
        through: {
          attributes: ['id', 'read'],
          where
        },
        attributes: { exclude: ['userId']}
      } 
    ]
  })
  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})

module.exports = router