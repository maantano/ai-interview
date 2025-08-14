"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { InterviewSession, InterviewQuestion, AnalysisResult, AppScreen } from "@/types/interview"
import {
  ArrowLeft,
  Edit3,
  RefreshCw,
  History,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  Sparkles,
  Database,
} from "lucide-react"

const scoreLabels = {
  understanding: "질문 이해도",
  logic: "논리적 구성",
  specificity: "구체성",
  jobFit: "직무 적합성",
}

const getScoreColor = (score: number) => {
  if (score >= 85) return "text-green-600"
  if (score >= 70) return "text-blue-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

const getScoreGrade = (score: number) => {
  if (score >= 90) return "A+"
  if (score >= 85) return "A"
  if (score >= 80) return "B+"
  if (score >= 75) return "B"
  if (score >= 70) return "C+"
  if (score >= 65) return "C"
  return "D"
}

interface AnalysisScreenProps {
  currentSession: InterviewSession | null;
  currentQuestion: InterviewQuestion | null;
  currentAnalysis: AnalysisResult | null;
  isAnalyzing: boolean;
  editAnswer: () => void;
  nextQuestion: () => void;
  endSession: () => void;
  setCurrentScreen: (screen: AppScreen) => void;
}

export function AnalysisScreen({
  currentSession,
  currentQuestion, 
  currentAnalysis,
  isAnalyzing,
  editAnswer,
  nextQuestion,
  endSession,
  setCurrentScreen
}: AnalysisScreenProps) {

  // Debug logging
  console.log("🖥️ AnalysisScreen render:", {
    hasCurrentSession: !!currentSession,
    hasCurrentQuestion: !!currentQuestion,
    hasCurrentAnalysis: !!currentAnalysis,
    isAnalyzing,
    currentAnalysis,
    currentAnalysisType: typeof currentAnalysis,
    currentAnalysisKeys: currentAnalysis ? Object.keys(currentAnalysis) : null
  })

  const [animatedScore, setAnimatedScore] = useState(0)
  const [animatedScores, setAnimatedScores] = useState({
    understanding: 0,
    logic: 0,
    specificity: 0,
    jobFit: 0,
  })
  const [showSampleAnswer, setShowSampleAnswer] = useState(false)

  // 점수 애니메이션 효과
  useEffect(() => {
    if (!currentAnalysis || typeof currentAnalysis.totalScore !== 'number') {
      console.log("🎬 Skipping animation - invalid analysis data:", currentAnalysis);
      return;
    }
    
    console.log("🎬 Starting animation for analysis:", currentAnalysis)

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      // 총점 애니메이션
      const totalScore = currentAnalysis?.totalScore || 0;
      setAnimatedScore(Math.round(totalScore * progress))

      // 세부 점수 애니메이션 (with null checks)
      const scores = currentAnalysis?.scores || {};
      setAnimatedScores({
        understanding: Math.round((scores.understanding || 0) * progress),
        logic: Math.round((scores.logic || 0) * progress),
        specificity: Math.round((scores.specificity || 0) * progress),
        jobFit: Math.round((scores.jobFit || 0) * progress),
      })

      if (currentStep >= steps) {
        clearInterval(interval)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [currentAnalysis])

  // Show loading screen only if we don't have analysis data
  if (!currentSession || !currentQuestion || !currentAnalysis) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-25" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">AI가 답변을 분석하고 있습니다</h2>
            <p className="text-muted-foreground">
              전문적인 피드백을 제공하기 위해 분석 중입니다...
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              질문 이해도 분석 중...
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.5s]" />
              논리적 구성 평가 중...
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:1s]" />
              구체성 및 직무 적합성 검토 중...
            </div>
          </div>

          {/* Animated dots */}
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    )
  }

  // This condition should never be reached now since we handle !currentAnalysis above

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={endSession} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          처음으로
        </Button>
        <div className="flex items-center gap-2">
          <Badge 
            variant={currentSession.aiGenerated ? "default" : "outline"} 
            className={`text-xs ${currentSession.aiGenerated ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" : ""}`}
          >
            {currentSession.aiGenerated ? (
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI 분석
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                샘플 분석
              </div>
            )}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            분석 완료
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {/* 총점 카드 */}
        <Card className="w-full">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">종합 점수</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
              {/* 원형 배경 */}
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(animatedScore / 100) * 314} 314`}
                  className={getScoreColor(currentAnalysis?.totalScore || 0)}
                  strokeLinecap="round"
                />
              </svg>
              {/* 점수 텍스트 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-3xl font-bold ${getScoreColor(currentAnalysis?.totalScore || 0)}`}>{animatedScore}</div>
                <div className="text-sm text-muted-foreground">/ 100</div>
                <div className={`text-xs font-semibold ${getScoreColor(currentAnalysis?.totalScore || 0)}`}>
                  {getScoreGrade(currentAnalysis?.totalScore || 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 세부 점수 카드 */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              세부 분석 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(scoreLabels).map(([key, label]) => {
              const score = animatedScores[key as keyof typeof animatedScores]
              const actualScore = currentAnalysis?.scores?.[key as keyof typeof currentAnalysis.scores] || 0
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{label}</span>
                    <span className={`text-sm font-bold ${getScoreColor(actualScore)}`}>{score || 0}/25</span>
                  </div>
                  <Progress value={((score || 0) / 25) * 100} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* AI 피드백 카드 */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              AI 피드백
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 잘한 점 */}
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                잘한 점
              </h4>
              <ul className="space-y-2">
                {(currentAnalysis?.strengths || []).map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    {strength || "데이터를 불러오는 중..."}
                  </li>
                ))}
              </ul>
            </div>

            {/* 개선할 점 */}
            <div className="space-y-3">
              <h4 className="font-semibold text-orange-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                개선할 점
              </h4>
              <ul className="space-y-2">
                {(currentAnalysis?.improvements || []).map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    {improvement || "데이터를 불러오는 중..."}
                  </li>
                ))}
              </ul>
            </div>

            {/* 구체적인 첨삭 내용 */}
            {currentAnalysis?.detailedFeedback && (
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  첨삭 내용
                </h4>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm leading-relaxed">{currentAnalysis.detailedFeedback}</p>
                </div>
              </div>
            )}

            {/* 개념 설명 */}
            {currentAnalysis?.conceptualExplanation && (
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  질문의 의도와 개념
                </h4>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm leading-relaxed">{currentAnalysis.conceptualExplanation}</p>
                </div>
              </div>
            )}

            {/* 추천 답변 예시 */}
            <Collapsible open={showSampleAnswer} onOpenChange={setShowSampleAnswer}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  모범 답변 예시 보기
                  {showSampleAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-medium mb-2 text-sm text-muted-foreground">모범 답변 예시</h5>
                  <p className="text-sm leading-relaxed">{currentAnalysis?.sampleAnswer || '샘플 답변을 불러올 수 없습니다.'}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* 액션 버튼들 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button onClick={editAnswer} variant="outline" className="h-12 flex items-center gap-2 bg-transparent">
            <Edit3 className="w-4 h-4" />
            답변 수정하기
          </Button>
          <Button onClick={nextQuestion} className="h-12 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />새 질문 연습하기
          </Button>
          <Button
            onClick={() => setCurrentScreen("history")}
            variant="outline"
            className="h-12 flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            이전 기록 보기
          </Button>
        </div>

        {/* 질문 정보 */}
        <Card className="w-full bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">분석한 질문</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{currentQuestion?.question || '질문을 불러올 수 없습니다.'}</p>
            <div className="bg-background rounded-lg p-3">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">내 답변</h5>
              <p className="text-sm leading-relaxed">{currentAnalysis?.answer || '답변을 불러올 수 없습니다.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
