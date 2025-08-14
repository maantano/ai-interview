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
import * as gtag from "@/lib/gtag";

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
  
  // Debug currentAnalysis state changes
  useEffect(() => {
    console.log("🔥 currentAnalysis state changed:", currentAnalysis?.id || "null");
    console.log("🔥 Full currentAnalysis object:", currentAnalysis);
    
    // Analysis data changed - no need to manage isAnalyzing here
    // The component will automatically show results when currentAnalysis is available
  }, [currentAnalysis, isAnalyzing, currentScreen]);
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
        console.error("Failed to generate questions, using fallback:", error);

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
        console.error("Error loading saved session:", err);
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
        gtag.event({
          action: "session_start",
          category: "interview",
          label: category,
        });

        // Generate questions for the new session
        await generateQuestionsForSession(newSession);
      } catch (err) {
        console.error("Error starting session:", err);
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
      console.log("🔄 [DEBUG] generateNewQuestion called");
      console.log("🔍 [DEBUG] Current session:", {
        hasSession: !!currentSession,
        hasQuestionQueue: !!currentSession?.questionQueue,
        queueLength: currentSession?.questionQueue?.length || 0,
      });

      if (!currentSession?.questionQueue) {
        console.error("❌ [DEBUG] No question queue found");
        throw new Error("질문 큐를 찾을 수 없습니다.");
      }

      const queue = currentSession.questionQueue;
      const answeredQuestionIds = currentSession.results.map(
        (r) => r.questionId
      );
      const unansweredQuestions = queue.filter(
        (q) => !answeredQuestionIds.includes(q.id)
      );
      console.log("🔍 [DEBUG] queue:", queue);
      console.log("🔍 [DEBUG] answeredQuestionIds:", answeredQuestionIds);
      console.log("🔍 [DEBUG] unansweredQuestions:", unansweredQuestions);

      console.log("📊 [DEBUG] Question queue status:", {
        totalQuestions: queue.length,
        answeredCount: answeredQuestionIds.length,
        unansweredCount: unansweredQuestions.length,
        answeredIds: answeredQuestionIds,
        queueIds: queue.map((q) => q.id),
      });

      // First, try to serve from existing queue
      const randomIndex = Math.floor(
        Math.random() * unansweredQuestions.length
      );
      const nextQuestion = unansweredQuestions[randomIndex];

      if (nextQuestion) {
        console.log(
          "✅ [DEBUG] Found next question from queue:",
          nextQuestion.question
        );
        console.log(
          "🔄 [DEBUG] Setting new question and clearing answer/analysis"
        );
        // Set the next question from queue immediately
        setCurrentQuestion(nextQuestion);
        setCurrentAnswer("");
        setCurrentAnalysis(null);

        // Google Analytics: Track new question
        gtag.event({
          action: "new_question",
          category: "interview",
          label: currentSession.category,
        });

        // Check if we need to refill the queue (less than 3 unanswered questions remaining)
        if (unansweredQuestions.length <= 3) {
          try {
            console.log("🔄 Refilling question queue in background...");
            // Refill queue in background without blocking UI
            await generateQuestionsForSession(currentSession, true);
          } catch (refillError) {
            console.warn("Failed to refill question queue:", refillError);
            // Continue with existing questions even if refill fails
          }
        }
      } else {
        // No unanswered questions left, generate new batch
        console.log("❌ No unanswered questions left, generating new batch...");
        await generateQuestionsForSession(currentSession);
      }
    } catch (err) {
      console.error("❌ Error generating question:", err);
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
      console.log("🚀 [DEBUG] analyzeAnswer function called");
      console.log("🔍 [DEBUG] Current state:", {
        hasCurrentQuestion: !!currentQuestion,
        hasCurrentAnswer: !!currentAnswer.trim(),
        hasCurrentSession: !!currentSession,
        answerLength: currentAnswer.trim().length,
      });

      if (!currentQuestion || !currentAnswer.trim() || !currentSession) {
        console.error("❌ [DEBUG] Missing required data");
        setError("답변을 분석하기 위한 필수 정보가 부족합니다.");
        return;
      }

      // Validate answer length (minimum 10 characters)
      if (currentAnswer.trim().length < 10) {
        console.error(
          "❌ [DEBUG] Answer too short:",
          currentAnswer.trim().length
        );
        setError("답변은 최소 10글자 이상 작성해주세요.");
        return;
      }

      console.log("✅ [DEBUG] Validation passed, starting analysis...");

      // IMMEDIATELY go to analysis screen with loading state
      setIsAnalyzing(true);
      setError(null);
      setCurrentAnalysis(null); // Clear previous analysis
      setCurrentScreen("analysis"); // Go to analysis screen immediately
      console.log(
        "🔄 [DEBUG] Moved to analysis screen with loading state"
      );

      try {
        // Call AI analysis API
        console.log("🚀 Calling analyze-answer API...");
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

        console.log("📡 API Response status:", response.status);
        console.log("🔍 Response OK:", response.ok);

        // Check if response is ok before parsing JSON
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ API Response error:", errorText);
          throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
        }

        let result;
        try {
          result = await response.json();
          console.log("📦 API Response data:", result);
        } catch (parseError) {
          console.error("❌ Failed to parse API response as JSON:", parseError);
          throw new Error("서버 응답을 해석할 수 없습니다.");
        }

        if (result.success) {
          const analysis = result.analysis;
          console.log("✅ [DEBUG] Analysis received:", analysis);

          // Validate analysis structure before using it
          if (!analysis || typeof analysis !== "object") {
            console.error("❌ [DEBUG] Invalid analysis structure:", analysis);
            throw new Error("분석 결과의 형식이 올바르지 않습니다.");
          }

          // Validate required fields
          if (
            !analysis.id ||
            !analysis.questionId ||
            !analysis.scores ||
            typeof analysis.totalScore !== "number"
          ) {
            console.error(
              "❌ [DEBUG] Missing required analysis fields:",
              analysis
            );
            throw new Error("분석 결과에 필요한 정보가 누락되었습니다.");
          }

          // Fix date handling - convert string dates back to Date objects
          if (typeof analysis.createdAt === "string") {
            analysis.createdAt = new Date(analysis.createdAt);
          }

          console.log("🔍 [DEBUG] Analysis validation passed");

          console.log("💾 [DEBUG] Setting current session and analysis...");
          
          // Update session with new result
          const sessionUpdate = {
            ...currentSession,
            results: [...currentSession.results, analysis],
          };
          
          // Set both states together
          console.log("🔥 BEFORE setCurrentSession:", currentSession?.results?.length);
          console.log("🔥 BEFORE setCurrentAnalysis:", currentAnalysis);
          setCurrentSession(sessionUpdate);
          setCurrentAnalysis(analysis);
          console.log("🔥 AFTER setState calls - analysis should be:", analysis?.id);

          // Save to storage
          try {
            storage.saveCurrentSession(sessionUpdate);
            console.log("✅ Session saved to storage");
          } catch (storageError) {
            console.warn("Failed to save session to storage:", storageError);
          }

          // Analysis data is set, useEffect will stop the loading state
          // Force a re-render by setting isAnalyzing to false
          console.log("💾 Analysis data set, forcing re-render...");
          setIsAnalyzing(false);

          // Google Analytics: Track answer analysis
          gtag.event({
            action: "answer_analyzed",
            category: "interview",
            label: currentSession.category,
            value: analysis.totalScore,
          });
        } else {
          // Check if this is a validation error (400 status)
          if (response.status === 400) {
            // For validation errors, show error message but stay on interview screen
            console.log("❌ Validation error:", result.error);
            setError(result.error || "입력 값이 올바르지 않습니다.");
            return;
          }
          console.log("❌ API error:", result.error);
          throw new Error(result.error || "Analysis failed");
        }
      } catch (error) {
        console.error("❌ Analysis failed with error:", error);

        // Log the exact point where the error occurred
        if (error instanceof Error) {
          console.error("❌ Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
        }

        // Retry logic for network errors
        if (
          retryCount < 2 &&
          error instanceof Error &&
          (error.message.includes("시간 초과") ||
            error.message.includes("network") ||
            error.message.includes("fetch"))
        ) {
          console.log(`Retrying analysis... (attempt ${retryCount + 1})`);
          setTimeout(() => analyzeAnswer(retryCount + 1), 1000);
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "답변 분석 중 오류가 발생했습니다. 다시 시도해주세요."
        );

        // On error, stay on interview screen and stop analyzing
        console.log("❌ Staying on interview screen due to error");
        setIsAnalyzing(false);
      } finally {
        // For success case, useEffect will handle isAnalyzing and navigation
        console.log("🔄 Analysis function complete");
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
        gtag.event({
          action: "session_completed",
          category: "interview",
          label: currentSession.category,
          value: currentSession.results.length,
        });
      }
      storage.clearCurrentSession();
      setCurrentSession(null);
      setCurrentQuestion(null);
      setCurrentAnswer("");
      setCurrentAnalysis(null);
      setCurrentScreen("job-selection");
    } catch (err) {
      console.error("Error ending session:", err);
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
      console.warn("Failed to clear session storage:", err);
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
