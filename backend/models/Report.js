const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: false,
    },
    fileSize: {
      type: Number,
      required: false,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'image'],
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    reportType: {
      type: String,
      enum: ['blood_test', 'xray', 'ct_scan', 'ultrasound', 'ecg', 'other'],
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    ocrAnalysis: {
      confidence: Number,
      characterCount: Number,
      wordCount: Number,
      lineCount: Number,
      medicalKeywords: [String],
      extractedNumbers: [Number],
      structuredData: {
        hemoglobin: String,
        bloodSugar: String,
        cholesterol: {
          total: String,
          ldl: String,
          hdl: String,
        },
        hba1c: String,
        notes: [String],
      },
      error: String,
    },
    aiAnalysis: {
      findings: String,
      riskFactors: [String],
      recommendations: [String],
      confidence: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'processed', 'analyzed'],
      default: 'pending',
      index: true,
    },
    tags: [String],
    description: String,
    isPublic: {
      type: Boolean,
      default: false,
    },
    qrCode: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', ReportSchema);
