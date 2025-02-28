const models = require('../models');
const response = require('../functions/serviceUtil.js');
const auth = require('../middlewares/auth.js');
const CustomError = require('../functions/CustomError');
const validate = require('../functions/validate');

module.exports = {
  name: 'usersController',

  // Método para el registro de usuarios
  registro: async (req, res, next) => {
    try {
      // Iniciar transacción
      const result = await models.sequelize.transaction(async (transaction) => {
        // Validar los datos del formulario
        console.log(req.body);
        await validate(req.body, {
          name: 'required|min:3', // Nombre de usuario obligatorio y mínimo 3 caracteres
          email: 'required|email', // Email obligatorio y válido
          password: 'required|min:6', // Contraseña obligatoria y mínimo 6 caracteres
        }, {
          'required.name': 'El nombre de usuario es obligatorio',
          'min.name': 'El nombre de usuario debe tener al menos 3 caracteres',
          'required.email': 'El email es obligatorio',
          'email.email': 'El email no es válido',
          'required.password': 'La contraseña es obligatoria',
          'min.password': 'La contraseña debe tener al menos 6 caracteres',
        });

        // Verificar si el email ya está registrado
        const existingUser = await models.user.findOne({
          where: {
            email: req.body.email,
          },
          transaction,
        });

        if (existingUser) {
          throw new CustomError('El email ya está registrado', 400);
        }

        // Crear el nuevo usuario
        await models.user.create(
          {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password, // Asegúrate de que el modelo hashee la contraseña
          },
          { transaction },
        );

        return 'registro exitoso';
      });

      // Transacción completada
      res.status(201).send(response.getResponseCustom(201, result));
      res.end();
    } catch (error) {
      // Transacción fallida
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      // Iniciar transacción
      const result = await models.sequelize.transaction(async (transaction) => {
        // Validar los datos del formulario
        await validate(req.body, {
          email: 'required|email',
          password: 'required',
        }, {
          'required.email': 'Envía un email por favor',
          'email.email': 'El email es inválido',
          'required.password': 'Envía una contraseña por favor',
        });

        // Buscar al usuario por su email
        const user = await models.user.findOne({
          where: {
            email: req.body.email,
          },
          transaction,
        });

        // Verificar si el usuario existe
        if (!user) {
          throw new CustomError('Usuario o contraseña incorrectos', 401);
        }

        // Verificar si la contraseña es correcta
        if (!user.checkPassword(req.body.password)) {
          throw new CustomError('Usuario o contraseña incorrectos', 401);
        }

        // Crear la respuesta del usuario
        const userRes = {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        return {
          user: userRes,
          token: auth.generateAccessToken(userRes), // Generar token de acceso
        };
      });

      // Transacción completada
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      // Transacción fallida
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      // Iniciar transacción
      const result = await models.sequelize.transaction(async (transaction) => {
        // Validar los datos del formulario
        await validate(req.body, {
          email: 'required|email',
          password: 'required',
          new_password: 'required|confirmed|min:6',
        }, {
          'required.email': 'Envía un email por favor',
          'email.email': 'El email es inválido',
          'required.password': 'Envía tu contraseña actual por favor',
          'confirmed.new_password': 'Las nuevas contraseñas no son iguales',
          'min.new_password': 'La nueva contraseña debe tener al menos 6 caracteres',
        });

        // Buscar al usuario por su ID (usando el ID del usuario autenticado)
        const user = await models.user.findByPk(req.user.user_id, { transaction });

        // Verificar si la contraseña actual es correcta
        if (!user.checkPassword(req.body.password)) {
          throw new CustomError('La contraseña es incorrecta', 412);
        }

        // Si se proporciona una nueva contraseña, actualizarla
        if (req.body.new_password) {
          user.password = req.body.new_password;
        }

        // Guardar los cambios en la base de datos
        await user.save({ transaction });

        // Devolver un mensaje de éxito
        return 'Perfil actualizado con éxito';
      });

      // Transacción completada
      res.status(200).send(response.getResponseCustom(200, result));
      res.end();
    } catch (error) {
      // Transacción fallida
      next(error);
    }
  },
};
