const models = require('../models');
const response = require('../functions/serviceUtil.js');
const paginable = require('../functions/paginable.js');
const CustomError = require('../functions/CustomError.js');
// const authMiddleware = require('../middlewares/auth.js');

module.exports = {
  name: 'ProductsController',
  allProducts: async (req, res, next) => {
    console.log('allProducts llamada');
    try {
      const { page, per_page } = req.query;
      console.log('req.query', req.query);
      const products = await models.product.findAndCountAll({
        where: {
        // agregar condiciones de filtrado aquí y un filters en la const de page
        },
        limit: parseInt(per_page),
        offset: (page - 1) * parseInt(per_page),
      });
      const respuesta = paginable.paginatedResponse(products, req.query);
      console.log('Productos', respuesta.data.data);
      res.status(200).send(respuesta);
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
  show: async (req, res, next) => {
    try {
    // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const product = await models.product.findOne({
          transaction,
          where: {
            code: req.params.code,
          },
        });

        if (!product) throw new CustomError('product not found', 404);

        return product;
      });
      // Transaction complete!
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
    // Transaction Failed!
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
    // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const product = await models.product.create({
          // CREATE ATTRIBUTES
        }, { transaction });

        return product;
      });
      // Transaction complete!
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
    // Transaction Failed!
      next(error);
    }
  },

  update: async (req, res, next) => {
    console.log('Solicitud de productos recibida');
    try {
    // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const product = await models.product.findByPk(req.params.product_id, {
          transaction,
        });

        if (!product) throw new CustomError('product not found', 404);

        // UPDATE ATTRIBUTES
        await product.save({ transaction });

        return product;
      });
      // Transaction complete!
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      console.log('Error al obtener productos:', error);
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
    // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const product = await models.product.findByPk(req.params.product_id, {
          transaction,
        });

        if (!product) throw new CustomError('product not found', 404);

        await product.destroy({ transaction });

        return product;
      });
      // Transaction complete!
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
    // Transaction Failed!
      next(error);
    }
  },
};
