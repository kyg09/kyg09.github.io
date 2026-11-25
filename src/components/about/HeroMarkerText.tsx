'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MarkerText } from '@/components/kokonutui/marker-text';
import styles from './HeroMarkerText.module.css';

// 원본의 controlled show를 사용한다. 이름·본문 DOM은 기존 번역과 첫 등장 동작이 그대로 관리한다.
export function HeroMarkerText({ children }: { children: ReactNode }) {
  const trigger = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const element = trigger.current;
    if (!element) return;
    // 터치·펜은 공통 런타임의 누름/취소/스크롤 해제를 그대로 구독한다.
    const press = new MutationObserver(() => setPressed(element.classList.contains('is-touch-active')));
    press.observe(element, { attributes: true, attributeFilter: ['class'] });
    const modality = new MutationObserver(() => {
      if (!document.documentElement.classList.contains('can-hover')) setHovered(false);
    });
    modality.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const clear = () => { setHovered(false); setPressed(false); };
    const onVisibility = () => { if (document.hidden) clear(); };
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      press.disconnect();
      modality.disconnect();
      window.removeEventListener('blur', clear);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div
      ref={trigger}
      className={styles.trigger}
      data-hero-marker
      data-marker-active={hovered || pressed}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      <MarkerText as="section" className={`hero-statement ${styles.text}`} show={hovered || pressed}>
        {children}
      </MarkerText>
    </div>
  );
}
