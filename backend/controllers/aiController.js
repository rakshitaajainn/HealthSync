const Report = require('../models/Report');
const ocrService = require('../services/ocrService');
const predictionService = require('../services/predictionService');
const logger = require('../utils/logger');

/**
 * Analyze report with AI
 */
exports.analyzeReport = async (req, res) => {
  try {
    const { reportId } = req.body;
    logger.info('ai.analyze', 'Request received: AI report analysis', { reportId });

    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required',
      });
    }

    logger.info('ai.analyze', 'DB operation: fetching report blueprint');
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to analyze this report',
      });
    }

    let extractedText = report.extractedText;

    if (!extractedText || extractedText.length < 10) {
      logger.info('ai.analyze', 'OCR process: extracting document text matrix');
      try {
        const analysisResult = await ocrService.analyzeExtractedText(
          report.filePath,
          report.fileType
        );
        extractedText = analysisResult.text || '';
        report.extractedText = extractedText;
      } catch (ocrError) {
        logger.error('ai.analyze', 'OCR process: extraction failed', { error: ocrError.message });
        extractedText = '';
      }
    }

    if (!extractedText || extractedText.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract sufficient text from the report for analysis',
      });
    }

    logger.info('ai.analyze', 'AI predictions: compiling health insights context matrix');
    const aiAnalysis = await predictionService.getPrediction(
      extractedText,
      report.reportType
    );

    report.aiAnalysis = aiAnalysis;
    report.status = 'analyzed';

    logger.info('ai.analyze', 'DB operation: securing AI analysis report metadata');
    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report analyzed successfully',
      data: report,
    });
  } catch (error) {
    logger.error('ai.analyze', 'Analyze report pipeline failed', { message: error.message });
    res.status(500).json({
      success: false,
      message: error.message || 'Error analyzing report',
    });
  }
};

/**
 * Get AI insights
 */
exports.getInsights = async (req, res) => {
  try {
    logger.info('ai.insights', 'Request received: fetch AI recommendations', { reportId: req.params.reportId });
    
    logger.info('ai.insights', 'DB operation: querying AI report matrix');
    const report = await Report.findById(req.params.reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    if (report.userId.toString() !== req.user.id && !report.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view insights',
      });
    }

    if (!report.aiAnalysis) {
      return res.status(400).json({
        success: false,
        message: 'Report not analyzed yet',
      });
    }

    res.status(200).json({
      success: true,
      data: report.aiAnalysis,
    });
  } catch (error) {
    logger.error('ai.insights', 'Insight request failed internally', { message: error.message });
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching insights',
    });
  }
};

/**
 * Predict health risk from vitals
 */
exports.predictHealth = async (req, res) => {
  try {
    logger.info('ai.predict', 'Request received: generic biological health predictions');
    const {
      age,
      weight,
      height,
      systolic,
      diastolic,
      gender,
      smoker,
      diabetes,
      sleepHours,
      dietQuality,
      activityLevel,
    } = req.body;

    if (
      age === undefined ||
      weight === undefined ||
      height === undefined ||
      systolic === undefined ||
      diastolic === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: age, weight, height, systolic, diastolic',
      });
    }

    logger.info('ai.predict', 'AI predictions: executing raw biology heuristic analysis');
    const prediction = await predictionService.predictHealthRisk({
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      gender: gender || 'M',
      smoker: smoker === true || smoker === 'true',
      diabetes: diabetes === true || diabetes === 'true',
      sleepHours: sleepHours ? Number(sleepHours) : null,
      dietQuality: dietQuality || 'average',
      activityLevel: activityLevel || 'moderate',
    });

    res.status(200).json({
      success: true,
      message: 'Prediction completed',
      data: prediction,
    });
  } catch (error) {
    logger.error('ai.predict', 'Biological prediction engine failed', { message: error.message });
    res.status(500).json({
      success: false,
      message: error.message || 'Prediction failed',
    });
  }
};
