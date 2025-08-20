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
  console.log('🎯 GA Event Attempt:', { action, category, label, value });
  console.log('🔍 Environment Check:', {
    hasWindow: typeof window !== 'undefined',
    GA_ID: GA_MEASUREMENT_ID,
    hasGtag: typeof window !== 'undefined' && !!window.gtag,
    gtagType: typeof window !== 'undefined' ? typeof window.gtag : 'undefined'
  });

  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID && window.gtag) {
    // GA4 이벤트 파라미터 구성
    const eventParams: Record<string, string | number | undefined> = {
      event_category: category,
      event_label: label,
      value: value ?? undefined,
    };
    
    console.log('✅ Sending GA event with params:', eventParams);
    window.gtag('event', action, eventParams);
    console.log('📡 GA event sent successfully');
    
    // 추가: dataLayer 확인
    if (window.dataLayer) {
      console.log('📊 DataLayer length after event:', window.dataLayer.length);
      console.log('📊 Last dataLayer entry:', window.dataLayer[window.dataLayer.length - 1]);
    }
  } else {
    console.error('❌ GA event failed - requirements not met:', {
      hasWindow: typeof window !== 'undefined',
      hasGAId: !!GA_MEASUREMENT_ID,
      hasGtag: typeof window !== 'undefined' && !!window.gtag,
      GA_ID: GA_MEASUREMENT_ID
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