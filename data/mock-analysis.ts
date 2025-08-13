import type { AnalysisResult, AnalysisScore } from "@/types/interview"

export const generateMockAnalysis = (questionId: string, answer: string): AnalysisResult => {
  // 답변 길이에 따른 기본 점수 조정
  const answerLength = answer.length
  const lengthBonus = Math.min(answerLength / 10, 20) // 최대 20점 보너스

  // 랜덤 점수 생성 (60-95 범위)
  const baseScore = 60 + Math.random() * 35

  const scores: AnalysisScore = {
    understanding: Math.min(95, Math.round(baseScore + Math.random() * 10 + lengthBonus)),
    logic: Math.min(95, Math.round(baseScore + Math.random() * 15 + lengthBonus)),
    specificity: Math.min(95, Math.round(baseScore + Math.random() * 20 + lengthBonus)),
    jobFit: Math.min(95, Math.round(baseScore + Math.random() * 10 + lengthBonus)),
  }

  const totalScore = Math.round((scores.understanding + scores.logic + scores.specificity + scores.jobFit) / 4)

  const strengths = [
    "질문의 핵심을 잘 파악하고 답변하셨습니다.",
    "구체적인 경험을 바탕으로 설명해주셨네요.",
    "논리적인 구조로 답변을 구성하셨습니다.",
    "실무에 적용 가능한 내용으로 답변하셨습니다.",
  ]

  const improvements = [
    "더 구체적인 수치나 결과를 포함하면 좋겠습니다.",
    "경험한 어려움과 해결 과정을 추가로 설명해보세요.",
    "해당 직무와의 연관성을 더 명확히 표현해보세요.",
    "답변의 결론 부분을 더 강화해보세요.",
  ]

  const sampleAnswers = [
    "저는 이전 프로젝트에서 성능 최적화를 위해 코드 스플리팅과 이미지 최적화를 적용했습니다. 그 결과 페이지 로딩 시간을 30% 단축시킬 수 있었고, 사용자 만족도가 크게 향상되었습니다. 특히 모바일 환경에서의 개선 효과가 두드러졌으며, 이를 통해 전환율도 15% 증가했습니다.",
    "팀 프로젝트에서 의견 충돌이 있을 때는 먼저 각자의 관점을 충분히 듣고 이해하려고 노력합니다. 그 다음 데이터와 사용자 피드백을 바탕으로 객관적인 판단 기준을 제시하여 합리적인 결론을 도출합니다. 이런 방식으로 팀의 화합을 유지하면서도 최적의 결과를 얻을 수 있었습니다.",
  ]

  return {
    id: `analysis-${Date.now()}`,
    questionId,
    answer,
    scores,
    totalScore,
    strengths: strengths.slice(0, 2 + Math.floor(Math.random() * 2)),
    improvements: improvements.slice(0, 2 + Math.floor(Math.random() * 2)),
    sampleAnswer: sampleAnswers[Math.floor(Math.random() * sampleAnswers.length)],
    createdAt: new Date(),
  }
}
