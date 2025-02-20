const express = require('express');

const router = express.Router();
const controllers = require('../controllers/index');
const { authMiddleware } = require('../middlewares/auth.js');

router.get('/', [authMiddleware], controllers.VentasController.index);

router.post('/', [authMiddleware], controllers.VentasController.guardarVenta);

router.get('/:ventas_id', [authMiddleware], controllers.VentasController.show);

router.put('/:ventas_id', [authMiddleware], controllers.VentasController.update);

router.delete('/:ventas_id', [authMiddleware], controllers.VentasController.delete);

module.exports = {
  basePath: '/ventas',
  router,
};
