const express = require('express');

const router = express.Router();
const controllers = require('../controllers/index');
const { authMiddleware } = require('../middlewares/auth');

router.get('/', authMiddleware, controllers.ProductsController.allProducts);
router.post('/', authMiddleware, controllers.ProductsController.create);
router.get('/:product_id', authMiddleware, controllers.ProductsController.show);
router.put('/:product_id', authMiddleware, controllers.ProductsController.update);
router.delete('/:product_id', authMiddleware, controllers.ProductsController.delete);

module.exports = {
  basePath: '/products',
  router,
};
