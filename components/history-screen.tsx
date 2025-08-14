"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { storage } from "@/lib/storage"
import type { InterviewSession, AnalysisResult, AppScreen } from "@/types/interview"
import {
  ArrowLeft,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  BarChart3,
} from "lucide-react"

const jobCategoryLabels = {
  frontend: "프론트엔드 개발자",
  backend: "백엔드 개발자",
  planner: "기획자",
  designer: "디자이너",
  marketer: "마케터",
  "data-science": "데이터 사이언티스트",
  devops: "DevOps 엔지니어",
  "product-management": "프로덕트 매니저",
  qa: "QA 엔지니어",
  "mobile-development": "모바일 개발자",
  other: "기타",
}

const getScoreColor = (score: number) => {
  if (score >= 85) return "text-green-600 bg-green-50 border-green-200"
  if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200"
  if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200"
  return "text-red-600 bg-red-50 border-red-200"
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

interface DetailModalProps {
  result: AnalysisResult
  questionNumber: number
}

function DetailModal({ result, questionNumber }: DetailModalProps) {
  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          질문 {questionNumber} 상세 분석
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* 점수 요약 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">{result.totalScore}</div>
            <div className="text-xs text-muted-foreground">총점</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-semibold">{result.scores.understanding}</div>
            <div className="text-xs text-muted-foreground">이해도</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-semibold">{result.scores.logic}</div>
            <div className="text-xs text-muted-foreground">논리성</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-semibold">{result.scores.specificity}</div>
            <div className="text-xs text-muted-foreground">구체성</div>
          </div>
        </div>

        {/* 내 답변 */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">내 답변</h4>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm leading-relaxed">{result.answer}</p>
          </div>
        </div>

        {/* 피드백 */}
        <div className="grid gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-green-700 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              잘한 점
            </h4>
            <ul className="space-y-2">
              {result.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-orange-700 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              개선할 점
            </h4>
            <ul className="space-y-2">
              {result.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}

interface HistoryScreenProps {
  setCurrentScreen: (screen: AppScreen) => void;
  currentSession: InterviewSession | null;
}

export function HistoryScreen({ setCurrentScreen, currentSession }: HistoryScreenProps) {
  const [sessionsHistory, setSessionsHistory] = useState<InterviewSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadHistory = () => {
      try {
        const history = storage.getSessionsHistory()
        setSessionsHistory(history)
      } catch (error) {
        console.error("Failed to load history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold">기록을 불러오는 중...</h2>
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mt-4" />
        </div>
      </div>
    )
  }

  const allSessions = currentSession ? [currentSession, ...sessionsHistory] : sessionsHistory
  const hasNoHistory = allSessions.length === 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentScreen(currentSession ? "interview" : "job-selection")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentSession ? "면접으로 돌아가기" : "처음으로"}
        </Button>
        <Badge variant="secondary" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          면접 기록
        </Badge>
      </div>

      {hasNoHistory ? (
        <Card className="w-full">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">아직 면접 기록이 없습니다</h3>
            <p className="text-muted-foreground mb-6">첫 번째 면접을 시작해보세요!</p>
            <Button onClick={() => setCurrentScreen("job-selection")}>면접 시작하기</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">면접 기록</h1>
            <p className="text-muted-foreground">지금까지 {allSessions.length}개의 면접 세션을 진행하셨습니다</p>
          </div>

          {allSessions.map((session, sessionIndex) => {
            const isCurrentSession = sessionIndex === 0 && currentSession
            const jobLabel =
              session.category === "other" ? session.customCategory || "기타" : jobCategoryLabels[session.category]

            const averageScore =
              session.results.length > 0
                ? Math.round(
                    session.results.reduce((sum, result) => sum + result.totalScore, 0) / session.results.length,
                  )
                : 0

            return (
              <Card key={session.id} className={`w-full ${isCurrentSession ? "border-primary" : ""}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{jobLabel}</CardTitle>
                      {isCurrentSession && (
                        <Badge variant="default" className="text-xs">
                          진행 중
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(session.createdAt)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 세션 요약 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">{session.results.length}</div>
                      <div className="text-xs text-muted-foreground">답변한 질문</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div
                        className={`text-2xl font-bold mb-1 ${averageScore > 0 ? getScoreColor(averageScore).split(" ")[0] : "text-muted-foreground"}`}
                      >
                        {averageScore || "-"}
                      </div>
                      <div className="text-xs text-muted-foreground">평균 점수</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-lg font-semibold">
                        {session.results.length > 0 ? Math.max(...session.results.map((r) => r.totalScore)) : "-"}
                      </div>
                      <div className="text-xs text-muted-foreground">최고 점수</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-lg font-semibold flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        {Math.round((Date.now() - session.createdAt.getTime()) / (1000 * 60))}분 전
                      </div>
                      <div className="text-xs text-muted-foreground">시작 시간</div>
                    </div>
                  </div>

                  {/* 질문별 결과 */}
                  {session.results.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        질문별 결과
                      </h4>
                      <div className="grid gap-2">
                        {session.results.map((result, resultIndex) => (
                          <Dialog key={result.id}>
                            <DialogTrigger asChild>
                              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${getScoreColor(result.totalScore)}`}
                                  >
                                    {resultIndex + 1}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">질문 {resultIndex + 1}</div>
                                    <div className="text-xs text-muted-foreground">{formatDate(result.createdAt)}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`text-lg font-bold ${getScoreColor(result.totalScore).split(" ")[0]}`}
                                  >
                                    {result.totalScore}
                                  </div>
                                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                </div>
                              </div>
                            </DialogTrigger>
                            <DetailModal result={result} questionNumber={resultIndex + 1} />
                          </Dialog>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  {isCurrentSession && (
                    <div className="pt-4 border-t">
                      <Button onClick={() => setCurrentScreen("interview")} className="w-full">
                        면접 계속하기
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
