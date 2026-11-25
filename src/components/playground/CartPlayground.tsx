'use client';

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  createCartState,
  deleteSelected,
  getCartGroups,
  getCartSummary,
  selectAll,
  selectGroup,
  toggleBenefit,
  undoDelete,
  updateQuantity,
  validateCart,
  type CartIssue,
  type CartState,
  type Scenario,
} from '@/lib/cart-playground';
import { usePortfolioLocale } from '@/lib/usePortfolioLocale';
import styles from './CartPlayground.module.css';

const copy = {
  ko: {
    introduction: '수급자 프로필에 따라 달라지는 품목별 구매 가능 수량과 지원금 잔액을 가상 상품·금액으로 체험합니다.',
    eyebrow: 'Cart Interaction',
    reset: '처음으로',
    presets: '장바구니 예시 선택',
    normal: '기본 흐름',
    budget: '지원금 부족',
    stock: '재고 변경',
    normalHint: '상품을 선택하고, 수량과 지원금 사용 여부를 바꿔 보세요.',
    budgetHint: '예시 잔액이 줄어든 상태입니다. 선택과 지원금 사용을 조정해 보세요.',
    stockHint: '담은 뒤 재고가 줄어든 상태입니다. 수량을 조정해 보세요.',
    balance: '예시 지원금 잔액',
    paymentRate: '예시 본인부담률',
    profileSelector: '예시 구매자 프로필 선택',
    profileTitle: '현재 예시 프로필',
    exampleNumber: '가상 인정번호',
    benefitPeriod: '급여 적용 기간',
    noPeriod: '해당 없음',
    allowances: '품목별 지원금 구매 가능 수량',
    category: '품목',
    availableCount: '구매 가능',
    benefitAvailableCount: '지원금 구매 가능',
    selectedBenefitCount: '선택 급여',
    selectedRegularCount: '일반 구매',
    overCount: '초과 수량',
    categoryNames: { walker: '보행기', bath: '목욕 의자', care: '일반케어용품' } as Record<string, string>,
    welfareSection: '복지용구 (급여·일반가)',
    careSection: '일반케어용품',
    benefitOn: '지원금 사용',
    benefitOff: '일반가 구매',
    generalOnly: '일반가로만 구매 가능',
    welfareBenefitPayable: '적용금액',
    welfareRegularAmount: '복지용구 일반가 금액',
    generalCareAmount: '일반케어 금액',
    benefitCalculation: '지원금은 적용 상품의 전체 가격에서 차감하고, 해당 결제액에는 예시 본인부담률을 적용합니다.',
    generalCalculation: '일반고객은 복지용구도 일반가로 계산하며, 지원금은 차감하지 않습니다.',
    normalProfileHint: '품목별 구매 가능 수량과 잔액을 확인하고, 지원금 사용을 직접 바꿔 보세요.',
    budgetProfileHint: '예시 잔액이 50,000원인 프로필입니다. 잔액을 넘긴 경우의 안내를 확인해 보세요.',
    quantityProfileHint: '보행기의 지원금 구매 가능 수량이 0개인 프로필입니다. 일반가 구매로 바꿀 수 있어요.',
    generalProfileHint: '수급자 정보가 없는 일반고객입니다. 복지용구와 일반케어용품 모두 일반가로 계산합니다.',
    availableAmount: '사용 가능 지원금',
    requestedAmount: '예상 차감액',
    overAmount: '초과 금액',
    alertConfirm: '확인',
    categoryIssue: '{category}의 지원금 구매 조건을 확인해 주세요.',
    categoryUnavailable: '{category}는 지원금 구매 가능 수량이 0개라 일반가로만 구매할 수 있어요.',
    stockDetail: '이 옵션의 예시 재고는 {stock}개예요. 수량과 재고를 확인해 주세요.',
    quantityDetail: '{category}는 {available}개까지 지원금으로 구매할 수 있어요. {selected}개를 선택해 {over}개 초과했어요.',
    selectAll: '전체 선택',
    selected: '선택',
    deleteSelected: '선택 삭제',
    items: '장바구니 상품',
    grouped: '옵션 {count}개 묶음',
    individual: '개별 선택',
    quantity: '수량',
    decrease: '수량 줄이기',
    increase: '수량 늘리기',
    unit: '개',
    stockLeft: '예시 재고 {count}개',
    benefit: '지원금 사용',
    deleted: '선택한 상품을 삭제했습니다.',
    undo: '되돌리기',
    emptyTitle: '장바구니가 비었어요',
    emptyDescription: '예시 상품을 다시 채우고 처음부터 체험할 수 있어요.',
    refill: '예시 다시 채우기',
    summary: '선택한 상품의 예시 금액',
    productAmount: '선택 상품금액',
    benefitAmount: '지원금 차감 (상품 전체 가격)',
    payableAmount: '예시 결제금액',
    remainingAmount: '차감 후 예시 잔액',
    order: '주문 조건 확인',
    noSelection: '상품을 선택하면 주문 조건을 확인할 수 있어요.',
    previewTitle: '주문서 미리보기',
    previewDescription: '주문 조건을 확인한 예시입니다. 선택한 옵션과 금액을 살펴보세요.',
    previewItems: '선택한 옵션',
    back: '장바구니로 돌아가기',
    restart: '예시 다시 시작',
    issues: {
      stock: '예시 재고를 초과할 수 없어요. 적용된 수량과 재고를 확인해 주세요.',
      quantity: '예시 구매 가능 수량을 초과했어요. 수량을 줄이거나 지원금 사용을 해제해 주세요.',
      budget: '예상 차감액이 지원금 잔액보다 커요. 상품 선택을 줄이거나 지원금 사용을 해제해 주세요.',
      eligibility: '지원금 적용 조건을 확인해 주세요. 적용 수량을 줄이거나 지원금 사용을 해제할 수 있어요.',
      empty: '주문 조건을 확인할 상품을 먼저 선택해 주세요.',
      profile: '현재 예시 프로필은 지원금 구매를 할 수 없어요. 지원금 사용을 해제해 일반가로 확인해 주세요.',
    },
  },
  en: {
    introduction: 'Try item-specific benefit allowances and remaining balances for different profiles, using fictional products and amounts.',
    eyebrow: 'Cart Interaction',
    reset: 'Reset',
    presets: 'Choose a cart example',
    normal: 'Standard',
    budget: 'Budget limit',
    stock: 'Stock change',
    normalHint: 'Select products, change quantities, or turn benefit use on and off.',
    budgetHint: 'The example balance is lower. Adjust your selection or benefit use.',
    stockHint: 'Stock has changed since the item was added. Adjust the quantity.',
    balance: 'Example benefit balance',
    paymentRate: 'Example copayment',
    profileSelector: 'Choose an example customer profile',
    profileTitle: 'Current example profile',
    exampleNumber: 'Fictional eligibility number',
    benefitPeriod: 'Benefit period',
    noPeriod: 'Not applicable',
    allowances: 'Benefit purchase allowance by item',
    category: 'Item',
    availableCount: 'Available',
    benefitAvailableCount: 'Benefit allowance',
    selectedBenefitCount: 'Selected with benefit',
    selectedRegularCount: 'Regular purchase',
    overCount: 'Over the allowance',
    categoryNames: { walker: 'Walkers', bath: 'Bath chairs', care: 'General care supplies' } as Record<string, string>,
    welfareSection: 'Assistive equipment (benefit / regular price)',
    careSection: 'General care supplies',
    benefitOn: 'Using benefit',
    benefitOff: 'Regular-price purchase',
    generalOnly: 'Regular-price purchase only',
    welfareBenefitPayable: 'Applied amount',
    welfareRegularAmount: 'Regular-price equipment',
    generalCareAmount: 'General care supplies',
    benefitCalculation: 'The full price of eligible items is deducted from the example balance. Their payment amount uses the example copayment rate.',
    generalCalculation: 'General customers pay the regular price for assistive equipment, with no benefit deduction.',
    normalProfileHint: 'Check each item’s allowance and the balance, then choose whether to use benefits.',
    budgetProfileHint: 'This profile has an example balance of ₩50,000. Try the balance-limit check.',
    quantityProfileHint: 'This profile has no walker allowance. You can switch it to a regular-price purchase.',
    generalProfileHint: 'A general customer without benefit eligibility. All assistive equipment and care supplies use regular prices.',
    availableAmount: 'Available benefit balance',
    requestedAmount: 'Expected deduction',
    overAmount: 'Amount over the balance',
    alertConfirm: 'OK',
    categoryIssue: 'Check the benefit conditions for {category}.',
    categoryUnavailable: 'The benefit allowance for {category} is 0. This item is available at the regular price only.',
    stockDetail: 'The example stock for this option is {stock}. Check the quantity and available stock.',
    quantityDetail: 'The benefit allowance for {category} is {available}. You selected {selected}, exceeding it by {over}.',
    selectAll: 'Select all',
    selected: 'Selected',
    deleteSelected: 'Remove selected',
    items: 'Cart products',
    grouped: '{count} grouped options',
    individual: 'Individual option',
    quantity: 'Quantity',
    decrease: 'Decrease quantity',
    increase: 'Increase quantity',
    unit: 'items',
    stockLeft: 'Example stock: {count}',
    benefit: 'Use benefit',
    deleted: 'Selected products removed.',
    undo: 'Undo',
    emptyTitle: 'Your example cart is empty',
    emptyDescription: 'Restore the example products to try the flow again.',
    refill: 'Restore example products',
    summary: 'Example totals for selected products',
    productAmount: 'Selected products',
    benefitAmount: 'Benefit deduction (full item price)',
    payableAmount: 'Example payment',
    remainingAmount: 'Example balance after deduction',
    order: 'Check order conditions',
    noSelection: 'Select a product to check the order conditions.',
    previewTitle: 'Order preview',
    previewDescription: 'The example passes the order checks. Review the selected options and totals.',
    previewItems: 'Selected options',
    back: 'Back to cart',
    restart: 'Try the example again',
    issues: {
      stock: 'The quantity cannot exceed the example stock. Check the applied quantity and available stock.',
      quantity: 'The quantity exceeds the example benefit allowance. Reduce it or turn off benefit use.',
      budget: 'The expected deduction exceeds the benefit balance. Select fewer products or turn off benefit use.',
      eligibility: 'Check the benefit conditions. Reduce the eligible quantity or turn off benefit use.',
      empty: 'Select a product before checking the order conditions.',
      profile: 'This example profile cannot use benefits. Turn off benefit use to check a regular-price purchase.',
    },
  },
};

type ProfileScenario = Exclude<Scenario, 'stock'>;
const profileScenarios: ProfileScenario[] = ['normal', 'budget', 'quantity', 'general'];
type Feedback = { kind: 'issue'; issue: CartIssue } | { kind: 'deleted' } | null;

// 네이티브 체크박스로 부분 선택·키보드 조작을 함께 지원합니다.
function SelectionCheckbox({
  id,
  label,
  checked,
  indeterminate = false,
  disabled = false,
  onChange,
  inputRef,
}: {
  id: string;
  label: string;
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate, ref]);
  return (
    <input
      ref={ref}
      className={styles.checkbox}
      id={id}
      type="checkbox"
      aria-label={label}
      aria-checked={indeterminate ? 'mixed' : checked}
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}

// 작은 단색 제품 표시는 실제 상품 이미지나 별도 에셋을 사용하지 않습니다.
function ProductDrawing({ kind }: { kind: 'walker' | 'care' | 'bath' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={styles.drawing}>
      {kind === 'walker' ? (
        <>
          <path d="M11 37 15 12q9-3 18 0l4 25M16 21h16M14 29h20M15 12l-3-3m21 3 3-3" />
          <circle cx="12" cy="39" r="3" /><circle cx="36" cy="39" r="3" />
        </>
      ) : kind === 'bath' ? (
        <>
          <path d="M13 9q10-2 21 0l-1 16H14L13 9Zm1 17h20M16 27l-3 12m18-12 3 12M17 17h13" />
          <path d="m11 40 5-1m16 0 5 1" />
        </>
      ) : (
        <>
          <path d="M12 11q12-3 24 0l1 27q-13 3-26 0l1-27ZM12 17h24M20 24h9m-9 5h9" />
          <path d="M17 8v5m14-5v5" />
        </>
      )}
    </svg>
  );
}

// 실제 서비스 API 없이, 옵션 ID와 카드 묶음·금액을 같은 로컬 상태에서 계산합니다.
export function CartPlayground({ embedded = false }: { embedded?: boolean }) {
  const locale = usePortfolioLocale();
  const text = copy[locale];
  const [activeProfile, setActiveProfile] = useState<ProfileScenario>('normal');
  // 프로필 전환은 각 장바구니의 선택·수량·구매 유형과 삭제 복구 내역을 보존합니다.
  const [profileCarts, setProfileCarts] = useState<Record<ProfileScenario, CartState>>(() => ({
    normal: createCartState('normal'),
    budget: createCartState('budget'),
    quantity: createCartState('quantity'),
    general: createCartState('general'),
  }));
  const cart = profileCarts[activeProfile];
  function setCart(next: CartState) {
    setProfileCarts((previous) => ({ ...previous, [activeProfile]: next }));
  }
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [preview, setPreview] = useState(false);
  const resetRef = useRef<HTMLButtonElement>(null);
  const allRef = useRef<HTMLInputElement>(null);
  const orderRef = useRef<HTMLButtonElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLHeadingElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const groups = getCartGroups(cart);
  const summary = getCartSummary(cart);
  const selectedIds = new Set(cart.selectedIds);
  const allSelected = cart.options.length > 0 && cart.options.every((option) => selectedIds.has(option.id));
  const partiallySelected = cart.selectedIds.length > 0 && !allSelected;
  const money = useMemo(() => new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    style: 'currency', currency: 'KRW', maximumFractionDigits: 0,
  }), [locale]);
  const formatMoney = (amount: number) => money.format(amount);
  const quantityId = (id: string) => `cart-demo-quantity-${id}`;
  const benefitId = (id: string) => `cart-demo-benefit-${id}`;
  const countUnit = (count: number) => locale === 'ko' ? '개' : count === 1 ? 'item' : 'items';
  const formatDate = (date: string) => date ? date.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1.$2.$3') : '—';
  const formatMessage = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
  const categoryName = (category: string) => text.categoryNames[category] ?? category;
  const selectedCategoryQuantity = (category: string, useBenefit: boolean) => cart.options
    .filter((option) => option.category === category && option.useBenefit === useBenefit && selectedIds.has(option.id))
    .reduce((count, option) => count + option.quantity, 0);
  // 지원금 OFF는 구매 유형만 바꿉니다. 복지용구의 원래 상품 분류는 그대로 둡니다.
  const productSections = [
    { id: 'welfare', title: text.welfareSection, groups: groups.filter((group) => group.kind !== 'care') },
    { id: 'care', title: text.careSection, groups: groups.filter((group) => group.kind === 'care') },
  ];

  // 삭제·복구·화면 전환 뒤에도 포커스가 사라지지 않도록 렌더 완료 후 복구합니다.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const element = target === 'reset' ? resetRef.current
      : target === 'all' ? allRef.current
        : target === 'order' ? orderRef.current
          : target === 'feedback' ? feedbackRef.current
            : target === 'preview' ? previewRef.current
              : document.getElementById(target);
    element?.focus({ preventScroll: true });
  }, [cart, preview, feedback]);

  function clearDraft(id: string) {
    setDrafts((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
  }

  function restart() {
    setCart(createCartState(activeProfile));
    setDrafts({});
    setFeedback(null);
    setPreview(false);
  }

  function switchProfile(scenario: ProfileScenario) {
    setActiveProfile(scenario);
    setDrafts({});
    setFeedback(null);
    setPreview(false);
    pendingFocus.current = null;
  }

  function changeQuantity(id: string, quantity: number, type: 'plus' | 'minus' | 'input') {
    const result = updateQuantity(cart, id, quantity, type);
    setCart(result.state);
    clearDraft(id);
    setFeedback(result.issue ? { kind: 'issue', issue: result.issue } : null);
    if (result.issue) pendingFocus.current = 'feedback';
  }

  function commitDraft(id: string) {
    if (!(id in drafts)) return;
    const value = drafts[id].trim();
    changeQuantity(id, value === '' ? 1 : Number(value), 'input');
  }

  function changeBenefit(id: string) {
    const result = toggleBenefit(cart, id);
    setCart(result.state);
    setFeedback(result.issue ? { kind: 'issue', issue: result.issue } : null);
    // 지원금 변경으로 카드가 다시 묶여도 같은 옵션으로 포커스를 돌립니다.
    pendingFocus.current = result.issue ? 'feedback' : benefitId(id);
  }

  function removeSelected() {
    const next = deleteSelected(cart);
    setCart(next);
    setDrafts({});
    setPreview(false);
    setFeedback({ kind: 'deleted' });
    pendingFocus.current = next.options.length ? 'all' : 'reset';
  }

  function undo() {
    setCart(undoDelete(cart));
    setDrafts({});
    setFeedback(null);
    setPreview(false);
    pendingFocus.current = 'all';
  }

  function checkOrder() {
    // 직접 입력한 수량을 확정한 뒤 화면과 같은 상태로 주문 조건을 검사합니다.
    let next = cart;
    let draftIssue: CartIssue | null = null;
    Object.entries(drafts).forEach(([id, value]) => {
      const result = updateQuantity(next, id, value.trim() === '' ? 1 : Number(value), 'input');
      next = result.state;
      draftIssue ??= result.issue;
    });
    const issue = draftIssue ?? validateCart(next);
    setCart(next);
    setDrafts({});
    if (issue) {
      setFeedback({ kind: 'issue', issue });
      pendingFocus.current = 'feedback';
    } else {
      setFeedback(null);
      setPreview(true);
      pendingFocus.current = 'preview';
    }
  }

  const issueOption = feedback?.kind === 'issue' && feedback.issue.optionId
    ? cart.options.find((option) => option.id === feedback.issue.optionId)
    : undefined;
  const scenarioHint = activeProfile === 'budget' ? text.budgetProfileHint
    : activeProfile === 'quantity' ? text.quantityProfileHint
      : activeProfile === 'general' ? text.generalProfileHint : text.normalProfileHint;

  function dismissIssue() {
    if (feedback?.kind !== 'issue') return;
    const issue = feedback.issue;
    const option = cart.options.find((item) => item.id === issue.optionId);
    pendingFocus.current = option && (issue.code === 'quantity' || issue.code === 'stock')
      ? quantityId(option.id)
      : option && selectedIds.has(option.id) && cart.profile.isBeneficiary
        ? benefitId(option.id) : 'order';
    // 확인은 안내만 닫습니다. 지원금 적용 여부는 사용자가 직접 변경합니다.
    setFeedback(null);
  }

  function IssueDetails({ issue }: { issue: CartIssue }) {
    const category = issue.category ?? issueOption?.category ?? '';
    const available = issue.availableCount ?? cart.profile.categoryLimits[category] ?? 0;
    const selected = issue.selectedCount ?? selectedCategoryQuantity(category, true);
    const over = issue.overCount ?? Math.max(0, selected - available);
    const title = issue.code === 'quantity'
      ? formatMessage(text.quantityDetail, { category: categoryName(category), available, selected, over })
      : issue.code === 'eligibility'
        ? formatMessage(available === 0 ? text.categoryUnavailable : text.categoryIssue, { category: categoryName(category) })
        : issue.code === 'stock' && issueOption
          ? formatMessage(text.stockDetail, { stock: issueOption.stock }) : text.issues[issue.code];
    return (
      <>
        <svg className={styles.alertDrawing} viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M15.4 3.5C22.7 3 28.7 8.6 28.5 16.1c.3 7-5.7 12.6-12.7 12.1C8.3 28.7 3 23 3.4 15.8 3 9.1 8.7 3 15.4 3.5Z" />
          <path d="m16.3 9-.6 9.2m.1 4.2.2.2" />
        </svg>
        <div className={styles.issueBody}>
          <p>{title}</p>
          {(issue.code === 'quantity' || issue.code === 'eligibility') && (
            <dl className={styles.issueDetails}>
              <div><dt>{text.availableCount}</dt><dd>{available} {countUnit(available)}</dd></div>
              <div><dt>{text.selectedBenefitCount}</dt><dd>{selected} {countUnit(selected)}</dd></div>
              <div><dt>{text.overCount}</dt><dd className={over > 0 ? styles.overValue : undefined}>{over} {countUnit(over)}</dd></div>
            </dl>
          )}
          {issue.code === 'budget' && (
            <dl className={styles.issueDetails}>
              <div><dt>{text.availableAmount}</dt><dd>{formatMoney(issue.availableAmount ?? cart.profile.availableAmount)}</dd></div>
              <div><dt>{text.requestedAmount}</dt><dd>{formatMoney(issue.benefitAmount ?? summary.benefitAmount)}</dd></div>
              <div><dt>{text.overAmount}</dt><dd className={styles.overValue}>{formatMoney(issue.overAmount ?? Math.max(0, summary.benefitAmount - cart.profile.availableAmount))}</dd></div>
            </dl>
          )}
          {(issue.code === 'quantity' || issue.code === 'eligibility') && <p>{text.issues.eligibility}</p>}
        </div>
        <button type="button" className={styles.textButton} onClick={dismissIssue}>{text.alertConfirm}</button>
      </>
    );
  }

  function Totals() {
    return (
      <>
      <dl className={styles.totals} aria-label={text.summary}>
        <div><dt>{text.productAmount}</dt><dd>{formatMoney(summary.productAmount)}</dd></div>
        <div><dt>{text.welfareBenefitPayable}</dt><dd>{formatMoney(summary.welfareBenefitPayable)}</dd></div>
        <div><dt>{text.welfareRegularAmount}</dt><dd>{formatMoney(summary.welfareRegularAmount)}</dd></div>
        <div><dt>{text.generalCareAmount}</dt><dd>{formatMoney(summary.generalCareAmount)}</dd></div>
        <div><dt>{text.benefitAmount}</dt><dd>{formatMoney(summary.benefitAmount)}</dd></div>
        <div className={styles.totalPayment}><dt>{text.payableAmount}</dt><dd>{formatMoney(summary.payableAmount)}</dd></div>
        <div className={styles.remaining}><dt>{text.remainingAmount}</dt><dd className={summary.remainingAmount < 0 ? styles.overValue : undefined}>{formatMoney(summary.remainingAmount)}</dd></div>
      </dl>
      <p className={styles.calculationNote}>{cart.profile.isBeneficiary ? text.benefitCalculation : text.generalCalculation}</p>
      </>
    );
  }

  const content = (
      <div className={styles.panel}>
        <div className={styles.panelHeading}>
          <span className={styles.eyebrow} lang="en">{text.eyebrow}</span>
          <button ref={resetRef} className={styles.textButton} type="button" onClick={() => { restart(); pendingFocus.current = 'reset'; }}>
            {text.reset}
          </button>
        </div>
        <div className={styles.presets} role="group" aria-label={text.profileSelector}>
          {profileScenarios.map((scenario) => (
            <button key={scenario} type="button" aria-pressed={activeProfile === scenario} onClick={() => switchProfile(scenario)}>
              {profileCarts[scenario].profile.name[locale]}
            </button>
          ))}
        </div>
        <p className={styles.scenarioHint}>{scenarioHint}</p>
        <section className={styles.profileCard} aria-label={text.profileTitle}>
          <div className={styles.profileHeading}><h4>{cart.profile.name[locale]}</h4><span>{cart.profile.grade[locale]}</span></div>
          <dl className={styles.profile}>
            <div><dt>{text.exampleNumber}</dt><dd>{cart.profile.ltcNumber || '—'}</dd></div>
            <div><dt>{text.benefitPeriod}</dt><dd>{cart.profile.applyStartDate ? `${formatDate(cart.profile.applyStartDate)}–${formatDate(cart.profile.applyEndDate)}` : text.noPeriod}</dd></div>
            <div><dt>{text.paymentRate}</dt><dd>{cart.profile.paymentRate}%</dd></div>
            <div><dt>{text.balance}</dt><dd>{formatMoney(cart.profile.availableAmount)}</dd></div>
          </dl>
          <table className={styles.allowanceTable}>
            <caption>{text.allowances}</caption>
            <thead><tr><th scope="col">{text.category}</th><th scope="col">{text.availableCount}</th></tr></thead>
            <tbody>{Object.entries(cart.profile.categoryLimits).map(([category, count]) => (
              <tr key={category}><th scope="row">{categoryName(category)}</th><td>{count} {countUnit(count)}</td></tr>
            ))}</tbody>
          </table>
        </section>

        <div className={styles.feedback} ref={feedbackRef} id="cart-demo-feedback" role="status" aria-live="polite" aria-atomic="true" tabIndex={-1} data-kind={feedback?.kind} hidden={!feedback}>
          {feedback?.kind === 'issue' ? <IssueDetails issue={feedback.issue} /> : feedback?.kind === 'deleted' ? <p>{text.deleted}</p> : null}
        </div>
        {cart.undo && (
          <div className={styles.recovery}>
            <button type="button" className={styles.textButton} onClick={undo}><span aria-hidden="true">↶</span> {text.undo}</button>
          </div>
        )}

        {preview ? (
          <div className={styles.preview}>
            <h3 ref={previewRef} tabIndex={-1}>{text.previewTitle}</h3>
            <p className={styles.previewDescription}>{text.previewDescription}</p>
            <ul className={styles.previewList} aria-label={text.previewItems}>
              {cart.options.filter((option) => selectedIds.has(option.id)).map((option) => (
                <li key={option.id}>
                  <span>{option.name[locale]}<small>{option.optionLabel[locale]} · {option.quantity} {countUnit(option.quantity)}{option.eligible && ` · ${option.useBenefit ? text.benefitOn : text.benefitOff}`}</small></span>
                  <span>{formatMoney(option.unitPrice * option.quantity)}</span>
                </li>
              ))}
            </ul>
            <Totals />
            <div className={styles.previewActions}>
              <button type="button" className={styles.primaryButton} onClick={() => { setPreview(false); pendingFocus.current = 'order'; }}>{text.back}</button>
              <button type="button" className={styles.textButton} onClick={() => { restart(); pendingFocus.current = 'all'; }}>{text.restart}</button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.toolbar}>
              <label className={styles.selectAll} htmlFor="cart-demo-select-all">
                <SelectionCheckbox id="cart-demo-select-all" label={text.selectAll} checked={allSelected} indeterminate={partiallySelected} disabled={!cart.options.length} inputRef={allRef} onChange={(checked) => { setCart(selectAll(cart, checked)); setFeedback(null); }} />
                <span>{text.selectAll} <small>({summary.selectedCardCount}/{summary.cardCount})</small></span>
              </label>
              <button className={styles.textButton} type="button" disabled={summary.selectedOptionCount === 0} onClick={removeSelected}>{text.deleteSelected}</button>
            </div>
            {cart.options.length ? (
              <div className={styles.productSections}>
              {productSections.filter((section) => section.groups.length > 0).map((section) => (
                <section className={styles.productSection} key={section.id} aria-labelledby={`cart-demo-${section.id}-title`}>
                  <h4 id={`cart-demo-${section.id}-title`}>{section.title}</h4>
                  <ul className={styles.cartList} aria-label={section.title}>
                {section.groups.map((group) => (
                  <li className={styles.productGroup} key={group.id}>
                    <div className={styles.productHeading}>
                      <SelectionCheckbox id={`cart-demo-group-${group.id}`} label={group.name[locale]} checked={group.selected} indeterminate={group.indeterminate} onChange={(checked) => { setCart(selectGroup(cart, group.id, checked)); setFeedback(null); }} />
                      <ProductDrawing kind={group.kind} />
                      <label htmlFor={`cart-demo-group-${group.id}`} className={styles.productName}>
                        {group.name[locale]}
                        <small>{group.options.length > 1 ? text.grouped.replace('{count}', String(group.options.length)) : text.individual}</small>
                        {group.kind !== 'care' && <span className={styles.purchaseBadge} data-benefit={group.options.some((option) => option.useBenefit)}>{group.options.some((option) => option.useBenefit) ? text.benefitOn : text.benefitOff}</span>}
                      </label>
                    </div>
                    {group.kind !== 'care' && (
                      <div className={styles.allowanceSummary}>
                        <dl>
                          <div><dt>{text.benefitAvailableCount}</dt><dd>{cart.profile.categoryLimits[group.options[0].category] ?? 0} {countUnit(cart.profile.categoryLimits[group.options[0].category] ?? 0)}</dd></div>
                          <div><dt>{text.selectedBenefitCount}</dt><dd>{selectedCategoryQuantity(group.options[0].category, true)} {countUnit(selectedCategoryQuantity(group.options[0].category, true))}</dd></div>
                          <div><dt>{text.selectedRegularCount}</dt><dd>{selectedCategoryQuantity(group.options[0].category, false)} {countUnit(selectedCategoryQuantity(group.options[0].category, false))}</dd></div>
                        </dl>
                        {(cart.profile.categoryLimits[group.options[0].category] ?? 0) === 0 && <p>{text.generalOnly}</p>}
                      </div>
                    )}
                    <div className={styles.options}>
                      {group.options.map((option) => {
                        const optionName = `${option.name[locale]} ${option.optionLabel[locale]}`;
                        const isError = feedback?.kind === 'issue' && feedback.issue.optionId === option.id &&
                          (feedback.issue.code === 'stock' || feedback.issue.code === 'quantity');
                        return (
                          <div className={styles.option} key={option.id} data-error={isError || undefined}>
                            <div className={styles.optionMain}>
                              <div className={styles.optionLabel}><span>{option.optionLabel[locale]}</span><small>{formatMoney(option.unitPrice)}</small></div>
                              <div className={styles.quantityControl}>
                                <button type="button" disabled={option.quantity <= 1} aria-label={`${optionName}: ${text.decrease}`} onClick={() => changeQuantity(option.id, option.quantity - 1, 'minus')}>−</button>
                                <input
                                  id={quantityId(option.id)}
                                  type="number"
                                  inputMode="numeric"
                                  min={1}
                                  step={1}
                                  aria-label={`${optionName}: ${text.quantity}`}
                                  aria-invalid={isError || undefined}
                                  aria-describedby={isError ? 'cart-demo-feedback' : undefined}
                                  value={drafts[option.id] ?? String(option.quantity)}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    setDrafts((previous) => ({ ...previous, [option.id]: value }));
                                  }}
                                  onBlur={() => commitDraft(option.id)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
                                    if (event.key === 'Escape') { clearDraft(option.id); setFeedback(null); }
                                  }}
                                />
                                <button type="button" aria-label={`${optionName}: ${text.increase}`} onClick={() => changeQuantity(option.id, option.quantity + 1, 'plus')}>+</button>
                              </div>
                            </div>
                            <div className={styles.optionMeta}>
                              {option.eligible && (
                                <label className={styles.benefitToggle} htmlFor={benefitId(option.id)}>
                                  <input className={styles.checkbox} id={benefitId(option.id)} type="checkbox" aria-label={`${optionName}: ${text.benefit}`} checked={option.useBenefit} disabled={!group.selected || !cart.profile.isBeneficiary || cart.profile.facilityAdmitted} onChange={() => changeBenefit(option.id)} />
                                  <span>{text.benefit}</span>
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </li>
                ))}
                  </ul>
                </section>
              ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <h3>{text.emptyTitle}</h3>
                <p>{text.emptyDescription}</p>
                <button type="button" className={styles.secondaryButton} onClick={() => { restart(); pendingFocus.current = 'all'; }}>{text.refill}</button>
              </div>
            )}
            <Totals />
            <button ref={orderRef} className={styles.primaryButton} type="button" disabled={summary.selectedOptionCount === 0} onClick={checkOrder}>{text.order}</button>
            {summary.selectedOptionCount === 0 && <p className={styles.orderHint}>{text.noSelection}</p>}
          </>
        )}
      </div>
  );

  if (embedded) return <div data-localized-skip>{content}</div>;
  return (
    <section id="ui-playground" className="site-section content-width" data-localized-skip aria-labelledby="ui-playground-title">
      <header className="section-header">
        <h2 id="ui-playground-title" className="section-title">UI Playground</h2>
        <p className={styles.introduction}>{text.introduction}</p>
      </header>
      {content}
    </section>
  );
}
