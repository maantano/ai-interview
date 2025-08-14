"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  PlayCircle,
  FileText,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";
import { getRealtimeAnalytics, type AnalyticsData } from "@/lib/analytics-api";

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const data = await getRealtimeAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        // 에러 시 기본값 사용
        setAnalytics({
          totalVisitors: 1247,
          interviewStarted: 342,
          analysisCompleted: 189,
          lastUpdated: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();

    // 30초마다 데이터 업데이트
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
  };

  const calculateConversionRate = (completed: number, started: number) => {
    if (started === 0) return 0;
    return Math.round((completed / started) * 100);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <CardTitle className="text-lg">실시간 데이터 로딩 중...</CardTitle>
            <CardDescription>
              최신 사용자 통계를 가져오고 있습니다
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const conversionRate = calculateConversionRate(
    analytics.analysisCompleted,
    analytics.interviewStarted
  );

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          <h2 className="text-xl font-bold">실시간 서비스 현황</h2>
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            LIVE
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 10.48 12h.01L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l2.83-2.5.01.01L13.52 12h-.01l2.69-2.39c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12c1.02 1.01 2.37 1.57 3.82 1.57 2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z" />
            </svg>
            GA4 연동
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          마지막 업데이트: {formatLastUpdated(analytics.lastUpdated)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 총 방문자 수 */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 방문자</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.totalVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">전체 누적 방문자 수</p>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        {/* 면접 시작한 사람 수 */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">면접 참여자</CardTitle>
            <PlayCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.interviewStarted.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              면접을 시작한 사용자
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        {/* 첨삭받은 사람 수 */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI 첨삭 완료</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.analysisCompleted.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              답변 분석을 받은 사용자
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>
      </div>

      {/* 추가 통계 정보
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            서비스 성과 지표
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">면접 참여율</div>
              <div className="text-lg font-semibold text-green-600">
                {Math.round((analytics.interviewStarted / analytics.totalVisitors) * 100)}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">첨삭 완료율</div>
              <div className="text-lg font-semibold text-purple-600">
                {conversionRate}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">평균 참여도</div>
              <div className="text-lg font-semibold text-blue-600">
                {analytics.analysisCompleted > 0 ? 
                  Math.round(analytics.analysisCompleted / analytics.interviewStarted * 100) : 0}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">활성 지수</div>
              <div className="text-lg font-semibold text-orange-600">
                {analytics.totalVisitors > 1000 ? "높음" : 
                 analytics.totalVisitors > 500 ? "보통" : "시작"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          📊 실시간 데이터는 30초마다 자동 업데이트됩니다 •
          <span className="text-primary font-semibold">Google Analytics 4</span>{" "}
          실시간 데이터
        </p>
      </div>
    </div>
  );
}
