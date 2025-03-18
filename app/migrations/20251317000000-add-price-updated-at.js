module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('product', 'price_updated_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('product', 'price_updated_at');
  },
};
