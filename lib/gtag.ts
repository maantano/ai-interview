export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && GA_MEASUREMENT_ID && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
      debug_mode: true, // 개발환경에서 디버그 모드 활성화
      send_page_view: true,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  console.log("🎯 GA Event Attempt:", { action, category, label, value });
  console.log("🔍 Environment Check:", {
    hasWindow: typeof window !== "undefined",
    GA_ID: GA_MEASUREMENT_ID,
    hasGtag: typeof window !== "undefined" && !!window.gtag,
    gtagType: typeof window !== "undefined" ? typeof window.gtag : "undefined",
    isLocalhost:
      typeof window !== "undefined" && window.location.hostname === "localhost",
    currentURL:
      typeof window !== "undefined" ? window.location.href : "undefined",
  });

  if (typeof window !== "undefined" && GA_MEASUREMENT_ID && window.gtag) {
    // GA4 표준 이벤트 파라미터 구성
    const eventParams: Record<string, string | number | undefined> = {
      event_category: category,
      event_label: label,
    };

    // value가 있을 때만 추가
    if (value !== undefined && value !== null) {
      eventParams.value = value;
    }

    console.log("✅ Sending GA event with params:", eventParams);
    window.gtag("event", action, eventParams);
    console.log("📡 GA event sent successfully");

    // 표준 이벤트도 추가로 전송 (실시간 인식을 위해)
    const standardEvent = getStandardEvent(action, category);
    if (standardEvent) {
      window.gtag("event", standardEvent.name, standardEvent.params);
      console.log("📡 Standard GA event sent:", standardEvent);
    }

    // 추가: dataLayer 확인
    if (window.dataLayer) {
      console.log("📊 DataLayer length after event:", window.dataLayer.length);
      console.log(
        "📊 Last dataLayer entry:",
        window.dataLayer[window.dataLayer.length - 1]
      );
    }
  } else {
    console.error("❌ GA event failed - requirements not met:", {
      hasWindow: typeof window !== "undefined",
      hasGAId: !!GA_MEASUREMENT_ID,
      hasGtag: typeof window !== "undefined" && !!window.gtag,
      GA_ID: GA_MEASUREMENT_ID,
    });
  }
};

/**
 * GA4 표준 이벤트로 매핑
 */
function getStandardEvent(
  action: string,
  category: string
): { name: string; params: Record<string, string> } | null {
  switch (action) {
    case "session_start":
      return {
        name: "session_start",
        params: {},
      };
    case "new_question":
      return {
        name: "page_view",
        params: {
          page_title: "Interview Question",
          page_location: window.location.href,
        },
      };
    case "answer_analyzed":
      return {
        name: "select_content",
        params: {
          content_type: "interview_answer",
          item_id: category,
        },
      };
    case "session_completed":
      return {
        name: "level_end",
        params: {
          level_name: category,
          success: "true",
        },
      };
    default:
      return null;
  }
}

// Type definitions for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
