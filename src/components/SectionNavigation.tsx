'use client';

import { useEffect, useRef } from 'react';

const sections = [
  ['about', 'Frontend Developer'],
  ['companies', 'Experience'],
  ['projects', 'Projects'],
  ['my-stack', 'SKILL'],
  ['ui-playground', 'UI Playground'],
  ['services', 'What I Do'],
  ['thoughts', 'Engineering Notes'],
  ['beyond-code', 'Beyond Code'],
  ['contact', 'Contact'],
] as const;

// 본문은 그대로 두고 실제 제목과 문서 스크롤을 추적하는 보조 내비게이션입니다.
export function SectionNavigation() {
  const navigationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = navigationRef.current;
    const page = document.getElementById('home');
    if (!wrapper || !page) return;
    const nav = wrapper.querySelector<HTMLElement>('.section-navigation-nav')!;
    const scroller = wrapper.querySelector<HTMLElement>('.section-navigation-scroll')!;
    const list = wrapper.querySelector<HTMLElement>('.section-navigation-list')!;
    const marker = wrapper.querySelector<HTMLElement>('.section-navigation-marker')!;
    const items = sections.flatMap(([id]) => {
      const section = document.getElementById(id);
      const heading = section?.querySelector<HTMLElement>('h1, h2');
      const link = wrapper.querySelector<HTMLAnchorElement>(`a[href="#${id}"]`);
      return section && heading && link ? [{ id, section, heading, link, top: 0 }] : [];
    });
    if (!items.length) return;

    const lifecycle = new AbortController();
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const wide = matchMedia('(min-width: 1280px)');
    let disposed = false;
    let ready = false;
    let geometryDirty = true;
    let frame = 0;
    let active = -1;
    let offset = 88;
    let maxScroll = 0;
    let pendingHash = false;
    let navigation: { index: number; lastY: number; stable: number; focus: boolean; ended: boolean } | null = null;
    const addedTabindex = new Set<HTMLElement>();

    function blocked() {
      return document.documentElement.matches('.has-landing-intro, .has-sheet, .is-intro-revealing') ||
        Boolean(document.querySelector('dialog[open]'));
    }

    // offsetTop을 합산하여 섹션 등장 transform의 중간 위치를 추적 기준에 넣지 않습니다.
    function layoutTop(element: HTMLElement) {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    }

    function positionMarker() {
      const item = items[active];
      if (!item || !list.getBoundingClientRect().width) {
        marker.hidden = true;
        return;
      }
      const bounds = item.link.getBoundingClientRect();
      const listBounds = list.getBoundingClientRect();
      marker.style.transform = `translateY(${bounds.top - listBounds.top}px)`;
      marker.style.height = `${bounds.height}px`;
      marker.hidden = false;

      // 목차만 최소한으로 이동합니다. scrollIntoView는 본문까지 이동시킬 수 있습니다.
      const viewport = scroller.getBoundingClientRect();
      if (bounds.top < viewport.top) scroller.scrollTop += bounds.top - viewport.top;
      else if (bounds.bottom > viewport.bottom) scroller.scrollTop += bounds.bottom - viewport.bottom;
    }

    function setActive(index: number) {
      if (active === index) return;
      if (items[active]) items[active].link.removeAttribute('aria-current');
      active = index;
      items[index].link.setAttribute('aria-current', 'location');
      positionMarker();
    }

    function measure() {
      geometryDirty = false;
      offset = parseFloat(getComputedStyle(nav).top) || 88;
      maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      items.forEach((item) => {
        item.top = layoutTop(item.heading);
        // 소개 링크는 요청한 고정 문구를 쓰고 나머지는 실제 섹션 제목을 따릅니다.
        const title = item.id === 'about' ? 'Frontend Developer' : item.heading.textContent?.trim() || item.id;
        if (item.link.textContent !== title) item.link.textContent = title;
      });
      nav.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Page sections' : '섹션 목차');
      positionMarker();
    }

    function currentSection() {
      if (maxScroll > 0 && window.scrollY >= maxScroll - 2) return items.length - 1;
      const line = window.scrollY + offset + 1;
      let low = 0;
      let high = items.length - 1;
      while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        if (items[middle].top <= line) low = middle;
        else high = middle - 1;
      }
      return low;
    }

    function destination(index: number) {
      return Math.max(0, Math.min(maxScroll, items[index].top - offset));
    }

    function finishNavigation() {
      const completed = navigation;
      navigation = null;
      if (completed?.focus) {
        const heading = items[completed.index].heading;
        if (!heading.hasAttribute('tabindex')) {
          heading.tabIndex = -1;
          addedTabindex.add(heading);
        }
        heading.focus({ preventScroll: true });
      }
      setActive(currentSection());
    }

    function navigate(index: number, smooth: boolean, focus = false) {
      if (!ready || blocked()) return;
      if (geometryDirty) measure();
      navigation = { index, lastY: window.scrollY, stable: 0, focus, ended: false };
      setActive(index);
      window.scrollTo({ top: destination(index), behavior: smooth && !motion.matches ? 'smooth' : 'instant' });
      schedule();
    }

    function hashIndex() {
      try { return items.findIndex((item) => item.id === decodeURIComponent(location.hash.slice(1))); }
      catch { return -1; }
    }

    function tick() {
      frame = 0;
      if (disposed || !ready || blocked()) return;
      if (geometryDirty) measure();
      if (pendingHash) {
        pendingHash = false;
        const index = hashIndex();
        if (index >= 0) { navigate(index, false); return; }
      }
      if (navigation) {
        const y = window.scrollY;
        const delta = Math.abs(y - navigation.lastY);
        navigation.stable = delta < 0.5 ? navigation.stable + 1 : 0;
        navigation.lastY = y;
        const arrived = Math.abs(y - destination(navigation.index)) < 2;
        // 스크롤 완료 이벤트와 실제 정지 프레임으로 판단하고 긴 타이머는 사용하지 않습니다.
        if ((arrived && navigation.stable >= 2) || navigation.ended || navigation.stable >= 6) finishNavigation();
        else schedule();
      } else setActive(currentSection());
    }

    function schedule() {
      if (!disposed && !frame) frame = requestAnimationFrame(tick);
    }

    function invalidate() { geometryDirty = true; schedule(); }

    function interrupt() {
      if (!navigation) return;
      navigation = null;
      window.scrollTo({ top: window.scrollY, behavior: 'instant' });
      schedule();
    }

    function syncState() {
      const initialized = page!.classList.contains('active');
      if (initialized && !ready) {
        ready = true;
        wrapper!.dataset.ready = 'true';
        pendingHash = true;
      }
      wrapper!.inert = !ready || !wide.matches || blocked();
      if (blocked()) interrupt();
      invalidate();
    }

    const events = { signal: lifecycle.signal };
    const passive = { ...events, passive: true };
    const capturePassive = { ...passive, capture: true };
    wrapper.addEventListener('click', (event) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('.section-navigation-link');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const index = items.findIndex((item) => item.link === link);
      if (index < 0 || !ready || blocked()) return;
      event.preventDefault();
      if (location.hash !== link.hash) history.pushState({ ...history.state, sheet: false }, '', link.hash);
      navigate(index, true, event.detail === 0);
    }, events);
    window.addEventListener('scroll', schedule, passive);
    window.addEventListener('scrollend', (event) => {
      if (event.target !== document && event.target !== window) return;
      if (navigation && Math.abs(window.scrollY - destination(navigation.index)) < 2) navigation.ended = true;
      schedule();
    }, passive);
    window.addEventListener('resize', invalidate, passive);
    window.addEventListener('wheel', interrupt, capturePassive);
    window.addEventListener('touchstart', interrupt, capturePassive);
    window.addEventListener('pointerdown', (event) => {
      if (event.clientX >= document.documentElement.clientWidth) interrupt();
    }, capturePassive);
    window.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key) &&
          !(event.target as Element).closest('input, textarea, select, [contenteditable="true"]')) interrupt();
    }, events);
    const replayHash = () => { pendingHash = true; interrupt(); invalidate(); };
    window.addEventListener('hashchange', replayHash, events);
    window.addEventListener('popstate', replayHash, events);
    document.addEventListener('load', invalidate, capturePassive);
    motion.addEventListener('change', () => { interrupt(); invalidate(); }, events);
    wide.addEventListener('change', syncState, events);

    const resize = new ResizeObserver(invalidate);
    [document.documentElement, page, list, ...items.flatMap((item) => [item.section, item.link])].forEach((element) => resize.observe(element));
    const headings = new MutationObserver(invalidate);
    items.forEach((item) => headings.observe(item.heading, { childList: true, characterData: true, subtree: true }));
    const state = new MutationObserver(syncState);
    state.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'lang'] });
    state.observe(page, { attributes: true, attributeFilter: ['class'] });
    const dialogs = new MutationObserver(syncState);
    document.querySelectorAll('dialog').forEach((dialog) => dialogs.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
    document.fonts.ready.then(() => { if (!disposed) invalidate(); });
    document.fonts.addEventListener('loadingdone', invalidate, events);
    syncState();

    return () => {
      disposed = true;
      lifecycle.abort();
      cancelAnimationFrame(frame);
      resize.disconnect();
      headings.disconnect();
      state.disconnect();
      dialogs.disconnect();
      addedTabindex.forEach((heading) => heading.removeAttribute('tabindex'));
    };
  }, []);

  return (
    <div className="section-navigation" ref={navigationRef}>
      <nav className="section-navigation-nav" aria-label="섹션 목차">
        <div className="section-navigation-scroll">
          <ul className="section-navigation-list">
            <li className="section-navigation-marker" aria-hidden="true" hidden />
            {sections.map(([id, title]) => (
              <li key={id}>
                <a className="section-navigation-link" href={`#${id}`}>{title}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
