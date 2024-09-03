
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const register = async (req, res, next) => {
  const { email, password, role } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return res.status(500).json({ message: 'El registro ha fallado.' });
  }

  if (existingUser) {
    return res.status(422).json({ message: 'El usuario ya existe.' });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return res.status(500).json({ message: 'El registro ha fallado.' });
  }

  const createdUser = new User({
    email,
    password: hashedPassword,
    role: role || 'user'
  });

  try {
    await createdUser.save();
  } catch (err) {
    return res.status(500).json({ message: 'El registro ha fallado.' });
  }

  res.status(201).json({ userId: createdUser.id, email: createdUser.email });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    return res.status(500).json({ message: 'El login ha fallado.' });
  }

  if (!user) {
    return res.status(403).json({ message: 'Credenciales incorrectas.' });
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    return res.status(500).json({ message: 'El login ha fallado.' });
  }

  if (!isValidPassword) {
    return res.status(403).json({ message: 'Credenciales incorrectas.' });
  }

  let token;
  try {
    token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (err) {
    return res.status(500).json({ message: 'El login ha fallado.' });
  }

  res.json({ userId: user.id, email: user.email, token: token });
};

module.exports = { register, login };
