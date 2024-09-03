const express = require('express');
const { getUsers, deleteUser } = require('../controllers/user-controller');
const { checkAuth, checkAdmin } = require('../middleware/check-auth');


const router = express.Router();

// Estas rutas son solo accesibles por administradores
router.use(checkAuth); // Proteger todas las rutas siguientes
// Aplico el middleware checkAdmin de manera global para las siguientes rutas
router.use(checkAdmin);
router.get('/',getUsers);
router.delete('/:id' ,deleteUser);

module.exports = router;
