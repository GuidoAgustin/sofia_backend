const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ventas extends Model {
    // static associate(models) {
    // CREATE ASSOCIATIONS HERE
    // }
  }
  Ventas.init(
    {
      ventas_id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      metodo_pago: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      productos: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ventas',
    },
  );
  return Ventas;
};
