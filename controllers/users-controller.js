const HttpError = require('../models/http-error');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');





// Registro de un nuevo usuario (solo disponible para admin)
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Datos inválidos, por favor revisa tu información.', 422));
  }

  const { name, email, password, role } = req.body;


  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError('El registro falló, por favor intenta nuevamente más tarde.', 500));
  }

  if (existingUser) {
    return next(new HttpError('El usuario ya existe, por favor inicia sesión.', 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError('No se pudo crear el usuario, por favor intenta nuevamente.', 500));
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    role
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError('El registro falló, por favor intenta nuevamente.', 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email, role: createdUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  } catch (err) {
    return next(new HttpError('El registro falló, por favor intenta nuevamente.', 500));
  }

  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};

// Listar todos los usuarios (solo disponible para admin)
const getUsers = async (req, res, next) => {
  

  const { page = 1, limit = 10 } = req.query; // Parámetros de paginación

  let users;
  try {
    users = await User.find({}, '-password') // Excluir el campo de la contraseña
      .limit(limit * 1) // Limitar el número de resultados
      .skip((page - 1) * limit) // Saltar los resultados anteriores
      .exec();

    const count = await User.countDocuments({}); // Contar el total de usuarios
    
    res.json({
      users: users.map(user => user.toObject({ getters: true })),
      totalPages: Math.ceil(count / limit), // Calcular el número total de páginas
      currentPage: page, // Página actual
    });
  } catch (err) {
    const error = new HttpError('No se pudo obtener la lista de usuarios, por favor intenta nuevamente más tarde.', 500);
    return next(error);
  }
};







// Login de un usuario
const login = async (req, res, next) => {
  const { email, password } = req.body;
 
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError('No se pudo iniciar sesión, por favor intenta nuevamente más tarde.', 500));
  }

  if (!existingUser) {
    return next(new HttpError('Credenciales incorrectas, no se pudo iniciar sesión.', 403));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError('No se pudo iniciar sesión, por favor intenta nuevamente.', 500));
  }

  if (!isValidPassword) {
    return next(new HttpError('Credenciales incorrectas, no se pudo iniciar sesión.', 403));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email, role: existingUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  } catch (err) {
    return next(new HttpError('No se pudo iniciar sesión, por favor intenta nuevamente.', 500));
  }

    // Devuelve el rol junto con el token
    res.json({ userId: existingUser.id, email: existingUser.email, token: token, role: existingUser.role });
};




module.exports = {
  signup,
  getUsers,
  login,
 
};
