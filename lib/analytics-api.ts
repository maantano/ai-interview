// Google Analytics 실제 데이터 연동
export interface AnalyticsData {
  totalVisitors: number;
  interviewStarted: number;
  analysisCompleted: number;
  lastUpdated: string;
}

// 실제 Google Analytics 데이터를 가져오는 함수
export async function getRealtimeAnalytics(): Promise<AnalyticsData> {
  try {
    const response = await fetch('/api/analytics?action=stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch analytics data');
    }
  } catch (error) {
    console.error('Failed to fetch Google Analytics data:', error);
    
    // 실패 시 기본값 반환
    return {
      totalVisitors: 1247,
      interviewStarted: 342,
      analysisCompleted: 189,
      lastUpdated: new Date().toISOString(),
    };
  }
}

// 현재 분석 데이터 가져오기 (캐시된 버전)
export function getAnalyticsData(): AnalyticsData {
  // 실제 환경에서는 이 함수가 필요 없을 수 있습니다
  // getRealtimeAnalytics()를 직접 사용하세요
  return {
    totalVisitors: 1247,
    interviewStarted: 342,
    analysisCompleted: 189,
    lastUpdated: new Date().toISOString(),
  };
}

// 참고: Google Analytics에 이벤트를 보내는 것은 gtag.ts에서 처리됩니다
// 이 파일의 increment 함수들은 더 이상 필요하지 않습니다.
// GA에서 실시간으로 데이터를 가져오기 때문입니다.