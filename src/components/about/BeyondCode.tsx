'use client';

import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { usePortfolioLocale } from '@/lib/usePortfolioLocale';
import styles from './BeyondCode.module.css';

const interests = ['reading', 'classical', 'tea', 'training'] as const;
type Interest = (typeof interests)[number];
type UnderlinePosition = { left: number; top: number; width: number };

// 구체적인 책·작곡가·운동 기록을 추가하지 않고 알려준 취향의 분위기를 풀어 쓴다.
const copy = {
  ko: {
    introduction: '요즘 제 시간을 채우는 것들', group: '관심사 선택',
    reading: { title: 'Reading', emphasis: '마음에 남는 문장', description: ['요즘은 이북리더기로 책 읽는 시간을 즐기고 있습니다.', '마음에 남는 문장을 천천히 읽으며, 한 문장에 잠시 머무는 시간이 좋습니다.', '읽는 동안에는 다른 일을 잠시 내려놓고 책에 집중할 수 있어 좋습니다.'] },
    classical: { title: 'Classical', emphasis: '악기가 주고받는 소리', description: ['클래식 음악을 즐겨 듣습니다.', '멜로디와 악기가 주고받는 소리, 곡이 흘러가는 모습을 천천히 따라가는 시간이 좋습니다.', '말없이 이어지는 음악을 듣다 보면 생각도 잠깐 쉬어 가는 기분이 듭니다.'] },
    tea: { title: 'Tea', emphasis: '잠시 속도를 늦추는 시간', description: ['차 한 잔을 즐기는 시간을 좋아합니다.', '찻잔을 앞에 두고 향을 느끼며 잠시 속도를 늦추는 시간이 좋습니다.', '한 잔을 천천히 마시는 것만으로도 일상 속 작은 쉼이 됩니다.'] },
    training: { title: 'Training', emphasis: '동작 하나에 집중하는 시간', description: ['웨이트 운동을 즐깁니다.', '몸을 움직이고 동작 하나에 집중하는 시간이 좋습니다.', '제 속도에 맞춰 차근차근 이어 갈 수 있다는 점이 웨이트 운동의 매력이라고 생각합니다.'] },
  },
  en: {
    introduction: 'A few things I enjoy these days.', group: 'Choose an interest',
    reading: { title: 'Reading', emphasis: 'a sentence that stays with me', description: ['Lately, I’ve been enjoying reading on my e-reader.', 'I like taking my time with a sentence that stays with me.', 'Reading gives me a quiet moment to set other things aside and focus on a book.'] },
    classical: { title: 'Classical', emphasis: 'the interplay between instruments', description: ['I enjoy listening to classical music.', 'I like following the melody, the interplay between instruments, and the way a piece unfolds.', 'Listening gives my thoughts a little room to settle.'] },
    tea: { title: 'Tea', emphasis: 'slow down for a moment', description: ['I enjoy taking time for a cup of tea.', 'A cup of tea and its gentle aroma make it easy to slow down for a moment.', 'Sipping a cup of tea can be a small pause in the day.'] },
    training: { title: 'Training', emphasis: 'focusing on one movement at a time', description: ['I enjoy weight training.', 'I like moving my body and focusing on one movement at a time.', 'Being able to work through it at my own pace is part of what I enjoy.'] },
  },
} as const;

// 공통 손그림 필터는 SVG에 한 번만 적용하고 각 오브제의 움직이는 부분을 분리한다.
function InterestObject({ interest }: { interest: Interest }) {
  const readerClip = 'beyond-reader-' + useId();
  const objects = {
    reading: <>
      {/* 책 두 권과 책갈피를 더해 이북리더기 주변의 읽는 분위기를 만든다. */}
      <g className={styles.detail}>
        <path d="M8.3 10.7 6.7 37.4q-.1 1.2 1.4 1.4l.9.1M7.2 43.4q15.7-.5 31.6.4l.2 3-32-.2q-1.5-1.7.2-3.2ZM8.5 45.1l27.3.4M33 43.9l-.1 3.1 2-1.1 1.7 1.2.1-3.1" />
      </g>
      <path d="M13.1 5.8 34.2 5.3Q37.1 5.5 37 8.5L36.5 39.5Q36.3 42.1 33.5 42L12.9 41.6Q10.3 41.4 10.5 38.5L10.9 9Q10.8 6.2 13.1 5.8Z" />
      <path d="m15.1 11.3 16.8-.2-.2 22.2-17-.3ZM20.8 8.5l5.3-.1" />
      <g clipPath={`url(#${readerClip})`}><g className={styles.readerPage}><path className={`${styles.accent} ${styles.readingAccent}`} d="m18 16.9 11.1-.2M18 21.7l10.8.3M18.2 26.7l7.9-.1M18 34.9l9.4.1M18 39.7l11-.1M18.2 44.7l6.3-.2" /></g></g>
      <path d="M24.5 36.8q1.2-.1 1.1 1.1t-1.3 1q-1.3-.1-1.1-1.2.2-1 1.3-.9ZM29.2 5.5l-.1 5 1.5-1 1.6.9.1-5" />
    </>,
    classical: <>
      {/* 턴테이블 받침과 작은 조절부를 두고 음반의 회전은 그대로 유지한다. */}
      <g className={styles.detail}>
        <path d="M6.4 4.9 42.6 4.5q2.1.1 2.1 2.6l.1 35.6q.1 2.5-2.4 2.4L5.9 45.5q-2.3-.2-2.2-2.4L3.4 8q0-2.8 3-3.1ZM8 45.7v1.3h4.4v-1.3M35.1 45.4v1.4l4.5-.1v-1.3" />
        <path d="M40.4 36.5q2.2 0 2.2 2.3t-2.2 2.1q-2.3 0-2.2-2.3t2.2-2.1ZM40.3 37.7l.1 1.1M6.7 8.5l2.7-.1" />
      </g>
      <path className={styles.recordOutline} d="M21.9 8.3C12.4 8.1 4.9 16 5.3 25.5c.2 9.5 7.7 16.7 17 16.4 9.4-.2 16.9-7.5 16.7-17.1C39 15.4 31.4 8.2 21.9 8.3Z" />
      <g className={styles.record}>
        <path d="M22 13.1c-7.1.1-12.4 5.4-12 12.5.2 6.8 5.3 11.9 12.3 11.8 6.8-.2 12-5.5 11.8-12.4-.1-6.9-5.3-12-12.1-11.9Z" />
        <path d="M22.1 18c-4.1-.1-7.3 3.2-7.2 7.4.1 4 3.3 7.1 7.5 7 4-.1 7-3.4 6.9-7.3-.1-4.1-3.2-7-7.2-7.1Z" />
        <path className={styles.detail} d="M10.7 17q4.4-6.6 12.4-6.3M22.9 39.6q7-.5 11.1-6.2" />
        <path className={`${styles.accent} ${styles.recordAccent}`} d="M22.1 23.3q2-.1 2.1 1.8t-2 2q-2 .1-2-1.9t1.9-1.9Z" /><path d="M13 14.1l2.6 2.3M29.1 32.2l2.6 2.5" />
      </g>
      <path d="m40.8 7.6-2.9 14.6-6.3 7.5M39.6 7.1l2.8.5-.7 3-2.8-.5ZM30.8 28.7l2.7 2-3 3.7-2.6-2Z" />
    </>,
    tea: <>
      {/* 작은 티포트·찻잎·받침을 덧붙이고 두 줄의 김만 가볍게 움직인다. */}
      <g className={styles.detail}>
        <path d="M34.1 12.7q4.5 1 9.1-.2l-.7 4.5q-.5 3.8-4.4 3.7-4.3 0-4.7-3.5ZM34.6 12q4-2.5 8.5 0M37.9 10.7l.1-1.4q1.1-.8 2.2.1l-.1 1.2M43.2 13.8q4.2-.4 3.6 2.6-.4 2.5-3.8 2.1M34.2 14.8l-3.4-1.9.9 3.3 2.8 1.9" />
        <path d="M4.5 15.5q7-.9 7.5 5.7Q5 22 4.5 15.5ZM5.5 16.5l5 3.8M6.9 41.4C1.9 43.2 7.9 46.5 21.6 46.2s23.9-3.2 17.7-5.3" />
      </g>
      <path d="M9 23.3q10.1 1.9 23-.2l-.7 9q-.8 8.1-10.4 8.2-9.2.1-10.4-7.5ZM10.2 25.1q10 1.6 20.5-.2" />
      <path d="M31.9 25.3q9.7-2 9 4.2-.4 5.6-9.7 5.2M7 42.7q13.2 3.5 29-.2M17.3 40.3l-.2 1.5q4.1 1.1 8.2.1l-.1-1.6" />
      <g className={styles.steam}><path className={`${styles.accent} ${styles.teaAccent}`} d="M16.5 18.9q-3.1-3.6.7-6.8 2.5-2.1.1-5.3" /></g>
      <g className={`${styles.steam} ${styles.secondSteam}`}><path className={`${styles.accent} ${styles.teaAccent}`} d="M25 19q3.4-3.5.1-6.6-2.2-2 .2-4.7" /></g>
    </>,
    training: <>
      <g className={styles.detail}>
        <path d="M38.7 33.7q5.4 0 5.5 5.3.1 5.2-5.3 5.3-5.2.1-5.4-5.2-.1-5.3 5.2-5.4ZM38.8 37.4q1.7 0 1.7 1.6t-1.6 1.7q-1.7 0-1.7-1.6t1.6-1.7M36 35.4l-.9 1.2M41.7 41.5l-.9 1.1" />
        <path d="m7.3 44 18.8.3-.1 2.7-18.8-.3q-1.5-1.1.1-2.7ZM9.1 45.5l14.8.2" />
      </g>
      <g className={styles.dumbbell}>
        <path className={`${styles.accent} ${styles.trainingAccent}`} d="m16.7 24.7 12.1-7.2 3.3 5.4-12.2 7.3Z" />
        <path d="m7.9 23.2 5.9-3.6L24 36.3l-5.9 3.6ZM24.1 12.6 30 9l10.1 16.6-5.7 3.6Z" />
        <path d="m4.9 29 4.3-2.6 7.2 11.8-4.1 2.6ZM31.9 9l4.3-2.6 7.2 11.7-4.1 2.6M4.3 34l3.2-1.9M39.8 12.8l3.2-1.9" />
        <path className={styles.detail} d="m11.4 23.5 8.3 13.6M27.6 12.8l8.2 13.5M20 24l1.5 2.4M22.9 22.3l1.5 2.4M25.8 20.6l1.5 2.4" />
      </g>
    </>,
  };
  return <svg className={styles.icon} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {interest === 'reading' && <defs><clipPath id={readerClip}><rect x="17" y="14" width="14" height="16" /></clipPath></defs>}
    {objects[interest]}
  </svg>;
}

// 문구의 실제 줄 조각에만 밑줄을 두어 모바일 줄바꿈과 영문 길이에도 맞춘다.
function InterestDescription({ paragraphs, emphasis }: { paragraphs: readonly string[]; emphasis: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const phraseRef = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<{ left: number; top: number; width: number }[]>([]);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current, phrase = phraseRef.current;
    if (!container || !phrase) return;
    let disposed = false, frame = 0;
    function measure() {
      frame = 0;
      if (disposed) return;
      const origin = container!.getBoundingClientRect();
      const next = Array.from(phrase!.getClientRects()).filter(rect => rect.width > 0).map(rect => ({
        left: rect.left - origin.left, top: rect.bottom - origin.top - 1, width: rect.width,
      }));
      setLines(previous => previous.length === next.length && previous.every((line, i) =>
        Math.abs(line.left - next[i].left) < 0.2 && Math.abs(line.top - next[i].top) < 0.2 && Math.abs(line.width - next[i].width) < 0.2
      ) ? previous : next);
    }
    function schedule() { if (!disposed && !frame) frame = requestAnimationFrame(measure); }
    measure();
    const resize = new ResizeObserver(schedule);
    resize.observe(container);
    const view = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      setVisible(entries[0].isIntersecting && entries[0].intersectionRatio >= 0.15);
    }, { threshold: 0.15 });
    if (view) view.observe(container); else setVisible(true);
    document.fonts?.ready.then(schedule);
    return () => { disposed = true; cancelAnimationFrame(frame); resize.disconnect(); view?.disconnect(); };
  }, []);

  return <div ref={containerRef} className={styles.descriptionCopy} data-drawing={visible}>
    {paragraphs.map(paragraph => {
      const start = paragraph.indexOf(emphasis);
      return <p key={paragraph}>{start < 0 ? paragraph : <>
        {paragraph.slice(0, start)}<span ref={phraseRef} data-interest-emphasis>{emphasis}</span>{paragraph.slice(start + emphasis.length)}
      </>}</p>;
    })}
    {lines.map((line, index) => <span key={index} className={styles.descriptionStroke} aria-hidden="true" style={{
      left: line.left, top: line.top, width: line.width, '--stroke-delay': (220 + index * 180) + 'ms',
    } as CSSProperties} />)}
  </div>;
}

export function BeyondCode() {
  const locale = usePortfolioLocale(), text = copy[locale];
  const [selected, setSelected] = useState<Interest>('reading');
  const shelfRef = useRef<HTMLDivElement>(null);
  const labels = useRef<Partial<Record<Interest, HTMLSpanElement | null>>>({});
  const positioned = useRef(false);
  const [underline, setUnderline] = useState<UnderlinePosition | null>(null);
  const [moving, setMoving] = useState(false);

  // 너비나 항목 번호로 추측하지 않고 실제 라벨 좌표로 모바일의 행 이동까지 맞춘다.
  useLayoutEffect(() => {
    let disposed = false, frame = 0;
    function measure() {
      if (disposed || !shelfRef.current || !labels.current[selected]) return;
      const parent = shelfRef.current.getBoundingClientRect();
      const label = labels.current[selected]!.getBoundingClientRect();
      if (!label.width || !label.height) return;
      const next = { left: label.left - parent.left - 1, top: label.bottom - parent.top + 2, width: label.width + 2 };
      setUnderline((previous) => previous && previous.left === next.left && previous.top === next.top && previous.width === next.width ? previous : next);
      if (!positioned.current) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (!disposed) { positioned.current = true; setMoving(true); }
        });
      }
    }
    measure();
    const Observer = window.ResizeObserver;
    const observer = Observer ? new Observer(measure) : null;
    if (shelfRef.current) observer?.observe(shelfRef.current);
    Object.values(labels.current).forEach((label) => { if (label) observer?.observe(label); });
    window.addEventListener('resize', measure);
    document.fonts?.ready?.then(measure, () => {});
    return () => { disposed = true; cancelAnimationFrame(frame); observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [selected, locale]);

  return <section id="beyond-code" className="site-section content-width" data-localized-skip aria-labelledby="beyond-code-title">
    <header className="section-header"><h2 id="beyond-code-title" className="section-title" lang="en">Beyond Code</h2><p className={styles.introduction}>{text.introduction}</p></header>
    <div className={styles.shelf} ref={shelfRef} role="group" aria-label={text.group}>
      {interests.map((interest) => <button className={styles.interest} data-interest-object={interest} key={interest} type="button" aria-pressed={selected === interest} aria-controls="beyond-code-description" onClick={() => setSelected(interest)}>
        <span className={styles.object}><InterestObject interest={interest} /></span>
        <span className={styles.name} ref={(element) => { labels.current[interest] = element; }} lang="en">{text[interest].title}</span>
      </button>)}
      <span className={styles.underline} data-ready={underline !== null} data-moving={moving} style={underline ?? undefined} aria-hidden="true" />
    </div>
    <div id="beyond-code-description" className={styles.description} role="status" aria-live="polite" aria-atomic="true">
      <InterestDescription key={`${selected}-${locale}`} paragraphs={text[selected].description} emphasis={text[selected].emphasis} />
    </div>
  </section>;
}
