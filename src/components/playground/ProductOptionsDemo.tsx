'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePortfolioLocale } from '@/lib/usePortfolioLocale';
import styles from './ProductOptionsDemo.module.css';

type Localized = { ko: string; en: string };
type Variant = { id: string; type: string; color: Localized; price: number; stock: number; existing: number };
type Selection = { id: string; quantity: number };
type Feedback = { kind: 'added' | 'merged' | 'stock' | 'clamped' | 'removed' | 'restored' | 'unavailable'; id: string } | null;
const productTypes = [
  { id: 'standard', label: { ko: '기본형', en: 'Standard' } },
  { id: 'light', label: { ko: '경량형', en: 'Lightweight' } },
];
// 상품·옵션 가격·재고·기존 장바구니 수량은 모두 고정된 체험용 가상 데이터입니다.
const variants: Variant[] = [
  { id: 'standard-gray', type: 'standard', color: { ko: '그레이', en: 'Gray' }, price: 60000, stock: 5, existing: 2 },
  { id: 'standard-beige', type: 'standard', color: { ko: '베이지', en: 'Beige' }, price: 62000, stock: 3, existing: 1 },
  { id: 'light-black', type: 'light', color: { ko: '블랙', en: 'Black' }, price: 75000, stock: 2, existing: 1 },
  { id: 'light-white', type: 'light', color: { ko: '화이트', en: 'White' }, price: 78000, stock: 0, existing: 0 },
];
const findVariant = (id: string) => variants.find((variant) => variant.id === id)!;
const maximum = (variant: Variant) => Math.max(0, variant.stock - variant.existing);
const copy = {
  ko: {
    description: '제품 유형과 색상을 조합해 여러 옵션을 골라 보세요. 같은 조합은 수량으로 합치고, 기존 장바구니 수량까지 포함해 재고를 확인합니다.',
    fictional: '가격·재고·기존 담긴 수량은 고정된 가상 예시입니다. 이 체험은 아래 선택 목록만 변경합니다.',
    reset: '처음으로', productName: '예시 보행기', type: '제품 유형', color: '색상', chooseType: '유형을 선택하세요', chooseColor: '색상을 선택하세요', chooseTypeFirst: '유형을 먼저 선택하세요',
    price: '옵션 가격', stock: '예시 재고', existing: '기존 장바구니', available: '이번 선택 가능', remaining: '더 선택 가능', soldOut: '품절', add: '선택 목록에 추가',
    selected: '선택한 옵션', empty: '조합을 골라 추가하면 옵션별로 목록에 쌓여요.', quantity: '수량', decrease: '수량 줄이기', increase: '수량 늘리기', remove: '삭제', undo: '삭제 되돌리기',
    total: '선택 금액', count: '옵션 {count}종', confirm: '선택 내용 확인', review: '선택 내역', reviewDescription: '선택한 옵션과 수량을 확인했습니다. 수정하면 같은 목록으로 돌아갑니다.', edit: '선택 수정하기',
    added: '{option}을 선택 목록에 추가했어요.', merged: '{option}은 이미 있어 수량을 {quantity}개로 합쳤어요.',
    stockMessage: '예시 재고 {stock}개 중 기존 장바구니에 {existing}개가 있어, 이번에는 최대 {maximum}개까지 선택할 수 있어요. 현재 선택은 {quantity}개로 유지했어요.',
    clamped: '이번 선택 가능 수량 안에서 {quantity}개로 조정했어요.', removed: '{option}을 목록에서 삭제했어요.', restored: '{option}을 복구했어요.', unavailable: '이 조합은 예시 재고가 없어 추가할 수 없어요.',
  },
  en: {
    description: 'Build several type-and-color combinations. Repeated options merge into one quantity, and stock checks include items already in the example cart.',
    fictional: 'Prices, stock, and existing cart quantities are fixed fictional examples. This demo changes only the selection list below.',
    reset: 'Reset', productName: 'Example Walker', type: 'Product type', color: 'Color', chooseType: 'Choose a type', chooseColor: 'Choose a color', chooseTypeFirst: 'Choose a type first',
    price: 'Option price', stock: 'Example stock', existing: 'Already in cart', available: 'Can select now', remaining: 'Can add more', soldOut: 'Sold out', add: 'Add to selection',
    selected: 'Selected options', empty: 'Choose and add a combination to build your selection list.', quantity: 'Quantity', decrease: 'Decrease quantity', increase: 'Increase quantity', remove: 'Remove', undo: 'Undo removal',
    total: 'Selected total', count: '{count} option types', confirm: 'Review selection', review: 'Selection review', reviewDescription: 'Your selected options and quantities are shown below. Return to edit the same list.', edit: 'Edit selection',
    added: '{option} added to your selection.', merged: '{option} was already selected. Its quantity is now {quantity}.',
    stockMessage: 'Example stock is {stock}, with {existing} already in the cart. You can select up to {maximum} more. Your current quantity remains {quantity}.',
    clamped: 'Quantity adjusted to {quantity} within the amount available to select.', removed: '{option} removed from your selection.', restored: '{option} restored.', unavailable: 'This combination has no example stock and cannot be added.',
  },
};

// 종속 선택·여러 조합·중복 병합·기존 담긴 수량의 재고 검증을 API 없이 체험합니다.
export function ProductOptionsDemo() {
  const locale = usePortfolioLocale();
  const text = copy[locale];
  const [type, setType] = useState('');
  const [variantId, setVariantId] = useState('');
  const [selections, setSelections] = useState<Selection[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [undo, setUndo] = useState<{ row: Selection; index: number } | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const resetRef = useRef<HTMLButtonElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const reviewRef = useRef<HTMLHeadingElement>(null);
  const pendingFocus = useRef<'type' | 'reset' | 'confirm' | 'review' | null>(null);
  const variant = variantId ? findVariant(variantId) : undefined;
  const formatter = useMemo(() => new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }), [locale]);
  const money = (value: number) => formatter.format(value);
  const unit = (value: number) => locale === 'ko' ? '개' : value === 1 ? 'item' : 'items';
  const label = (option: Variant) => `${productTypes.find((item) => item.id === option.type)!.label[locale]} / ${option.color[locale]}`;
  const fill = (template: string, values: Record<string, string | number>) => Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
  const total = selections.reduce((amount, row) => amount + findVariant(row.id).price * row.quantity, 0);
  const selectedQuantity = (id: string) => selections.find((row) => row.id === id)?.quantity ?? 0;
  const failed = feedback?.kind === 'stock' || feedback?.kind === 'unavailable';

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    ({ type: typeRef.current, reset: resetRef.current, confirm: confirmRef.current, review: reviewRef.current })[target]?.focus({ preventScroll: true });
  }, [selections, reviewing, feedback]);

  function reset() {
    setType(''); setVariantId(''); setSelections([]); setDrafts({}); setFeedback(null); setUndo(null); setReviewing(false);
    pendingFocus.current = 'reset';
  }
  function add() {
    if (!variant) return;
    const current = selectedQuantity(variant.id);
    if (current + 1 > maximum(variant)) { setFeedback({ kind: variant.stock === 0 ? 'unavailable' : 'stock', id: variant.id }); return; }
    setSelections((previous) => current ? previous.map((row) => row.id === variant.id ? { ...row, quantity: row.quantity + 1 } : row) : [...previous, { id: variant.id, quantity: 1 }]);
    setFeedback({ kind: current ? 'merged' : 'added', id: variant.id });
    if (undo?.row.id === variant.id) setUndo(null);
  }
  function clearDraft(id: string) {
    setDrafts((previous) => { const next = { ...previous }; delete next[id]; return next; });
  }
  function update(id: string, requested: number, kind: 'plus' | 'minus' | 'input') {
    const option = findVariant(id);
    const limit = maximum(option);
    if (kind === 'plus' && requested > limit) { setFeedback({ kind: 'stock', id }); return; }
    const quantity = Math.min(limit, Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 1));
    setSelections((previous) => previous.map((row) => row.id === id ? { ...row, quantity } : row));
    clearDraft(id);
    setFeedback(kind === 'input' && quantity !== requested ? { kind: 'clamped', id } : null);
  }
  function commit(id: string) {
    if (!(id in drafts)) return;
    update(id, drafts[id].trim() === '' ? 1 : Number(drafts[id]), 'input');
  }
  function remove(id: string) {
    const index = selections.findIndex((row) => row.id === id);
    setUndo({ row: selections[index], index });
    setSelections((previous) => previous.filter((row) => row.id !== id));
    clearDraft(id); setFeedback({ kind: 'removed', id }); pendingFocus.current = 'type';
  }
  function restore() {
    if (!undo) return;
    setSelections((previous) => { const next = [...previous]; if (!next.some((row) => row.id === undo.row.id)) next.splice(Math.min(undo.index, next.length), 0, undo.row); return next; });
    setFeedback({ kind: 'restored', id: undo.row.id }); setUndo(null); pendingFocus.current = 'type';
  }
  function review() {
    setSelections((previous) => previous.map((row) => row.id in drafts ? { ...row, quantity: Math.min(maximum(findVariant(row.id)), Math.max(1, Math.floor(Number(drafts[row.id]) || 1))) } : row));
    setDrafts({}); setFeedback(null); setReviewing(true); pendingFocus.current = 'review';
  }

  let feedbackText = '';
  if (feedback) {
    const option = findVariant(feedback.id);
    const template = feedback.kind === 'stock' ? text.stockMessage : text[feedback.kind];
    feedbackText = fill(template, { option: label(option), quantity: selectedQuantity(option.id), stock: option.stock, existing: option.existing, maximum: maximum(option) });
  }

  return (
    <div className={styles.demo} data-localized-skip>
      <header className={styles.heading}><h3 lang="en">Product Options</h3><button ref={resetRef} type="button" className={styles.textButton} onClick={reset}>{text.reset}</button></header>
      <p className={styles.description}>{text.description}</p>
      <p className={styles.fictional}>{text.fictional}</p>

      {reviewing ? (
        <div className={styles.review}>
          <h4 ref={reviewRef} tabIndex={-1}>{text.review}</h4>
          <p>{text.reviewDescription}</p>
          <ul className={styles.reviewList}>{selections.map((row) => <li key={row.id}><span>{label(findVariant(row.id))}<small>{row.quantity} {unit(row.quantity)}</small></span><span>{money(findVariant(row.id).price * row.quantity)}</span></li>)}</ul>
          <div className={styles.total}><span>{text.total}</span><span>{money(total)}</span></div>
          <button type="button" className={styles.primaryButton} onClick={() => { setReviewing(false); pendingFocus.current = 'confirm'; }}>{text.edit}</button>
        </div>
      ) : (
        <>
          <div className={styles.productHeading}>
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={styles.drawing}><path d="M11 37 15 12q9-3 18 0l4 25M16 21h16M14 29h20M15 12l-3-3m21 3 3-3" /><circle cx="12" cy="39" r="3" /><circle cx="36" cy="39" r="3" /></svg>
            <span>{text.productName}</span>
          </div>
          <div className={styles.builder}>
            <label>{text.type}<select ref={typeRef} value={type} onChange={(event) => { setType(event.target.value); setVariantId(''); setFeedback(null); }}><option value="">{text.chooseType}</option>{productTypes.map((item) => <option key={item.id} value={item.id}>{item.label[locale]}</option>)}</select></label>
            <label>{text.color}<select value={variantId} disabled={!type} onChange={(event) => { const id = event.target.value; setVariantId(id); setFeedback(id && maximum(findVariant(id)) === 0 ? { kind: 'unavailable', id } : null); }}><option value="">{type ? text.chooseColor : text.chooseTypeFirst}</option>{variants.filter((item) => item.type === type).map((item) => <option key={item.id} value={item.id}>{item.color[locale]}{item.stock === 0 ? ` · ${text.soldOut}` : ''}</option>)}</select></label>
          </div>
          {variant && (
            <div className={styles.availability}>
              <div className={styles.price}><span>{text.price}</span><span>{money(variant.price)}</span></div>
              <dl><div><dt>{text.stock}</dt><dd>{variant.stock}</dd></div><div><dt>{text.existing}</dt><dd>{variant.existing}</dd></div><div><dt>{text.available}</dt><dd>{maximum(variant)}</dd></div></dl>
              <p>{text.remaining}: {Math.max(0, maximum(variant) - selectedQuantity(variant.id))} {unit(Math.max(0, maximum(variant) - selectedQuantity(variant.id)))}</p>
            </div>
          )}
          <button className={styles.addButton} type="button" disabled={!variant || maximum(variant) === 0} onClick={add}>{text.add}</button>

          <div className={styles.feedback} role="status" aria-live="polite" aria-atomic="true" data-error={failed || undefined} hidden={!feedback}>
            {failed && <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M15.4 3.5C22.7 3 28.7 8.6 28.5 16.1c.3 7-5.7 12.6-12.7 12.1C8.3 28.7 3 23 3.4 15.8 3 9.1 8.7 3 15.4 3.5Z" /><path d="m16.3 9-.6 9.2m.1 4.2.2.2" /></svg>}
            <p>{feedbackText}</p>
          </div>
          <div className={styles.listHeading}><h4>{text.selected}</h4><span>{fill(text.count, { count: selections.length })}</span>{undo && <button type="button" className={styles.textButton} onClick={restore}>{text.undo}</button>}</div>
          {selections.length ? (
            <ul className={styles.rows} aria-label={text.selected}>
              {selections.map((row) => { const option = findVariant(row.id); const name = label(option); return (
                <li key={row.id}>
                  <div className={styles.rowHeading}><span>{name}</span><button type="button" className={styles.textButton} aria-label={`${name}: ${text.remove}`} onClick={() => remove(row.id)}>{text.remove}</button></div>
                  <p className={styles.rowStock}>{text.stock} {option.stock} · {text.existing} {option.existing} · {text.available} {maximum(option)}</p>
                  <div className={styles.rowBottom}>
                    <div className={styles.quantityControl}>
                      <button type="button" disabled={row.quantity <= 1} aria-label={`${name}: ${text.decrease}`} onClick={() => update(row.id, row.quantity - 1, 'minus')}>−</button>
                      <input type="number" inputMode="numeric" min={1} step={1} aria-label={`${name}: ${text.quantity}`} value={drafts[row.id] ?? row.quantity} onChange={(event) => { const value = event.target.value; setDrafts((previous) => ({ ...previous, [row.id]: value })); setFeedback(null); }} onBlur={() => commit(row.id)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); } if (event.key === 'Escape') { clearDraft(row.id); setFeedback(null); } }} />
                      <button type="button" aria-label={`${name}: ${text.increase}`} onClick={() => update(row.id, row.quantity + 1, 'plus')}>+</button>
                    </div>
                    <span>{money(option.price * row.quantity)}</span>
                  </div>
                </li>
              ); })}
            </ul>
          ) : <p className={styles.empty}>{text.empty}</p>}
          <div className={styles.total}><span>{text.total}</span><span>{money(total)}</span></div>
          <button ref={confirmRef} type="button" className={styles.primaryButton} disabled={!selections.length} onClick={review}>{text.confirm}</button>
        </>
      )}
    </div>
  );
}
