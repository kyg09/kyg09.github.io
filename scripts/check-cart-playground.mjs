import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// 순수 모델 검사는 실제 API·브라우저 없이 프로젝트의 TypeScript와 Node assert를 사용한다.
const require = createRequire(new URL('../package.json', import.meta.url));
const ts = require('typescript');
const file = new URL('../src/lib/cart-playground.ts', import.meta.url);
const source = readFileSync(file, 'utf8');
const compiled = ts.transpileModule(source, {
  fileName: 'cart-playground.ts',
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  reportDiagnostics: true,
});
assert.equal(compiled.diagnostics?.length ?? 0, 0, 'Model syntax');
const model = {};
new Function('exports', compiled.outputText)(model);
const {
  createCartState, getCartGroups, getCartSummary, validateCart,
  updateQuantity, toggleBenefit, selectGroup, selectAll, deleteSelected, undoDelete,
} = model;
let passed = 0;
function check(name, fn) { try { fn(); passed++; } catch (error) { error.message = name + ': ' + error.message; throw error; } }
const option = (state, id) => state.options.find((item) => item.id === id);
const group = (state, productId) => getCartGroups(state).find((item) => item.options.some((item) => item.productId === productId));
const freeze = (value) => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

check('기본 가상 장바구니 3카드·4옵션과 금액 계산', () => {
  const state = createCartState();
  assert.equal(state.scenario, 'normal');
  assert.equal(state.options.length, 4);
  assert.deepEqual(getCartSummary(state), {
    selectedCardCount: 3, cardCount: 3, selectedOptionCount: 4,
    productAmount: 118000, benefitAmount: 100000, payableAmount: 33000, remainingAmount: 50000,
    welfareBenefitPayable: 15000, welfareRegularAmount: 0, generalCareAmount: 18000,
  });
  assert.equal(validateCart(state), null);
});

check('일반 상품 2옵션은 카드 한 건, 급여 옵션은 각각 한 건', () => {
  const state = createCartState();
  assert.equal(group(state, 'care').options.length, 2);
  assert.equal(group(state, 'care').id, 'product:care');
  assert.equal(group(state, 'walker').id, 'benefit:walker-basic');
  const partial = { ...state, selectedIds: ['care-pad'] };
  assert.equal(group(partial, 'care').indeterminate, true);
  assert.equal(group(partial, 'care').selected, false);
  assert.equal(getCartSummary(partial).selectedCardCount, 0);
  assert.equal(getCartSummary(partial).selectedOptionCount, 1);
});

check('일반 카드 선택은 두 옵션을 함께 선택·해제', () => {
  let state = selectAll(createCartState(), false);
  state = selectGroup(state, group(state, 'care').id, true);
  assert.deepEqual(state.selectedIds, ['care-pad', 'care-gloves']);
  assert.equal(getCartSummary(state).selectedCardCount, 1);
  assert.equal(getCartSummary(state).payableAmount, 18000);
  state = selectGroup(state, group(state, 'care').id, false);
  assert.deepEqual(validateCart(state), { code: 'empty' });
});

check('미선택 항목은 금액·주문 검증에서 제외', () => {
  const state = selectAll(createCartState('stock'), false);
  assert.deepEqual(validateCart(state), { code: 'empty' });
  assert.deepEqual(getCartSummary(state), {
    selectedCardCount: 0, cardCount: 3, selectedOptionCount: 0,
    productAmount: 0, benefitAmount: 0, payableAmount: 0, remainingAmount: 150000,
    welfareBenefitPayable: 0, welfareRegularAmount: 0, generalCareAmount: 0,
  });
  const careOnly = selectGroup(state, group(state, 'care').id, true);
  assert.equal(validateCart(careOnly), null);
});

check('지원금 부족 프리셋은 자동 일반구매 전환 없이 오류 표시', () => {
  const state = createCartState('budget');
  const before = structuredClone(state);
  assert.deepEqual(validateCart(state), { code: 'budget', availableAmount: 50000, benefitAmount: 100000, overAmount: 50000 });
  assert.equal(getCartSummary(state).remainingAmount, -50000);
  assert.deepEqual(state, before);
  assert.equal(option(state, 'walker-basic').useBenefit, true);
});

check('사용자가 지원금 OFF 후 재주문 가능, ON 시 한도 부족이면 변경 차단', () => {
  const first = toggleBenefit(createCartState('budget'), 'walker-basic');
  assert.equal(first.issue, null);
  assert.equal(option(first.state, 'walker-basic').useBenefit, false);
  assert.equal(validateCart(first.state), null);
  assert.deepEqual(getCartSummary(first.state), {
    selectedCardCount: 3, cardCount: 3, selectedOptionCount: 4,
    productAmount: 118000, benefitAmount: 40000, payableAmount: 81600, remainingAmount: 10000,
    welfareBenefitPayable: 3600, welfareRegularAmount: 60000, generalCareAmount: 18000,
  });
  assert.equal(group(first.state, 'walker').id, 'product:walker');
  const second = toggleBenefit(first.state, 'walker-basic');
  assert.deepEqual(second.issue, { code: 'budget', optionId: 'walker-basic', availableAmount: 50000, benefitAmount: 100000, overAmount: 50000 });
  assert.equal(second.state, first.state);
  assert.equal(option(second.state, 'walker-basic').useBenefit, false);
});

check('미선택 상품의 지원금 설정도 바뀌고 선택 목록은 유지한다', () => {
  let state = selectAll(createCartState(), false);
  const off = toggleBenefit(state, 'walker-basic');
  assert.equal(off.issue, null);
  assert.equal(option(off.state, 'walker-basic').useBenefit, false);
  assert.deepEqual(off.state.selectedIds, []);
  const on = toggleBenefit(off.state, 'walker-basic');
  assert.equal(on.issue, null);
  assert.equal(option(on.state, 'walker-basic').useBenefit, true);
  assert.deepEqual(on.state.selectedIds, []);
  assert.equal(validateCart(on.state).code, 'empty');
  state = selectAll(createCartState('budget'), false);
  state = toggleBenefit(state, 'walker-basic').state;
  const blocked = toggleBenefit(state, 'walker-basic');
  assert.equal(blocked.issue.code, 'budget');
  assert.equal(blocked.state, state);
});

check('품절·한도 초과 상태에서도 사용자가 지원금 OFF를 선택할 수 있다', () => {
  let state = createCartState('budget');
  state = { ...state, options: state.options.map((item) => item.id === 'walker-basic' ? { ...item, stock: 0 } : item) };
  const result = toggleBenefit(state, 'walker-basic');
  assert.equal(result.issue, null);
  assert.equal(option(result.state, 'walker-basic').useBenefit, false);
});

check('재고 감소 프리셋은 +가 수량을 줄이지 않고 -는 3→2→1', () => {
  let state = createCartState('stock');
  assert.deepEqual(validateCart(state), { code: 'stock', optionId: 'walker-basic' });
  let result = updateQuantity(state, 'walker-basic', 4, 'plus');
  assert.equal(result.state, state);
  assert.equal(option(result.state, 'walker-basic').quantity, 3);
  assert.equal(result.issue.code, 'stock');
  result = updateQuantity(state, 'walker-basic', 2, 'minus');
  assert.equal(result.issue, null);
  state = result.state;
  assert.equal(option(state, 'walker-basic').quantity, 2);
  assert.equal(validateCart(state).code, 'stock');
  state = updateQuantity(state, 'walker-basic', 1, 'minus').state;
  assert.equal(option(state, 'walker-basic').quantity, 1);
  assert.equal(validateCart(state), null);
});

check('직접 입력은 재고 상한으로 보정하고 초과 시도를 안내', () => {
  const result = updateQuantity(createCartState('stock'), 'walker-basic', 99, 'input');
  assert.deepEqual(result.issue, { code: 'stock', optionId: 'walker-basic' });
  assert.equal(option(result.state, 'walker-basic').quantity, 1);
  assert.equal(validateCart(result.state), null);
  assert.equal(option(updateQuantity(result.state, 'walker-basic', 0, 'input').state, 'walker-basic').quantity, 1);
  assert.equal(option(updateQuantity(result.state, 'walker-basic', Number.NaN, 'input').state, 'walker-basic').quantity, 1);
});

check('품목 수량을 금액보다 먼저 검사, 감소 후 다시 확인', () => {
  const second = updateQuantity(createCartState('budget'), 'walker-basic', 2, 'plus').state;
  const result = updateQuantity(second, 'walker-basic', 3, 'plus');
  assert.equal(result.issue, null);
  assert.deepEqual(validateCart(result.state), {
    code: 'quantity', optionId: 'walker-basic', category: 'walker',
    availableCount: 2, selectedCount: 3, overCount: 1,
  });
  assert.equal(getCartSummary(result.state).remainingAmount < 0, true);
  const decreased = updateQuantity(result.state, 'walker-basic', 2, 'minus').state;
  assert.equal(validateCart(decreased).code, 'budget');
});

check('동일 카테고리 급여 옵션 수량은 합산, 일반구매 옵션은 제외', () => {
  const state = createCartState();
  const extra = { ...option(state, 'walker-basic'), id: 'walker-extra', optionLabel: { ko: '추가 옵션', en: 'Extra Option' } };
  const expanded = { ...state, options: [...state.options, extra], selectedIds: [...state.selectedIds, extra.id] };
  assert.deepEqual(validateCart(expanded), { code: 'quantity', optionId: 'walker-basic', category: 'walker', availableCount: 1, selectedCount: 2, overCount: 1 });
  const normal = { ...expanded, options: expanded.options.map((item) => item.id === extra.id ? { ...item, useBenefit: false } : item) };
  assert.equal(validateCart(normal), null);
});

check('지원금 불가 품목과 구매 가능 수량 0인 품목의 사용 전환 차단', () => {
  const care = toggleBenefit(createCartState(), 'care-pad');
  assert.deepEqual(care.issue, { code: 'eligibility', optionId: 'care-pad', category: 'care', availableCount: 0, selectedCount: 1, overCount: 1 });
  assert.equal(option(care.state, 'care-pad').useBenefit, false);
  let state = toggleBenefit(createCartState(), 'walker-basic').state;
  state = { ...state, profile: { ...state.profile, categoryLimits: { ...state.profile.categoryLimits, walker: 0 } } };
  const result = toggleBenefit(state, 'walker-basic');
  assert.deepEqual(result.issue, { code: 'eligibility', optionId: 'walker-basic', category: 'walker', availableCount: 0, selectedCount: 1, overCount: 1 });
  assert.equal(result.state, state);
});

check('잔액과 같은 차감 금액은 통과하고 1원 초과는 차단', () => {
  const state = createCartState();
  const exact = { ...state, profile: { ...state.profile, availableAmount: 100000 } };
  assert.equal(validateCart(exact), null);
  assert.equal(getCartSummary(exact).remainingAmount, 0);
  assert.equal(validateCart({ ...exact, profile: { ...exact.profile, availableAmount: 99999 } }).code, 'budget');
});

check('재고 0 옵션은 전체·그룹 선택에서 제외', () => {
  let state = createCartState();
  state = { ...state, options: state.options.map((item) => item.id === 'walker-basic' ? { ...item, stock: 0 } : item) };
  state = selectAll(state, true);
  assert.equal(state.selectedIds.includes('walker-basic'), false);
  assert.equal(getCartSummary(state).selectedCardCount, 2);
  state = selectAll(state, false);
  state = selectGroup(state, group(state, 'walker').id, true);
  assert.deepEqual(state.selectedIds, []);
  assert.equal(updateQuantity(state, 'walker-basic', 1, 'plus').issue.code, 'stock');
});

check('전체 삭제·빈 상태·복구·재선택·재조작', () => {
  const original = createCartState();
  let state = deleteSelected(original);
  assert.equal(state.options.length, 0);
  assert.equal(getCartSummary(state).cardCount, 0);
  assert.equal(validateCart(state).code, 'empty');
  state = undoDelete(state);
  assert.deepEqual(state.options, original.options);
  assert.deepEqual(state.selectedIds, original.selectedIds);
  assert.equal(state.undo, null);
  assert.equal(validateCart(state), null);
  state = selectAll(state, false);
  state = selectGroup(state, group(state, 'care').id, true);
  assert.equal(getCartSummary(state).selectedCardCount, 1);
  state = updateQuantity(state, 'care-pad', 2, 'plus').state;
  assert.equal(getCartSummary(state).payableAmount, 28000);
});

check('삭제 취소는 원래 순서·선택을 복구하면서 후속 수량·선택 변경 유지', () => {
  let state = selectAll(createCartState(), false);
  state = selectGroup(state, group(state, 'care').id, true);
  state = deleteSelected(state);
  assert.deepEqual(state.options.map((item) => item.id), ['walker-basic', 'bath-chair']);
  state = updateQuantity(state, 'walker-basic', 2, 'plus').state;
  state = selectGroup(state, group(state, 'walker').id, true);
  state = undoDelete(state);
  assert.deepEqual(state.options.map((item) => item.id), ['walker-basic', 'bath-chair', 'care-pad', 'care-gloves']);
  assert.equal(option(state, 'walker-basic').quantity, 2);
  assert.deepEqual(state.selectedIds, ['walker-basic', 'care-pad', 'care-gloves']);
  assert.equal(getCartSummary(state).selectedCardCount, 2);
  assert.equal(state.undo, null);
  assert.equal(undoDelete(state), state);
});

check('빈 선택 삭제는 기존 복구 기록을 지우지 않는다', () => {
  let state = selectAll(createCartState(), false);
  state = selectGroup(state, group(state, 'walker').id, true);
  state = deleteSelected(state);
  const again = deleteSelected(state);
  assert.equal(again, state);
  assert.equal(undoDelete(again).options.length, 4);
});

check('한영 이름을 제공하고 프리셋 재생성 시 상태가 공유되지 않는다', () => {
  const state = createCartState();
  assert.equal(state.options.every((item) => item.name.ko && item.name.en && item.optionLabel.ko && item.optionLabel.en), true);
  state.options[0].name.ko = '변경';
  state.profile.categoryLimits.walker = 99;
  assert.equal(createCartState().options[0].name.ko, '접이식 보행기');
  assert.equal(createCartState().profile.categoryLimits.walker, 1);
});

check('모든 상태 변경은 입력 객체를 수정하지 않는다', () => {
  const state = freeze(createCartState());
  const before = structuredClone(state);
  updateQuantity(state, 'walker-basic', 2, 'plus');
  toggleBenefit(state, 'walker-basic');
  selectGroup(state, group(state, 'care').id, false);
  selectAll(state, false);
  undoDelete(deleteSelected(state));
  assert.deepEqual(state, before);
});

check('A·B·C·일반 고객 프로필은 이름·한도·본인부담률을 각각 제공한다', () => {
  const a = createCartState('normal').profile;
  const b = createCartState('budget').profile;
  const c = createCartState('quantity').profile;
  const general = createCartState('general').profile;
  assert.equal(a.name.ko, '예시 수급자 A');
  assert.equal(b.name.ko, '예시 수급자 B');
  assert.equal(c.name.ko, '예시 수급자 C');
  assert.equal(general.name.ko, '예시 일반 고객');
  assert.deepEqual([a.availableAmount, b.availableAmount, c.availableAmount, general.availableAmount], [150000,50000,200000,0]);
  assert.deepEqual([a.paymentRate,b.paymentRate,c.paymentRate,general.paymentRate], [15,9,6,100]);
  assert.deepEqual([a.categoryLimits.walker,b.categoryLimits.walker,c.categoryLimits.walker,general.categoryLimits.walker], [1,2,0,0]);
  assert.equal(a.grade.ko, '3등급');
  assert.equal(a.applyStartDate, '20260101');
  assert.equal(a.applyEndDate, '20261231');
  assert.equal(general.ltcNumber, '');
  assert.equal(general.isBeneficiary, false);
  assert.equal(general.grade.ko, '-');
});

check('일반 고객은 모든 복지용구를 일반가로 구매하고 일반케어와 분리한다', () => {
  const state = createCartState('general');
  assert.equal(state.options.every((item) => !item.useBenefit), true);
  assert.equal(option(state, 'walker-basic').eligible, true);
  assert.equal(option(state, 'care-pad').eligible, false);
  assert.equal(validateCart(state), null);
  assert.deepEqual(getCartSummary(state), {
    selectedCardCount: 3, cardCount: 3, selectedOptionCount: 4,
    productAmount: 118000, benefitAmount: 0, payableAmount: 118000, remainingAmount: 0,
    welfareBenefitPayable: 0, welfareRegularAmount: 100000, generalCareAmount: 18000,
  });
});

check('B의 가상 본인부담률은 9%, 지원금 차감은 전체 상품금액', () => {
  const summary = getCartSummary(createCartState('budget'));
  assert.equal(summary.welfareBenefitPayable, 9000);
  assert.equal(summary.benefitAmount, 100000);
  assert.equal(summary.payableAmount, 27000);
  assert.equal(summary.remainingAmount, -50000);
});

check('C의 구매 가능 수량 0은 일반가만 가능하다고 상세 안내', () => {
  const state = createCartState('quantity');
  assert.deepEqual(validateCart(state), {
    code: 'eligibility', optionId: 'walker-basic', category: 'walker',
    availableCount: 0, selectedCount: 1, overCount: 1,
  });
  assert.equal(option(state, 'walker-basic').useBenefit, true, '조건 변경으로 자동 일반가 전환하지 않음');
  const changed = toggleBenefit(state, 'walker-basic');
  assert.equal(changed.issue, null);
  assert.equal(validateCart(changed.state), null);
  const summary = getCartSummary(changed.state);
  assert.equal(summary.welfareBenefitPayable, 2400);
  assert.equal(summary.welfareRegularAmount, 60000);
  assert.equal(summary.generalCareAmount, 18000);
  assert.equal(summary.payableAmount, 80400);
});

check('품목 미지원은 잔여금 부족보다 먼저 반환', () => {
  const state = createCartState('quantity');
  state.profile.availableAmount = 0;
  assert.equal(validateCart(state).code, 'eligibility');
});

check('품목 수량 집계는 같은 품목의 선택된 급여 옵션 전체를 합산한다', () => {
  let state = createCartState('budget');
  const extra = { ...option(state, 'walker-basic'), id: 'walker-extra', quantity: 2 };
  state = { ...state, options: [...state.options, extra], selectedIds: ['walker-basic','walker-extra'] };
  assert.deepEqual(validateCart(state), {
    code: 'quantity', optionId: 'walker-basic', category: 'walker',
    availableCount: 2, selectedCount: 3, overCount: 1,
  });
  state = { ...state, selectedIds: ['walker-basic'] };
  assert.equal(validateCart(state).code, 'budget');
  state = { ...state, profile: { ...state.profile, availableAmount: 60000 } };
  assert.equal(validateCart(state), null);
});

check('프로필의 품목 매핑이 없으면 구매 가능 수량 0으로 처리한다', () => {
  const state = createCartState();
  state.profile.categoryLimits = { bath: 1 };
  assert.deepEqual(validateCart(state), {
    code: 'eligibility', optionId: 'walker-basic', category: 'walker',
    availableCount: 0, selectedCount: 1, overCount: 1,
  });
});

check('일반 고객·인정번호 없음·시설 입소 상태에서는 지원금 ON 차단', () => {
  const general = toggleBenefit(createCartState('general'), 'walker-basic');
  assert.deepEqual(general.issue, { code: 'profile', optionId: 'walker-basic' });
  for (const override of [{ ltcNumber: '' }, { isBeneficiary: false }, { facilityAdmitted: true }]) {
    let state = toggleBenefit(createCartState(), 'walker-basic').state;
    state = { ...state, profile: { ...state.profile, ...override } };
    const result = toggleBenefit(state, 'walker-basic');
    assert.deepEqual(result.issue, { code: 'profile', optionId: 'walker-basic' });
    assert.equal(option(result.state, 'walker-basic').useBenefit, false);
  }
});

check('유효하지 않은 프로필이라도 사용자가 지원금 OFF를 선택할 수 있다', () => {
  let state = createCartState();
  state = { ...state, profile: { ...state.profile, facilityAdmitted: true } };
  assert.equal(validateCart(state).code, 'profile');
  for (const id of ['walker-basic','bath-chair']) {
    const result = toggleBenefit(state,id);
    assert.equal(result.issue, null);
    state = result.state;
  }
  assert.equal(validateCart(state), null);
  assert.equal(getCartSummary(state).welfareRegularAmount, 100000);
});

check('프로필 변경 비교용 객체 사이의 이름·한도·선택 상태는 공유되지 않는다', () => {
  const a = createCartState('normal');
  const b = createCartState('budget');
  a.profile.name.ko = '변경';
  a.profile.categoryLimits.walker = 88;
  a.selectedIds.pop();
  assert.equal(b.profile.name.ko, '예시 수급자 B');
  assert.equal(b.profile.categoryLimits.walker, 2);
  assert.equal(b.selectedIds.length, 4);
  assert.equal(createCartState('normal').profile.name.ko, '예시 수급자 A');
});

console.log(`Cart model: ${passed} checks passed.`);
