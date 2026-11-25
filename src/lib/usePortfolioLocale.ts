'use client';

import { useSyncExternalStore } from 'react';

type PortfolioLocale = 'ko' | 'en';

// 기존 언어 버튼이 변경하는 html.lang을 구독해 조작 중인 React 상태도 유지한다.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  return () => observer.disconnect();
}

function getSnapshot(): PortfolioLocale {
  return document.documentElement.lang === 'en' ? 'en' : 'ko';
}

// 서버와 첫 hydration은 같은 한국어 마크업을 사용하고 이후 실제 문서 언어에 맞춘다.
export function usePortfolioLocale(): PortfolioLocale {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'ko');
}
