export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
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
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID && window.gtag) {
    console.log('📤 Sending GA event:', { action, category, label, value });
    
    // GA4 이벤트 파라미터 구성
    const eventParams: Record<string, string | number | undefined> = {
      event_category: category,
      event_label: label,
      value: value ?? undefined,
    };
    
    window.gtag('event', action, eventParams);
  } else {
    console.warn('⚠️ GA not available:', {
      hasWindow: typeof window !== 'undefined',
      hasGAId: !!GA_MEASUREMENT_ID,
      hasGtag: typeof window !== 'undefined' && !!window.gtag
    });
  }
};

// Type definitions for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}