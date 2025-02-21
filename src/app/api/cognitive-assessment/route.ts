import { NextResponse } from 'next/server';
import { GeminiService } from '@/app/services/geminiService';

const geminiService = new GeminiService(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { age, type } = await request.json();
    
    const test = await geminiService.generateAgeAppropriateTest(age, type);
    
    return NextResponse.json({ test });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate test' },
      { status: 500 }
    );
  }
} 