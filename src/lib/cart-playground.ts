export type Scenario = 'normal' | 'budget' | 'quantity' | 'general' | 'stock';
export type Locale = 'ko' | 'en';
export type Localized = { ko: string; en: string };

export type CartOption = {
  id: string;
  productId: string;
  name: Localized;
  optionLabel: Localized;
  kind: 'walker' | 'care' | 'bath';
  unitPrice: number;
  quantity: number;
  stock: number;
  category: string;
  eligible: boolean;
  useBenefit: boolean;
};

export type CartProfile = {
  id: Scenario;
  name: Localized;
  grade: Localized;
  ltcNumber: string;
  applyStartDate: string;
  applyEndDate: string;
  isBeneficiary: boolean;
  facilityAdmitted: boolean;
  availableAmount: number;
  paymentRate: number;
  categoryLimits: Record<string, number>;
};

export type CartState = {
  scenario: Scenario;
  options: CartOption[];
  selectedIds: string[];
  profile: CartProfile;
  undo: null | { removed: CartOption[]; order: string[]; selectedIds: string[] };
};

export type CartGroup = {
  id: string;
  name: Localized;
  kind: CartOption['kind'];
  options: CartOption[];
  selected: boolean;
  indeterminate: boolean;
};

export type CartIssue = {
  code: 'stock' | 'quantity' | 'budget' | 'eligibility' | 'empty' | 'profile';
  optionId?: string;
  category?: string;
  availableCount?: number;
  selectedCount?: number;
  overCount?: number;
  availableAmount?: number;
  benefitAmount?: number;
  overAmount?: number;
};

type CartMutation = { state: CartState; issue: CartIssue | null };
type QuantityChange = 'plus' | 'minus' | 'input';

const MAX_QUANTITY = 99;

// 아래 금액·재고·구매 가능 수량은 제도 안내가 아닌 포트폴리오 체험용 가상 데이터다.
export function createCartState(scenario: Scenario = 'normal'): CartState {
  const generalCustomer = scenario === 'general';
  const profileLetter = scenario === 'budget' ? 'B' : scenario === 'quantity' ? 'C' : 'A';
  const options: CartOption[] = [
    {
      id: 'walker-basic', productId: 'walker', kind: 'walker', category: 'walker',
      name: { ko: '접이식 보행기', en: 'Folding Walker' },
      optionLabel: { ko: '기본형 · 그레이', en: 'Standard · Gray' },
      unitPrice: 60000, quantity: scenario === 'stock' ? 3 : 1,
      stock: scenario === 'stock' ? 1 : 3, eligible: true, useBenefit: !generalCustomer,
    },
    {
      id: 'bath-chair', productId: 'bath', kind: 'bath', category: 'bath',
      name: { ko: '목욕 의자', en: 'Bath Chair' },
      optionLabel: { ko: '기본형', en: 'Standard' },
      unitPrice: 40000, quantity: 1, stock: 2, eligible: true, useBenefit: !generalCustomer,
    },
    {
      id: 'care-pad', productId: 'care', kind: 'care', category: 'care',
      name: { ko: '데일리 케어 세트', en: 'Daily Care Set' },
      optionLabel: { ko: '위생 패드', en: 'Hygiene Pads' },
      unitPrice: 10000, quantity: 1, stock: 8, eligible: false, useBenefit: false,
    },
    {
      id: 'care-gloves', productId: 'care', kind: 'care', category: 'care',
      name: { ko: '데일리 케어 세트', en: 'Daily Care Set' },
      optionLabel: { ko: '위생 장갑', en: 'Care Gloves' },
      unitPrice: 8000, quantity: 1, stock: 10, eligible: false, useBenefit: false,
    },
  ];
  return {
    scenario,
    options,
    selectedIds: options.map((option) => option.id),
    profile: {
      id: scenario,
      name: generalCustomer
        ? { ko: '예시 일반 고객', en: 'Sample Customer' }
        : { ko: `예시 수급자 ${profileLetter}`, en: `Sample Beneficiary ${profileLetter}` },
      grade: generalCustomer ? { ko: '-', en: '-' } : { ko: '3등급', en: 'Grade 3' },
      ltcNumber: generalCustomer ? '' : `DEMO-${profileLetter}`,
      applyStartDate: generalCustomer ? '' : '20260101',
      applyEndDate: generalCustomer ? '' : '20261231',
      isBeneficiary: !generalCustomer,
      facilityAdmitted: false,
      availableAmount: generalCustomer ? 0 : scenario === 'budget' ? 50000 : scenario === 'quantity' ? 200000 : 150000,
      paymentRate: generalCustomer ? 100 : scenario === 'budget' ? 9 : scenario === 'quantity' ? 6 : 15,
      categoryLimits: {
        walker: generalCustomer || scenario === 'quantity' ? 0 : scenario === 'budget' ? 2 : 1,
        bath: generalCustomer ? 0 : 1,
      },
    },
    undo: null,
  };
}

const selectedOptions = (state: CartState): CartOption[] => {
  const selected = new Set(state.selectedIds);
  return state.options.filter((option) => selected.has(option.id));
};

const stockLimit = (option: CartOption): number =>
  Math.max(0, Math.min(MAX_QUANTITY, Number.isFinite(option.stock) ? Math.floor(option.stock) : 0));

const optionAmount = (option: CartOption): number => option.unitPrice * option.quantity;

const copyOption = (option: CartOption): CartOption => ({
  ...option,
  name: { ...option.name },
  optionLabel: { ...option.optionLabel },
});

// 급여 옵션은 각각, 일반 옵션은 같은 상품끼리 묶어 실제 카드 단위로 센다.
export function getCartGroups(state: CartState): CartGroup[] {
  const groups = new Map<string, CartGroup>();
  const selected = new Set(state.selectedIds);
  state.options.forEach((option) => {
    const id = option.useBenefit ? `benefit:${option.id}` : `product:${option.productId}`;
    const group = groups.get(id);
    if (group) group.options.push(option);
    else groups.set(id, { id, name: option.name, kind: option.kind, options: [option], selected: false, indeterminate: false });
  });
  return Array.from(groups.values(), (group) => {
    const selectable = group.options.filter((option) => stockLimit(option) > 0);
    const count = selectable.filter((option) => selected.has(option.id)).length;
    return {
      ...group,
      selected: selectable.length > 0 && count === selectable.length,
      indeterminate: count > 0 && count < selectable.length,
    };
  });
}

// 지원금 차감 예상액과 결제액은 다르다. 복지용구 일반가 구매와 일반케어도 분리한다.
export function getCartSummary(state: CartState): {
  selectedCardCount: number;
  cardCount: number;
  selectedOptionCount: number;
  productAmount: number;
  benefitAmount: number;
  payableAmount: number;
  remainingAmount: number;
  welfareBenefitPayable: number;
  welfareRegularAmount: number;
  generalCareAmount: number;
} {
  const groups = getCartGroups(state);
  const selected = selectedOptions(state);
  const rate = Math.max(0, Math.min(100, state.profile.paymentRate));
  const amounts = selected.reduce((sum, option) => {
    const amount = optionAmount(option);
    sum.productAmount += amount;
    if (option.eligible && option.useBenefit) {
      sum.benefitAmount += amount;
      sum.welfareBenefitPayable += Math.floor(amount * rate / 100);
    } else if (option.eligible) {
      sum.welfareRegularAmount += amount;
    } else {
      sum.generalCareAmount += amount;
    }
    return sum;
  }, { productAmount: 0, benefitAmount: 0, welfareBenefitPayable: 0, welfareRegularAmount: 0, generalCareAmount: 0 });
  return {
    selectedCardCount: groups.filter((group) => group.selected).length,
    cardCount: groups.length,
    selectedOptionCount: selected.length,
    ...amounts,
    payableAmount: amounts.welfareBenefitPayable + amounts.welfareRegularAmount + amounts.generalCareAmount,
    remainingAmount: state.profile.availableAmount - amounts.benefitAmount,
  };
}

const hasBenefitProfile = (profile: CartProfile): boolean =>
  profile.isBeneficiary && Boolean(profile.ltcNumber) && !profile.facilityAdmitted;

// 상품의 급여 가능 속성과 이 수급자에게 남은 품목별 구매 수량을 별도로 확인한다.
function getBenefitIssue(state: CartState, options: CartOption[]): CartIssue | null {
  const applied = options.filter((option) => option.useBenefit);
  if (applied.length === 0) return null;
  if (!hasBenefitProfile(state.profile)) return { code: 'profile', optionId: applied[0].id };

  const categories = new Map<string, { optionId: string; selectedCount: number; eligible: boolean }>();
  for (const option of applied) {
    const previous = categories.get(option.category);
    categories.set(option.category, {
      optionId: previous?.optionId ?? option.id,
      selectedCount: (previous?.selectedCount ?? 0) + option.quantity,
      eligible: (previous?.eligible ?? true) && option.eligible,
    });
  }
  const limits = Array.from(categories, ([category, entry]) => {
    const availableCount = Math.max(0, state.profile.categoryLimits[category] ?? 0);
    return {
      ...entry,
      category,
      availableCount,
      overCount: Math.max(0, entry.selectedCount - availableCount),
    };
  });
  const unavailable = limits.find((entry) => !entry.eligible || entry.availableCount === 0);
  if (unavailable) {
    const { eligible: _eligible, ...detail } = unavailable;
    return { code: 'eligibility', ...detail };
  }
  const exceeded = limits.find((entry) => entry.selectedCount > entry.availableCount);
  if (exceeded) {
    const { eligible: _eligible, ...detail } = exceeded;
    return { code: 'quantity', ...detail };
  }
  const benefitAmount = applied.reduce((sum, option) => sum + optionAmount(option), 0);
  const availableAmount = state.profile.availableAmount;
  return benefitAmount > availableAmount
    ? { code: 'budget', availableAmount, benefitAmount, overAmount: benefitAmount - availableAmount }
    : null;
}

// 주문서 확인 직전에 선택 항목만 재검증한다. 조건 초과로 구매 유형을 자동 변경하지 않는다.
export function validateCart(state: CartState): CartIssue | null {
  const selected = selectedOptions(state);
  if (selected.length === 0) return { code: 'empty' };
  const invalidStock = selected.find((option) =>
    stockLimit(option) === 0 || !Number.isFinite(option.quantity) || option.quantity < 1 || option.quantity > stockLimit(option),
  );
  if (invalidStock) return { code: 'stock', optionId: invalidStock.id };
  return getBenefitIssue(state, selected);
}

// 재고가 줄어든 상태에서도 '-'는 한 단계씩 감소한다. '+'가 수량을 줄이는 일은 없다.
export function updateQuantity(state: CartState, id: string, quantity: number, type: QuantityChange = 'input'): CartMutation {
  const option = state.options.find((item) => item.id === id);
  if (!option) return { state, issue: null };
  const limit = stockLimit(option);
  if (limit === 0) return { state, issue: { code: 'stock', optionId: id } };
  const requested = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
  const exceeded = requested > limit;
  if (type === 'plus' && exceeded) return { state, issue: { code: 'stock', optionId: id } };
  const next = type === 'minus' ? requested : Math.min(requested, limit);
  const nextState = {
    ...state,
    options: state.options.map((item) => item.id === id ? { ...item, quantity: next } : item),
  };
  return { state: nextState, issue: type !== 'minus' && exceeded ? { code: 'stock', optionId: id } : null };
}

// 지원금 사용은 사용자가 직접 바꾼다. 미선택 상품도 설정할 수 있고 선택 상태는 바꾸지 않는다.
export function toggleBenefit(state: CartState, id: string): CartMutation {
  const option = state.options.find((item) => item.id === id);
  if (!option) return { state, issue: null };
  if (!option.useBenefit && !hasBenefitProfile(state.profile)) return { state, issue: { code: 'profile', optionId: id } };
  if (!option.useBenefit && stockLimit(option) === 0) return { state, issue: { code: 'stock', optionId: id } };
  if (!option.useBenefit && !option.eligible) return {
    state,
    issue: {
      code: 'eligibility', optionId: id, category: option.category,
      availableCount: 0, selectedCount: option.quantity, overCount: option.quantity,
    },
  };
  if (!option.useBenefit && option.quantity > stockLimit(option)) return { state, issue: { code: 'stock', optionId: id } };
  const nextState = {
    ...state,
    options: state.options.map((item) => item.id === id ? { ...item, useBenefit: !item.useBenefit } : item),
  };
  if (!option.useBenefit) {
    // 사용 설정을 켜는 상품은 현재 미선택이어도 함께 검증하되 실제 선택 목록은 유지한다.
    const selected = new Set([...nextState.selectedIds, id]);
    const issue = getBenefitIssue(nextState, nextState.options.filter((item) => selected.has(item.id)));
    if (issue) return { state, issue: { ...issue, optionId: issue.optionId ?? id } };
  }
  return { state: nextState, issue: null };
}

export function selectGroup(state: CartState, groupId: string, selected: boolean): CartState {
  const group = getCartGroups(state).find((item) => item.id === groupId);
  if (!group) return state;
  const ids = new Set(state.selectedIds);
  group.options.forEach((option) => {
    if (selected && stockLimit(option) > 0) ids.add(option.id);
    else ids.delete(option.id);
  });
  return { ...state, selectedIds: state.options.filter((option) => ids.has(option.id) && stockLimit(option) > 0).map((option) => option.id) };
}

export function selectAll(state: CartState, selected: boolean): CartState {
  return { ...state, selectedIds: selected ? state.options.filter((option) => stockLimit(option) > 0).map((option) => option.id) : [] };
}

// 삭제 취소에 필요한 항목만 보관한다. 나머지 항목의 후속 편집은 스냅샷으로 덮지 않는다.
export function deleteSelected(state: CartState): CartState {
  const ids = new Set(state.selectedIds);
  const removed = state.options.filter((option) => ids.has(option.id));
  if (removed.length === 0) return state;
  return {
    ...state,
    options: state.options.filter((option) => !ids.has(option.id)),
    selectedIds: [],
    undo: { removed: removed.map(copyOption), order: state.options.map((option) => option.id), selectedIds: [...state.selectedIds] },
  };
}

export function undoDelete(state: CartState): CartState {
  if (!state.undo) return state;
  const undo = state.undo;
  const optionsById = new Map(undo.removed.map((option) => [option.id, copyOption(option)]));
  state.options.forEach((option) => optionsById.set(option.id, option));
  const originalOrder = new Set(undo.order);
  const restored = undo.order.flatMap((id) => {
    const option = optionsById.get(id);
    return option ? [option] : [];
  });
  restored.push(...state.options.filter((option) => !originalOrder.has(option.id)));
  const selected = new Set([...state.selectedIds, ...undo.selectedIds]);
  return {
    ...state,
    options: restored,
    selectedIds: restored.filter((option) => selected.has(option.id) && stockLimit(option) > 0).map((option) => option.id),
    undo: null,
  };
}
