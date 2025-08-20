"use client";

import { useEffect } from "react";
import { useInterview } from "@/hooks/use-interview";
import { JobSelectionScreen } from "@/components/job-selection-screen";
import { LoadingScreen } from "@/components/loading-screen";
import { InterviewScreen } from "@/components/interview-screen";
import { AnalysisScreen } from "@/components/analysis-screen";
import { HistoryScreen } from "@/components/history-screen";
import { ErrorBoundary } from "@/components/error-boundary";
import GATracker from "@/components/ga-tracker";

export default function HomePage() {
  const interviewState = useInterview();

  // 페이지 방문 시 방문자 카운터 증가
  useEffect(() => {
    // 세션 스토리지로 중복 방지
    const sessionKey = 'visitor_counted';
    if (!sessionStorage.getItem(sessionKey)) {
      fetch('/api/counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'visitor' })
      }).catch(err => console.log('Visitor count failed:', err));
      
      sessionStorage.setItem(sessionKey, 'true');
    }
  }, []);

  // Debug logging
  // console.log("🏠 [DEBUG] HomePage render:", {
  //   currentScreen: interviewState.currentScreen,
  //   hasCurrentSession: !!interviewState.currentSession,
  //   hasCurrentQuestion: !!interviewState.currentQuestion,
  //   hasCurrentAnalysis: !!interviewState.currentAnalysis,
  //   isAnalyzing: interviewState.isAnalyzing,
  //   error: interviewState.error
  // });

  return (
    <ErrorBoundary>
      <GATracker />
      <main className="min-h-screen bg-background">
        {interviewState.currentScreen === "job-selection" && (
          <JobSelectionScreen startSession={interviewState.startSession} />
        )}
        {interviewState.currentScreen === "loading" && (
          <LoadingScreen
            jobCategory={
              interviewState.currentSession?.customCategory ||
              (interviewState.currentSession?.category === "other"
                ? "기타"
                : interviewState.currentSession?.category)
            }
          />
        )}
        {interviewState.currentScreen === "interview" && (
          <InterviewScreen
            currentQuestion={interviewState.currentQuestion}
            currentAnswer={interviewState.currentAnswer}
            setCurrentAnswer={interviewState.setCurrentAnswer}
            analyzeAnswer={interviewState.analyzeAnswer}
            generateNewQuestion={interviewState.generateNewQuestion}
            resetToStart={interviewState.resetToStart} // endSession을 resetToStart로 변경
            isAnalyzing={interviewState.isAnalyzing}
            currentSession={interviewState.currentSession}
            error={interviewState.error}
            clearError={interviewState.clearError}
          />
        )}
        {interviewState.currentScreen === "analysis" && (
          <AnalysisScreen
            currentSession={interviewState.currentSession}
            currentQuestion={interviewState.currentQuestion}
            currentAnalysis={interviewState.currentAnalysis}
            isAnalyzing={interviewState.isAnalyzing}
            editAnswer={interviewState.editAnswer}
            nextQuestion={interviewState.nextQuestion}
            endSession={interviewState.endSession}
            setCurrentScreen={interviewState.setCurrentScreen}
          />
        )}
        {interviewState.currentScreen === "history" && (
          <HistoryScreen
            setCurrentScreen={interviewState.setCurrentScreen}
            currentSession={interviewState.currentSession}
          />
        )}
      </main>
    </ErrorBoundary>
  );
}
