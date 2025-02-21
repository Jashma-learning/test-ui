import { NextResponse } from 'next/server';
import { AssessmentService } from '@/app/services/assessmentService';

const assessmentService = new AssessmentService();

export async function POST(request: Request) {
  try {
    const assessment = await request.json();
    const challenge = await assessmentService.generateChallenge(assessment);
    
    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate assessment' },
      { status: 500 }
    );
  }
} 