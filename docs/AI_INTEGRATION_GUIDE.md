# AI 통합 가이드

## 개요
이 문서는 AI 면접 서비스에 AI 모델을 통합하는 방법을 상세히 설명합니다. OpenAI GPT-4 또는 Google Gemini를 사용하여 면접 질문 생성 및 답변 평가를 구현합니다.

## 1. AI 제공자 선택

### OpenAI GPT-4 (권장)
**장점:**
- 우수한 한국어 처리 능력
- 정교한 평가 및 피드백 생성
- 안정적인 API 서비스

**단점:**
- 상대적으로 높은 비용
- API 호출 속도 제한

**가격:**
- GPT-4: $0.03/1K input tokens, $0.06/1K output tokens
- GPT-3.5-turbo: $0.001/1K input tokens, $0.002/1K output tokens

### Google Gemini
**장점:**
- 무료 티어 제공 (분당 60 요청)
- 빠른 응답 속도
- 경쟁력 있는 가격

**단점:**
- 한국어 성능이 GPT-4보다 다소 낮음
- API 안정성 개선 필요

**가격:**
- Gemini Pro: 무료 티어 후 $0.00025/1K characters

## 2. API 키 설정

### 환경 변수 설정
```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key_here
# 또는
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# API 선택
AI_PROVIDER=openai # 또는 gemini

# Rate limiting
MAX_REQUESTS_PER_USER=20
MAX_REQUESTS_PER_MINUTE=60
```

## 3. API 통합 구현

### 3.1 AI 서비스 인터페이스
```typescript
// lib/ai/types.ts
export interface AIService {
  generateQuestion(category: string, difficulty: string): Promise<string>
  evaluateAnswer(question: string, answer: string, category: string): Promise<EvaluationResult>
  generateIdealAnswer(question: string, category: string): Promise<string>
}

export interface EvaluationResult {
  totalScore: number
  scores: {
    understanding: number
    logic: number
    specificity: number
    relevance: number
  }
  strengths: string[]
  improvements: string[]
  feedback: string
}
```

### 3.2 OpenAI 구현
```typescript
// lib/ai/openai-service.ts
import OpenAI from 'openai'

export class OpenAIService implements AIService {
  private client: OpenAI
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
  
  async generateQuestion(category: string, difficulty: string): Promise<string> {
    const prompt = `당신은 ${category} 분야의 면접관입니다.
    난이도 ${difficulty}의 면접 질문을 1개 생성해주세요.
    질문은 구체적이고 실무와 연관이 있어야 합니다.`
    
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    })
    
    return response.choices[0].message.content
  }
  
  async evaluateAnswer(question: string, answer: string, category: string): Promise<EvaluationResult> {
    const prompt = `면접 질문과 답변을 평가해주세요.
    
    직무: ${category}
    질문: ${question}
    답변: ${answer}
    
    다음 기준으로 평가해주세요:
    1. 질문 이해도 (25점)
    2. 논리적 구성 (25점)
    3. 구체성 (25점)
    4. 직무 적합성 (25점)
    
    JSON 형식으로 응답해주세요:
    {
      "totalScore": 총점,
      "scores": {
        "understanding": 점수,
        "logic": 점수,
        "specificity": 점수,
        "relevance": 점수
      },
      "strengths": ["잘한 점 1", "잘한 점 2"],
      "improvements": ["개선점 1", "개선점 2"],
      "feedback": "종합 피드백"
    }`
    
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
    
    return JSON.parse(response.choices[0].message.content)
  }
}
```

### 3.3 Gemini 구현
```typescript
// lib/ai/gemini-service.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

export class GeminiService implements AIService {
  private client: GoogleGenerativeAI
  
  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
  }
  
  async generateQuestion(category: string, difficulty: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `당신은 ${category} 분야의 면접관입니다.
    난이도 ${difficulty}의 면접 질문을 1개 생성해주세요.
    질문은 구체적이고 실무와 연관이 있어야 합니다.`
    
    const result = await model.generateContent(prompt)
    return result.response.text()
  }
  
  // evaluateAnswer 구현...
}
```

## 4. API 라우트 구현

### 4.1 질문 생성 API
```typescript
// app/api/questions/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AIServiceFactory } from '@/lib/ai/factory'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = req.ip ?? 'anonymous'
    const { success } = await rateLimit.check(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }
    
    const { category, difficulty = 'medium' } = await req.json()
    
    if (!category) {
      return NextResponse.json(
        { error: '직무 카테고리를 선택해주세요.' },
        { status: 400 }
      )
    }
    
    const aiService = AIServiceFactory.create()
    const question = await aiService.generateQuestion(category, difficulty)
    
    return NextResponse.json({ question })
  } catch (error) {
    console.error('Question generation failed:', error)
    return NextResponse.json(
      { error: '질문 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
```

### 4.2 답변 평가 API
```typescript
// app/api/answers/evaluate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AIServiceFactory } from '@/lib/ai/factory'

export async function POST(req: NextRequest) {
  try {
    const { question, answer, category } = await req.json()
    
    // 입력 검증
    if (!question || !answer || !category) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }
    
    // 답변 길이 검증
    if (answer.length < 50) {
      return NextResponse.json(
        { error: '답변이 너무 짧습니다. 최소 50자 이상 작성해주세요.' },
        { status: 400 }
      )
    }
    
    const aiService = AIServiceFactory.create()
    const evaluation = await aiService.evaluateAnswer(question, answer, category)
    
    return NextResponse.json(evaluation)
  } catch (error) {
    console.error('Answer evaluation failed:', error)
    return NextResponse.json(
      { error: '답변 평가에 실패했습니다.' },
      { status: 500 }
    )
  }
}
```

## 5. 프론트엔드 통합

### 5.1 AI Hook 수정
```typescript
// hooks/use-interview.ts
export function useInterview() {
  // ... 기존 코드
  
  const generateNewQuestion = useCallback(async (category?: JobCategory) => {
    const targetCategory = category || currentSession?.category
    if (!targetCategory) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: targetCategory })
      })
      
      if (!response.ok) {
        throw new Error('질문 생성 실패')
      }
      
      const { question } = await response.json()
      setCurrentQuestion({
        id: `q-${Date.now()}`,
        question,
        category: targetCategory,
        difficulty: 'medium'
      })
    } catch (error) {
      console.error('Failed to generate question:', error)
      // Fallback to mock questions
      const questions = mockQuestions[targetCategory]
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
      setCurrentQuestion(randomQuestion)
    } finally {
      setIsLoading(false)
    }
  }, [currentSession])
  
  const analyzeAnswer = useCallback(async () => {
    if (!currentQuestion || !currentAnswer.trim() || !currentSession) return
    
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/answers/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: currentAnswer,
          category: currentSession.category
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '평가 실패')
      }
      
      const evaluation = await response.json()
      
      const analysis: AnalysisResult = {
        id: `analysis-${Date.now()}`,
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        userAnswer: currentAnswer,
        totalScore: evaluation.totalScore,
        scores: evaluation.scores,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        feedback: evaluation.feedback,
        idealAnswer: evaluation.idealAnswer || '',
        timestamp: new Date()
      }
      
      // 세션에 결과 추가
      const updatedSession = {
        ...currentSession,
        results: [...currentSession.results, analysis]
      }
      
      setCurrentSession(updatedSession)
      setCurrentAnalysis(analysis)
      storage.saveCurrentSession(updatedSession)
      setCurrentScreen('analysis')
    } catch (error) {
      console.error('Analysis failed:', error)
      // Fallback to local analysis
      const analysis = analyzeUserAnswer(
        currentQuestion,
        currentAnswer,
        currentSession.category,
        currentSession.customCategory
      )
      // ... 동일한 처리
    } finally {
      setIsAnalyzing(false)
    }
  }, [currentQuestion, currentAnswer, currentSession])
}
```

## 6. 비용 최적화 전략

### 6.1 캐싱 전략
```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN
})

export async function getCachedOrGenerate<T>(
  key: string,
  generator: () => Promise<T>,
  ttl: number = 3600 // 1시간
): Promise<T> {
  const cached = await redis.get(key)
  if (cached) return cached as T
  
  const result = await generator()
  await redis.set(key, result, { ex: ttl })
  return result
}
```

### 6.2 Rate Limiting
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 h'), // 시간당 20 요청
  analytics: true
})
```

## 7. 에러 처리 및 폴백

### 7.1 Retry 로직
```typescript
// lib/ai/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }
  
  throw lastError!
}
```

### 7.2 Fallback 전략
```typescript
// lib/ai/fallback.ts
export class AIServiceWithFallback implements AIService {
  private primary: AIService
  private fallback: AIService
  
  constructor(primary: AIService, fallback: AIService) {
    this.primary = primary
    this.fallback = fallback
  }
  
  async generateQuestion(category: string, difficulty: string): Promise<string> {
    try {
      return await withRetry(() => this.primary.generateQuestion(category, difficulty))
    } catch (error) {
      console.error('Primary AI service failed, using fallback:', error)
      return await this.fallback.generateQuestion(category, difficulty)
    }
  }
}
```

## 8. 모니터링 및 로깅

### 8.1 API 사용량 추적
```typescript
// lib/monitoring/usage.ts
export async function trackAIUsage(
  provider: string,
  operation: string,
  tokens: number,
  cost: number
) {
  await db.aiUsage.create({
    data: {
      provider,
      operation,
      tokens,
      cost,
      timestamp: new Date()
    }
  })
  
  // 일일 한도 체크
  const dailyUsage = await getDailyUsage()
  if (dailyUsage.cost > MAX_DAILY_COST) {
    await notifyAdmin('AI 사용 비용 한도 초과')
  }
}
```

## 9. 테스트 전략

### 9.1 Mock AI Service
```typescript
// lib/ai/__mocks__/mock-service.ts
export class MockAIService implements AIService {
  async generateQuestion(category: string): Promise<string> {
    const questions = {
      frontend: '리액트에서 상태 관리를 어떻게 하시나요?',
      backend: '데이터베이스 인덱싱의 중요성에 대해 설명해주세요.',
      // ...
    }
    return questions[category] || '기본 질문'
  }
  
  async evaluateAnswer(): Promise<EvaluationResult> {
    return {
      totalScore: 85,
      scores: {
        understanding: 22,
        logic: 21,
        specificity: 20,
        relevance: 22
      },
      strengths: ['명확한 답변', '좋은 구조'],
      improvements: ['더 구체적인 예시 필요'],
      feedback: '전반적으로 좋은 답변입니다.'
    }
  }
}
```

## 10. 구현 체크리스트

### Phase 1: 기본 설정 (필수)
- [ ] AI 제공자 선택 (OpenAI 또는 Gemini)
- [ ] API 키 발급 및 환경 변수 설정
- [ ] 기본 AI 서비스 클래스 구현
- [ ] API 라우트 생성

### Phase 2: 통합 (필수)
- [ ] 프론트엔드 Hook 수정
- [ ] 에러 처리 구현
- [ ] Loading 상태 UI 구현
- [ ] 로컬 폴백 메커니즘

### Phase 3: 최적화 (권장)
- [ ] Rate limiting 구현
- [ ] 캐싱 전략 적용
- [ ] Retry 로직 구현
- [ ] 비용 모니터링

### Phase 4: 고급 기능 (선택)
- [ ] 다중 AI 제공자 지원
- [ ] A/B 테스팅
- [ ] 사용자별 맞춤 평가
- [ ] 실시간 피드백

## 필요한 패키지 설치

```bash
# OpenAI 사용 시
npm install openai

# Gemini 사용 시
npm install @google/generative-ai

# 공통 (권장)
npm install @upstash/redis @upstash/ratelimit
npm install zod # 입력 검증용
```

## 예상 비용

### 일일 100명 사용 기준
- 평균 3개 질문/사용자
- 질문당 토큰: ~500 (생성) + ~1500 (평가)

**OpenAI GPT-4:**
- 일일: ~$18
- 월간: ~$540

**OpenAI GPT-3.5-turbo:**
- 일일: ~$1.8
- 월간: ~$54

**Google Gemini:**
- 일일: ~$0.75
- 월간: ~$22.5

## 지원 연락처

AI 통합 관련 문의사항이나 이슈가 있으시면 아래로 연락 주세요:
- 기술 지원: [프로젝트 GitHub Issues]
- 긴급 문의: [PM 연락처]

---
이 가이드를 참고하여 AI 통합을 진행하시고, 구현 중 발생하는 이슈는 공유해 주시면 함께 해결하겠습니다.