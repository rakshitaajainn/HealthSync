const { createWorker } = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Run OCR safely using worker
 */
async function runOCR(filePath) {
  const worker = await createWorker();
  logger.info('ocr.worker', 'OCR worker created', { fileName: path.basename(filePath) });

  try {
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    logger.info('ocr.worker', 'OCR worker initialized', { fileName: path.basename(filePath) });

    const result = await worker.recognize(filePath);
    logger.info('ocr.worker', 'OCR recognition completed', {
      fileName: path.basename(filePath),
      confidence: result.data.confidence,
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    logger.error('ocr.worker', 'OCR worker failed', {
      fileName: path.basename(filePath),
      message: error.message,
    });
    return {
      text: '',
      confidence: 0,
      error: error.message,
    };
  } finally {
    await worker.terminate();
    logger.debug('ocr.worker', 'OCR worker terminated', { fileName: path.basename(filePath) });
  }
}

/**
 * Clean extracted text
 */
function cleanExtractedText(text) {
  if (!text) return '';

  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n\n')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Extract structured medical data
 */
function extractStructuredData(text) {
  const normalized = text.toLowerCase();

  const data = {
    hemoglobin: null,
    bloodSugar: null,
    hba1c: null,
    cholesterol: {
      total: null,
      ldl: null,
      hdl: null,
    },
    notes: [],
  };

  const getValue = (regex) => {
    const match = normalized.match(regex);
    return match && match[1] ? parseFloat(match[1]) : null;
  };

  data.hemoglobin = getValue(/\b(hemoglobin|hb|hgb)\s*[:=]?\s*(\d+(\.\d+)?)/)?.toString() || null;
  data.hba1c = getValue(/\b(hba1c|a1c)\s*[:=]?\s*(\d+(\.\d+)?)/)?.toString() || null;

  data.bloodSugar =
    getValue(/\b(glucose|blood sugar)\s*[:=]?\s*(\d+(\.\d+)?)/)?.toString() || null;

  data.cholesterol.total =
    getValue(/\b(total cholesterol|cholesterol)\s*[:=]?\s*(\d+(\.\d+)?)/)?.toString() || null;

  data.cholesterol.ldl =
    getValue(/\b(ldl)\s*[:=]?\s*(\d+(\.\d+)?)/)?.toString() || null;

  data.cholesterol.hdl =
    getValue(/\b(hdl)\s*[:=]?\s*(\d+(\.\d+)?)/)?.toString() || null;

  if (data.hemoglobin) data.notes.push(`Hb: ${data.hemoglobin}`);
  if (data.bloodSugar) data.notes.push(`Sugar: ${data.bloodSugar}`);
  if (data.hba1c) data.notes.push(`HbA1c: ${data.hba1c}`);

  return data;
}

/**
 * Extract numbers from text
 */
function extractNumbers(text) {
  const matches = text.match(/\b\d+\.?\d*\b/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Extract medical keywords
 */
function extractKeywords(text) {
  const keywords = [
    'normal', 'abnormal', 'positive', 'negative',
    'high', 'low', 'glucose', 'cholesterol',
    'hemoglobin', 'infection', 'report'
  ];

  const lower = text.toLowerCase();
  return keywords.filter(k => lower.includes(k));
}

/**
 * Main OCR + analysis function
 */
exports.analyzeExtractedText = async (filePath, fileType = 'image') => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    logger.info('ocr.analysis', 'OCR analysis started', {
      fileName: path.basename(filePath),
      fileType,
    });

    const result = await runOCR(filePath);

    const cleanedText = cleanExtractedText(result.text);

    const lines = cleanedText.split('\n').filter(l => l.trim());
    const words = cleanedText.split(/\s+/);
    const medicalKeywords = extractKeywords(cleanedText);

    logger.info('ocr.analysis', 'OCR analysis completed', {
      fileName: path.basename(filePath),
      confidence: result.confidence,
      wordCount: words.length,
      keywordCount: medicalKeywords.length,
    });

    return {
      success: true,
      text: cleanedText,
      confidence: result.confidence,
      characterCount: cleanedText.length,
      wordCount: words.length,

      analysis: {
        lineCount: lines.length,
        medicalKeywords,
        numbers: extractNumbers(cleanedText),
        structuredData: extractStructuredData(cleanedText),
      },
    };

  } catch (error) {
    logger.error('ocr.analysis', 'OCR analysis failed', {
      fileName: path.basename(filePath),
      message: error.message,
    });
    throw error;
  }
};
