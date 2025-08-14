// Google Analytics Data API 연동을 위한 파일
// 실제 프로덕션에서는 Google Analytics Data API를 사용하여 실시간 데이터를 가져올 수 있습니다.
// 현재는 모의 데이터를 사용합니다.

export interface AnalyticsData {
  totalVisitors: number;
  interviewStarted: number;
  analysisCompleted: number;
  lastUpdated: string;
}

// 로컬 스토리지에서 카운터를 관리하는 함수들
const ANALYTICS_STORAGE_KEY = 'ai-interview-analytics';

function getStoredAnalytics(): AnalyticsData {
  if (typeof window === 'undefined') {
    return {
      totalVisitors: 1247,
      interviewStarted: 342,
      analysisCompleted: 189,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse analytics data:', error);
  }

  // 기본값 반환
  return {
    totalVisitors: 1247,
    interviewStarted: 342,
    analysisCompleted: 189,
    lastUpdated: new Date().toISOString(),
  };
}

function saveAnalytics(data: AnalyticsData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save analytics data:', error);
  }
}

// 방문자 수 증가
export function incrementVisitors(): void {
  const data = getStoredAnalytics();
  data.totalVisitors += 1;
  data.lastUpdated = new Date().toISOString();
  saveAnalytics(data);
}

// 면접 시작 수 증가
export function incrementInterviewStarted(): void {
  const data = getStoredAnalytics();
  data.interviewStarted += 1;
  data.lastUpdated = new Date().toISOString();
  saveAnalytics(data);
}

// 분석 완료 수 증가
export function incrementAnalysisCompleted(): void {
  const data = getStoredAnalytics();
  data.analysisCompleted += 1;
  data.lastUpdated = new Date().toISOString();
  saveAnalytics(data);
}

// 현재 분석 데이터 가져오기
export function getAnalyticsData(): AnalyticsData {
  return getStoredAnalytics();
}

// 실시간 업데이트를 위한 모의 데이터 생성 (개발용)
export function getRealtimeAnalytics(): Promise<AnalyticsData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = getStoredAnalytics();
      // 실제 환경에서는 여기서 Google Analytics Data API를 호출할 것입니다
      resolve(data);
    }, 500);
  });
}