'use client';

import Script from 'next/script';
import { startPortfolioRuntime } from '@/lib/runtime/portfolio';

// 캐러셀이 속성과 섀도 DOM을 추가하므로 하이드레이션 이후에 불러온다.
// 스크립트 로드에 실패해도 기본 스크롤·모달·언어 동작은 사용할 수 있다.
export function PortfolioRuntime() {
  return (
    <Script
      id="blossom-carousel"
      src="/assets/vendor/blossom-carousel/blossom-carousel-web.umd.js?v=bec696bf"
      strategy="afterInteractive"
      onReady={startPortfolioRuntime}
      onError={startPortfolioRuntime}
    />
  );
}
