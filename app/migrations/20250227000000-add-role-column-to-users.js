module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'admin',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('user', 'role');
  },
};
