const express = require('express');
const emergencyController = require('../controllers/emergencyController');

const router = express.Router();

/**
 * GET /api/emergency/:userId
 * Retrieve emergency health information for a user
 * Public endpoint - no authentication required
 * Returns: name, age, blood group, allergies, phone, emergency contact, medical history summary
 */
router.get('/:userId', emergencyController.getEmergencyInfo);

/**
 * GET /api/emergency/:userId/qr
 * Generate QR code for emergency health access
 * Public endpoint - no authentication required
 * Query parameters:
 *   - format: 'base64' (default), 'svg', 'buffer'
 *   - baseUrl: Custom base URL for QR code (default: http://localhost:5000)
 */
router.get('/:userId/qr', emergencyController.generateEmergencyQRCode);

module.exports = router;
