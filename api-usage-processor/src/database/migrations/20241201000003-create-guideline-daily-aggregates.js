'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('guideline_daily_aggregates', {
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
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sum: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      average: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
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

    // Add unique constraint and indexes
    await queryInterface.addConstraint('guideline_daily_aggregates', {
      fields: ['guidelineId', 'date'],
      type: 'unique',
      name: 'guideline_daily_aggregates_guidelineId_date_unique',
    });

    await queryInterface.addIndex('guideline_daily_aggregates', ['date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('guideline_daily_aggregates');
  },
};
