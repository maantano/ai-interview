"use client";

import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GATracker() {
  console.log("🔍 GATracker component rendering, ID:", GA_MEASUREMENT_ID);
  
  if (!GA_MEASUREMENT_ID) {
    console.warn("⚠️ GA_MEASUREMENT_ID not found");
    return null;
  }

  return (
    <>
      <Script
        id="gtag-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log("📡 GA script loaded successfully");
          // GA 스크립트가 로드된 후에 초기화
          window.dataLayer = window.dataLayer || [];
          function gtag(...args: unknown[]) {
            window.dataLayer.push(args);
          }
          window.gtag = gtag;
          
          gtag('js', new Date());
          gtag('config', GA_MEASUREMENT_ID, {
            page_path: window.location.pathname,
            debug_mode: true, // 로컬 개발환경에서 디버그 모드
            send_page_view: true,
            allow_google_signals: false, // 로컬에서는 Google 신호 비활성화
            allow_ad_personalization_signals: false
          });
          
          console.log("✅ GA initialized with ID:", GA_MEASUREMENT_ID);
          console.log("✅ gtag function available:", typeof window.gtag);
          console.log("✅ dataLayer initial:", window.dataLayer);
          
          // 테스트 이벤트 즉시 전송
          gtag('event', 'ga_test_event', {
            event_category: 'test',
            event_label: 'initialization_test'
          });
          console.log("🧪 Test event sent");
          console.log("📊 DataLayer after test event:", window.dataLayer);
          
          // 페이지 로드 완료 후 추가 테스트
          setTimeout(() => {
            gtag('event', 'page_loaded', {
              event_category: 'engagement',
              event_label: 'app_ready'
            });
            console.log("🎯 Page loaded event sent");
            console.log("📊 Final dataLayer check:", window.dataLayer);
          }, 1000);
        }}
        onError={(e) => {
          console.error("❌ GA script failed to load:", e);
        }}
      />
    </>
  );
}