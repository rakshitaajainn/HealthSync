const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Validation middleware for signup
 */
const signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Please provide a valid age'),
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group'),
];

/**
 * Validation middleware for login
 */
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * POST /api/auth/signup
 * Create a new user account
 * Public route
 */
router.post('/signup', signupValidation, authController.signup);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * Public route
 */
router.post('/login', loginValidation, authController.login);

/**
 * GET /api/auth/profile
 * Get current user profile
 * Protected route - requires valid JWT token
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * PUT /api/auth/profile
 * Update current user profile
 * Protected route - requires valid JWT token
 */
const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ min: 2 }),
  body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Please provide a valid age'),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
];

router.put('/profile', authMiddleware, updateProfileValidation, authController.updateProfile);

module.exports = router;
