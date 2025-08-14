import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  JobCategory,
  InterviewQuestion,
  AnalysisResult,
} from "@/types/interview";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
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
    const jobTitle =
      category === "other"
        ? customCategory || "일반"
        : getJobTitleInKorean(category);

    const prompt = `당신은 ${jobTitle} 분야의 전문 면접관입니다.
2024-2025년 현재 트렌드에 맞는 실제적인 면접 질문 10개를 생성해주세요.

조건:
1. 실무 경험을 평가할 수 있는 구체적인 질문
2. 해당 직무의 핵심 역량을 다루는 질문
3. 최신 기술/트렌드가 반영된 질문
4. 난이도: 쉬움 3개, 보통 5개, 어려움 2개
5. 질문은 15-150자 사이로 작성
6. 한국어로 작성

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
      .filter((q: {question?: string, difficulty?: string, category?: string}) => q.question && q.difficulty && q.category)
      .map((q: {question: string, difficulty: string, category: string}, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        category: category,
        question: q.question.trim(),
        difficulty: q.difficulty as "easy" | "medium" | "hard",
      }))
      .slice(0, 10); // Ensure maximum 10 questions

    if (questions.length < 5) {
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
      await new Promise((resolve) => setTimeout(resolve, delay));
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
    const jobTitle =
      category === "other"
        ? customCategory || "일반"
        : getJobTitleInKorean(category);

    const prompt = `당신은 ${jobTitle} 분야의 전문 면접관입니다. 다음 면접 질문과 지원자의 답변을 상세히 분석해주세요.

면접 질문: ${question}
지원자 답변: ${answer}
직무: ${jobTitle}

분석 기준:
이 면접 질문이 무엇을 평가하려는지, 해당 직무에서 중요한 역량이 무엇인지를 고려하여 답변을 평가해주세요.

다음 기준으로 25점씩 평가:
1. 질문 이해도 (0-25점): 질문의 핵심 의도를 정확히 파악하고 답변했는가
2. 논리적 구성 (0-25점): 답변이 체계적이고 논리적으로 구성되었는가
3. 구체성 (0-25점): 구체적인 경험, 사례, 수치 등이 포함되었는가
4. 직무 적합성 (0-25점): 해당 직무에서 요구하는 역량과 연관성이 있는가

특별 고려사항:
- 답변이 너무 짧거나 "모르겠습니다"와 같은 경우, 해당 질문이 요구하는 지식/경험에 대해 구체적으로 안내해주세요
- 질문의 맥락을 고려하여 어떤 답변이 기대되는지 명확히 제시해주세요
- ${jobTitle} 직무의 실무 관점에서 실용적인 피드백을 제공해주세요

**중요: 오직 아래의 JSON 형식으로만 응답하세요. 추가 설명이나 텍스트는 포함하지 마세요.**

{
  "scores": {
    "understanding": 20,
    "logic": 15,
    "specificity": 10,
    "relevance": 18
  },
  "totalScore": 63,
  "strengths": ["구체적인 예시", "논리적 설명"],
  "improvements": ["경험 추가 필요", "구체적 수치 제시"],
  "feedback": "질문의 핵심을 이해했으나 구체적인 경험 사례가 부족합니다. 실제 프로젝트 경험을 바탕으로 답변해보세요.",
  "idealAnswer": "${jobTitle} 업무에서 실제로 사용한 구체적인 기술이나 방법론을 예시로 들어 설명하는 것이 좋습니다.",
  "conceptualExplanation": "이 질문은 지원자의 기술적 역량과 실무 경험을 평가하기 위한 것입니다. 핵심 개념과 배경 지식을 포함한 설명을 제공하세요."
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

    if (typeof analysisData.totalScore !== "number") {
      console.error("Invalid totalScore in AI response:", analysisData);
      throw new Error(
        "Invalid analysis response structure: invalid totalScore"
      );
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
        understanding: Math.max(
          0,
          Math.min(25, analysisData.scores.understanding)
        ),
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
      sampleAnswer:
        analysisData.idealAnswer || "모범 답변을 생성할 수 없습니다.",
      detailedFeedback: analysisData.feedback || undefined, // 구체적인 첨삭 내용
      conceptualExplanation:
        (analysisData as {conceptualExplanation?: string}).conceptualExplanation || undefined, // 질문의 의도와 개념 설명
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
      await new Promise((resolve) => setTimeout(resolve, delay));
      return analyzeAnswer(
        questionId,
        question,
        answer,
        category,
        customCategory,
        retryCount + 1
      );
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
export async function checkAPIHealth(): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return {
        available: false,
        error: "NEXT_PUBLIC_GEMINI_API_KEY not configured",
      };
    }

    const result = await model.generateContent("Hello, respond with 'OK'");
    const response = await result.response;
    const text = response.text();

    return {
      available: text.includes("OK"),
      error: text.includes("OK") ? undefined : "Unexpected response",
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
