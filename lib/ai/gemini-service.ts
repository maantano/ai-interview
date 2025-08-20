import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JobCategory, InterviewQuestion, AnalysisResult } from "@/types/interview";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface QuestionGenerationResponse {
  success: boolean;
  questions: InterviewQuestion[];
  error?: string;
}

interface AnalysisResponse {
  success: boolean;
  analysis: AnalysisResult;
  error?: string;
}

interface AIAnalysisResponse {
  scores: {
    understanding: number;
    logic: number;
    specificity: number;
    relevance: number;
  };
  totalScore: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
  idealAnswer: string;
}

/**
 * Generate interview questions using Gemini AI
 */
export async function generateQuestions(
  category: JobCategory,
  customCategory?: string,
  retryCount = 0
): Promise<QuestionGenerationResponse> {
  try {
    const jobTitle = category === "other" ? customCategory || "일반" : getJobTitleInKorean(category);
    
    // 다양성을 위한 랜덤 시드 추가
    const randomSeed = Math.random().toString(36).substring(7);
    const currentTime = new Date().toISOString();
    
    const prompt = `[세션 ID: ${randomSeed}] [생성 시간: ${currentTime}]
당신은 ${jobTitle} 분야의 전문 면접관입니다.
2024-2025년 현재 트렌드에 맞는 실제적인 면접 질문 25개를 생성해주세요.

조건:
1. 실무 경험을 평가할 수 있는 구체적인 질문
2. 해당 직무의 핵심 역량을 다루는 질문  
3. 최신 기술/트렌드가 반영된 질문
4. 다양한 관점과 상황별 질문 포함:
   - 기술적 숙련도 (5-7개)
   - 문제해결 및 분석 (4-6개)  
   - 협업 및 커뮤니케이션 (3-5개)
   - 리더십 및 성장 (3-5개)
   - 업계 트렌드 및 미래 전망 (3-5개)
   - 실제 업무 상황 기반 시나리오 (3-5개)
5. 난이도: 쉬움 8개, 보통 12개, 어려움 5개
6. 질문은 15-150자 사이로 작성
7. 한국어로 작성
8. 이전 생성과 다른 창의적이고 독창적인 질문
9. 각 질문은 고유하고 다른 관점에서 접근

형식: 반드시 다음 JSON 배열 형식으로만 반환해주세요:
[
  {"question": "질문 내용", "difficulty": "easy|medium|hard", "category": "${category}"},
  ...
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON format in AI response");
    }
    
    const questionsData = JSON.parse(jsonMatch[0]);
    
    // Validate and format questions
    const questions: InterviewQuestion[] = questionsData
      .filter((q: {question?: string; difficulty?: string; category?: string}) => q.question && q.difficulty && q.category)
      .map((q: {question: string; difficulty: string; category: string}, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        category: category,
        question: q.question.trim(),
        difficulty: q.difficulty as "easy" | "medium" | "hard",
      }))
      .slice(0, 25); // Ensure maximum 25 questions

    if (questions.length < 20) {
      throw new Error("Generated insufficient number of valid questions");
    }

    return {
      success: true,
      questions,
    };
  } catch (error) {
    console.error("Error generating questions with AI:", error);
    
    // Retry logic with exponential backoff
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateQuestions(category, customCategory, retryCount + 1);
    }
    
    return {
      success: false,
      questions: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Analyze user answer using Gemini AI
 */
export async function analyzeAnswer(
  questionId: string,
  question: string,
  answer: string,
  category: JobCategory,
  customCategory?: string,
  retryCount = 0
): Promise<AnalysisResponse> {
  try {
    const jobTitle = category === "other" ? customCategory || "일반" : getJobTitleInKorean(category);
    
    const prompt = `당신은 ${jobTitle} 분야의 전문 면접관입니다. 다음 과정으로 면접 질문을 분석하고 지원자 답변을 평가해주세요.

면접 질문: "${question}"
지원자 답변: "${answer}"
직무: ${jobTitle}

### 1단계: 질문 분석
먼저 이 질문의 의도와 개념을 분석하세요:
- 이 질문이 평가하려는 핵심 역량은 무엇인가?
- ${jobTitle}에게 왜 이런 질문을 하는가?
- 어떤 배경 지식이나 경험을 확인하려는가?

### 2단계: 모범 답변 작성
위 분석을 바탕으로 실제 모범 답변을 작성하세요:
- STAR 방식(상황-행동-결과)으로 구성
- ${jobTitle}의 실무 경험을 바탕으로 한 구체적인 사례
- 정량적 결과나 성과 수치 포함
- 200-400자 분량의 완전한 답변

### 3단계: 지원자 답변 평가
다음 기준으로 25점씩 평가:
1. 질문 이해도 (0-25점): 질문의 핵심 의도를 정확히 파악하고 답변했는가
2. 논리적 구성 (0-25점): 답변이 체계적이고 논리적으로 구성되었는가
3. 구체성 (0-25점): 구체적인 경험, 사례, 수치 등이 포함되었는가
4. 직무 적합성 (0-25점): 해당 직무에서 요구하는 역량과 연관성이 있는가

**중요: 오직 아래의 JSON 형식으로만 응답하세요.**

{
  "scores": {
    "understanding": 실제평가점수,
    "logic": 실제평가점수,
    "specificity": 실제평가점수,
    "relevance": 실제평가점수
  },
  "totalScore": 총점,
  "strengths": ["강점1", "강점2"],
  "improvements": ["개선점1", "개선점2"],
  "feedback": "구체적인 피드백",
  "idealAnswer": "위에서 분석한 질문 의도를 바탕으로 작성한 실제 모범 답변 (STAR 방식, 구체적 사례와 수치 포함)",
  "conceptualExplanation": "1단계에서 분석한 이 질문의 핵심 개념, 평가 의도, 요구되는 역량에 대한 설명"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI response text:", text);
      throw new Error("Invalid JSON format in AI response");
    }
    
    let analysisData: AIAnalysisResponse;
    try {
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Extracted JSON:", jsonMatch[0]);
      throw new Error("Failed to parse AI response JSON");
    }
    
    // More flexible validation with detailed logging
    if (!analysisData.scores) {
      console.error("Missing scores in AI response:", analysisData);
      throw new Error("Invalid analysis response structure: missing scores");
    }
    
    if (typeof analysisData.totalScore !== 'number') {
      console.error("Invalid totalScore in AI response:", analysisData);
      throw new Error("Invalid analysis response structure: invalid totalScore");
    }
    
    if (!analysisData.feedback) {
      console.error("Missing feedback in AI response:", analysisData);
      throw new Error("Invalid analysis response structure: missing feedback");
    }

    // Create analysis result
    const analysis: AnalysisResult = {
      id: `analysis-${Date.now()}`,
      questionId,
      answer,
      scores: {
        understanding: Math.max(0, Math.min(25, analysisData.scores.understanding)),
        logic: Math.max(0, Math.min(25, analysisData.scores.logic)),
        specificity: Math.max(0, Math.min(25, analysisData.scores.specificity)),
        jobFit: Math.max(0, Math.min(25, analysisData.scores.relevance)),
      },
      totalScore: Math.max(0, Math.min(100, analysisData.totalScore)),
      strengths: Array.isArray(analysisData.strengths) 
        ? analysisData.strengths.slice(0, 3) 
        : ["AI 분석 결과를 정상적으로 받지 못했습니다."],
      improvements: Array.isArray(analysisData.improvements) 
        ? analysisData.improvements.slice(0, 3) 
        : ["다시 시도해주세요."],
      sampleAnswer: analysisData.idealAnswer || "모범 답변을 생성할 수 없습니다.",
      detailedFeedback: analysisData.feedback || undefined,  // 구체적인 첨삭 내용
      conceptualExplanation: (analysisData as AIAnalysisResponse & {conceptualExplanation?: string}).conceptualExplanation || undefined,  // 질문의 의도와 개념 설명
      createdAt: new Date(),
    };

    return {
      success: true,
      analysis,
    };
  } catch (error) {
    console.error("Error analyzing answer with AI:", error);
    
    // Retry logic with exponential backoff
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
      return analyzeAnswer(questionId, question, answer, category, customCategory, retryCount + 1);
    }
    
    return {
      success: false,
      analysis: {} as AnalysisResult,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get job title in Korean for prompts
 */
function getJobTitleInKorean(category: JobCategory): string {
  const jobTitles: Record<JobCategory, string> = {
    frontend: "프론트엔드 개발자",
    backend: "백엔드 개발자", 
    planner: "서비스 기획자",
    designer: "UI/UX 디자이너",
    marketer: "마케터",
    "data-science": "데이터 사이언티스트",
    devops: "DevOps 엔지니어",
    "product-management": "프로덕트 매니저",
    qa: "QA 엔지니어",
    "mobile-development": "모바일 개발자",
    other: "일반",
  };
  
  return jobTitles[category] || "일반";
}

/**
 * Check API availability and health
 */
export async function checkAPIHealth(): Promise<{ available: boolean; error?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { available: false, error: "GEMINI_API_KEY not configured" };
    }
    
    const result = await model.generateContent("Hello, respond with 'OK'");
    const response = await result.response;
    const text = response.text();
    
    return { available: text.includes("OK"), error: text.includes("OK") ? undefined : "Unexpected response" };
  } catch (error) {
    return { 
      available: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}