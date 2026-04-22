const User = require('../models/User');
const qrCodeService = require('../services/qrCodeService');
const logger = require('../utils/logger');

/**
 * Get emergency health information for a user (public endpoint)
 * Returns: blood group, allergies, age, and basic contact info
 * No authentication required
 */
exports.getEmergencyInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    logger.info('emergency.info', 'Request received: emergency artifact data stream');

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    logger.info('emergency.info', 'DB operation: isolating generic emergency demographics');
    const user = await User.findById(userId).select(
      'name age bloodGroup allergies phone emergencyContact medicalHistory'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Emergency health information retrieved',
      data: {
        name: user.name,
        age: user.age,
        bloodGroup: user.bloodGroup,
        allergies: user.allergies && user.allergies.length > 0 ? user.allergies : ['None listed'],
        phone: user.phone,
        emergencyContact: user.emergencyContact || { name: 'Not provided', phone: 'Not provided' },
        medicalHistorySummary: user.medicalHistory ? user.medicalHistory.substring(0, 200) : 'None provided',
      },
    });
  } catch (error) {
    logger.error('emergency.info', 'Emergency identity pipeline blocked internally', { message: error.message });
    res.status(500).json({
      success: false,
      message: 'Error retrieving emergency information',
    });
  }
};

/**
 * Generate QR code for emergency health access (public endpoint)
 * Returns: QR code as base64 encoded PNG image
 * No authentication required
 */
exports.generateEmergencyQRCode = async (req, res) => {
  try {
    const { userId } = req.params;
    const { format = 'base64', baseUrl } = req.query;
    logger.info('emergency.qr', 'Request received: QR generation graphics matrix');

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    logger.info('emergency.qr', 'DB operation: verifying root schema entity presence');
    const user = await User.findById(userId).select('_id');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let qrCode;
    const options = baseUrl ? { baseUrl } : {};

    if (format === 'svg') {
      qrCode = await qrCodeService.generateQRCodeSVG(userId, options);
      res.set('Content-Type', 'image/svg+xml');
      res.send(qrCode);
    } else if (format === 'buffer') {
      qrCode = await qrCodeService.generateQRCodeBuffer(userId, options);
      res.set('Content-Type', 'image/png');
      res.send(qrCode);
    } else {
      qrCode = await qrCodeService.generateEmergencyQRCode(userId, options);
      res.json({
        success: true,
        message: 'QR code generated successfully',
        data: {
          userId,
          qrCode,
          format: 'base64',
          url: `${req.protocol}://${req.get('host')}/api/emergency/${userId}`,
        },
      });
    }
  } catch (error) {
    logger.error('emergency.qr', 'QR matrix rendering failed entirely', { message: error.message });
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating QR code',
    });
  }
};
