const { Op } = require('sequelize');
const models = require('../models');
const response = require('../functions/serviceUtil.js');
const paginable = require('../functions/paginable.js');
const CustomError = require('../functions/CustomError.js');
const validate = require('../functions/validate');
// const authMiddleware = require('../middlewares/auth.js');

module.exports = {
  name: 'ProductsController',
  allProducts: async (req, res, next) => {
    try {
      const { search, fecha_corta } = req.query;

      const where = {};

      // Filtro de búsqueda
      if (search) {
        where[Op.or] = [
          { name_product: { [Op.like]: `%${search}%` } },
          { provider: { [Op.like]: `%${search}%` } },
        ];
      }

      const order = [];
      if (fecha_corta === 'true' || fecha_corta === true) {
        order.push(['fecha_corta', 'DESC']);
      }

      const products = await models.product.findAndCountAll(
        paginable.paginate(
          {
            where,
            order,
          },
          req.query,
        ),
      );

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
  scanSimple: async (req, res, next) => {
    try {
      const product = await models.product.findOne({
        where: {
          code: req.params.code,
        },
      });

      if (!product) throw new CustomError('product not found', 404);

      res.status(200).send(product); // Envía el producto directamente
    } catch (error) {
      next(error);
    }
  },
  oneProduct: async (req, res, next) => {
    try {
      const product = await models.product.findOne({
        where: {
          product_id: req.params.product_id,
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
        await validate(
          req.body,
          {
            name_product: 'required', // Nombre del producto obligatorio
            price: 'required', // Precio obligatorio
            provider: 'required', // Proveedor obligatorio
            code: 'required', // Código obligatorio
          },
          {
            'required.name_product': 'El nombre del producto es obligatorio',
            'required.price': 'El precio es obligatorio',
            'required.provider': 'El proveedor es obligatorio',
            'required.code': 'El código es obligatorio',
          },
        );

        // Verificar si el producto ya está registrado
        const existingProduct = await models.product.findOne({
          where: {
            code: req.body.code,
          },
          transaction,
        });

        if (existingProduct) {
          throw new CustomError(
            'El código del producto ya está registrado',
            400,
          );
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
  updateProduct: async (req, res, next) => {
    try {
      // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const product = await models.product.findByPk(req.params.product_id, {
          transaction,
        });

        if (!product) throw new CustomError('product not found', 404);

        const {
          name_product, price, provider, code,
        } = req.body;

        // Guardar el precio anterior antes de actualizar
        product.last_price = product.price;

        // Actualizar los campos del producto
        product.name_product = name_product;
        product.provider = provider;
        product.code = code;

        // Si el precio cambia, actualiza `price_updated_at`
        if (product.price !== price) {
          product.price = price;
          product.price_updated_at = new Date(); // Actualiza la fecha de actualización
        }

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
  updatePrices: async (req, res, next) => {
    console.log('Solicitud de actualización de precios recibida');
    try {
      const { productos } = req.body;

      if (!productos || !Array.isArray(productos)) {
        throw new CustomError('Se esperaba un array de productos', 400);
      }

      const result = await models.sequelize.transaction(async (transaction) => {
        const updatedProducts = await Promise.all(
          productos.map(async (producto) => {
            const { id, price } = producto;

            if (typeof price !== 'number' || price < 0) {
              throw new CustomError(
                `Precio inválido para el producto con ID ${id}`,
                400,
              );
            }

            const product = await models.product.findByPk(id, { transaction });
            if (!product) {
              throw new CustomError(`Producto con ID ${id} no encontrado`, 404);
            }

            // Guardar el precio anterior antes de actualizar
            product.last_price = product.price;

            // Actualizar el nuevo precio
            product.price = price;

            product.price_updated_at = new Date();

            await product.save({ transaction });

            return product;
          }),
        );

        return updatedProducts;
      });

      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      console.log('Error al actualizar precios:', error);
      next(error);
    }
  },

  onDelete: async (req, res, next) => {
    console.log('Llamando a onDelete en products.controller.js');
    try {
      // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const product = await models.product.findByPk(req.params.product_id, {
          transaction,
        });

        if (!product) throw new CustomError('product not found', 404);

        // UPDATE ATTRIBUTES
        await product.destroy({ transaction });

        return 'Producto eliminado con exito';
      });
      // Transaction complete!
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      console.log('Error al obtener productos:', error);
      next(error);
    }
  },
  fecha_corta: async (req, res, next) => {
    try {
      const result = await models.sequelize.transaction(async (transaction) => {
        const product = await models.product.findByPk(req.params.product_id, {
          transaction,
        });

        if (!product) throw new CustomError('Producto no encontrado', 404);

        // Cambiar el estado de fecha_corta
        product.fecha_corta = !product.fecha_corta;
        await product.save({ transaction });

        return product;
      });

      res.status(200).send(response.getResponseCustom(200, result));
    } catch (error) {
      next(error);
    }
  },
};
