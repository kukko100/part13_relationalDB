const router = require('express').Router()
const bcrypt = require('bcrypt')
const { User, Blog } = require('../models')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
        model: Blog,
        attributes: { exclude: ['userId'] }
    }
  })
  res.json(users)
})

router.post('/', async (req, res) => {
    const { username, name, password } = req.body
    if (password.length < 3) {
        return res.status(400).json({
            error: 'password too short, must be 3 chars or longer'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = await User.build({ ...req.body, passwordHash })
    const savedUser = await user.save()
    
    res.status(201).json(savedUser)
})


router.put('/:username', async (req, res) => {
    const { username } = req.params;
    const { newUsername } = req.body;

    // Validate input
    if (!newUsername || newUsername.length < 3) {
      return res.status(400).json({ error: 'New username is required' });
    }

    // Find the user by the current username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the new username is already taken
    const existingUser = await User.findOne({ where: { username: newUsername } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Update the username
    user.username = newUsername;
    await user.save();

    res.json({ message: 'Username updated successfully', user });
});

router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id)
  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})

module.exports = router