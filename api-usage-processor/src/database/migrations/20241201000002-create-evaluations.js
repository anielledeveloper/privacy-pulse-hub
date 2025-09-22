'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('evaluations', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      guidelineId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'guidelines',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      percentage: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
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

    // Add index on guidelineId for performance
    await queryInterface.addIndex('evaluations', ['guidelineId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('evaluations');
  },
};
