const express = require('express');

const router = express.Router();
const controllers = require('../controllers/index');
const { authMiddleware } = require('../middlewares/auth.js');
// Ruta para el registro
router.post('/registro', [], controllers.usersController.registro);
router.post('/login', [], controllers.usersController.login);
router.put('/profile', [authMiddleware], controllers.usersController.updateProfile);
router.get('/users', [authMiddleware], controllers.usersController.allUsers);
router.delete('/users/:userId', [authMiddleware], controllers.usersController.deleteUser);

module.exports = {
  basePath: '/',
  router,
};
