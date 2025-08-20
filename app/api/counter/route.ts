import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// 카운터 데이터 파일 경로
const COUNTER_FILE = path.join(process.cwd(), 'data', 'analytics-counter.json');

interface CounterData {
  totalVisitors: number;
  interviewStarted: number;
  analysisCompleted: number;
  lastUpdated: string;
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
  try {
    // 디렉토리 생성
    await fs.mkdir(path.dirname(COUNTER_FILE), { recursive: true });
    // 파일 쓰기
    await fs.writeFile(COUNTER_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to write counter:', error);
  }
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
    
    // 세션 ID 정의 (모든 케이스에서 사용)
    const sessionId = request.headers.get('x-session-id') || 
                     request.headers.get('x-forwarded-for') || 
                     'anonymous';
    
    switch (type) {
      case 'visitor':
        // 간단한 중복 방지 (실제로는 Redis 등 사용 권장)
        // const sessionKey = `visitor_${sessionId}_${new Date().toDateString()}`;
        // TODO: 세션 관리 개선 필요
        
        current.totalVisitors += 1;
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
            client_id: sessionId,
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