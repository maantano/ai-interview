import { NextRequest, NextResponse } from 'next/server';
import { analyzeAnswer, checkAPIHealth } from '@/lib/ai/gemini-service';
import { checkRateLimit, recordUsage } from '@/lib/usage-tracker';
import { analyzeUserAnswer } from '@/lib/answer-analyzer';
import type { JobCategory, AnalysisResult } from '@/types/interview';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { 
      questionId, 
      question, 
      answer, 
      category, 
      customCategory 
    }: { 
      questionId: string;
      question: string;
      answer: string;
      category: JobCategory;
      customCategory?: string;
    } = body;

    // Validate required fields
    if (!questionId || !question || !answer || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: questionId, question, answer, category' },
        { status: 400 }
      );
    }

    // Validate answer length
    if (answer.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: '답변은 최소 10글자 이상 작성해주세요.' },
        { status: 400 }
      );
    }

    if (answer.trim().length > 2000) {
      return NextResponse.json(
        { success: false, error: '답변은 2000글자를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // Check rate limits
    const rateLimitCheck = checkRateLimit(request, 'answerAnalysis');
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
    let analysis: AnalysisResult;
    let aiGenerated = false;

    if (healthCheck.available) {
      try {
        // Try to analyze with AI
        const result = await analyzeAnswer(
          questionId, 
          question, 
          answer, 
          category, 
          customCategory
        );
        
        if (result.success) {
          analysis = result.analysis;
          aiGenerated = true;
          
          // Record successful usage
          recordUsage(request, 'answerAnalysis');
        } else {
          throw new Error(result.error || 'Analysis failed');
        }
      } catch (aiError) {
        console.error('AI analysis failed, falling back to local:', aiError);
        // Fall through to local analysis
      }
    }

    // Fallback to local analysis if AI failed or unavailable
    if (!aiGenerated) {
      // Create mock question object for local analyzer
      const mockQuestion = {
        id: questionId,
        question,
        category,
        difficulty: 'medium' as const
      };
      
      analysis = analyzeUserAnswer(mockQuestion, answer, category, customCategory);
    }

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        aiGenerated,
        category,
        customCategory: category === 'other' ? customCategory : undefined,
        answerLength: answer.trim().length,
        remaining: rateLimitCheck.remaining,
      },
    });

  } catch (error) {
    console.error('Error in analyze-answer API:', error);
    
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
    // Get usage stats and rate limit info
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
      const rateLimitCheck = checkRateLimit(request, 'answerAnalysis');
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
    console.error('Error in analyze-answer GET:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}