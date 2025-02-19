const express = require('express');

const router = express.Router();
const controllers = require('../controllers/index');
const { authMiddleware } = require('../middlewares/auth');

router.get('/', authMiddleware, controllers.ProductsController.allProducts);
router.post('/', authMiddleware, controllers.ProductsController.addProduct);
router.get('/scan/:code', authMiddleware, controllers.ProductsController.scan);
router.get('/:product_id', authMiddleware, controllers.ProductsController.oneProduct);
router.put('/:product_id', authMiddleware, controllers.ProductsController.updateProduct);
router.put('/batch/price_update', authMiddleware, controllers.ProductsController.updatePrices);
router.delete('/:product_id', authMiddleware, controllers.ProductsController.onDelete);
router.put('/:product_id/fecha_corta', authMiddleware, controllers.ProductsController.fecha_corta);
router.get('/scan/simple/:code', authMiddleware, controllers.ProductsController.scanSimple);

module.exports = {
  basePath: '/products',
  router,
};
