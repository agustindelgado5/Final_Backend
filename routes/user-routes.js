const express = require('express');
const { check } = require('express-validator');
const { getUsers, deleteUser, login, register } = require('../controllers/users-controller');
const { checkAuth, checkAdmin } = require('../middleware/check-auth');

const router = express.Router();

// Ruta para el login (accesible sin autenticación)
router.post('/login', login);


router.use(checkAuth); // Proteger todas las rutas siguientes

// Aplico el middleware checkAdmin de manera global para las siguientes rutas
router.use(checkAdmin);


// Ruta para registrar un nuevo usuario (solo accesible por administradores)
router.post(
  '/register',
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
    check('role').not().isEmpty()
  ],
  register
);



// Ruta para listar todos los usuarios (solo accesible por administradores)
router.get('/', getUsers);

// Ruta para eliminar un usuario por ID (solo accesible por administradores)
router.delete('/:id', deleteUser);

module.exports = router;
