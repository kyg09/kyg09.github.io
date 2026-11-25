'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { usePortfolioLocale } from '@/lib/usePortfolioLocale';
import styles from './FormDemo.module.css';

type CustomerType = 'recipient' | 'general';
type Route = 'center' | 'online' | 'etc';
type Relation = '' | 'CHILD' | 'SPOUSE' | 'SELF';
type Applicant = { name: string; relationship: Relation; phone: string };
type Customer = { id: string; type: CustomerType; name: string; address: string; detail: string; applicants: Applicant[] };
type Field = 'customer' | 'name' | 'relationship' | 'phone' | 'address' | 'detail' | 'channel' | 'orderNumber' | 'etcOrder' | 'agreement';
type ErrorCode = 'required' | 'customer' | 'name' | 'phone' | 'number' | 'agreement';
const fieldOrder: Field[] = ['customer', 'name', 'relationship', 'phone', 'address', 'detail', 'channel', 'orderNumber', 'etcOrder', 'agreement'];
const blankApplicant: Applicant = { name: '', relationship: '', phone: '' };

// 실고객·실주소를 쓰지 않는 독립 예시다. IMS의 고객·신청인·주소 필드 구조만 참고한다.
const customers: Customer[] = [
  { id: 'R-01', type: 'recipient', name: '예시 수급자 A', address: '가상시 예시로 10', detail: '101호', applicants: [{ name: '예시 신청인 A', relationship: 'CHILD', phone: '01000000001' }, { name: '예시 신청인 B', relationship: 'SPOUSE', phone: '01000000002' }] },
  { id: 'R-02', type: 'recipient', name: '예시 수급자 B', address: '가상시 예시로 20', detail: '202호', applicants: [{ name: '예시 신청인 C', relationship: 'CHILD', phone: '01000000003' }] },
  { id: 'G-01', type: 'general', name: '예시 일반고객 A', address: '가상시 예시길 30', detail: '303호', applicants: [{ name: '예시 신청인 D', relationship: 'SELF', phone: '01000000004' }] },
  { id: 'G-02', type: 'general', name: '예시 일반고객 B', address: '가상시 예시길 40', detail: '404호', applicants: [{ name: '예시 신청인 E', relationship: 'SELF', phone: '01000000005' }] },
];

const copy = {
  ko: {
    introduction: '가상 고객 정보로 주문 입력 흐름을 체험합니다.',
    search: '고객 조회', keyword: '이름 또는 고객번호', searchButton: '검색', recipient: '수급자', general: '일반고객',
    load: '정보 불러오기', noResults: '검색 결과가 없습니다. 검색어를 지우고 다시 검색해 보세요.', results: '검색 결과',
    loaded: '고객 정보를 불러왔습니다.', changed: '고객 구분이 변경되어 신청인·배송지·동의를 초기화했습니다.',
    customerPolicy: '다른 고객을 불러오면 신청인·별도 배송지·동의가 초기화됩니다. 주문 경로와 메모는 유지됩니다.',
    applicantTitle: '신청인', applicantSelect: '신청인 선택', manual: '직접 입력',
    applicantPolicy: '직접 입력한 신청인은 전환 중 유지됩니다. 신청인이 바뀌면 동의는 해제됩니다.',
    name: '신청인 이름', relationship: '관계', phone: '휴대폰번호', CHILD: '자녀', SPOUSE: '배우자', SELF: '본인', choose: '선택하세요',
    delivery: '배송지', same: '고객 주소와 동일', address: '기본 주소', detail: '상세 주소',
    deliveryPolicy: '별도 주소는 전환 중 유지되며, 현재 선택한 주소만 요약에 반영됩니다.',
    routeTitle: '주문 정보', route: '주문 경로', center: '센터 주문', online: '온라인 주문', etc: '기타 주문',
    channel: '온라인 채널', orderNumber: '주문번호', etcOrder: '기타 주문 경로', memo: '배송 메모 (선택)',
    routePolicy: '주문 경로를 바꾸면 채널·주문번호·기타 경로가 초기화됩니다. 채널을 바꾸면 주문번호만 초기화됩니다.',
    agreement: '정보 제공에 동의합니다 (필수)', consentPolicy: '가상 주문 입력을 확인하기 위한 동의 상태 예시입니다.',
    check: '주문 입력 확인', reset: '초기화', edit: '다시 수정', complete: '주문 입력 확인 완료',
    completeHint: '아래 정보로 입력을 확인했습니다. 실제 주문은 등록되지 않습니다.',
    errorTitle: '확인이 필요한 항목', notice: '실제 주문은 등록되지 않습니다.',
    customer: '선택한 고객', agreementSummary: '필수 정보 제공 동의 확인', noMemo: '입력 없음',
    errors: { required: '필수 항목을 입력해 주세요.', customer: '검색 결과에서 고객 정보를 불러와 주세요.', name: '한글·영문 2~20자로 입력해 주세요.', phone: '전화번호는 숫자 10~11자리로 입력해 주세요.', number: '주문번호는 숫자 1~20자리로 입력해 주세요.', agreement: '필수 정보 제공 동의를 확인해 주세요.' },
  },
  en: {
    introduction: 'Explore the order input flow with fictional customer details.',
    search: 'Find a customer', keyword: 'Name or customer ID', searchButton: 'Search', recipient: 'Beneficiary', general: 'General customer',
    load: 'Load details', noResults: 'No results. Clear the search term and try again.', results: 'Search results',
    loaded: 'Customer details loaded.', changed: 'Customer type changed. Applicant, delivery details, and consent have been cleared.',
    customerPolicy: 'Loading another customer clears the applicant, separate delivery address, and consent. The order route and memo stay unchanged.',
    applicantTitle: 'Applicant', applicantSelect: 'Choose an applicant', manual: 'Enter manually',
    applicantPolicy: 'Manual applicant details are kept when switching. Changing the applicant clears consent.',
    name: 'Applicant name', relationship: 'Relationship', phone: 'Phone number', CHILD: 'Child', SPOUSE: 'Spouse', SELF: 'Self', choose: 'Choose an option',
    delivery: 'Delivery address', same: 'Use the customer address', address: 'Street address', detail: 'Address details',
    deliveryPolicy: 'The separate address is kept when switching. Only the active address appears in the summary.',
    routeTitle: 'Order details', route: 'Order route', center: 'Center order', online: 'Online order', etc: 'Other order',
    channel: 'Online channel', orderNumber: 'Order number', etcOrder: 'Other order route', memo: 'Delivery memo (optional)',
    routePolicy: 'Changing the route clears its channel, order number, and custom route. Changing the channel clears the order number.',
    agreement: 'I agree to provide the information (required)', consentPolicy: 'A sample consent state for checking this fictional order form.',
    check: 'Check order input', reset: 'Reset', edit: 'Edit again', complete: 'Order input checked',
    completeHint: 'The input is summarized below. No real order is registered.',
    errorTitle: 'Please review these fields', notice: 'No real order is registered.',
    customer: 'Selected customer', agreementSummary: 'Required consent confirmed', noMemo: 'Not entered',
    errors: { required: 'Complete this required field.', customer: 'Load a customer from the search results.', name: 'Use 2–20 Korean or English letters.', phone: 'Enter a phone number with 10–11 digits.', number: 'Use 1–20 digits for the order number.', agreement: 'Confirm the required information consent.' },
  },
} as const;

function AlertIcon() {
  return <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M9 3.1Q10 1.7 11 3.2l6.7 11.9q.8 1.7-1.2 1.8H3.3q-1.9-.1-1-1.9Z" strokeLinejoin="round" /><path d="M10 7v4.5M10 13.7v.3" strokeLinecap="round" /></svg>;
}

export function FormDemo() {
  const locale = usePortfolioLocale(), text = copy[locale], id = 'form-demo-' + useId();
  const [type, setType] = useState<CustomerType>('recipient');
  const [query, setQuery] = useState(''), [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState(''), [applicantMode, setApplicantMode] = useState('saved-0');
  const [manual, setManual] = useState<Applicant>(blankApplicant);
  const [sameAddress, setSameAddress] = useState(true), [address, setAddress] = useState(''), [detail, setDetail] = useState('');
  const [route, setRoute] = useState<Route>('center'), [channel, setChannel] = useState(''), [orderNumber, setOrderNumber] = useState(''), [etcOrder, setEtcOrder] = useState('');
  const [memo, setMemo] = useState(''), [agreement, setAgreement] = useState(false);
  const [submitted, setSubmitted] = useState(false), [done, setDone] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [announcement, setAnnouncement] = useState<'loaded' | 'changed' | ''>('');
  const [focusTo, setFocusTo] = useState<Field | 'loaded' | 'result' | null>(null);
  const refs = useRef<Partial<Record<Field | 'loaded' | 'result', HTMLElement | null>>>({});
  const customer = customers.find((item) => item.id === customerId);
  const applicant = applicantMode === 'manual' ? manual : customer?.applicants[Number(applicantMode.slice(6))] ?? blankApplicant;
  const deliveryAddress = sameAddress ? customer?.address ?? '' : address;
  const deliveryDetail = sameAddress ? customer?.detail ?? '' : detail;
  const matches = searchTerm === null ? [] : customers.filter((item) => item.type === type && `${item.name} ${item.id}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const errors: Partial<Record<Field, ErrorCode>> = {};
  if (!customer) errors.customer = 'customer';
  else {
    if (!applicant.name.trim()) errors.name = 'required';
    else if (!/^[가-힣A-Za-z][가-힣A-Za-z ]{1,19}$/.test(applicant.name.trim())) errors.name = 'name';
    if (!applicant.relationship) errors.relationship = 'required';
    if (!/^\d{10,11}$/.test(applicant.phone.replaceAll('-', ''))) errors.phone = applicant.phone ? 'phone' : 'required';
    if (!deliveryAddress.trim()) errors.address = 'required';
    if (!deliveryDetail.trim()) errors.detail = 'required';
    if (route === 'online') {
      if (!channel) errors.channel = 'required';
      else if (!/^\d{1,20}$/.test(orderNumber)) errors.orderNumber = orderNumber ? 'number' : 'required';
    }
    if (route === 'etc' && !etcOrder.trim()) errors.etcOrder = 'required';
    if (!agreement) errors.agreement = 'agreement';
  }
  const invalid = fieldOrder.filter((field) => errors[field]);
  const showError = (field: Field) => Boolean(errors[field] && (submitted || touched[field]));
  const describedBy = (field: Field) => showError(field) ? `${id}-${field}-error` : undefined;
  const mark = (field: Field) => setTouched((previous) => ({ ...previous, [field]: true }));

  // 초기 마운트에는 포커스를 옮기지 않고, 조작·검증·복구 후에만 의도한 필드로 이동한다.
  useEffect(() => {
    if (!focusTo) return;
    refs.current[focusTo]?.focus(); setFocusTo(null);
  }, [focusTo, done, customerId]);

  function clearCustomer(nextType: CustomerType = type) {
    setType(nextType); setCustomerId(''); setSearchTerm(null); setQuery(''); setManual(blankApplicant); setApplicantMode('saved-0');
    setSameAddress(true); setAddress(''); setDetail(''); setAgreement(false); setSubmitted(false); setTouched({}); setDone(false);
  }
  function reset() {
    clearCustomer('recipient'); setRoute('center'); setChannel(''); setOrderNumber(''); setEtcOrder(''); setMemo(''); setAnnouncement(''); setFocusTo('customer');
  }
  function loadCustomer(item: Customer) {
    setCustomerId(item.id); setManual(blankApplicant); setApplicantMode('saved-0'); setSameAddress(true); setAddress(''); setDetail('');
    setAgreement(false); setSearchTerm(null); setSubmitted(false); setTouched({}); setAnnouncement('loaded'); setFocusTo('loaded');
  }
  function changeRoute(next: Route) { setRoute(next); setChannel(''); setOrderNumber(''); setEtcOrder(''); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitted(true);
    if (invalid.length) { setFocusTo(invalid[0]); return; }
    setDone(true); setFocusTo('result');
  }
  function ErrorText({ field }: { field: Field }) {
    const code = errors[field];
    return showError(field) && code ? <p id={`${id}-${field}-error`} className={styles.error}><AlertIcon />{text.errors[code]}</p> : null;
  }
  const inputProps = (field: Field) => ({ id: `${id}-${field}`, ref: (element: HTMLInputElement | HTMLSelectElement | null) => { refs.current[field] = element; }, 'aria-invalid': showError(field), 'aria-describedby': describedBy(field), onBlur: () => mark(field) });

  return <div className={styles.panel} data-localized-skip>
    <header className={styles.heading}><h3 lang="en">Order Form</h3><button type="button" className={styles.textButton} onClick={reset}>{text.reset}</button></header>
    <p className={styles.introduction}>{text.introduction}</p>
    {done && customer ? <div className={styles.result} role="status" tabIndex={-1} ref={(element) => { refs.current.result = element; }}>
      <h4>{text.complete}</h4><p>{text.completeHint}</p>
      <dl>
        <div><dt>{text.customer}</dt><dd>{customer.name} · {customer.id}</dd></div>
        <div><dt>{text.applicantTitle}</dt><dd>{applicant.name} · {text[applicant.relationship || 'SELF']} · {applicant.phone}</dd></div>
        <div><dt>{text.delivery}</dt><dd>{deliveryAddress} {deliveryDetail}</dd></div>
        <div><dt>{text.route}</dt><dd>{text[route]}{route === 'online' ? ` · ${channel} · ${orderNumber}` : route === 'etc' ? ` · ${etcOrder}` : ''}</dd></div>
        <div><dt>{text.memo}</dt><dd>{memo || text.noMemo}</dd></div>
        <div><dt>{text.agreementSummary}</dt><dd>✓</dd></div>
      </dl>
      <button type="button" className={styles.primary} onClick={() => { setDone(false); setFocusTo('customer'); }}>{text.edit}</button>
    </div> : <form noValidate onSubmit={submit} aria-label="Order Form">
      {submitted && invalid.length > 0 && <div className={styles.errorSummary} role="alert">
        <strong><AlertIcon />{text.errorTitle} ({invalid.length})</strong>
        <ul>{invalid.map((field) => <li key={field}><button type="button" onClick={() => setFocusTo(field)}>{text[field]}: {text.errors[errors[field]!]}</button></li>)}</ul>
      </div>}
      <fieldset className={styles.group}>
        <legend>01 · {text.search}</legend>
        <div className={styles.choices}>{(['recipient', 'general'] as const).map((value) => <label key={value}><input type="radio" name={`${id}-customer-type`} checked={type === value} onChange={() => { clearCustomer(value); setAnnouncement('changed'); setFocusTo('customer'); }} />{text[value]}</label>)}</div>
        <label htmlFor={`${id}-customer`}>{text.keyword}</label>
        <div className={styles.searchRow}><input {...inputProps('customer')} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); setSearchTerm(query.trim()); } }} autoComplete="off" /><button type="button" className={styles.secondary} onClick={() => setSearchTerm(query.trim())}>{text.searchButton}</button></div>
        <ErrorText field="customer" />
        {searchTerm !== null && <div className={styles.searchResults}>
          <p role="status">{text.results} · {matches.length}</p>
          {matches.length ? <ul>{matches.map((item) => <li key={item.id}><span>{item.name}<small>{item.id}</small></span><button type="button" className={styles.secondary} aria-label={`${item.name} ${text.load}`} onClick={() => loadCustomer(item)}>{text.load}</button></li>)}</ul> : <p>{text.noResults}</p>}
        </div>}
        {customer && <div className={styles.customer} ref={(element) => { refs.current.loaded = element; }} tabIndex={-1}><strong>{customer.name}</strong><span>{customer.id} · {text[customer.type]}</span><span>{customer.address} {customer.detail}</span></div>}
        <p className={styles.hint} role="status">{announcement ? text[announcement] : ''}</p>
        <p className={styles.hint}>{text.customerPolicy}</p>
      </fieldset>

      {customer && <>
      <fieldset className={styles.group}>
        <legend>02 · {text.applicantTitle}</legend>
        <label htmlFor={`${id}-applicant`}>{text.applicantSelect}</label>
        <select id={`${id}-applicant`} value={applicantMode} onChange={(event) => { setApplicantMode(event.target.value); setAgreement(false); }}>
          {customer?.applicants.map((person, index) => <option value={`saved-${index}`} key={person.name}>{person.name} · {text[person.relationship || 'SELF']}</option>)}
          <option value="manual">{text.manual}</option>
        </select>
        <div className={styles.columns}>
          <div><label htmlFor={`${id}-name`}>{text.name}</label><input {...inputProps('name')} value={applicant.name} readOnly={applicantMode !== 'manual'} maxLength={40} autoComplete="off" onChange={(event) => { setManual((previous) => ({ ...previous, name: event.target.value })); setAgreement(false); }} /><ErrorText field="name" /></div>
          <div><label htmlFor={`${id}-relationship`}>{text.relationship}</label><select {...inputProps('relationship')} value={applicant.relationship} disabled={applicantMode !== 'manual'} onChange={(event) => { setManual((previous) => ({ ...previous, relationship: event.target.value as Relation })); setAgreement(false); }}><option value="">{text.choose}</option>{(['CHILD', 'SPOUSE', 'SELF'] as const).map((value) => <option value={value} key={value}>{text[value]}</option>)}</select><ErrorText field="relationship" /></div>
        </div>
        <label htmlFor={`${id}-phone`}>{text.phone}</label><input {...inputProps('phone')} value={applicant.phone} readOnly={applicantMode !== 'manual'} inputMode="tel" maxLength={13} autoComplete="off" onChange={(event) => { setManual((previous) => ({ ...previous, phone: event.target.value })); setAgreement(false); }} /><ErrorText field="phone" />
        <p className={styles.hint}>{text.applicantPolicy}</p>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>03 · {text.delivery}</legend>
        <label className={styles.check}><input type="checkbox" checked={sameAddress} onChange={(event) => setSameAddress(event.target.checked)} />{text.same}</label>
        <label htmlFor={`${id}-address`}>{text.address}</label><input {...inputProps('address')} value={deliveryAddress} readOnly={sameAddress} onChange={(event) => setAddress(event.target.value)} maxLength={100} autoComplete="off" /><ErrorText field="address" />
        <label htmlFor={`${id}-detail`}>{text.detail}</label><input {...inputProps('detail')} value={deliveryDetail} readOnly={sameAddress} onChange={(event) => setDetail(event.target.value)} maxLength={60} autoComplete="off" /><ErrorText field="detail" />
        <p className={styles.hint}>{text.deliveryPolicy}</p>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>04 · {text.routeTitle}</legend>
        <div className={styles.choices}>{(['center', 'online', 'etc'] as const).map((value) => <label key={value}><input type="radio" name={`${id}-route`} checked={route === value} onChange={() => changeRoute(value)} />{text[value]}</label>)}</div>
        {route === 'online' && <div className={styles.columns}>
          <div><label htmlFor={`${id}-channel`}>{text.channel}</label><select {...inputProps('channel')} value={channel} onChange={(event) => { setChannel(event.target.value); setOrderNumber(''); }}><option value="">{text.choose}</option>{['SMARTSTORE', 'COUPANG', 'ELEVENSTREET'].map((value) => <option key={value} value={value}>{value}</option>)}</select><ErrorText field="channel" /></div>
          <div><label htmlFor={`${id}-orderNumber`}>{text.orderNumber}</label><input {...inputProps('orderNumber')} value={orderNumber} disabled={!channel} onChange={(event) => setOrderNumber(event.target.value)} inputMode="numeric" maxLength={20} /><ErrorText field="orderNumber" /></div>
        </div>}
        {route === 'etc' && <><label htmlFor={`${id}-etcOrder`}>{text.etcOrder}</label><input {...inputProps('etcOrder')} value={etcOrder} onChange={(event) => setEtcOrder(event.target.value)} maxLength={40} /><ErrorText field="etcOrder" /></>}
        <p className={styles.hint}>{text.routePolicy}</p>
        <label htmlFor={`${id}-memo`}>{text.memo}</label><textarea id={`${id}-memo`} value={memo} onChange={(event) => setMemo(event.target.value)} maxLength={300} rows={2} />
      </fieldset>
      <fieldset className={styles.group}>
        <legend>05 · {text.agreementSummary}</legend>
        <label className={styles.check}><input {...inputProps('agreement')} type="checkbox" checked={agreement} onChange={(event) => setAgreement(event.target.checked)} />{text.agreement}</label>
        <ErrorText field="agreement" /><p className={styles.hint}>{text.consentPolicy}</p>
      </fieldset>
      </>}
      <div className={styles.actions}><button type="submit" className={styles.primary}>{text.check}</button><button type="button" className={styles.secondary} onClick={reset}>{text.reset}</button></div>
    </form>}
    <p className={styles.note}>{text.notice}</p>
  </div>;
}
