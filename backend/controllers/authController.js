const User = require('../models/User');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * @desc   Sign up a new user
 * @route  POST /api/auth/signup
 * @access Public
 */
exports.signup = async (req, res) => {
  try {
    logger.info('auth.signup', 'Request received: initial signup schema block');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, email, password, age, bloodGroup, allergies, phone } = req.body;

    logger.info('auth.signup', 'DB operation: asserting duplicate user schemas');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const user = new User({
      name,
      email,
      password,
      age,
      bloodGroup,
      allergies: allergies || [],
      phone,
    });

    logger.info('auth.signup', 'DB operation: allocating new user environment block');
    await user.save();

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        bloodGroup: user.bloodGroup,
        allergies: user.allergies,
      },
    });
  } catch (error) {
    logger.error('auth.signup', 'Registration block operation failed critically', { message: error.message });
    res.status(500).json({
      success: false,
      message: error.message || 'Error during signup',
    });
  }
};

/**
 * @desc   Login user
 * @route  POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    logger.info('auth.login', 'Request received: authenticate mapped user');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    logger.info('auth.login', 'DB operation: executing schema mapping lookup');
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.',
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        bloodGroup: user.bloodGroup,
        allergies: user.allergies,
      },
    });
  } catch (error) {
    logger.error('auth.login', 'Authentication pipeline failed abruptly', { message: error.message });
    res.status(500).json({
      success: false,
      message: error.message || 'Error during login',
    });
  }
};

/**
 * @desc   Get current user profile
 * @route  GET /api/auth/profile
 * @access Private
 */
exports.getProfile = async (req, res) => {
  try {
    logger.info('auth.profile.get', 'Request received: query live user config block');
    logger.info('auth.profile.get', 'DB operation: locating synchronized identity variables');
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('auth.profile.get', 'Identity query lookup failed', { message: error.message });
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching profile',
    });
  }
};

/**
 * @desc   Update user profile
 * @route  PUT /api/auth/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    logger.info('auth.profile.update', 'Request received: mutate runtime user config');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, age, bloodGroup, allergies, phone, dateOfBirth, medicalHistory } = req.body;

    logger.info('auth.profile.update', 'DB operation: executing schema identity overwrite');
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        age,
        bloodGroup,
        allergies,
        phone,
        dateOfBirth,
        medicalHistory,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    logger.error('auth.profile.update', 'Identity mutation process failed critically', { message: error.message });
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile',
    });
  }
};
