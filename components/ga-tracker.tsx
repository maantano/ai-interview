"use client";

import { useEffect } from "react";
import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GATracker() {
  useEffect(() => {
    if (GA_MEASUREMENT_ID && typeof window !== "undefined") {
      // GA4 초기화
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;
      
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
      });
    }
  }, []);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}