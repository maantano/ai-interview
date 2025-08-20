import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// 카운터 데이터 파일 경로
const COUNTER_FILE = path.join(process.cwd(), 'data', 'analytics-counter.json');
const VISITOR_LOG_FILE = path.join(process.cwd(), 'data', 'visitor-log.json');

// 프로덕션 환경용 메모리 저장소
let memoryCounter: CounterData | null = null;
let memoryVisitorLog: VisitorLog = {};

interface CounterData {
  totalVisitors: number;
  interviewStarted: number;
  analysisCompleted: number;
  lastUpdated: string;
}

interface VisitorLog {
  [date: string]: string[]; // date -> array of IP addresses
}

// 초기 데이터
const DEFAULT_DATA: CounterData = {
  totalVisitors: 0,
  interviewStarted: 0,
  analysisCompleted: 0,
  lastUpdated: new Date().toISOString(),
};

// 데이터 읽기
async function readCounter(): Promise<CounterData> {
  if (process.env.NODE_ENV === 'production') {
    // 프로덕션에서는 메모리 저장소 사용
    if (!memoryCounter) {
      memoryCounter = { ...DEFAULT_DATA };
    }
    return memoryCounter;
  }
  
  try {
    const data = await fs.readFile(COUNTER_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // 파일이 없으면 기본값 반환
    return DEFAULT_DATA;
  }
}

// 데이터 쓰기
async function writeCounter(data: CounterData): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    // 프로덕션에서는 메모리에 저장
    memoryCounter = { ...data };
    return;
  }
  
  try {
    // 디렉토리 생성
    await fs.mkdir(path.dirname(COUNTER_FILE), { recursive: true });
    // 파일 쓰기
    await fs.writeFile(COUNTER_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to write counter:', error);
  }
}

// 방문자 로그 읽기
async function readVisitorLog(): Promise<VisitorLog> {
  if (process.env.NODE_ENV === 'production') {
    return memoryVisitorLog;
  }
  
  try {
    const data = await fs.readFile(VISITOR_LOG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// 방문자 로그 쓰기
async function writeVisitorLog(data: VisitorLog): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    memoryVisitorLog = { ...data };
    return;
  }
  
  try {
    await fs.mkdir(path.dirname(VISITOR_LOG_FILE), { recursive: true });
    await fs.writeFile(VISITOR_LOG_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to write visitor log:', error);
  }
}

// IP 기반 중복 방문 체크 (일별)
async function isNewVisitorToday(ip: string): Promise<boolean> {
  const today = new Date().toDateString();
  const log = await readVisitorLog();
  
  if (!log[today]) {
    log[today] = [];
  }
  
  const isNew = !log[today].includes(ip);
  
  if (isNew) {
    log[today].push(ip);
    // 7일 이상 된 로그는 삭제 (용량 관리)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    Object.keys(log).forEach(date => {
      if (new Date(date) < sevenDaysAgo) {
        delete log[date];
      }
    });
    await writeVisitorLog(log);
  }
  
  return isNew;
}

// GET: 현재 카운터 조회
export async function GET() {
  try {
    const data = await readCounter();
    
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Counter GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read counter' },
      { status: 500 }
    );
  }
}

// POST: 카운터 증가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body; // 'visitor', 'interview', 'analysis'
    
    const current = await readCounter();
    
    // IP 주소 추출
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'anonymous';
    
    switch (type) {
      case 'visitor':
        // IP 기반 일별 중복 방지
        const isNewVisitor = await isNewVisitorToday(ip);
        if (isNewVisitor) {
          current.totalVisitors += 1;
        }
        break;
        
      case 'interview':
        current.interviewStarted += 1;
        break;
        
      case 'analysis':
        current.analysisCompleted += 1;
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type' },
          { status: 400 }
        );
    }
    
    current.lastUpdated = new Date().toISOString();
    await writeCounter(current);
    
    // GA Measurement Protocol로도 전송 (실시간 반영)
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      try {
        const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
        const apiSecret = process.env.GA_API_SECRET || 'dummy_secret'; // GA4에서 생성 필요
        
        const eventName = type === 'visitor' ? 'page_view' : 
                         type === 'interview' ? 'session_start' : 
                         'answer_analyzed';
        
        await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
          method: 'POST',
          body: JSON.stringify({
            client_id: ip || 'anonymous',
            events: [{
              name: eventName,
              params: {
                engagement_time_msec: 100,
                session_id: Date.now().toString(),
              }
            }]
          })
        });
      } catch {
      }
    }
    
    return NextResponse.json({
      success: true,
      data: current,
    });
  } catch (error) {
    console.error('Counter POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update counter' },
      { status: 500 }
    );
  }
}