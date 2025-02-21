if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY is not configured in environment variables');
}

export const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// Add model configuration
export const AI_CONFIG = {
  modelName: 'gemini-pro',
  maxOutputTokens: 2048,
  temperature: 0.7,
  topP: 0.8,
  topK: 40
};

export const API_ENDPOINTS = {
  trivia: 'https://opentdb.com/api.php',
  dictionary: 'https://api.dictionaryapi.dev/api/v2/entries/en',
  numbers: 'http://numbersapi.com/random/math'
}; 