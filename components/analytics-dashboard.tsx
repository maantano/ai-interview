"use client";

import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// 기본 대시보드 틀 (로딩 중에도 표시)
function AnalyticsPlaceholder() {
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 text-green-500">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold">실시간 서비스 현황</h2>
          <div className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            LIVE
          </div>
          <div className="flex items-center gap-1 px-2 py-1 text-xs border rounded">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 10.48 12h.01L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l2.83-2.5.01.01L13.52 12h-.01l2.69-2.39c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12c1.02 1.01 2.37 1.57 3.82 1.57 2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z" />
            </svg>
            GA4 연동
          </div>
        </div>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
          </svg>
          마지막 업데이트: 로딩 중...
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 총 방문자 수 */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 방문자</CardTitle>
            <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="min-h-[2rem] flex items-center">
              <span className="text-2xl font-bold text-primary font-mono tabular-nums">
                <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                지금까지 방문한 사람 수
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        {/* 면접 시작한 사람 수 */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">면접 참여자</CardTitle>
            <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="min-h-[2rem] flex items-center">
              <span className="text-2xl font-bold text-primary font-mono tabular-nums">
                <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                지금까지 면접 시작 버튼 클릭 수
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        {/* 첨삭받은 사람 수 */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI 첨삭 완료</CardTitle>
            <svg className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="min-h-[2rem] flex items-center">
              <span className="text-2xl font-bold text-primary font-mono tabular-nums">
                <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                지금까지 분석하기 버튼 클릭 수
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 완전히 클라이언트 전용으로 dynamic import
const AnalyticsDashboardClient = dynamic(
  () => import("./analytics-dashboard-client"),
  {
    ssr: false, // 서버사이드 렌더링 완전 비활성화
    loading: () => <AnalyticsPlaceholder />,
  }
);

export function AnalyticsDashboard() {
  return <AnalyticsDashboardClient />;
}