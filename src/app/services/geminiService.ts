import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateAgeAppropriateTest(age: number, type: string) {
    const prompt = `Generate an interactive cognitive test for a ${age}-year-old child.
    Focus on ${type} assessment.
    Include:
    - Age-appropriate visual elements
    - Clear instructions
    - Engaging interactive components
    - Multiple difficulty levels
    - Emotional intelligence indicators
    Return as structured JSON with:
    - Test content
    - Correct responses
    - Scoring metrics
    - Development indicators`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Error generating test:', error);
      throw error;
    }
  }

  async analyzeTestResults(results: any) {
    const prompt = `Analyze these cognitive test results:
    ${JSON.stringify(results)}
    Provide:
    - Cognitive strengths
    - Areas for improvement
    - Development recommendations
    - Age-appropriate activities`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error analyzing results:', error);
      throw error;
    }
  }
} 