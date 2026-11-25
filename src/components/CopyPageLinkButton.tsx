'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { usePortfolioLocale } from '@/lib/usePortfolioLocale';
import styles from './CopyPageLinkButton.module.css';

type Mode = 'idle' | 'copied' | 'error';
type Spring = { x: number; v: number; t: number; k: number; c: number };
type Animator = { measure: () => void; target: (success: boolean) => void };
const spring = (x: number, k: number, c: number): Spring => ({ x, v: 0, t: x, k, c });
const clamp = (x: number, min: number, max: number) => Math.max(min, Math.min(max, x));
const copy = {
  ko: { idle: 'Copy link', copied: 'Copied', retry: 'Retry copy', action: '페이지 주소 복사', error: '주소를 복사하지 못했습니다. 다시 눌러 주세요.' },
  en: { idle: 'Copy link', copied: 'Copied', retry: 'Retry copy', action: 'Copy page link', error: 'Could not copy the link. Please try again.' },
};

// DesignBookmark Copy Button의 아이콘·텍스트·너비 spring을 그대로 옮긴다.
// 원본: https://designbookmark.com/motion-src/copy-button/copy.js
// R 260/20, I 420/18, RW 300/24, 프레임당 4회 적분. 데모 자동 재생은 사용하지 않는다.
export function CopyPageLinkButton() {
  const locale = usePortfolioLocale();
  const text = copy[locale];
  const [mode, setMode] = useState<Mode>('idle');
  const [pending, setPending] = useState(false);
  const modeRef = useRef<Mode>('idle');
  const pendingRef = useRef(false);
  const mounted = useRef(false);
  const attempt = useRef(0);
  const resetTimer = useRef<number | null>(null);
  const rollRef = useRef<HTMLSpanElement>(null);
  const wordsRef = useRef<HTMLSpanElement>(null);
  const firstRef = useRef<HTMLSpanElement>(null);
  const secondRef = useRef<HTMLSpanElement>(null);
  const copyRef = useRef<SVGSVGElement>(null);
  const checkRef = useRef<SVGSVGElement>(null);
  const animator = useRef<Animator | null>(null);

  useLayoutEffect(() => {
    const roll = rollRef.current, words = wordsRef.current, first = firstRef.current, second = secondRef.current;
    const icon = copyRef.current, check = checkRef.current;
    if (!roll || !words || !first || !second || !icon || !check) return;
    mounted.current = true;
    const R = spring(0, 260, 20), I = spring(0, 420, 18), RW = spring(0, 300, 24);
    const springs = [R, I, RW];
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let widths = [0, 0], frame = 0, measureFrame = 0, last = 0, disposed = false, measured = false;

    function hint(active: boolean) {
      words!.style.willChange = active ? 'transform' : '';
      icon!.style.willChange = check!.style.willChange = active ? 'transform, opacity' : '';
      roll!.style.willChange = active ? 'width' : '';
    }
    function render() {
      roll!.style.width = Math.max(0, RW.x).toFixed(2) + 'px';
      words!.style.transform = `translateY(${(-18 * R.x).toFixed(2)}px)`;
      const i = clamp(I.x, -0.2, 1.2);
      icon!.style.opacity = clamp(1 - i * 1.6, 0, 1).toFixed(3);
      icon!.style.transform = `scale(${(1 - 0.5 * clamp(i, 0, 1)).toFixed(3)}) rotate(${(-40 * clamp(i, 0, 1)).toFixed(1)}deg)`;
      check!.style.opacity = clamp(i * 1.6 - 0.4, 0, 1).toFixed(3);
      check!.style.transform = `scale(${(0.4 + 0.6 * i).toFixed(3)})`;
    }
    function stop() {
      cancelAnimationFrame(frame); frame = 0; last = 0; hint(false);
    }
    function snap() {
      stop(); springs.forEach(s => { s.x = s.t; s.v = 0; }); render();
    }
    function settled() {
      return springs.every(s => Math.abs(s.x - s.t) < 0.01 && Math.abs(s.v) < 0.02);
    }
    function tick(now: number) {
      frame = 0;
      if (disposed) return;
      if (document.hidden || media.matches) { snap(); return; }
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0;
      last = now;
      for (let n = 0; n < 4; n++) springs.forEach(s => {
        s.v += (-s.k * (s.x - s.t) - s.c * s.v) * dt / 4;
        s.x += s.v * dt / 4;
      });
      render();
      if (settled()) snap(); else frame = requestAnimationFrame(tick);
    }
    function start() {
      if (disposed) return;
      if (media.matches || document.hidden || settled()) { snap(); return; }
      if (!frame) { last = 0; hint(true); frame = requestAnimationFrame(tick); }
    }
    function target(success: boolean) {
      R.t = I.t = success ? 1 : 0;
      RW.t = widths[success ? 1 : 0];
      start();
    }
    function measure() {
      if (disposed) return;
      // 애니메이션 중인 버튼 폭은 관측하지 않고 자연 크기의 두 문구만 읽는다.
      widths = [first!.offsetWidth, second!.offsetWidth];
      RW.t = widths[modeRef.current === 'copied' ? 1 : 0];
      if (!measured) { RW.x = RW.t; measured = true; }
      start();
    }
    function scheduleMeasure() {
      if (!disposed && !measureFrame) measureFrame = requestAnimationFrame(() => { measureFrame = 0; measure(); });
    }
    const resize = new ResizeObserver(scheduleMeasure);
    resize.observe(first); resize.observe(second);
    animator.current = { target, measure };
    measure(); target(modeRef.current === 'copied');
    document.fonts?.ready.then(scheduleMeasure);
    const onMotion = () => { if (media.matches) snap(); else start(); };
    const onVisibility = () => { if (document.hidden) snap(); };
    media.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      disposed = true; mounted.current = false; attempt.current++;
      stop(); cancelAnimationFrame(measureFrame); resize.disconnect();
      media.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
      if (resetTimer.current !== null) clearTimeout(resetTimer.current);
      animator.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    animator.current?.measure();
    animator.current?.target(mode === 'copied');
  }, [locale, mode]);

  function feedback(next: Mode) {
    modeRef.current = next;
    setMode(next);
    animator.current?.target(next === 'copied');
  }

  async function copyLink() {
    if (pendingRef.current) return;
    const current = ++attempt.current;
    pendingRef.current = true; setPending(true);
    if (resetTimer.current !== null) { clearTimeout(resetTimer.current); resetTimer.current = null; }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      const url = new URL(locale === 'en' ? '/en/' : '/', window.location.origin);
      await navigator.clipboard.writeText(url.href);
      if (!mounted.current || current !== attempt.current) return;
      feedback('copied');
      resetTimer.current = window.setTimeout(() => { resetTimer.current = null; feedback('idle'); }, 1800);
    } catch {
      if (!mounted.current || current !== attempt.current) return;
      feedback('error');
    } finally {
      if (mounted.current && current === attempt.current) { pendingRef.current = false; setPending(false); }
    }
  }

  return <><button type="button" className={`copy-page-link ${styles.button}`} data-localized-skip data-state={mode}
    aria-label={mode === 'error' ? text.retry : text.action} aria-busy={pending} onClick={copyLink}>
    <span className={styles.icon} aria-hidden="true">
      <svg ref={copyRef} viewBox="0 0 24 24"><rect x="8.5" y="8.5" width="11" height="11" rx="3" /><path d="M15.5 8.5V7a2.5 2.5 0 0 0-2.5-2.5H7A2.5 2.5 0 0 0 4.5 7v6A2.5 2.5 0 0 0 7 15.5h1.5" /></svg>
      <svg ref={checkRef} className={styles.check} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </span>
    <span ref={rollRef} className={styles.roll} aria-hidden="true"><span ref={wordsRef} className={styles.words}>
      <span ref={firstRef}>{mode === 'error' ? text.retry : text.idle}</span><span ref={secondRef}>{text.copied}</span>
    </span></span>
  </button><span className={styles.srOnly} data-localized-skip role="status" aria-live="polite" aria-atomic="true">{mode === 'copied' ? text.copied : mode === 'error' ? text.error : ''}</span></>;
}
