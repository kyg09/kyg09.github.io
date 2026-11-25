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

  useEffect(() => {
    const emphasis = trigger.current?.querySelector<HTMLElement>('.intro-emphasis');
    const text = emphasis?.querySelector<HTMLElement>('[data-intro-emphasis-text]');
    const layer = emphasis?.querySelector<HTMLElement>('.intro-emphasis-lines');
    if (!emphasis || !text || !layer) return;
    let frame = 0;
    let disposed = false;

    // 번역·단어 등장·폰트 변경 후 각 줄의 실제 글자 폭에만 손그림 밑줄을 맞춘다.
    const measure = () => {
      if (disposed) return;
      const origin = emphasis.getBoundingClientRect();
      const rows: { left: number; right: number; top: number; bottom: number }[] = [];
      const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent?.trim()) continue;
        range.selectNodeContents(walker.currentNode);
        for (const rect of Array.from(range.getClientRects())) {
          if (rect.width < 1 || rect.height < 1) continue;
          const row = rows.find((item) => Math.abs(item.top - rect.top) < 2);
          if (row) {
            row.left = Math.min(row.left, rect.left);
            row.right = Math.max(row.right, rect.right);
            row.bottom = Math.max(row.bottom, rect.bottom);
          } else rows.push({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });
        }
      }
      const bottomInset = rows.length ? origin.bottom - Math.max(...rows.map((row) => row.bottom)) : 0;
      const fragment = document.createDocumentFragment();
      for (const row of rows) {
        const line = document.createElement('span');
        line.className = 'intro-emphasis-line';
        line.style.left = `${row.left - origin.left}px`;
        line.style.top = `calc(${row.bottom - origin.top + bottomInset}px + 0.15rem - 6px)`;
        line.style.width = `${row.right - row.left}px`;
        fragment.append(line);
      }
      layer.replaceChildren(fragment);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const textChanges = new MutationObserver(schedule);
    textChanges.observe(text, { childList: true, characterData: true, subtree: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(emphasis);
    document.fonts.ready.then(() => { if (!disposed) schedule(); });
    document.fonts.addEventListener('loadingdone', schedule);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      textChanges.disconnect();
      resize.disconnect();
      document.fonts.removeEventListener('loadingdone', schedule);
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
