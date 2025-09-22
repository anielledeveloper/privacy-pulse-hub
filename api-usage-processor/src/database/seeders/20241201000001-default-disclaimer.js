'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if default disclaimer already exists
    const existingDisclaimer = await queryInterface.sequelize.query(
      'SELECT id FROM disclaimers WHERE id = 1',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingDisclaimer.length === 0) {
      // Create default disclaimer record with ID 1
      const defaultDisclaimerText = `What will be shared?
Guideline evaluations: Your 0-100% ratings for each guideline
Device identifier: A random UUID generated on your device (not your IP address)
Submission timestamp: When you completed the evaluation
What will NOT be shared?
IP address: We do not collect or store your IP address
Personal information: No names, emails, or identifying details
Browsing history: We only access data you explicitly submit
How is this data used?
Team insights: Aggregate trends and averages for your team
Progress tracking: Monitor guideline adherence over time
Improvement areas: Identify which guidelines need attention
Your rights
Withdraw anytime: Turn off external sharing in Settings
Local-only mode: Continue using the extension without sharing
Data export: Download your local data anytime

I understand and agree to share my guideline evaluations with my team for aggregate insights. I acknowledge that no IP address or personal information will be collected.`;

      // Create SHA-256 hash of the disclaimer text
      const crypto = require('crypto');
      const disclaimerHash = crypto.createHash('sha256').update(defaultDisclaimerText).digest('hex');

      await queryInterface.bulkInsert('disclaimers', [{
        id: 1,
        version: '1.0.0',
        disclaimerText: defaultDisclaimerText,
        disclaimerHash: disclaimerHash,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }

    // Update existing consents to reference the default disclaimer
    await queryInterface.sequelize.query(`
      UPDATE consents
      SET "disclaimerId" = 1
      WHERE "disclaimerId" IS NULL OR "disclaimerId" = 1
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove default disclaimer record
    await queryInterface.bulkDelete('disclaimers', { id: 1 }, {});
  }
};
