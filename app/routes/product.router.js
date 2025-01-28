const express = require('express');

const router = express.Router();
const controllers = require('../controllers/index');
const { authMiddleware } = require('../middlewares/auth');

router.get('/', authMiddleware, controllers.ProductsController.allProducts);
router.post('/', authMiddleware, controllers.ProductsController.addProduct);
router.get('/scan/:code', authMiddleware, controllers.ProductsController.scan);
router.get('/:product_id', authMiddleware, controllers.ProductsController.oneProduct);
router.put('/:product_id', authMiddleware, controllers.ProductsController.updateProduct);
router.delete('/:product_id', authMiddleware, controllers.ProductsController.onDelete);

module.exports = {
  basePath: '/products',
  router,
};
