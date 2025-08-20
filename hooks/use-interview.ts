"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  JobCategory,
  InterviewQuestion,
  AnalysisResult,
  InterviewSession,
  AppScreen,
} from "@/types/interview";
import { mockQuestions } from "@/data/mock-questions";
import { storage } from "@/lib/storage";
// GA4 events are now sent directly via window.gtag

export function useInterview() {
  const [currentScreen, setCurrentScreen] =
    useState<AppScreen>("job-selection");
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(
    null
  );
  const [currentQuestion, setCurrentQuestion] =
    useState<InterviewQuestion | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate questions for a session or refill queue
  const generateQuestionsForSession = useCallback(
    async (session: InterviewSession, isRefill = false): Promise<void> => {
      try {
        setIsLoading(true);

        // Try AI generation first
        const response = await fetch("/api/ai/generate-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: session.category,
            customCategory: session.customCategory,
          }),
        });

        const result = await response.json();

        if (result.success && result.questions.length > 0) {
          // Update session with AI-generated questions
          const updatedSession = {
            ...session,
            questionQueue: isRefill
              ? [...session.questionQueue, ...result.questions]
              : result.questions,
            aiGenerated: result.metadata.aiGenerated,
          };

          setCurrentSession(updatedSession);
          if (!isRefill) {
            setCurrentQuestion(result.questions[0]);
          }
          storage.saveCurrentSession(updatedSession);

          if (currentScreen !== "interview" && !isRefill) {
            setCurrentScreen("interview");
          }
        } else {
          throw new Error(result.error || "Failed to generate questions");
        }
      } catch (error) {
        console.error("🔄 GA Event: generate_questions - Error:", error);
        // Fallback to mock questions
        const questions = mockQuestions[session.category];
        if (!questions || questions.length === 0) {
          throw new Error(
            `해당 직무의 질문을 찾을 수 없습니다: ${session.category}`
          );
        }

        // Select 10 random questions
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 10);

        const updatedSession = {
          ...session,
          questionQueue: isRefill
            ? [...session.questionQueue, ...selectedQuestions]
            : selectedQuestions,
          aiGenerated: false,
        };

        setCurrentSession(updatedSession);
        if (!isRefill) {
          setCurrentQuestion(selectedQuestions[0]);
        }
        storage.saveCurrentSession(updatedSession);

        if (currentScreen !== "interview" && !isRefill) {
          setCurrentScreen("interview");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [currentScreen]
  );

  // Load saved session on mount
  useEffect(() => {
    const loadSavedSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const savedSession = storage.getCurrentSession();
        if (savedSession) {
          setCurrentSession(savedSession);

          // If session has a question queue, find current question
          if (
            savedSession.questionQueue &&
            savedSession.questionQueue.length > 0
          ) {
            // Find the current question (first unanswered one)
            const answeredQuestionIds = savedSession.results.map(
              (r) => r.questionId
            );
            const currentQ = savedSession.questionQueue.find(
              (q) => !answeredQuestionIds.includes(q.id)
            );

            if (currentQ) {
              setCurrentQuestion(currentQ);
              setCurrentScreen("interview");
            } else {
              // All questions answered, generate new ones
              await generateQuestionsForSession(savedSession);
            }
          } else {
            // Generate new questions for the saved session
            await generateQuestionsForSession(savedSession);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "세션을 불러오는 중 오류가 발생했습니다."
        );
        // Clear corrupted session data
        storage.clearCurrentSession();
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedSession();
  }, []);

  // 직무 선택 및 세션 시작
  const startSession = useCallback(
    async (category: JobCategory, customCategory?: string) => {
      try {
        setError(null);
        setIsLoading(true);

        // Show loading screen immediately
        setCurrentScreen("loading");

        const newSession: InterviewSession = {
          id: `session-${Date.now()}`,
          category,
          customCategory,
          results: [],
          createdAt: new Date(),
          questionQueue: [],
          aiGenerated: false,
        };

        // Clear previous states
        setCurrentSession(newSession);
        setCurrentQuestion(null);
        setCurrentAnswer("");
        setCurrentAnalysis(null);
        storage.saveCurrentSession(newSession);

        // Google Analytics: Track session start
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'session_start', {
            event_category: 'interview',
            event_label: category,
          });
        }

        // Generate questions for the new session
        await generateQuestionsForSession(newSession);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "세션을 시작하는 중 오류가 발생했습니다."
        );
        setIsLoading(false);
        setCurrentScreen("job-selection"); // Return to job selection on error
      }
    },
    [generateQuestionsForSession]
  );

  // 새 질문 생성 (큐에서 다음 질문 가져오기)
  const generateNewQuestion = useCallback(async () => {
    try {
      setError(null);

      if (!currentSession?.questionQueue) {
        throw new Error("질문 큐를 찾을 수 없습니다.");
      }

      const queue = currentSession.questionQueue;
      const answeredQuestionIds = currentSession.results.map(
        (r) => r.questionId
      );
      const unansweredQuestions = queue.filter(
        (q) => !answeredQuestionIds.includes(q.id)
      );

      // First, try to serve from existing queue
      const randomIndex = Math.floor(
        Math.random() * unansweredQuestions.length
      );
      const nextQuestion = unansweredQuestions[randomIndex];

      if (nextQuestion) {
        // Set the next question from queue immediately
        setCurrentQuestion(nextQuestion);
        setCurrentAnswer("");
        setCurrentAnalysis(null);

        // Google Analytics: Track new question
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'new_question', {
            event_category: 'interview',
            event_label: currentSession.category,
          });
        }

        // Check if we need to refill the queue (less than 3 unanswered questions remaining)
        if (unansweredQuestions.length <= 3) {
          try {
            // Refill queue in background without blocking UI
            await generateQuestionsForSession(currentSession, true);
          } catch (refillError) {
            console.error(
              "🔄 GA Event: new_question - Refill error:",
              refillError
            );
            // Continue with existing questions even if refill fails
          }
        }
      } else {
        // No unanswered questions left, generate new batch
        await generateQuestionsForSession(currentSession);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "질문을 생성하는 중 오류가 발생했습니다."
      );
    }
  }, [currentSession, generateQuestionsForSession]);

  // 답변 분석
  const analyzeAnswer = useCallback(
    async (retryCount = 0) => {
      if (!currentQuestion || !currentAnswer.trim() || !currentSession) {
        setError("답변을 분석하기 위한 필수 정보가 부족합니다.");
        return;
      }

      // Validate answer length (minimum 10 characters)
      if (currentAnswer.trim().length < 10) {
        setError("답변은 최소 10글자 이상 작성해주세요.");
        return;
      }

      // IMMEDIATELY go to analysis screen with loading state
      setIsAnalyzing(true);
      setError(null);
      setCurrentAnalysis(null); // Clear previous analysis
      setCurrentScreen("analysis"); // Go to analysis screen immediately

      try {
        // Call AI analysis API
        const response = await fetch("/api/ai/analyze-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            question: currentQuestion.question,
            answer: currentAnswer,
            category: currentSession.category,
            customCategory: currentSession.customCategory,
          }),
        });

        // Check if response is ok before parsing JSON
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
        }

        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          console.error(
            "🔄 GA Event: answer_analyzed - Parse error:",
            parseError
          );
          throw new Error("서버 응답을 해석할 수 없습니다.");
        }
        if (result.success) {
          const analysis = result.analysis;

          // Validate analysis structure before using it
          if (!analysis || typeof analysis !== "object") {
            throw new Error("분석 결과의 형식이 올바르지 않습니다.");
          }

          // Validate required fields
          if (
            !analysis.id ||
            !analysis.questionId ||
            !analysis.scores ||
            typeof analysis.totalScore !== "number"
          ) {
            throw new Error("분석 결과에 필요한 정보가 누락되었습니다.");
          }

          // Fix date handling - convert string dates back to Date objects
          if (typeof analysis.createdAt === "string") {
            analysis.createdAt = new Date(analysis.createdAt);
          }

          // Update session with new result
          const sessionUpdate = {
            ...currentSession,
            results: [...currentSession.results, analysis],
          };

          // Set both states together
          setCurrentSession(sessionUpdate);
          setCurrentAnalysis(analysis);

          // Save to storage
          try {
            storage.saveCurrentSession(sessionUpdate);
          } catch (storageError) {
            console.error(
              "🔄 GA Event: answer_analyzed - Storage error:",
              storageError
            );
          }

          // Analysis data is set, useEffect will stop the loading state
          // Force a re-render by setting isAnalyzing to false
          setIsAnalyzing(false);

          // Google Analytics: Track answer analysis success
          console.log("📊 GA Event: answer_analyzed", {
            action: "answer_analyzed",
            category: "interview",
            label: currentSession.category,
            value: analysis.totalScore,
            hasValue: analysis.totalScore !== undefined,
            analysisData: analysis,
          });

          // GA4 이벤트 전송 - gtag를 직접 호출
          if (typeof window !== 'undefined' && window.gtag) {
            const score = analysis.totalScore ? Math.round(analysis.totalScore) : 0;
            
            console.log("📤 Sending GA event directly:", {
              event: "answer_analyzed",
              category: currentSession.category,
              score: score
            });
            
            // GA4 형식으로 직접 전송
            window.gtag('event', 'answer_analyzed', {
              event_category: 'interview',
              event_label: currentSession.category,
              value: score
            });
            
            // 백업: Measurement Protocol로도 전송
            try {
              fetch(`https://www.google-analytics.com/mp/collect?measurement_id=G-WQNEQX1T08&api_secret=your_api_secret`, {
                method: 'POST',
                body: JSON.stringify({
                  client_id: 'anonymous',
                  events: [{
                    name: 'answer_analyzed',
                    parameters: {
                      event_category: 'interview',
                      event_label: currentSession.category,
                      value: score
                    }
                  }]
                })
              });
              console.log("📡 Backup GA event sent via Measurement Protocol");
            } catch (err) {
              console.log("Backup GA failed:", err);
            }
          }
        } else {
          // Check if this is a validation error (400 status)
          if (response.status === 400) {
            // For validation errors, show error message but stay on interview screen
            setError(result.error || "입력 값이 올바르지 않습니다.");
            return;
          }
          throw new Error(result.error || "Analysis failed");
        }
      } catch (error) {
        // Log the exact point where the error occurred
        if (error instanceof Error) {
          // Error details available for debugging
        }

        // Retry logic for network errors
        if (
          retryCount < 2 &&
          error instanceof Error &&
          (error.message.includes("시간 초과") ||
            error.message.includes("network") ||
            error.message.includes("fetch"))
        ) {
          setTimeout(() => analyzeAnswer(retryCount + 1), 1000);
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "답변 분석 중 오류가 발생했습니다. 다시 시도해주세요."
        );

        // On error, stay on interview screen and stop analyzing
        setIsAnalyzing(false);
      } finally {
        // For success case, useEffect will handle isAnalyzing and navigation
      }
    },
    [currentQuestion, currentAnswer, currentSession]
  );

  // 답변 수정
  const editAnswer = useCallback(() => {
    setError(null);
    setCurrentScreen("interview");
  }, []);

  // 새 질문으로 이동
  const nextQuestion = useCallback(() => {
    setError(null);
    generateNewQuestion();
    setCurrentScreen("interview");
  }, [generateNewQuestion]);

  // 세션 종료
  const endSession = useCallback(() => {
    try {
      setError(null);

      if (currentSession && currentSession.results.length > 0) {
        storage.saveToHistory(currentSession);

        // Google Analytics: Track session completion
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'session_completed', {
            event_category: 'interview',
            event_label: currentSession.category,
            value: currentSession.results.length,
          });
        }
      }
      storage.clearCurrentSession();
      setCurrentSession(null);
      setCurrentQuestion(null);
      setCurrentAnswer("");
      setCurrentAnalysis(null);
      setCurrentScreen("job-selection");
    } catch (err) {
      // Still proceed with cleanup even if storage fails
      setCurrentSession(null);
      setCurrentQuestion(null);
      setCurrentAnswer("");
      setCurrentAnalysis(null);
      setCurrentScreen("job-selection");
      setError(
        "세션 종료 중 일부 오류가 발생했지만 정상적으로 종료되었습니다."
      );
    }
  }, [currentSession]);

  // 처음으로 돌아가기
  const resetToStart = useCallback(() => {
    try {
      setError(null);
      storage.clearCurrentSession();
    } catch (err) {
    } finally {
      setCurrentSession(null);
      setCurrentQuestion(null);
      setCurrentAnswer("");
      setCurrentAnalysis(null);
      setIsAnalyzing(false);
      setCurrentScreen("job-selection");
    }
  }, []);

  // 에러 클리어
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    currentScreen,
    currentSession,
    currentQuestion,
    currentAnswer,
    currentAnalysis,
    isAnalyzing,
    error,
    isLoading,

    // Actions
    setCurrentScreen,
    setCurrentAnswer,
    startSession,
    generateNewQuestion,
    analyzeAnswer,
    editAnswer,
    nextQuestion,
    endSession,
    resetToStart,
    clearError,
  };
}
