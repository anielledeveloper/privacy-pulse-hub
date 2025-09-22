'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create disclaimers table
    await queryInterface.createTable('disclaimers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      version: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      disclaimerText: { type: Sequelize.TEXT, allowNull: false },
      disclaimerHash: { type: Sequelize.STRING(64), allowNull: false, unique: true },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // Add indexes for disclaimers table
    await queryInterface.addIndex('disclaimers', ['version']);
    await queryInterface.addIndex('disclaimers', ['disclaimerHash']);
    await queryInterface.addIndex('disclaimers', ['isActive']);

    // Add disclaimerId column to consents table
    await queryInterface.addColumn('consents', 'disclaimerId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: { model: 'disclaimers', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Add index for disclaimerId in consents table
    await queryInterface.addIndex('consents', ['disclaimerId']);
  },

  async down(queryInterface, Sequelize) {
    // Remove disclaimerId column from consents table
    await queryInterface.removeColumn('consents', 'disclaimerId');
    
    // Drop disclaimers table
    await queryInterface.dropTable('disclaimers');
  }
};
