'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create consents table
    await queryInterface.createTable('consents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      deviceId: {
        type: Sequelize.STRING(36), // UUID length
        allowNull: false,
        // Remove unique constraint on just deviceId - allow multiple versions per device
      },
      consentVersion: {
        type: Sequelize.STRING(20), // e.g., "1.0.0"
        allowNull: false,
      },
      consentTextHash: {
        type: Sequelize.STRING(64), // SHA-256 hash length
        allowNull: false,
      },
      agreedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      evidence: {
        type: Sequelize.STRING(500), // Increased from 50 to 500 to accommodate checkbox text
        allowNull: false,
      },
      withdrawnAt: {
        type: Sequelize.DATE,
        allowNull: true, // null means consent is active
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for consents table
    await queryInterface.addIndex('consents', ['deviceId']);
    await queryInterface.addIndex('consents', ['consentVersion']);
    await queryInterface.addIndex('consents', ['withdrawnAt']);
    // Add composite unique constraint on (deviceId, consentVersion) instead of just deviceId
    await queryInterface.addIndex('consents', ['deviceId', 'consentVersion'], {
      unique: true,
      name: 'consents_device_version_unique'
    });

    // Add consent-related columns to evaluations table
    await queryInterface.addColumn('evaluations', 'consentId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // Default to first consent record
      references: {
        model: 'consents',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('evaluations', 'deviceId', {
      type: Sequelize.STRING(36),
      allowNull: false,
      defaultValue: 'legacy-device',
    });
    
    await queryInterface.addColumn('evaluations', 'consentVersion', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'legacy',
    });

    // Add indexes for evaluations table
    await queryInterface.addIndex('evaluations', ['consentId']);
    await queryInterface.addIndex('evaluations', ['deviceId']);
    await queryInterface.addIndex('evaluations', ['consentVersion']);
    await queryInterface.addIndex('evaluations', ['deviceId', 'consentVersion']);
  },

  async down(queryInterface, Sequelize) {
    // Remove consent-related columns from evaluations table
    await queryInterface.removeColumn('evaluations', 'consentVersion');
    await queryInterface.removeColumn('evaluations', 'deviceId');
    await queryInterface.removeColumn('evaluations', 'consentId');

    // Drop consents table
    await queryInterface.dropTable('consents');
  }
};
