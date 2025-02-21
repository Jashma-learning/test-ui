import { GoogleGenerativeAI } from '@google/generative-ai';
import { Assessment, Challenge } from '../types/assessment';

export class AssessmentService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateChallenge(assessment: Assessment): Promise<Challenge> {
    const prompt = `Create an age-appropriate cognitive challenge for a ${assessment.ageGroup}-year-old.
    Category: ${assessment.category}
    Format: ${assessment.format}
    Difficulty: ${assessment.difficulty}
    
    Include:
    - Clear instructions
    - Challenge data (patterns, sequences, or story elements)
    - Scoring criteria
    - Time limit if applicable
    
    Return as JSON matching the Challenge type with:
    - type: string
    - prompt: string
    - data: any relevant challenge data
    - timeLimit: number (in seconds)
    - scoring: criteria object`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Error generating challenge:', error);
      throw error;
    }
  }

  async analyzePerformance(results: any) {
    const prompt = `Analyze this cognitive test performance:
    ${JSON.stringify(results)}
    
    Provide detailed analysis including:
    - Specific cognitive strengths identified
    - Areas needing improvement
    - Age-appropriate recommendations
    - Learning style insights
    
    Format as JSON with sections for strengths, improvements, and recommendations.`;

    try {
      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Error analyzing performance:', error);
      throw error;
    }
  }
} 