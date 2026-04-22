const express = require('express');
const aiController = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /api/ai/analyze
 * Analyze report with AI
 * Protected route
 */
router.post('/analyze', authMiddleware, aiController.analyzeReport);

/**
 * GET /api/ai/insights/:reportId
 * Get AI insights for a specific report
 * Protected route
 */
router.get('/insights/:reportId', authMiddleware, aiController.getInsights);

/**
 * POST /api/ai/predict
 * Predict health risk based on vital signs
 * Protected route
 * Required fields: age, weight, height, systolic, diastolic
 * Optional fields: gender, smoker, diabetes
 */
router.post('/predict', authMiddleware, aiController.predictHealth);

module.exports = router;
