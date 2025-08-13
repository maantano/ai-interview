export type JobCategory = "frontend" | "backend" | "planner" | "designer" | "marketer" | "data-science" | "devops" | "product-management" | "qa" | "mobile-development" | "other"

export interface InterviewQuestion {
  id: string
  category: JobCategory
  question: string
  difficulty: "easy" | "medium" | "hard"
}

export interface AnalysisScore {
  understanding: number // 질문 이해도
  logic: number // 논리적 구성
  specificity: number // 구체성
  jobFit: number // 직무 적합성
}

export interface AnalysisResult {
  id: string
  questionId: string
  answer: string
  scores: AnalysisScore
  totalScore: number
  strengths: string[]
  improvements: string[]
  sampleAnswer: string
  createdAt: Date
}

export interface InterviewSession {
  id: string
  category: JobCategory
  customCategory?: string
  results: AnalysisResult[]
  createdAt: Date
  questionQueue: InterviewQuestion[]
  aiGenerated: boolean
}

export type AppScreen = "job-selection" | "loading" | "interview" | "analysis" | "history"
