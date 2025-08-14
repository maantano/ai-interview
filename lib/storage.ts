import type { InterviewSession } from "@/types/interview"

const STORAGE_KEYS = {
  CURRENT_SESSION: "ai-interview-current-session",
  SESSIONS_HISTORY: "ai-interview-sessions-history",
} as const

export const storage = {
  // 현재 세션 관리
  getCurrentSession(): InterviewSession | null {
    if (typeof window === "undefined") return null

    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION)
      if (!data) return null

      const session = JSON.parse(data)
      // Date 객체 복원
      session.createdAt = new Date(session.createdAt)
      session.results = session.results.map((result: {createdAt: string}) => ({
        ...result,
        createdAt: new Date(result.createdAt),
      }))

      return session
    } catch (error) {
      console.error("Failed to get current session:", error)
      return null
    }
  },

  saveCurrentSession(session: InterviewSession): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session))
    } catch (error) {
      console.error("Failed to save current session:", error)
    }
  },

  clearCurrentSession(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION)
  },

  // 세션 히스토리 관리
  getSessionsHistory(): InterviewSession[] {
    if (typeof window === "undefined") return []

    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS_HISTORY)
      if (!data) return []

      const sessions = JSON.parse(data)
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        results: session.results.map((result: any) => ({
          ...result,
          createdAt: new Date(result.createdAt),
        })),
      }))
    } catch (error) {
      console.error("Failed to get sessions history:", error)
      return []
    }
  },

  saveToHistory(session: InterviewSession): void {
    if (typeof window === "undefined") return

    try {
      const history = this.getSessionsHistory()
      const updatedHistory = [session, ...history.slice(0, 9)] // 최대 10개 세션 유지
      localStorage.setItem(STORAGE_KEYS.SESSIONS_HISTORY, JSON.stringify(updatedHistory))
    } catch (error) {
      console.error("Failed to save to history:", error)
    }
  },
}
