const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Health Risk Prediction Service
 * Provides rule-based health risk assessment
 */

const predictionService = {
  /**
   * Predict health risk based on vital signs
   * @param {Object} vitals - User vitals
   * @returns {Promise<Object>} - Risk prediction result
   */
  predictHealthRisk: async (vitals) => {
    try {
      logger.info('prediction.risk', 'Risk prediction started', {
        age: vitals?.age,
        hasSleepHours: vitals?.sleepHours !== undefined && vitals?.sleepHours !== null,
        dietQuality: vitals?.dietQuality,
        activityLevel: vitals?.activityLevel,
      });

      const validation = validateVitals(vitals);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const riskFactors = calculateRiskFactors(vitals);
      const riskLevel = determineRiskLevel(riskFactors);
      const recommendations = generateRecommendations(riskFactors, vitals);
      const riskScore = calculateRiskScore(riskFactors);

      logger.info('prediction.risk', 'Risk prediction completed', {
        age: vitals.age,
        riskLevel,
        riskScore,
        activeFactors: Object.keys(riskFactors).filter((key) => riskFactors[key]).length,
      });

      return {
        success: true,
        riskLevel,
        riskScore,
        riskFactors,
        recommendations,
        vitals: {
          age: vitals.age,
          bmi: calculateBMI(vitals.weight, vitals.height),
          bloodPressure: `${vitals.systolic}/${vitals.diastolic}`,
          sleepHours: vitals.sleepHours || null,
          dietQuality: vitals.dietQuality || 'average',
          activityLevel: vitals.activityLevel || 'moderate',
        },
        confidence: 0.85,
      };
    } catch (error) {
      logger.error('prediction.risk', 'Risk prediction failed', { message: error.message });
      throw error;
    }
  },

  /**
   * Get AI analysis for medical report
   * @param {String} text - Extracted text from report
   * @param {String} reportType - Type of report
   * @returns {Promise<Object>} - Analysis result
   */
  getPrediction: async (text, reportType) => {
    try {
      logger.info('prediction.ai', 'Report AI prediction started', {
        reportType,
        textLength: text?.length || 0,
      });

      const response = {
        findings: 'Sample findings from AI analysis',
        riskFactors: ['Factor 1', 'Factor 2'],
        recommendations: ['Recommendation 1', 'Recommendation 2'],
        confidence: 0.85,
      };

      logger.info('prediction.ai', 'Report AI prediction completed', {
        reportType,
        recommendationCount: response.recommendations.length,
        confidence: response.confidence,
      });

      return response;

      // Example future integration:
      // const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
      // const result = await axios.post(`${aiServiceUrl}/predict`, { text, reportType });
      // return result.data;
    } catch (error) {
      logger.error('prediction.ai', 'Report AI prediction failed', {
        reportType,
        message: error.message,
      });
      throw new Error('Failed to get AI predictions');
    }
  },
};

function validateVitals(vitals) {
  if (!vitals) {
    return { valid: false, error: 'Vitals data is required' };
  }

  const { age, weight, height, systolic, diastolic, sleepHours, dietQuality, activityLevel } = vitals;

  if (!age || age < 18 || age > 120) {
    return { valid: false, error: 'Age must be between 18 and 120' };
  }

  if (!weight || weight < 20 || weight > 300) {
    return { valid: false, error: 'Weight must be between 20 and 300 kg' };
  }

  if (!height || height < 100 || height > 250) {
    return { valid: false, error: 'Height must be between 100 and 250 cm' };
  }

  if (!systolic || systolic < 50 || systolic > 250) {
    return { valid: false, error: 'Systolic BP must be between 50 and 250' };
  }

  if (!diastolic || diastolic < 30 || diastolic > 150) {
    return { valid: false, error: 'Diastolic BP must be between 30 and 150' };
  }

  if (sleepHours !== undefined && sleepHours !== null) {
    const sleep = Number(sleepHours);
    if (Number.isNaN(sleep) || sleep < 0 || sleep > 24) {
      return { valid: false, error: 'Sleep hours must be between 0 and 24' };
    }
  }

  if (dietQuality && !['poor', 'average', 'good'].includes(dietQuality.toLowerCase())) {
    return { valid: false, error: 'Diet quality must be poor, average, or good' };
  }

  if (activityLevel && !['low', 'moderate', 'high'].includes(activityLevel.toLowerCase())) {
    return { valid: false, error: 'Activity level must be low, moderate, or high' };
  }

  return { valid: true };
}

function calculateBMI(weight, height) {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

function calculateRiskFactors(vitals) {
  const { age, weight, height, systolic, diastolic, smoker, diabetes, sleepHours, dietQuality, activityLevel } = vitals;
  const bmi = calculateBMI(weight, height);
  const normalizedDiet = dietQuality ? dietQuality.toLowerCase() : 'average';
  const normalizedActivity = activityLevel ? activityLevel.toLowerCase() : 'moderate';
  const sleep = sleepHours !== undefined && sleepHours !== null ? Number(sleepHours) : null;

  return {
    ageRisk: age > 60,
    advancedAgeRisk: age > 75,
    overweight: bmi >= 25 && bmi < 30,
    obese: bmi >= 30,
    elevatedBP: systolic >= 120 && systolic < 130 && diastolic < 80,
    stage1Hypertension: (systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90),
    stage2Hypertension: systolic >= 140 || diastolic >= 90,
    hypertensiveCrisis: systolic > 180 || diastolic > 120,
    smoker: smoker === true,
    diabetes: diabetes === true,
    poorSleep: sleep !== null ? sleep < 6 || sleep > 9 : false,
    poorDiet: normalizedDiet === 'poor',
    lowActivity: normalizedActivity === 'low',
    goodDiet: normalizedDiet === 'good',
    activeLifestyle: normalizedActivity === 'high',
  };
}

function determineRiskLevel(riskFactors) {
  if (riskFactors.hypertensiveCrisis) {
    return 'critical';
  }

  const highRiskCount = Object.values({
    ...riskFactors,
    advancedAgeRisk: riskFactors.advancedAgeRisk,
    obese: riskFactors.obese,
    stage2Hypertension: riskFactors.stage2Hypertension,
    diabetes: riskFactors.diabetes,
    smoker: riskFactors.smoker,
  }).filter(Boolean).length;

  if (
    riskFactors.stage2Hypertension ||
    riskFactors.obese ||
    (riskFactors.advancedAgeRisk && riskFactors.smoker) ||
    highRiskCount >= 3 ||
    riskFactors.poorDiet ||
    riskFactors.poorSleep
  ) {
    return 'high';
  }

  const mediumRiskCount = Object.values({
    ageRisk: riskFactors.ageRisk,
    overweight: riskFactors.overweight,
    stage1Hypertension: riskFactors.stage1Hypertension,
    smoker: riskFactors.smoker,
    poorDiet: riskFactors.poorDiet,
    poorSleep: riskFactors.poorSleep,
    lowActivity: riskFactors.lowActivity,
  }).filter(Boolean).length;

  if (
    riskFactors.stage1Hypertension ||
    riskFactors.overweight ||
    riskFactors.poorDiet ||
    riskFactors.poorSleep ||
    mediumRiskCount >= 2
  ) {
    return 'medium';
  }

  return 'low';
}

function calculateRiskScore(riskFactors) {
  let score = 20;

  if (riskFactors.ageRisk) score += 5;
  if (riskFactors.advancedAgeRisk) score += 10;
  if (riskFactors.overweight) score += 5;
  if (riskFactors.obese) score += 15;
  if (riskFactors.elevatedBP) score += 5;
  if (riskFactors.stage1Hypertension) score += 15;
  if (riskFactors.stage2Hypertension) score += 25;
  if (riskFactors.hypertensiveCrisis) score += 50;
  if (riskFactors.smoker) score += 15;
  if (riskFactors.diabetes) score += 15;
  if (riskFactors.poorDiet) score += 10;
  if (riskFactors.poorSleep) score += 10;
  if (riskFactors.lowActivity) score += 8;
  if (riskFactors.goodDiet) score -= 5;
  if (riskFactors.activeLifestyle) score -= 5;

  return Math.min(Math.max(score, 0), 100);
}

function generateRecommendations(riskFactors, vitals) {
  const recommendations = [];

  if (riskFactors.stage2Hypertension || riskFactors.hypertensiveCrisis) {
    recommendations.push('Urgent: seek immediate medical attention for blood pressure management');
  } else if (riskFactors.stage1Hypertension) {
    recommendations.push('Monitor blood pressure regularly and consult a healthcare provider');
  } else if (riskFactors.elevatedBP) {
    recommendations.push('Reduce salt intake and increase physical activity to manage blood pressure');
  }

  if (riskFactors.obese) {
    recommendations.push('Consult a nutritionist for weight management and implement a structured diet plan');
  } else if (riskFactors.overweight) {
    recommendations.push('Aim for a healthy weight through balanced diet and regular exercise');
  }

  if (riskFactors.advancedAgeRisk) {
    recommendations.push('Annual comprehensive health checkup recommended for age group 75+');
  } else if (riskFactors.ageRisk) {
    recommendations.push('Regular health checkups are recommended for age 60+');
  }

  if (riskFactors.smoker) {
    recommendations.push('Quit smoking immediately to reduce cardiovascular risk');
  }

  if (riskFactors.diabetes) {
    recommendations.push('Maintain strict blood sugar control and follow your diabetes management plan');
  }

  if (riskFactors.poorDiet) {
    recommendations.push('Improve dietary quality with vegetables, lean proteins, and whole grains');
  } else if (riskFactors.goodDiet) {
    recommendations.push('Continue with a healthy diet and keep monitoring portion sizes');
  }

  if (riskFactors.poorSleep) {
    recommendations.push('Aim for 7-9 hours of consistent sleep every night');
  }

  if (riskFactors.lowActivity) {
    recommendations.push('Increase physical activity gradually, targeting moderate exercise most days');
  }

  if (!riskFactors.obese && !riskFactors.smoker) {
    recommendations.push('Maintain at least 150 minutes of moderate exercise per week');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue maintaining healthy lifestyle habits and regular checkups');
  }

  return recommendations;
}

module.exports = predictionService;
