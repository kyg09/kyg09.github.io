'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePortfolioLocale } from '@/lib/usePortfolioLocale';
import styles from './FilterDemo.module.css';

type Filter = 'panorama' | 'consultation' | 'therapy';
const filters: Filter[] = ['panorama', 'consultation', 'therapy'];
// 실제 시설 정보가 아닌 조건 비교용 예시 목록이다.
const facilities = [
  { id: 'A', tags: ['panorama', 'consultation'] },
  { id: 'B', tags: ['consultation', 'therapy'] },
  { id: 'C', tags: ['panorama', 'therapy'] },
  { id: 'D', tags: [] },
];
const copy = {
  ko: {
    title: 'Facility Filters', description: '조건을 선택하고 적용하거나 취소해 보세요. 네 곳의 가상 시설로 동작합니다.',
    open: '필터 열기', close: '편집 취소', reset: '처음으로', edit: '검색 조건', legend: '원하는 조건을 선택하세요',
    panorama: '파노라마', consultation: '온라인 상담', therapy: '물리·작업치료',
    selectReset: '선택 초기화', cancel: '취소', apply: '결과 적용',
    draft: '선택 중인 조건의 결과', count: '개', current: '적용된 조건', all: '전체 시설',
    results: '가상 시설 검색 결과', facility: '예시 시설', sort: '정렬', asc: '이름순', desc: '이름 역순',
    empty: '조건에 맞는 시설이 없어요. 선택한 조건을 줄여 보세요.',
    plain: '등록된 예시 조건 없음', explanation: '모든 선택 조건을 만족하는 예시만 표시합니다.',
  },
  en: {
    title: 'Facility Filters', description: 'Choose conditions, then apply or cancel. This demo uses four fictional facilities.',
    open: 'Open filters', close: 'Cancel editing', reset: 'Reset', edit: 'Search conditions', legend: 'Choose your conditions',
    panorama: 'Panorama', consultation: 'Online consultation', therapy: 'Physical / occupational therapy',
    selectReset: 'Clear selection', cancel: 'Cancel', apply: 'Apply results',
    draft: 'Matches for the current selection', count: 'matches', current: 'Applied conditions', all: 'All facilities',
    results: 'Example facility search results', facility: 'Example facility', sort: 'Sort', asc: 'Name A–Z', desc: 'Name Z–A',
    empty: 'No examples match. Try selecting fewer conditions.',
    plain: 'No example features listed', explanation: 'Examples must match every selected condition.',
  },
} as const;

// 적용한 조건과 편집 중인 조건을 분리해 취소 시 기존 결과를 유지한다.
export function FilterDemo() {
  const locale = usePortfolioLocale();
  const text = copy[locale];
  const [applied, setApplied] = useState<Filter[]>([]);
  const [draft, setDraft] = useState<Filter[]>([]);
  const [editing, setEditing] = useState(false);
  const [sort, setSort] = useState('asc');
  const openRef = useRef<HTMLButtonElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const pendingFocus = useRef(false);
  const matching = (selection: Filter[]) => facilities.filter((item) => selection.every((filter) => item.tags.includes(filter)));
  const results = useMemo(() => {
    const items = matching(applied);
    return sort === 'desc' ? [...items].reverse() : items;
  }, [applied, sort]);
  const draftCount = matching(draft).length;

  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    (editing ? firstRef.current : openRef.current)?.focus({ preventScroll: true });
  }, [editing]);

  function close(apply: boolean) {
    if (apply) setApplied([...draft]);
    else setDraft([...applied]);
    pendingFocus.current = true;
    setEditing(false);
  }

  return (
    <div className={styles.panel} data-localized-skip>
      <div className={styles.heading}>
        <h3 lang="en">{text.title}</h3>
        <button type="button" onClick={() => { setApplied([]); setDraft([]); setSort('asc'); if (editing) { pendingFocus.current = true; setEditing(false); } }}>{text.reset}</button>
      </div>
      <p className={styles.description}>{text.description}</p>
      <div className={styles.controls}>
        <button ref={openRef} type="button" className={styles.outline} aria-expanded={editing} aria-controls="filter-demo-editor" onClick={() => { if (editing) close(false); else { setDraft([...applied]); pendingFocus.current = true; setEditing(true); } }}>{editing ? text.close : text.open}</button>
        <label>{text.sort}<select aria-label={text.sort} value={sort} onChange={(event) => setSort(event.target.value)}><option value="asc">{text.asc}</option><option value="desc">{text.desc}</option></select></label>
      </div>
      {editing && (
        <div className={styles.editor} id="filter-demo-editor" role="region" aria-label={text.edit} onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); close(false); } }}>
          <fieldset>
            <legend>{text.legend}</legend>
            {filters.map((filter, index) => (
              <label key={filter}><input ref={index === 0 ? firstRef : undefined} type="checkbox" checked={draft.includes(filter)} onChange={(event) => setDraft((previous) => event.target.checked ? [...previous, filter] : previous.filter((value) => value !== filter))} />{text[filter]}</label>
            ))}
          </fieldset>
          <p className={styles.draftCount} role="status">{text.draft}: {draftCount} {text.count}</p>
          {draftCount === 0 && <p className={styles.empty}>{text.empty}</p>}
          <div className={styles.actions}>
            <button type="button" onClick={() => setDraft([])}>{text.selectReset}</button>
            <button type="button" onClick={() => close(false)}>{text.cancel}</button>
            <button type="button" className={styles.primary} disabled={draftCount === 0} onClick={() => close(true)}>{text.apply}</button>
          </div>
        </div>
      )}
      <p className={styles.applied}>{text.current}: {applied.length ? applied.map((filter) => text[filter]).join(' · ') : text.all}</p>
      <div className={styles.resultHeading}><span>{text.results}</span><strong aria-live="polite">{results.length} {text.count}</strong></div>
      <ul className={styles.results} aria-label={text.results}>
        {results.map((item) => <li key={item.id}><span className={styles.facilityMark} aria-hidden="true">⌂</span><div><h4>{text.facility} {item.id}</h4><p>{item.tags.length ? item.tags.map((filter) => text[filter as Filter]).join(' · ') : text.plain}</p></div></li>)}
      </ul>
      <p className={styles.footnote}>{text.explanation}</p>
    </div>
  );
}
