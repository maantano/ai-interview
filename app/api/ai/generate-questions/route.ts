import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions, checkAPIHealth } from '@/lib/ai/gemini-service';
import { checkRateLimit, recordUsage } from '@/lib/usage-tracker';
import { mockQuestions } from '@/data/mock-questions';
import type { JobCategory, InterviewQuestion } from '@/types/interview';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { category, customCategory }: { category: JobCategory; customCategory?: string } = body;

    // Validate required fields
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    // Check rate limits
    const rateLimitCheck = checkRateLimit(request, 'questionGeneration');
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: rateLimitCheck.message,
          type: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    // Check API health first
    const healthCheck = await checkAPIHealth();
    let questions: InterviewQuestion[] = [];
    let aiGenerated = false;

    if (healthCheck.available) {
      try {
        // Try to generate questions with AI
        const result = await generateQuestions(category, customCategory);
        
        if (result.success && result.questions.length >= 20) {
          questions = result.questions;
          aiGenerated = true;
          
          // Record successful usage
          recordUsage(request, 'questionGeneration');
        } else {
          throw new Error(result.error || 'Insufficient questions generated');
        }
      } catch (aiError) {
        console.error('AI generation failed, falling back to mock:', aiError);
        // Fall through to mock questions
      }
    }

    // Fallback to mock questions if AI failed or unavailable
    if (!aiGenerated) {
      const mockData = mockQuestions[category];
      if (!mockData || mockData.length === 0) {
        return NextResponse.json(
          { success: false, error: `No questions available for category: ${category}` },
          { status: 404 }
        );
      }

      // Select 25 random questions from mock data (or all if less than 25)
      const shuffled = [...mockData].sort(() => 0.5 - Math.random());
      questions = shuffled.slice(0, Math.min(25, mockData.length));
    }

    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        aiGenerated,
        category,
        customCategory: category === 'other' ? customCategory : undefined,
        count: questions.length,
        remaining: rateLimitCheck.remaining,
      },
    });

  } catch (error) {
    console.error('Error in generate-questions API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get usage stats
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'health') {
      const healthCheck = await checkAPIHealth();
      return NextResponse.json({
        success: true,
        health: healthCheck,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'usage') {
      const rateLimitCheck = checkRateLimit(request, 'questionGeneration');
      return NextResponse.json({
        success: true,
        rateLimit: {
          allowed: rateLimitCheck.allowed,
          remaining: rateLimitCheck.remaining,
          message: rateLimitCheck.message,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in generate-questions GET:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}