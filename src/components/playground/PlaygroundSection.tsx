'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { usePortfolioLocale } from '@/lib/usePortfolioLocale';
import { CartPlayground } from './CartPlayground';
import { ProductOptionsDemo } from './ProductOptionsDemo';
import { FilterDemo } from './FilterDemo';
import { FormDemo } from './FormDemo';
import styles from './PlaygroundSection.module.css';

const examples = ['cart', 'options', 'filters', 'form'] as const;
type Example = (typeof examples)[number];
const copy = {
  ko: { introduction: '실제 프로젝트에서 다뤘던 UI 동작을 작은 예제로 옮겼습니다. 직접 선택하고 바꿔 보세요.', label: '체험할 UI 선택', cart: '장바구니', options: '상품 옵션', filters: '시설 필터', form: '주문 입력' },
  en: { introduction: 'Small, hands-on examples based on UI behavior from my projects. Try selecting, changing, and resetting them.', label: 'Choose a UI example', cart: 'Cart', options: 'Options', filters: 'Filters', form: 'Order form' },
};

// 패널을 숨겨도 컴포넌트는 유지해 탭 전환 중 체험 상태를 잃지 않는다.
export function PlaygroundSection() {
  const locale = usePortfolioLocale();
  const text = copy[locale];
  const [active, setActive] = useState<Example>('cart');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? examples.length - 1 : step ? (index + step + examples.length) % examples.length : -1;
    if (next < 0) return;
    event.preventDefault();
    setActive(examples[next]);
    tabRefs.current[next]?.focus();
  }

  return (
    <section id="ui-playground" className="site-section content-width" data-localized-skip aria-labelledby="ui-playground-title">
      <header className="section-header">
        <h2 id="ui-playground-title" className="section-title" lang="en">UI Playground</h2>
        <p className={styles.introduction}>{text.introduction}</p>
      </header>
      <div className={styles.tabs} role="tablist" aria-label={text.label}>
        {examples.map((example, index) => <button ref={(element) => { tabRefs.current[index] = element; }} key={example} id={`playground-tab-${example}`} role="tab" type="button" aria-selected={active === example} aria-controls={`playground-panel-${example}`} tabIndex={active === example ? 0 : -1} onClick={() => setActive(example)} onKeyDown={(event) => move(event, index)}>{text[example]}</button>)}
      </div>
      {examples.map((example) => (
        <div key={example} id={`playground-panel-${example}`} role="tabpanel" aria-labelledby={`playground-tab-${example}`} className={styles.panel} hidden={active !== example} inert={active !== example}>
          {example === 'cart' ? <CartPlayground embedded /> : example === 'options' ? <ProductOptionsDemo /> : example === 'filters' ? <FilterDemo /> : <FormDemo />}
        </div>
      ))}
    </section>
  );
}
