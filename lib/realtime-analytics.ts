"use client";

// 실시간 분석 데이터를 위한 로컬 카운터 시스템
export interface RealtimeData {
  totalVisitors: number;
  interviewStarted: number;
  analysisCompleted: number;
  lastUpdated: string;
}

const STORAGE_KEY = 'interview_realtime_analytics';
const SESSION_KEY = 'interview_session_id';

// 세션 ID 생성 (하루 단위로 고유)
function getSessionId(): string {
  const today = new Date().toDateString();
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) {
    const [date, id] = existing.split('|');
    if (date === today) return id;
  }
  
  const newId = Math.random().toString(36).substring(2, 15);
  localStorage.setItem(SESSION_KEY, `${today}|${newId}`);
  return newId;
}

// 초기 데이터 로드
function loadRealtimeData(): RealtimeData {
  if (typeof window === 'undefined') {
    return {
      totalVisitors: 0,
      interviewStarted: 0,
      analysisCompleted: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load realtime data:', error);
  }

  return {
    totalVisitors: 0,
    interviewStarted: 0,
    analysisCompleted: 0,
    lastUpdated: new Date().toISOString(),
  };
}

// 데이터 저장
function saveRealtimeData(data: RealtimeData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save realtime data:', error);
  }
}

// 방문자 수 증가 (세션당 1회만)
export function incrementVisitor(): void {
  if (typeof window === 'undefined') return;
  
  const sessionId = getSessionId();
  const visitorKey = `visitor_${sessionId}`;
  
  // 이미 이 세션에서 카운트했으면 무시
  if (localStorage.getItem(visitorKey)) return;
  
  const data = loadRealtimeData();
  data.totalVisitors += 1;
  data.lastUpdated = new Date().toISOString();
  
  saveRealtimeData(data);
  localStorage.setItem(visitorKey, 'true');
  
  console.log('📊 Visitor count incremented:', data.totalVisitors);
}

// 면접 시작 수 증가
export function incrementInterviewStarted(): void {
  if (typeof window === 'undefined') return;
  
  const data = loadRealtimeData();
  data.interviewStarted += 1;
  data.lastUpdated = new Date().toISOString();
  
  saveRealtimeData(data);
  
  console.log('📊 Interview started count incremented:', data.interviewStarted);
}

// 분석 완료 수 증가  
export function incrementAnalysisCompleted(): void {
  if (typeof window === 'undefined') return;
  
  const data = loadRealtimeData();
  data.analysisCompleted += 1;
  data.lastUpdated = new Date().toISOString();
  
  saveRealtimeData(data);
  
  console.log('📊 Analysis completed count incremented:', data.analysisCompleted);
}

// 현재 실시간 데이터 가져오기
export function getRealtimeData(): RealtimeData {
  return loadRealtimeData();
}

// 데이터 리셋 (개발용)
export function resetRealtimeData(): void {
  if (typeof window === 'undefined') return;
  
  const freshData: RealtimeData = {
    totalVisitors: 0,
    interviewStarted: 0,
    analysisCompleted: 0,
    lastUpdated: new Date().toISOString(),
  };
  
  saveRealtimeData(freshData);
  
  // 세션 관련 키들도 정리
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('visitor_') || key === SESSION_KEY) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('📊 Realtime data reset');
}

// 브라우저 시작 시 방문자 카운트
if (typeof window !== 'undefined') {
  // 페이지 로드 시 방문자 증가
  setTimeout(() => {
    incrementVisitor();
  }, 1000);
}