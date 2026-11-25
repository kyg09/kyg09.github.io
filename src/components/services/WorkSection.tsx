import type { ReactNode } from 'react';

interface WorkItem {
  id: string;
  title: string;
  description: ReactNode;
}

// 설명에 포함된 형광펜 강조를 그대로 두고, 각 행의 콘텐츠를 한 곳에서 편집한다.
const workItems: WorkItem[] = [
  {
    id: 'work-shared-ui',
    title: 'Design Systems & Shared UI',
    description: (
      <>
        <p>
          {'DDOGA에서 '}
          <mark className="marker-highlight">
            {'색상·타이포그래피 토큰과 공통 UI를 패키지로 구성'}
          </mark>
          {'하고, Storybook에 사용 예시를 정리했습니다.'}
        </p>
        <p>
          {
            '새 화면을 구성할 때 참고할 수 있도록 공통 레이아웃과 입력 폼, 컴포넌트의 사용 예시를 함께 정리합니다.'
          }
        </p>
      </>
    ),
  },
  {
    id: 'work-product-operations',
    title: 'Product Operations & UX',
    description: (
      <>
        <p>
          {
            '개별 화면의 문제와 사용자가 다음 단계로 이동하는 흐름을 함께 살핍니다. 운영 중 발생한 조건을 확인하고 관련 화면과 기능을 수정합니다.'
          }
        </p>
        <p>
          {
            'Beusable로 상품 탐색에서 구매까지의 흐름을 살펴 사용자가 화면을 어떻게 이용하는지 확인했습니다.'
          }
        </p>
      </>
    ),
  },
  {
    id: 'work-eligibility',
    title: 'Eligibility & Checkout',
    description: (
      <>
        <p>
          {
            '같은 상품도 사용자 조건에 따라 노출과 구매 방식이 달라지는 업무를 다룹니다. 수급자 정보와 구매 조건을 화면의 안내와 검증에 반영합니다.'
          }
        </p>
        <p>
          {'장바구니에서 '}
          <mark className="marker-highlight">
            {'구매 가능 품목과 잔여 지원금 한도를 검증'}
          </mark>
          {
            '하고, 급여 조건에 맞지 않으면 일반상품으로 전환할 수 있게 했습니다.'
          }
        </p>
      </>
    ),
  },
  {
    id: 'work-back-office',
    title: 'Back-Office & Care Workflows',
    description: (
      <>
        <p>
          {'IMS에서 '}
          <mark className="marker-highlight">
            {'고객 조회, 신청인 변경, 배송 메모와 필수 동의 확인'}
          </mark>
          {'을 소매 주문 입력 화면에 연결했습니다.'}
        </p>
        <p>
          {
            '여러 정보를 함께 확인하며 진행하는 업무에서 입력 조건과 필수 확인 사항을 화면에 반영합니다. 기록 입력과 문서 출력까지 이어지는 업무 흐름을 구성합니다.'
          }
        </p>
      </>
    ),
  },
  {
    id: 'work-rendering',
    title: 'Rendering & Search Visibility',
    description: (
      <>
        <p>
          {
            '데이터를 언제 조회하고 화면에서 어떻게 재사용할지, 검색 엔진에 어떤 정보를 전달할지 구분해 구성합니다.'
          }
        </p>
        <p>
          {
            '상품·카테고리 메타데이터, canonical URL, 상품 Product JSON-LD를 구성했습니다.'
          }
        </p>
      </>
    ),
  },
  {
    id: 'work-collaboration',
    title: 'Cross-Functional Collaboration',
    description: (
      <>
        <p>
          {
            '기획자·디자이너·백엔드 개발자와 사용 흐름을 살피고, 요구사항에서 모호한 입력 조건과 예외를 구체화합니다.'
          }
        </p>
        <p>
          {
            '요양기관 현장에서 간호 기능 파일럿 테스트에 참여하며 현장 직원이 기록을 남기는 흐름을 확인했습니다.'
          }
        </p>
      </>
    ),
  },
];

// 공통 아코디언 행. 런타임이 aria-expanded와 inert를 함께 갱신한다.
function WorkAccordionItem({ item, index }: { item: WorkItem; index: number }) {
  const initiallyOpen = index === 0;
  return (
    <div className={`work-card${initiallyOpen ? ' is-open' : ''}`}>
      <h3 className="work-heading">
        <button
          className="work-trigger"
          id={item.id + '-trigger'}
          type="button"
          aria-expanded={initiallyOpen}
          aria-controls={item.id}
        >
          <span className="work-num" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="work-label" lang="en">
            {item.title}
          </span>
          <span className="work-indicator" aria-hidden="true">
            <svg
              className="work-indicator-icon"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                className="work-indicator-stroke work-indicator-stroke-left"
                d="M3.25 4.5L6 7.25"
              />
              <path
                className="work-indicator-stroke work-indicator-stroke-right"
                d="M8.75 4.5L6 7.25"
              />
            </svg>
          </span>
        </button>
      </h3>
      <div className="work-detail" id={item.id} inert={!initiallyOpen}>
        <div className="work-copy">{item.description}</div>
      </div>
    </div>
  );
}

// What I Do 섹션을 구성한다. 행 전환의 높이와 흐림 효과는 스타일에서 관리한다.
export function WorkSection() {
  return (
    <section id="services" className="site-section">
      <div className="home-body content-width content">
        <section className="how-i-work">
          <header className="section-header">
            <h2 className="section-title">What I Do</h2>
          </header>
          <div className="work-grid">
            {workItems.map((item, index) => (
              <WorkAccordionItem key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
