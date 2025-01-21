const models = require('../models');
const response = require('../functions/serviceUtil.js');
const paginable = require('../functions/paginable.js');
const CustomError = require('../functions/CustomError.js');
const validate = require('../functions/validate');
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
  scan: async (req, res, next) => {
    try {
      const product = await models.product.findOne({
        where: {
          code: req.params.code,
        },
      });

      if (!product) throw new CustomError('product not found', 404);

      res.status(200).send(response.getResponseCustom(200, product));
    } catch (error) {
      next(error);
    }
  },

  addProduct: async (req, res, next) => {
    try {
    // Iniciar transacción
      const result = await models.sequelize.transaction(async (transaction) => {
      // Validar los datos del formulario
        console.log(req.body);
        await validate(req.body, {
          name_product: 'required', // Nombre del producto obligatorio
          price: 'required', // Precio obligatorio
          provider: 'required', // Proveedor obligatorio
          code: 'required', // Código obligatorio
        }, {
          'required.name_product': 'El nombre del producto es obligatorio',
          'required.price': 'El precio es obligatorio',
          'required.provider': 'El proveedor es obligatorio',
          'required.code': 'El código es obligatorio',
        });

        // Verificar si el producto ya está registrado
        const existingProduct = await models.product.findOne({
          where: {
            code: req.body.code,
          },
          transaction,
        });

        if (existingProduct) {
          throw new CustomError('El código del producto ya está registrado', 400);
        }

        // Crear el nuevo producto
        await models.product.create(
          {
            name_product: req.body.name_product,
            price: req.body.price,
            provider: req.body.provider,
            code: req.body.code,
          },
          { transaction },
        );

        return 'Producto agregado con éxito';
      });

      // Transacción completada
      res.status(201).send(response.getResponseCustom(201, result));
      res.end();
    } catch (error) {
    // Transacción fallida
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
