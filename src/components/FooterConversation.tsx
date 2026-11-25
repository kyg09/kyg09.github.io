'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePortfolioLocale } from '@/lib/usePortfolioLocale';
import styles from './FooterConversation.module.css';

const copy = {
  ko: {
    label: '김영근의 프로필 대화', typingLabel: '답변 작성 중',
    turns: [
      ['어떤 서비스를 만들어 왔나요?', '복지용구 커머스와 요양기관 업무 도구, U+프로야구를 개발하고 운영했습니다. 반가워요! 👋'],
      ['협업할 때 무엇을 중요하게 생각하나요?', '실제 사용 흐름을 먼저 살피고, 불분명한 요구사항은 기획자·디자이너·백엔드 개발자와 함께 구체화합니다. 사용자가 다음에 할 일을 쉽게 이해하고 작업을 마칠 수 있도록 화면을 만듭니다.'],
      ['일하지 않을 때는 어떻게 시간을 보내나요?', '이북리더기로 책을 읽고 클래식 음악과 차를 즐깁니다. ☕ 웨이트 운동으로 몸을 움직이는 시간도 좋아해요.'],
    ],
  },
  en: {
    label: 'A conversation about Kim Young Geun', typingLabel: 'Typing a reply',
    turns: [
      ['What kinds of products have you worked on?', 'I have developed and maintained assistive equipment e-commerce, tools for care facilities, and U+ Baseball. Nice to meet you! 👋'],
      ['What matters to you when collaborating?', 'I start with how people use the service, then clarify requirements with product managers, designers, and backend developers. I build screens that help users understand what to do next and complete their tasks.'],
      ['How do you spend time outside work?', 'I enjoy reading on my e-reader, listening to classical music, and having a cup of tea. ☕ I also like weight training.'],
    ],
  },
} as const;

type Spring = { x: number; v: number; t: number; k: number; c: number };
type Word = { el: HTMLSpanElement; spring: Spring; on: boolean };
const spring = (x: number, k: number, c: number): Spring => ({ x, v: 0, t: x, k, c });
const clamp = (x: number, min = 0, max = 1) => Math.max(min, Math.min(max, x));
const splitWords = (text: string) => text.split(' ');
const WORD_DELAY = 0.07;
const INTRO_END = 1.85;
// 두 언어가 같은 타임라인을 써서 전환 중에도 대화를 처음부터 재생하지 않는다.
const durations = copy.ko.turns.map((_, i) => 2.1 + Math.max(splitWords(copy.ko.turns[i][1]).length, splitWords(copy.en.turns[i][1]).length) * WORD_DELAY + 0.9);
const starts = durations.map((_, i) => INTRO_END + durations.slice(0, i).reduce((sum, duration) => sum + duration, 0));
const TOTAL_TIME = INTRO_END + durations.reduce((sum, duration) => sum + duration, 0);

// 원본 Motion.step과 같은 질량 1 적분식이다. 한 프레임을 네 번 나눠 계산한다.
function step(s: Spring, dt: number) {
  s.v += (-s.k * (s.x - s.t) - s.c * s.v) * dt;
  s.x += s.v * dt;
}

/** 마지막 프로필을 세 가지 고정 Q/A로 바꾸고, 로고와 이메일의 자리는 유지한다. */
export function FooterConversation({ children }: { children: ReactNode }) {
  const locale = usePortfolioLocale();
  const text = copy[locale];
  const stageRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLOListElement>(null);
  const questionRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const measureRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const thinkingRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[][]>([]);
  const elapsedRef = useRef(0);
  const startedRef = useRef(false);
  const [completed, setCompleted] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const stage = stageRef.current;
    const portrait = portraitRef.current;
    const thread = threadRef.current;
    if (!stage || !portrait || !thread) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hero = spring(1, 260, 30);
    const threadY = spring(0, 260, 30);
    let viewportHeight = 0;
    const turns = text.turns.map((_, i) => ({
      question: spring(0, 300, 22), answer: spring(0, 300, 22),
      width: spring(0, 260, 26), height: spring(40, 260, 26), thinking: spring(1, 300, 30),
      questionBottom: 0, answerTop: 0, fullWidth: 0, fullHeight: 40, thinkingWidth: 24, wordHeights: [] as number[], wordWidths: [] as number[],
      words: (wordRefs.current[i] || []).filter((el): el is HTMLSpanElement => Boolean(el)).map((el): Word => ({ el, spring: spring(0, 340, 26), on: false })),
    }));
    let frameId = 0;
    let last = 0;
    let visible = false;
    let disposed = false;
    let playing = false;
    let completionCount = -1;
    let announcedThinking = -1;
    let profileObserver: IntersectionObserver | null = null;
    let profileVisible = false;
    let lastScrollY = window.scrollY;

    // 줄바꿈 위치는 시작과 리사이즈 때만 읽고, 매 프레임에는 저장한 수치만 사용한다.
    function measure() {
      viewportHeight = stage!.clientHeight;
      turns.forEach((turn, i) => {
        turn.fullWidth = measureRefs.current[i]?.offsetWidth || stage!.clientWidth * 0.9;
        turn.fullHeight = measureRefs.current[i]?.offsetHeight || 40;
        turn.thinkingWidth = thinkingRefs.current[i]?.offsetWidth || 24;
        const question = questionRefs.current[i];
        turn.questionBottom = (question?.offsetTop || 0) + (question?.offsetHeight || 40);
        turn.answerTop = measureRefs.current[i]?.parentElement?.offsetTop || turn.questionBottom + 10;
        const paragraph = textRefs.current[i];
        if (paragraph) paragraph.style.width = `${Math.max(1, turn.fullWidth - 28)}px`;
      });
      turns.forEach(turn => {
        turn.wordHeights = turn.words.map(word => 9 + word.el.offsetTop + word.el.offsetHeight + 9);
        // 실제 줄의 오른쪽 끝을 저장해 문장마다, 스트리밍 진행마다 자연스럽게 폭이 달라진다.
        let right = 0;
        turn.wordWidths = turn.words.map(word => {
          right = Math.max(right, word.el.offsetLeft + word.el.offsetWidth);
          return right ? Math.min(turn.fullWidth, Math.ceil(right + 28)) : turn.fullWidth;
        });
        turn.fullWidth = turn.wordWidths.at(-1) || turn.fullWidth;
      });
    }

    function updateTargets(snap = false) {
      const elapsed = elapsedRef.current;
      hero.t = elapsed >= 1.1 ? 0 : 1;
      let count = 0;
      let latestBottom = 0;
      let thinkingIndex = -1;
      turns.forEach((turn, i) => {
        const age = elapsed - starts[i];
        turn.question.t = age >= 0.15 ? 1 : 0;
        turn.answer.t = age >= 0.75 ? 1 : 0;
        turn.thinking.t = age >= 2.1 ? 0 : 1;
        if (turn.answer.t > 0 && turn.thinking.t > 0) thinkingIndex = i;
        turn.width.t = age >= 2.1 ? turn.fullWidth : turn.thinkingWidth + 28;
        turn.height.t = 40;
        turn.words.forEach((word, j) => {
          word.on = age >= 2.1 + j * WORD_DELAY;
          word.spring.t = word.on ? 1 : 0;
          if (word.on) {
            turn.width.t = Math.max(turn.thinkingWidth + 28, turn.wordWidths[j]);
            turn.height.t = turn.wordHeights[j];
          }
        });
        if (age >= durations[i] - 0.3 || elapsed >= TOTAL_TIME) {
          count = i + 1;
          turn.width.t = turn.fullWidth;
          turn.height.t = turn.fullHeight;
        }
        if (turn.question.t > 0) latestBottom = turn.questionBottom;
        if (turn.answer.t > 0) latestBottom = turn.answerTop + turn.height.t;
        if (snap) [turn.question, turn.answer, turn.width, turn.height, turn.thinking, ...turn.words.map(word => word.spring)].forEach(s => { s.x = s.t; s.v = 0; });
      });
      // 마지막 메시지의 실측 끝을 하단에 맞춰 새 대화가 이전 대화를 위로 밀어 올린다.
      threadY.t = viewportHeight - 12 - latestBottom;
      if (snap) { hero.x = hero.t; hero.v = 0; threadY.x = threadY.t; threadY.v = 0; }
      if (count !== completionCount) {
        completionCount = count;
        setCompleted(count);
        setAnnouncement(count ? `${text.turns[count - 1][0]} ${text.turns[count - 1][1]}` : '');
      }
      // 장식용 점 대신 입력 상태를 한 번만 안내하고, 답변은 기존 완료 시점에 읽는다.
      if (thinkingIndex !== announcedThinking) {
        announcedThinking = thinkingIndex;
        if (thinkingIndex >= 0) setAnnouncement(text.typingLabel);
      }
    }

    function render() {
      thread!.style.transform = `translate3d(0, ${threadY.x}px, 0)`;
      portrait!.style.opacity = String(clamp(hero.x));
      portrait!.style.transform = `scale(${Math.max(0.08, 0.12 + 0.88 * hero.x)})`;
      turns.forEach((turn, i) => {
        const question = questionRefs.current[i];
        const bubble = bubbleRefs.current[i];
        const thinking = thinkingRefs.current[i];
        if (question) {
          question.style.opacity = String(clamp(turn.question.x));
          question.style.transform = `translateY(${(1 - turn.question.x) * 14}px) scale(${0.92 + 0.08 * turn.question.x})`;
        }
        if (bubble) {
          bubble.style.opacity = String(clamp(turn.answer.x));
          bubble.style.transform = `translateY(${(1 - turn.answer.x) * 14}px)`;
          bubble.style.width = `${Math.max(0, turn.width.x)}px`;
          bubble.style.height = `${Math.max(0, turn.height.x)}px`;
        }
        if (thinking) {
          thinking.style.opacity = String(clamp(turn.thinking.x));
          const active = String(playing && visible && !document.hidden && !media.matches && turn.answer.t > 0 && turn.thinking.t > 0);
          if (thinking.dataset.active !== active) thinking.dataset.active = active;
        }
        turn.words.forEach(word => {
          const value = clamp(word.spring.x, 0, 1.2);
          word.el.style.opacity = String(clamp(value));
          word.el.style.transform = `translateY(${(1 - word.spring.x) * 6}px)`;
          word.el.style.filter = value < 0.98 ? `blur(${(1 - clamp(value)) * 4}px)` : 'none';
        });
      });
    }

    function stop() {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      playing = false;
      // JS 타임라인과 CSS 점 애니메이션을 함께 멈추되 진행 시간은 보존한다.
      thinkingRefs.current.forEach(thinking => {
        if (thinking) thinking.dataset.active = 'false';
      });
    }
    function finish() {
      stop();
      profileObserver?.disconnect();
      elapsedRef.current = TOTAL_TIME;
      updateTargets(true);
      render();
    }
    function frame(now: number) {
      frameId = 0;
      if (disposed || !visible || document.hidden) { stop(); return; }
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0;
      last = now;
      elapsedRef.current = Math.min(TOTAL_TIME, elapsedRef.current + dt);
      updateTargets();
      for (let j = 0; j < 4; j++) {
        step(hero, dt / 4);
        step(threadY, dt / 4);
        turns.forEach(turn => [turn.question, turn.answer, turn.width, turn.height, turn.thinking, ...turn.words.map(word => word.spring)].forEach(s => step(s, dt / 4)));
      }
      render();
      if (elapsedRef.current >= TOTAL_TIME) finish();
      else frameId = requestAnimationFrame(frame);
    }
    function resume() {
      if (media.matches) { finish(); return; }
      if (!startedRef.current && profileVisible && visible && !document.hidden) {
        startedRef.current = true;
        profileObserver?.disconnect();
      }
      if (startedRef.current && visible && !document.hidden && !frameId && elapsedRef.current < TOTAL_TIME) {
        last = 0;
        playing = true;
        frameId = requestAnimationFrame(frame);
      }
    }
    const onVisibility = () => document.hidden ? stop() : resume();
    const onMotion = () => media.matches ? finish() : resume();
    // 첫 진입과 스크롤 복귀 모두 실제 캐릭터가 55% 보인 뒤 시작한다.
    function watchProfile() {
      profileObserver?.disconnect();
      profileVisible = false;
      if (typeof IntersectionObserver === 'undefined' || media.matches) return;
      const watcher = new IntersectionObserver(entries => {
        if (disposed || watcher !== profileObserver) return;
        const entry = entries[0];
        profileVisible = entry.isIntersecting && entry.intersectionRatio >= 0.55;
        resume();
      }, { threshold: [0, 0.55] });
      profileObserver = watcher;
      watcher.observe(portrait!.querySelector('.footer-profile') || portrait!);
    }

    // 시간과 모든 spring 속도를 함께 비워 다음 진입에 이전 단어가 남지 않는다.
    function resetForReturn() {
      if (media.matches) { finish(); return; }
      stop();
      last = 0;
      elapsedRef.current = 0;
      startedRef.current = false;
      completionCount = -1;
      announcedThinking = -1;
      updateTargets(true);
      render();
      watchProfile();
    }

    const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {
      const entry = entries[0];
      const wasVisible = visible;
      visible = entry.isIntersecting;
      if (visible) resume();
      else {
        stop();
        const viewportBottom = entry.rootBounds?.bottom ?? window.innerHeight;
        // 이메일 쪽으로 더 내려간 이탈은 일시 중지하고, 위로 벗어난 경우만 되돌린다.
        if (!document.hidden && wasVisible && (startedRef.current || elapsedRef.current > 0) &&
            entry.boundingClientRect.top >= viewportBottom) resetForReturn();
      }
    }, { threshold: [0] }) : null;

    function onScroll() {
      const y = window.scrollY;
      // 화면 밖의 footer 위로 한 번에 이동한 경우도 재진입을 준비한다.
      if (!document.hidden && !visible && y < lastScrollY && (startedRef.current || elapsedRef.current > 0)) resetForReturn();
      lastScrollY = y;
    }
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => {
      measure();
      updateTargets(elapsedRef.current >= TOTAL_TIME);
      render();
    }) : null;
    document.fonts?.ready.then(() => {
      if (disposed) return;
      measure();
      updateTargets(elapsedRef.current >= TOTAL_TIME);
      render();
    });
    measure();
    updateTargets(true);
    render();
    observer?.observe(stage);
    if (!startedRef.current) watchProfile();
    resize?.observe(stage);
    if (!observer) { visible = true; startedRef.current = true; resume(); }
    if (media.matches) finish();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    media.addEventListener('change', onMotion);
    return () => {
      disposed = true;
      stop();
      observer?.disconnect();
      profileObserver?.disconnect();
      resize?.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      media.removeEventListener('change', onMotion);
    };
  }, [locale, text]);

  return (
    <div className={styles.conversation} data-localized-skip aria-label={text.label}>
      <div className={styles.stage} ref={stageRef}>
        <div className={styles.portrait} ref={portraitRef} aria-hidden="true">{children}</div>
        {/* 고정 영역 안에서 대화만 위로 이동해 로고와 이메일은 제자리를 유지한다. */}
        <ol className={styles.thread} ref={threadRef} aria-hidden="true">
          {text.turns.map(([question, answer], i) => (
            <li className={styles.turn} key={i}>
              <p className={styles.question} ref={node => { questionRefs.current[i] = node; }}>{question}</p>
              <div className={styles.answerSlot}>
                <p className={styles.measure} ref={node => { measureRefs.current[i] = node; }}>
                  {splitWords(answer).map((word, j, list) => <span key={j}><span className={styles.measureWord}>{word}</span>{j < list.length - 1 ? ' ' : ''}</span>)}
                </p>
                <div className={styles.answer} ref={node => { bubbleRefs.current[i] = node; }}>
                  <span className={styles.thinking} ref={node => { thinkingRefs.current[i] = node; }} aria-hidden="true">
                    <span className={styles.thinkingDot} />
                    <span className={styles.thinkingDot} />
                    <span className={styles.thinkingDot} />
                  </span>
                  <p className={styles.answerText} ref={node => { textRefs.current[i] = node; }}>
                    {splitWords(answer).map((word, j, list) => <span key={j}><span className={styles.word} ref={node => { (wordRefs.current[i] ||= [])[j] = node; }}>{word}</span>{j < list.length - 1 ? ' ' : ''}</span>)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
      {/* 단어별 갱신 대신 입력 상태와 완성된 답변만 접근성 안내에 노출한다. */}
      <ol className={styles.srOnly} aria-label={text.label}>
        {text.turns.slice(0, completed).map(([question, answer], i) => <li key={i}><p>{question}</p><p>{answer}</p></li>)}
      </ol>
      <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </div>
  );
}
