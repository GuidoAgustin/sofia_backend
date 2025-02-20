const models = require('../models/index.js');
const response = require('../functions/serviceUtil.js');
const paginable = require('../functions/paginable.js');
const CustomError = require('../functions/CustomError.js');

module.exports = {
  name: 'VentasController',

  index: async (req, res, next) => {
    try {
      // Start Transaction

      const result = await models.sequelize.transaction(async (transaction) => {
        const ventas = await models.ventas.findAndCountAll(
          paginable.paginate(
            {
              transaction,
            },

            req.query,
          ),
        );

        return ventas;
      });

      // Transaction complete!

      res.status(200).send(paginable.paginatedResponse(result, req.query));

      res.end();
    } catch (error) {
      // Transaction Failed!

      next(error);
    }
  },

  show: async (req, res, next) => {
    try {
      // Start Transaction

      const result = await models.sequelize.transaction(async (transaction) => {
        const ventas = await models.ventas.findByPk(req.params.ventas_id, {
          transaction,
        });

        if (!ventas) throw new CustomError('ventas not found', 404);

        return ventas;
      });

      // Transaction complete!

      res.status(200).send(response.getResponseCustom(200, result));

      res.end();
    } catch (error) {
      // Transaction Failed!

      next(error);
    }
  },

  guardarVenta: async (req, res, next) => {
    console.log('Petición POST a /ventas recibida');
    console.log('URL:', req.originalUrl); // <-- Añade esta línea
    console.log('Body:', req.body);
    try {
      const { total, metodo_pago, productos } = req.body; // <-- Obtén los datos del body

      // Start Transaction
      const result = await models.sequelize.transaction(async (transaction) => {
        const venta = await models.ventas.create(
          {
            total,
            metodo_pago,
            fecha_hora: new Date(), // <-- Añade la fecha y hora actual
            productos: JSON.stringify(productos), // <-- Guarda los productos como JSON
          },
          { transaction },
        );

        return venta;
      });

      // Transaction complete!
      res.status(201).send(response.getResponseCustom(201, result)); // <-- Status 201 (Created)
      res.end();
    } catch (error) {
      // Transaction Failed!
      console.error('Error en create:', error); // <-- Log del error para depuración
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      // Start Transaction

      const result = await models.sequelize.transaction(async (transaction) => {
        const ventas = await models.ventas.findByPk(req.params.ventas_id, {
          transaction,
        });

        if (!ventas) throw new CustomError('ventas not found', 404);

        // UPDATE ATTRIBUTES

        await ventas.save({ transaction });

        return ventas;
      });

      // Transaction complete!

      res.status(200).send(response.getResponseCustom(200, result));

      res.end();
    } catch (error) {
      // Transaction Failed!

      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      // Start Transaction

      const result = await models.sequelize.transaction(async (transaction) => {
        const ventas = await models.ventas.findByPk(req.params.ventas_id, {
          transaction,
        });

        if (!ventas) throw new CustomError('ventas not found', 404);

        await ventas.destroy({ transaction });

        return ventas;
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
