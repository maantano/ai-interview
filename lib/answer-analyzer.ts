import type { InterviewQuestion, AnalysisResult, JobCategory } from "@/types/interview"

export function analyzeUserAnswer(
  question: InterviewQuestion,
  answer: string,
  category: JobCategory,
  customCategory?: string,
): AnalysisResult {
  const words = answer.trim().split(/\s+/)
  const sentences = answer.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  // 기본 분석 지표
  const wordCount = words.length
  const sentenceCount = sentences.length
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1)

  // 키워드 분석
  const jobKeywords = getJobKeywords(category, customCategory)
  const keywordMatches = jobKeywords.filter((keyword) => answer.toLowerCase().includes(keyword.toLowerCase())).length

  // 구체성 분석 (숫자, 구체적 예시 등)
  const hasNumbers = /\d+/.test(answer)
  const hasExamples = /예를 들어|예시|경험|프로젝트|회사|팀/.test(answer)
  const hasTimeframe = /년|개월|주|일|기간|동안/.test(answer)

  // 점수 계산
  let understanding = Math.min(25, Math.max(5, wordCount * 0.3 + keywordMatches * 3))
  let logic = Math.min(25, Math.max(5, sentenceCount * 2 + (avgWordsPerSentence > 8 ? 5 : 0)))
  let specificity = Math.min(25, Math.max(5, (hasNumbers ? 8 : 0) + (hasExamples ? 10 : 0) + (hasTimeframe ? 7 : 0)))
  let relevance = Math.min(25, Math.max(5, keywordMatches * 4 + (wordCount > 50 ? 5 : 0)))

  // 답변이 너무 짧으면 점수 감점
  if (wordCount < 20) {
    understanding *= 0.6
    logic *= 0.6
    specificity *= 0.4
    relevance *= 0.7
  }

  // 답변이 너무 길면 약간 감점
  if (wordCount > 200) {
    understanding *= 0.9
    logic *= 0.8
  }

  const totalScore = Math.round(understanding + logic + specificity + relevance)

  // 피드백 생성
  const strengths = generateStrengths(answer, wordCount, hasExamples, keywordMatches)
  const improvements = generateImprovements(answer, wordCount, hasExamples, hasNumbers, keywordMatches)
  const idealAnswer = generateIdealAnswer(question, category, customCategory)

  return {
    id: `analysis-${Date.now()}`,
    questionId: question.id,
    answer: answer, // Changed from userAnswer to answer
    totalScore,
    scores: {
      understanding: Math.round(understanding),
      logic: Math.round(logic),
      specificity: Math.round(specificity),
      jobFit: Math.round(relevance), // Changed from relevance to jobFit
    },
    strengths,
    improvements,
    sampleAnswer: idealAnswer, // Changed from idealAnswer to sampleAnswer
    detailedFeedback: `답변의 ${Math.max(strengths.length, 1)}가지 강점이 있으나, ${Math.max(improvements.length, 1)}가지 개선점이 필요합니다. 특히 ${improvements[0] || '구체적인 경험 제시'}가 중요합니다.`,
    conceptualExplanation: `이 질문은 ${jobCategory}의 핵심 역량을 평가하기 위한 것입니다. 실무 경험과 문제 해결 능력을 구체적으로 보여주는 것이 중요합니다.`,
    createdAt: new Date(),
  }
}

function getJobKeywords(category: JobCategory, customCategory?: string): string[] {
  const keywords: Record<JobCategory, string[]> = {
    frontend: ["React", "JavaScript", "CSS", "HTML", "UI", "UX", "컴포넌트", "반응형", "브라우저", "사용자"],
    backend: ["API", "데이터베이스", "서버", "성능", "보안", "확장성", "아키텍처", "최적화"],
    planner: ["기획", "요구사항", "분석", "사용자", "프로세스", "개선", "전략", "목표"],
    designer: ["디자인", "사용자", "경험", "인터페이스", "브랜드", "시각적", "레이아웃", "색상"],
    marketer: ["마케팅", "고객", "브랜드", "캠페인", "분석", "성과", "타겟", "전략"],
    other: customCategory ? [customCategory] : ["경험", "역량", "성과", "목표"],
  }

  return keywords[category] || []
}

function generateStrengths(answer: string, wordCount: number, hasExamples: boolean, keywordMatches: number): string[] {
  const strengths: string[] = []

  if (wordCount >= 50) {
    strengths.push("충분한 분량으로 답변을 작성했습니다")
  }

  if (hasExamples) {
    strengths.push("구체적인 경험과 예시를 포함했습니다")
  }

  if (keywordMatches >= 2) {
    strengths.push("직무와 관련된 전문 용어를 적절히 사용했습니다")
  }

  if (answer.includes("문제") || answer.includes("해결")) {
    strengths.push("문제 해결 능력을 잘 어필했습니다")
  }

  if (strengths.length === 0) {
    strengths.push("질문에 성실하게 답변하려는 의지가 보입니다")
  }

  return strengths.slice(0, 3)
}

function generateImprovements(
  answer: string,
  wordCount: number,
  hasExamples: boolean,
  hasNumbers: boolean,
  keywordMatches: number,
): string[] {
  const improvements: string[] = []

  if (wordCount < 30) {
    improvements.push("답변을 더 구체적이고 자세하게 작성해보세요")
  }

  if (!hasExamples) {
    improvements.push("실제 경험이나 구체적인 예시를 포함하면 더 좋습니다")
  }

  if (!hasNumbers) {
    improvements.push("성과나 결과를 수치로 표현하면 더 설득력이 있습니다")
  }

  if (keywordMatches < 2) {
    improvements.push("해당 직무와 관련된 전문 용어를 더 활용해보세요")
  }

  if (improvements.length === 0) {
    improvements.push("답변의 논리적 구조를 더 명확하게 정리해보세요")
  }

  return improvements.slice(0, 3)
}

function generateIdealAnswer(question: InterviewQuestion, category: JobCategory, customCategory?: string): string {
  const jobTitle = category === "other" ? customCategory : category

  const templates = [
    `${jobTitle} 직무에서 이 질문에 대한 이상적인 답변은 구체적인 경험과 성과를 포함하여 논리적으로 구성되어야 합니다. 문제 상황, 해결 과정, 결과를 순서대로 설명하고 배운 점을 언급하는 것이 좋습니다.`,
    `효과적인 답변을 위해서는 STAR 기법(Situation, Task, Action, Result)을 활용하여 상황을 설명하고, 본인의 역할과 행동, 그리고 구체적인 성과를 수치와 함께 제시하는 것이 중요합니다.`,
    `이 질문에 대해서는 ${jobTitle} 직무의 핵심 역량을 보여줄 수 있는 실제 사례를 들어 설명하고, 그 과정에서 어떤 어려움이 있었는지, 어떻게 극복했는지를 구체적으로 언급하면 좋습니다.`,
  ]

  return templates[Math.floor(Math.random() * templates.length)]
}
