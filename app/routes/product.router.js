const express = require('express');

const router = express.Router();
const controllers = require('../controllers/index');
const { authMiddleware } = require('../middlewares/auth');

router.get('/products', authMiddleware, controllers.ProductsController.allProducts);
router.post('/addProducts', authMiddleware, controllers.ProductsController.addProduct);
router.get('/products/scan/:code', authMiddleware, controllers.ProductsController.scan);
router.put('/:product_id', authMiddleware, controllers.ProductsController.update);
router.delete('/:product_id', authMiddleware, controllers.ProductsController.delete);

module.exports = {
  basePath: '/',
  router,
};
