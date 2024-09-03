const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const HttpError = require('../models/http-error');

// Función para registrar un nuevo usuario
const register = async (req, res, next) => {
  console.log('Iniciando registro de usuario');
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Errores de validación:', errors.array());
    return next(new HttpError('Datos inválidos, por favor revisa tu información.', 422));
  }

  const { name, email, password, role } = req.body;
  console.log('Datos recibidos:', { name, email, password, role });

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
    console.log('Usuario existente:', existingUser);
  } catch (err) {
    console.log('Error al buscar usuario:', err);
    return next(new HttpError('El registro ha fallado, por favor intenta nuevamente más tarde.', 500));
  }

  if (existingUser) {
    return next(new HttpError('El usuario ya existe, por favor inicia sesión.', 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
    console.log('Contraseña hasheada:', hashedPassword);
  } catch (err) {
    console.log('Error al hashear contraseña:', err);
    return next(new HttpError('El registro ha fallado, por favor intenta nuevamente.', 500));
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    role
  });

  try {
    await createdUser.save();
    console.log('Usuario creado:', createdUser);
  } catch (err) {
    console.log('Error al guardar usuario:', err);
    return next(new HttpError('El registro ha fallado, por favor intenta nuevamente.', 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email, role: createdUser.role },
      'secret', // Asegúrate de usar tu clave secreta real
      { expiresIn: '1h' }
    );
    console.log('Token generado:', token);
  } catch (err) {
    console.log('Error al generar token:', err);
    return next(new HttpError('El registro ha fallado, por favor intenta nuevamente.', 500));
  }

  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};
// Función para iniciar sesión
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

// Función para listar usuarios (solo para admin)
const getUsers = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query; // Parámetros de paginación

  try {
    const users = await User.find({}, '-password') // Excluir el campo de la contraseña
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

// Función para actualizar un usuario (solo para admin)
const updateUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const userId = req.params.uid;

  try {
    let user = await User.findById(userId);

    if (!user) {
      return next(new HttpError('Usuario no encontrado.', 404));
    }

    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      try {
        user.password = await bcrypt.hash(password, 12);
      } catch (err) {
        return next(new HttpError('Algo salió mal, no se pudo actualizar la contraseña.', 500));
      }
    }

    user.role = role || user.role; // Actualizar el rol solo si se proporciona uno nuevo

    await user.save();
    res.status(200).json({ user: user.toObject({ getters: true }) });
  } catch (err) {
    return next(new HttpError('Algo salió mal, no se pudo actualizar el usuario.', 500));
  }
};

// Función para eliminar un usuario (solo para admin)
const deleteUser = async (req, res, next) => {
  const userId = req.params.uid;

  try {
    let user = await User.findById(userId);
    if (!user) {
      return next(new HttpError('Usuario no encontrado.', 404));
    }

    await user.deleteOne({ _id: userId });
    res.status(200).json({ message: 'Usuario eliminado.' });
  } catch (err) {
    console.error('Error al eliminar el usuario:', err);
    return next(new HttpError('Algo salió mal, no se pudo eliminar el usuario.', 500));
  }
};

module.exports = { register, login, deleteUser, updateUser, getUsers };
