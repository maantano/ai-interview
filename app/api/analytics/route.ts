import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Google Analytics Data API를 사용하여 실제 데이터 가져오기
async function getGoogleAnalyticsData() {
  try {
    // 환경 변수 확인
    const propertyId = process.env.GA_PROPERTY_ID;
    const clientEmail = process.env.GA_CLIENT_EMAIL;
    const privateKey = process.env.GA_PRIVATE_KEY;

    if (!propertyId || !clientEmail || !privateKey) {
      console.log('GA API credentials not configured, using mock data');
      throw new Error('GA credentials not configured');
    }

    // Google Analytics Data API 설정
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    google.options({ auth });
    const analytics = google.analyticsdata('v1beta');

    // 총 방문자 수 (페이지뷰)
    const pageViewsResponse = await analytics.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'screenPageViews' }],
      },
    });

    // 커스텀 이벤트 데이터
    const eventsResponse = await analytics.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: ['session_start', 'answer_analyzed']
            }
          }
        }
      },
    });

    const totalVisitors = parseInt(pageViewsResponse.data.rows?.[0]?.metricValues?.[0]?.value || '0');
    let interviewStarted = 0;
    let analysisCompleted = 0;

    eventsResponse.data.rows?.forEach((row) => {
      const eventName = row.dimensionValues?.[0]?.value;
      const eventCount = parseInt(row.metricValues?.[0]?.value || '0');
      
      if (eventName === 'session_start') {
        interviewStarted = eventCount;
      } else if (eventName === 'answer_analyzed') {
        analysisCompleted = eventCount;
      }
    });

    return {
      totalVisitors,
      interviewStarted,
      analysisCompleted,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Google Analytics API error:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'stats') {
      try {
        // 실제 GA 데이터 시도
        const data = await getGoogleAnalyticsData();
        
        return NextResponse.json({
          success: true,
          data,
          source: 'google_analytics',
          timestamp: new Date().toISOString(),
        });
      } catch (gaError) {
        console.log('GA API failed, using fallback data:', gaError);
        
        // GA API 실패 시 폴백 데이터
        const fallbackData = {
          totalVisitors: Math.floor(Math.random() * 100) + 1200,
          interviewStarted: Math.floor(Math.random() * 50) + 300,
          analysisCompleted: Math.floor(Math.random() * 30) + 150,
          lastUpdated: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: fallbackData,
          source: 'fallback',
          timestamp: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in analytics API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}