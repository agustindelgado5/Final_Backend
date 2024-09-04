const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/users-controller'); 
const { checkAuth, checkAdmin } = require('../middleware/check-auth');

const router = express.Router();




router.post('/login', usersController.login); 


router.use(checkAuth); // Proteger todas las rutas siguientes

// Aplico el middleware checkAdmin de manera global para las siguientes rutas
router.use(checkAdmin);


router.post(
  '/signup',
   // Solo admin puede registrar usuarios
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
    check('role').not().isEmpty()
  ],
  usersController.signup
);



router.get('/', usersController.getUsers); // Solo admin puede listar usuarios



module.exports = router;
