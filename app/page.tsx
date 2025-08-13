"use client";

import { useInterview } from "@/hooks/use-interview";
import { JobSelectionScreen } from "@/components/job-selection-screen";
import { LoadingScreen } from "@/components/loading-screen";
import { InterviewScreen } from "@/components/interview-screen";
import { AnalysisScreen } from "@/components/analysis-screen";
import { HistoryScreen } from "@/components/history-screen";
import { ErrorBoundary } from "@/components/error-boundary";

export default function HomePage() {
  const interviewState = useInterview();

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background">
        {interviewState.currentScreen === "job-selection" && (
          <JobSelectionScreen startSession={interviewState.startSession} />
        )}
        {interviewState.currentScreen === "loading" && (
          <LoadingScreen 
            jobCategory={interviewState.currentSession?.customCategory || (
              interviewState.currentSession?.category === "other" 
                ? "기타" 
                : interviewState.currentSession?.category
            )} 
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
          <AnalysisScreen />
        )}
        {interviewState.currentScreen === "history" && <HistoryScreen />}
      </main>
    </ErrorBoundary>
  );
}
