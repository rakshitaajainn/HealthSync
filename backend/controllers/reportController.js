const Report = require('../models/Report');
const fs = require('fs');
const path = require('path');
const ocrService = require('../services/ocrService');
const logger = require('../utils/logger');

/**
 * @desc   Get all reports for authenticated user
 * @route  GET /api/reports
 * @access Private
 */
exports.getReports = async (req, res) => {
  try {
    logger.info('reports.list', 'Request received: get all reports matrix');
    logger.info('reports.list', 'DB operation: querying multiple authenticated reports');

    const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    logger.error('reports.list', 'Failed core DB fetch query block', { message: error.message });
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reports',
    });
  }
};

/**
 * @desc   Get single report by ID
 * @route  GET /api/reports/:id
 * @access Private
 */
exports.getReport = async (req, res) => {
  try {
    logger.info('reports.get', 'Request received: get single report context', { reportId: req.params.id });
    logger.info('reports.get', 'DB operation: locating single report schema', { reportId: req.params.id });

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
        code: 'REPORT_NOT_FOUND',
      });
    }

    if (report.userId.toString() !== req.user.id && !report.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report',
        code: 'UNAUTHORIZED',
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    logger.error('reports.get', 'Isolated DB locate operation failed', { message: error.message });
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching report',
    });
  }
};

/**
 * @desc   Upload a medical report with OCR text extraction
 * @route  POST /api/reports/upload
 * @access Private
 */
exports.uploadReport = async (req, res) => {
  try {
    logger.info('reports.upload', 'Request received: upload physical medical artifact');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a PDF or image file.',
        code: 'NO_FILE',
      });
    }

    const { reportType, description, tags } = req.body;
    const validReportTypes = ['blood_test', 'xray', 'ct_scan', 'ultrasound', 'ecg', 'other'];

    if (!reportType || !validReportTypes.includes(reportType)) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {}

      return res.status(400).json({
        success: false,
        message: `Invalid report type. Allowed types: ${validReportTypes.join(', ')}`,
        code: 'INVALID_REPORT_TYPE',
      });
    }

    const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'image';
    const tagArray = tags ? tags.split(',').map((tag) => tag.trim()).filter((tag) => tag) : [];

    const report = new Report({
      userId: req.user.id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType,
      reportType,
      description: description || '',
      tags: tagArray,
      status: 'pending',
      isPublic: false,
    });

    logger.info('reports.upload', 'DB operation: allocating report blueprint metadata payload');
    await report.save();

    performOCRExtraction(report._id, req.file.path, fileType);

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully. Text extraction in progress...',
      report: {
        _id: report._id,
        fileName: report.fileName,
        fileType: report.fileType,
        fileSize: report.fileSize,
        reportType: report.reportType,
        status: report.status,
        uploadedAt: report.createdAt,
      },
    });
  } catch (error) {
    if (req.file && req.file.path) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {}
    }

    logger.error('reports.upload', 'FS Upload binding operation failed universally', { message: error.message });

    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading report',
      code: 'UPLOAD_FAILED',
    });
  }
};

/**
 * Perform OCR text extraction asynchronously
 * @param {String} reportId - Report ID
 * @param {String} filePath - File path
 * @param {String} fileType - File type (pdf or image)
 */
async function performOCRExtraction(reportId, filePath, fileType) {
  try {
    logger.info('reports.ocr', 'OCR process: isolating semantic matrix from physical medium');
    await Report.findByIdAndUpdate(reportId, { status: 'processing' });

    const extractionResult = await ocrService.analyzeExtractedText(filePath, fileType);

    logger.info('reports.ocr', 'DB operation: appending translated text schema values');
    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      {
        extractedText: extractionResult.text,
        status: 'processed',
        ocrAnalysis: {
          confidence: extractionResult.confidence,
          characterCount: extractionResult.characterCount,
          wordCount: extractionResult.wordCount,
          lineCount: extractionResult.analysis.lineCount,
          medicalKeywords: extractionResult.analysis.medicalKeywords,
          extractedNumbers: extractionResult.analysis.numbers.slice(0, 20),
          structuredData: extractionResult.analysis.structuredData,
        },
      },
      { new: true }
    );

    return updatedReport;
  } catch (error) {
    logger.error('reports.ocr', 'OCR process: core scanning execution failed completely', { message: error.message });

    await Report.findByIdAndUpdate(reportId, {
      status: 'processed',
      ocrAnalysis: {
        error: error.message,
        confidence: 0,
      },
    });
  }
}

/**
 * @desc   Delete a report
 * @route  DELETE /api/reports/:id
 * @access Private
 */
exports.deleteReport = async (req, res) => {
  try {
    logger.info('reports.delete', 'Request received: purge artifact context');

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
        code: 'REPORT_NOT_FOUND',
      });
    }

    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report',
        code: 'UNAUTHORIZED',
      });
    }

    if (report.filePath) {
      try {
        await fs.promises.unlink(report.filePath);
      } catch (unlinkError) {}
    }

    logger.info('reports.delete', 'DB operation: executing hard document purge');
    await Report.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    logger.error('reports.delete', 'Document purge operation failed critically', { message: error.message });
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting report',
    });
  }
};
