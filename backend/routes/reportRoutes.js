const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Configure multer storage settings
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename: userId-timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${req.user.id}-${uniqueSuffix}${ext}`);
  },
});

/**
 * File filter to accept only PDF and image files
 */
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/tiff',
  ];

  // Allowed file extensions
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff'];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isMimeTypeAllowed = allowedMimeTypes.includes(file.mimetype);
  const isExtensionAllowed = allowedExtensions.includes(fileExtension);

  if (isMimeTypeAllowed && isExtensionAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only PDF and image files (JPG, PNG, GIF, WebP, TIFF) are allowed.`
      ),
      false
    );
  }
};

/**
 * Configure multer upload settings
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

/**
 * Error handling middleware for multer
 */
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum limit of 10MB',
        code: 'FILE_TOO_LARGE',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Only one file can be uploaded at a time',
        code: 'TOO_MANY_FILES',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
      code: 'UPLOAD_ERROR',
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: 'VALIDATION_ERROR',
    });
  }

  next();
};

/**
 * GET /api/reports
 * Get all reports for authenticated user
 * Protected route
 */
router.get('/', authMiddleware, reportController.getReports);

/**
 * GET /api/reports/:id
 * Get single report by ID
 * Protected route
 */
router.get('/:id', authMiddleware, reportController.getReport);

/**
 * POST /api/reports/upload
 * Upload a new medical report (PDF or image)
 * Protected route
 * 
 * @param {File} file - Medical report file (PDF or image)
 * @param {String} reportType - Type of report (blood_test, xray, etc.)
 * @param {String} description - Optional description
 * @param {String} tags - Optional comma-separated tags
 */
router.post(
  '/upload',
  authMiddleware,
  upload.single('file'),
  uploadErrorHandler,
  reportController.uploadReport
);

/**
 * DELETE /api/reports/:id
 * Delete report by ID
 * Protected route
 */
router.delete('/:id', authMiddleware, reportController.deleteReport);

module.exports = router;
