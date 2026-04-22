const QRCode = require('qrcode');

/**
 * QR Code Generation Service
 * Generates QR codes for emergency health info access
 */

const qrCodeService = {
  /**
   * Generate QR code for emergency health access
   * @param {String} userId - MongoDB user ID
   * @param {Object} options - QR code options
   * @returns {Promise<String>} - Base64 encoded QR code image
   */
  generateEmergencyQRCode: async (userId, options = {}) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Validate userId format (MongoDB ObjectId)
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid user ID format');
      }

      // Construct emergency access URL
      const baseUrl = options.baseUrl || process.env.SERVER_BASE_URL || 'http://localhost:5000';
      const emergencyUrl = `${baseUrl}/api/emergency/${userId}`;

      console.log(`📱 Generating QR Code for: ${emergencyUrl}`);

      // QR code generation options
      const qrOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel || 'H', // High error correction
        type: 'image/png',
        width: options.width || 300,
        margin: options.margin || 2,
        color: {
          dark: options.darkColor || '#000000',
          light: options.lightColor || '#FFFFFF',
        },
      };

      // Generate QR code as data URL (base64)
      const qrCodeDataUrl = await QRCode.toDataURL(emergencyUrl, qrOptions);

      console.log('✅ QR Code generated successfully');

      return qrCodeDataUrl;
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  },

  /**
   * Generate QR code as file buffer
   * @param {String} userId - MongoDB user ID
   * @param {Object} options - QR code options
   * @returns {Promise<Buffer>} - PNG image buffer
   */
  generateQRCodeBuffer: async (userId, options = {}) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Validate userId format
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid user ID format');
      }

      // Construct emergency access URL
      const baseUrl = options.baseUrl || process.env.SERVER_BASE_URL || 'http://localhost:5000';
      const emergencyUrl = `${baseUrl}/api/emergency/${userId}`;

      // QR code generation options
      const qrOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel || 'H',
        width: options.width || 300,
        margin: options.margin || 2,
        color: {
          dark: options.darkColor || '#000000',
          light: options.lightColor || '#FFFFFF',
        },
      };

      // Generate QR code as buffer
      const qrCodeBuffer = await QRCode.toBuffer(emergencyUrl, qrOptions);

      return qrCodeBuffer;
    } catch (error) {
      console.error('QR Code buffer generation error:', error);
      throw new Error(`Failed to generate QR code buffer: ${error.message}`);
    }
  },

  /**
   * Generate QR code as SVG string
   * @param {String} userId - MongoDB user ID
   * @param {Object} options - QR code options
   * @returns {Promise<String>} - SVG string
   */
  generateQRCodeSVG: async (userId, options = {}) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Validate userId format
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid user ID format');
      }

      // Construct emergency access URL
      const baseUrl = options.baseUrl || process.env.SERVER_BASE_URL || 'http://localhost:5000';
      const emergencyUrl = `${baseUrl}/api/emergency/${userId}`;

      // QR code generation options
      const qrOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel || 'H',
        width: options.width || 300,
        margin: options.margin || 2,
        color: {
          dark: options.darkColor || '#000000',
          light: options.lightColor || '#FFFFFF',
        },
      };

      // Generate QR code as SVG string
      const qrCodeSvg = await QRCode.toString(emergencyUrl, qrOptions);

      return qrCodeSvg;
    } catch (error) {
      console.error('QR Code SVG generation error:', error);
      throw new Error(`Failed to generate QR code SVG: ${error.message}`);
    }
  },
};

module.exports = qrCodeService;
