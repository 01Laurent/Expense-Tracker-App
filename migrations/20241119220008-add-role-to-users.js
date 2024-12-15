'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the 'role' column to the 'Users' table
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,        // Ensures 'role' cannot be null
      defaultValue: 'member'   // Sets the default value of 'role' to 'member'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the 'role' column from the 'Users' table
    await queryInterface.removeColumn('Users', 'role');
  }
};
