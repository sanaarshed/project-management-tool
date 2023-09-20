'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'is_verify', {
      type: Sequelize.BOOLEAN,
      defaultValue: false, // You can set a default value if needed
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'is_verify');
  },
};
