"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  RefreshCw,
  Send,
  Clock,
  Sparkles,
  Database,
} from "lucide-react";
import type { InterviewQuestion, InterviewSession } from "@/types/interview";

const jobCategoryLabels = {
  frontend: "프론트엔드 개발자",
  backend: "백엔드 개발자",
  "mobile-development": "모바일 개발자",
  "data-science": "데이터 사이언티스트",
  devops: "데브옵스 엔지니어",
  qa: "QA 엔지니어",
  "product-management": "프로덕트 매니저",
  planner: "서비스 기획자",
  designer: "디자이너",
  marketer: "마케터",
  other: "기타",
};

interface InterviewScreenProps {
  currentQuestion: InterviewQuestion | null;
  currentAnswer: string;
  setCurrentAnswer: (answer: string) => void;
  analyzeAnswer: () => void;
  generateNewQuestion: () => void;
  resetToStart: () => void; // endSession을 resetToStart로 변경
  isAnalyzing: boolean;
  currentSession: InterviewSession | null;
  error: string | null;
  clearError?: () => void;
}

export function InterviewScreen({
  currentQuestion,
  currentAnswer,
  setCurrentAnswer,
  analyzeAnswer,
  generateNewQuestion,
  resetToStart, // endSession을 resetToStart로 변경
  isAnalyzing,
  currentSession,
  error,
  clearError,
}: InterviewScreenProps) {
  const [charCount, setCharCount] = useState(0);
  const [showCards, setShowCards] = useState(false);
  const maxChars = 500;
  const minChars = 10;

  useEffect(() => {
    setCharCount(currentAnswer.length);
  }, [currentAnswer]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCards(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAnswerChange = (value: string) => {
    if (value.length <= maxChars) {
      setCurrentAnswer(value);
      // Clear error when user starts typing
      if (error && clearError) {
        clearError();
      }
    }
  };

  const answerLength = currentAnswer.trim().length;
  const canAnalyze = answerLength >= minChars && !isAnalyzing;
  const canGenerateNew = !isAnalyzing;
  const hasValidationError = answerLength > 0 && answerLength < minChars;

  if (!currentSession || !currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Loading Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-8 bg-muted rounded animate-pulse" />
            <div className="w-px h-6 bg-muted" />
            <div className="w-32 h-6 bg-muted rounded animate-pulse" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-1">
          {/* Question Card Skeleton */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-muted rounded-full animate-pulse" />
                <div className="w-16 h-4 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-6 bg-muted rounded animate-pulse" />
                <div className="w-3/4 h-6 bg-muted rounded animate-pulse" />
              </div>
            </CardHeader>
          </Card>

          {/* Answer Input Card Skeleton */}
          <Card className="w-full">
            <CardHeader>
              <div className="w-24 h-6 bg-muted rounded animate-pulse" />
              <div className="w-64 h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full h-32 bg-muted rounded animate-pulse" />
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="flex-1 h-12 bg-muted rounded animate-pulse" />
                <div className="flex-1 sm:flex-initial h-12 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">
            질문을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  const jobLabel =
    currentSession.category === "other"
      ? currentSession.customCategory || "기타"
      : jobCategoryLabels[currentSession.category];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToStart}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            처음으로
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {jobLabel}
            </Badge>
            <Badge
              variant={currentSession.aiGenerated ? "default" : "outline"}
              className={`text-xs ${
                currentSession.aiGenerated
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                  : ""
              }`}
            >
              {currentSession.aiGenerated ? (
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI 생성
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  샘플
                </div>
              )}
            </Badge>
            <span className="text-sm text-muted-foreground">
              질문 {currentSession.results.length + 1}개
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Question Card */}
        <Card
          className={`w-full transition-all duration-700 ${
            showCards ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <CardDescription className="text-sm font-medium">
                면접 질문
              </CardDescription>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Answer Input Card */}
        <Card
          className={`w-full transition-all duration-700 delay-200 ${
            showCards ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <CardHeader>
            <CardTitle className="text-lg">답변 작성</CardTitle>
            <CardDescription>
              구체적인 경험과 사례를 바탕으로 답변해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="면접 질문에 대한 답변을 작성해주세요..."
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className={`min-h-[150px] resize-none text-base leading-relaxed transition-colors ${
                  hasValidationError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                disabled={isAnalyzing}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {charCount}/{maxChars}
              </div>
            </div>

            {/* Validation Error Message */}
            {hasValidationError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                  !
                </div>
                답변은 최소 {minChars}글자 이상 작성해주세요. (현재{" "}
                {answerLength}글자)
              </div>
            )}

            {/* API Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                  !
                </div>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={analyzeAnswer}
                disabled={!canAnalyze}
                className={`flex-1 h-12 text-base font-semibold transition-all duration-300 ${
                  isAnalyzing ? "bg-primary/80" : ""
                } ${!canAnalyze && answerLength > 0 ? "opacity-50" : ""}`}
                size="lg"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="animate-pulse">AI 분석 중...</span>
                    <div className="flex gap-1 ml-1">
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    {hasValidationError
                      ? `답변 분석하기 (${minChars - answerLength}글자 더 필요)`
                      : "답변 분석하기"}
                  </div>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => generateNewQuestion()}
                disabled={!canGenerateNew}
                className="flex-1 sm:flex-initial h-12 text-base"
                size="lg"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />새 질문 받기
                </div>
              </Button>
            </div>

            {/* Tips */}
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                답변 작성 팁
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 구체적인 수치나 결과를 포함해보세요</li>
                <li>• STAR 기법(상황-과제-행동-결과)을 활용해보세요</li>
                <li>• 해당 직무와 연관된 경험을 중심으로 작성해보세요</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Previous Results Summary */}
        {currentSession.results.length > 0 && (
          <Card
            className={`w-full transition-all duration-500 delay-500 ${
              showCards ? "opacity-100" : "opacity-0"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-lg">이전 답변 기록</CardTitle>
              <CardDescription>
                지금까지 {currentSession.results.length}개의 질문에
                답변하셨습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {currentSession.results.map((result, index) => (
                  <div
                    key={result.id}
                    className="text-center p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="text-2xl font-bold text-primary mb-1">
                      {result.totalScore}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      질문 {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
