const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    // static associate(models) {
    // CREATE ASSOCIATIONS HERE
    // }
  }
  Product.init(
    {
      product_id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      name_product: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        get() {
          return this.getDataValue('price') / 100;
        },
        set(value) {
          this.setDataValue('price', value * 100);
        },
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'product',
    },
  );
  return Product;
};
