'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('submission_locks', {
      deviceId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add unique constraint
    await queryInterface.addConstraint('submission_locks', {
      fields: ['deviceId', 'date'],
      type: 'unique',
      name: 'submission_locks_deviceId_date_unique',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('submission_locks');
  },
};
