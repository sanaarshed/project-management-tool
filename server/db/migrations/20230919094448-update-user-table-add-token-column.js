'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'token', {
      type: Sequelize.STRING,
      allowNull: true, // Make it nullable
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'token');
  }
};
