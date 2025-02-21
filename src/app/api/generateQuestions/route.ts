import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_AI_API_KEY, AI_CONFIG } from '@/app/utils/apiConfig';

const COGNITIVE_AREAS = {
  memory: {
    name: 'Memory & Recall',
    types: ['sequence', 'visual', 'auditory']
  },
  attention: {
    name: 'Attention & Focus',
    types: ['sustained', 'selective', 'divided']
  },
  processing: {
    name: 'Processing Speed',
    types: ['visual', 'auditory', 'decision']
  },
  reasoning: {
    name: 'Logical Reasoning',
    types: ['pattern', 'abstract', 'numerical']
  },
  spatial: {
    name: 'Spatial Awareness',
    types: ['visualization', 'orientation', 'relations']
  }
};

export async function POST(request: Request) {
  if (!GOOGLE_AI_API_KEY) {
    console.error('Missing API key');
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { age, area = 'memory' } = await request.json();
    console.log('Generating cognitive assessment for:', { age, area });

    // Sample cognitive assessment questions
    const questions = {
      questions: [
        {
          id: "1",
          type: "sequence_memory",
          question: "Remember and repeat the sequence",
          sequence: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"],  // Red, Green, Blue, Yellow
          delay: 1000, // 1 second per item
          minLength: 2,
          maxLength: 4,
          cognitiveArea: "memory",
          subType: "sequence"
        },
        {
          id: "2",
          type: "visual_pattern",
          question: "Complete the pattern",
          grid: [
            [true, false, true],
            [false, true, false],
            [true, false, false]  // Last position is target
          ],
          targetPosition: { x: 2, y: 2 },
          cognitiveArea: "spatial",
          subType: "pattern"
        },
        {
          id: "3",
          type: "reaction_time",
          question: "Click as soon as you see green",
          stimulus: "visual",
          delayRange: { min: 1000, max: 5000 },
          cognitiveArea: "processing",
          subType: "reaction"
        },
        {
          id: "4",
          type: "matching",
          question: "Match the related pairs",
          pairs: [
            { id: "a1", content: "Dog" },
            { id: "a2", content: "Puppy" },
            { id: "b1", content: "Cat" },
            { id: "b2", content: "Kitten" }
          ],
          shuffledPairs: [
            { id: "a1", content: "Dog" },
            { id: "b2", content: "Kitten" },
            { id: "b1", content: "Cat" },
            { id: "a2", content: "Puppy" }
          ],
          cognitiveArea: "memory",
          subType: "matching"
        }
      ]
    };

    return NextResponse.json(questions);

    /* Uncomment this when API is working
    const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: AI_CONFIG.modelName,
      generationConfig: {
        maxOutputTokens: AI_CONFIG.maxOutputTokens,
        temperature: AI_CONFIG.temperature,
        topP: AI_CONFIG.topP,
        topK: AI_CONFIG.topK,
      },
    });

    const prompt = `Create 5 multiple choice questions for ${grade}th grade ${subject}.
    Return as JSON array with this structure (no markdown, no additional text):
    {
      "questions": [
        {
          "id": "1",
          "question": "What is...?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Because..."
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const data = JSON.parse(text.replace(/```json|```/g, '').trim());
    return NextResponse.json(data);
    */

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate cognitive assessment' },
      { status: 500 }
    );
  }
}
