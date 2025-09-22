'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if default consent already exists
    const existingConsent = await queryInterface.sequelize.query(
      'SELECT id FROM consents WHERE id = 1',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingConsent.length === 0) {
      // Create default consent record with ID 1 only if it doesn't exist
      // Note: disclaimerId will be set by the disclaimer seeder
      await queryInterface.bulkInsert('consents', [{
        id: 1, // Explicitly set ID to 1 for foreign key references
        deviceId: 'legacy-device',
        consentVersion: 'legacy',
        consentTextHash: 'legacy-consent-hash',
        agreedAt: new Date(),
        evidence: 'legacy_migration',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }

    // Update existing evaluations to reference the default consent
    await queryInterface.sequelize.query(`
      UPDATE evaluations 
      SET "consentId" = 1 
      WHERE "consentId" IS NULL OR "consentId" = 1
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove default consent record
    await queryInterface.bulkDelete('consents', { id: 1 }, {});
  }
};
