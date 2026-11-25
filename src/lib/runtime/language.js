import { portfolioProjectEnglish } from '@/lib/runtime/project-translations';
import { portfolioResumeEnglish } from '@/lib/runtime/resume-translations';
import { updateHistory } from '@/lib/runtime/routes';

const languages = [
  { code: 'ko', label: '한국어', abbreviation: 'KO' },
  { code: 'en', label: 'English', abbreviation: 'EN' },
];

// 공통 언어 버튼을 사용하고, 기존 마크업의 버튼이 있으면 같은 인스턴스를 재사용한다.
function getLanguageControl(container) {
  const existing = container.querySelector(':scope > .language-switch');
  if (existing) return existing;

  const control = document.createElement('div');
  control.className = 'language-switch';
  control.setAttribute('role', 'group');

  for (const { code, label, abbreviation } of languages) {
    const button = document.createElement('button');
    button.type = 'button';
    button.lang = code;
    button.dataset.language = code;
    button.setAttribute('aria-label', label);
    button.textContent = abbreviation;
    control.append(button);
  }

  container.prepend(control);
  return control;
}

// 한국어 원문과 각 문맥의 속성을 기억해 현재 패널과 스크롤 위치에서 즉시 언어를 전환한다.
export function createPortfolioI18n() {
  var english = Object.assign({
    '김영근': 'Kim Young Geun',
    '여기까지 찾아오셨네요 👀': 'Oh, you found me here 👀',
    '작은 디테일을 좋아하는 프론트엔드 개발자 김영근입니다.': 'I’m Kim Young Geun, a Frontend Developer who loves the little details.',
    '김영근 · Frontend Developer': 'Kim Young Geun · Frontend Developer',
    '복지용구 스토어와 업무 시스템을 개발해 온 프론트엔드 개발자 김영근입니다.': 'Kim Young Geun is a Frontend Developer with experience in assistive equipment e-commerce and software for care teams.',
    '복지용구 스토어와 업무 시스템을 개발해 온': '',
    '프론트엔드 개발자 김영근': 'I’m Kim Young Geun, a Frontend Developer.',
    '입니다.': ' My work includes an assistive equipment store and software for care teams.',
    '기획자·디자이너·백엔드 개발자와 실제 사용 흐름을 살피고, 불분명한 요구사항을 함께 구체화합니다. 사용자가 다음에 해야 할 일을 쉽게 이해하고 작업을 끝까지 마칠 수 있도록 화면을 구현합니다.': 'I work with colleagues in product, design, and backend development to understand how people use a product and clarify what we need to build. I build interfaces that make it clear what to do next and help users complete their tasks.',
    '기획자·디자이너·백엔드 개발자와': 'I work with colleagues in product, design, and backend development to understand',
    '기획자·디자이너·백엔드 개발자': 'I work with colleagues in product, design, and backend development',
    '와': ' to understand',
    '을 살피고, 불분명한 요구사항을 함께': ' and clarify what we need to',
    '구체화': 'build',
    '실제 사용 흐름': 'how people use a product',
    '을 살피고,': ' and',
    '불분명한 요구사항을 함께 구체화': 'clarify what we need to build',
    '합니다. 사용자가 다음에 해야 할 일을 쉽게 이해하고 작업을': '. I build interfaces that make it clear what to do next and help users',
    '끝까지': 'complete their tasks',
    '마칠 수 있도록 화면을 구현합니다.': '.',
    '㈜헥톤프로젝트': 'Hecton Project',
    '복지용구 커머스와 요양기관 업무 서비스를 개발했습니다. 초기 구축부터 공통 UI 구성과 운영 이슈 대응까지 참여했습니다.': 'Developed assistive equipment e-commerce and software for care facilities, contributing from initial implementation to shared UI components and production support.',
    'DDOGA 스토어': 'DDOGA Store',
    '스토어 초기 구축과 수급자별 구매 흐름 구현. 공통 UI·Storybook 문서화와 서비스 운영 개선.': 'Built the initial store and eligibility-based purchasing flows. Created shared UI components, documented them in Storybook, and improved service operations.',
    '공통 레이아웃과 폼 구성, 수급자 조회와 소매 주문·고객 관리 화면 개발.': 'Built shared layouts and forms, along with screens for benefit recipient lookup, retail orders, and customer management.',
    '요양기관 솔루션': 'Care Facility System',
    '돌봄노트': 'Care Note',
    '수급자·간호 기록·돌봄 계획·문서 출력 구현. 보호자용 모바일 화면과 건강 기록 시각화.': 'Built resident records, nursing logs, care plans, and document exports, along with mobile screens for families and health data visualizations.',
    '사업 분사에 따라 JOA Silvercare로 고용 승계 ·': 'Transferred to JOA Silvercare following a spin-off ·',
    'U+프로야구 Web · Web App': 'U+ Baseball Web · Web App',
    '경기 중계와 하이라이트 화면 개발·유지보수. Shaka Player·PallyCon DRM 연동과 브라우저별 영상 재생 설정.': 'Developed and maintained live game and highlight screens. Integrated Shaka Player with PallyCon DRM and configured video playback across browsers.',
    'DDOGA 복지용구 스토어': 'DDOGA Assistive Equipment Store',
    '플랫폼 리뉴얼': 'Platform Redesign',
    'IMS 주문 관리': 'IMS Order Management',
    '요양기관 업무 시스템': 'Care Facility Management System',
    '사업 분사에 따라 조아실버케어로 고용승계 ·': 'Transferred to JOA Silvercare following a spin-off ·',
    '(예정)': '(expected)',
    '(주)루니젠': 'RunigenInc.',
    'U+프로야구 Web·Web App 개발 및 유지보수': 'Developed and maintained the U+ Baseball website and web app',
    'DDOGA에서': 'At DDOGA, I ',
    '색상·타이포그래피 토큰과 공통 UI를 패키지로 구성': 'packaged color and typography tokens with shared UI components',
    '하고, Storybook에 사용 예시를 정리했습니다.': ' and documented how to use them in Storybook.',
    'IMS에서는 Next.js와 MUI를 기반으로 여러 운영 화면에서 쓸 공통 레이아웃과 입력 폼을 구성했습니다.': 'For IMS, I used Next.js and MUI to build reusable layouts and forms for the back office.',
    '또하나의가족 운영 전반에서 발생한 이슈에 대응했습니다. 복지용구 스토어에서는 상품 옵션·재고·결제 흐름에서 생긴 문제를 수정했습니다.': 'I handled production issues across DDOGA. In the store, I fixed problems with product options, inventory, and checkout.',
    'Beusable로 상품 탐색에서 구매까지의 흐름을 살펴 사용자가 화면을 어떻게 이용하는지 확인했습니다.': 'I used Beusable to understand how customers moved from browsing to checkout.',
    '공단 조회로 확인한 수급자 정보에 맞춰 복지용구 상품과 급여 적용 여부를 표시했습니다.': 'I used eligibility data from Korea’s National Health Insurance Service to show which equipment could be purchased with benefits.',
    '장바구니에서': 'I built cart validation to ',
    '구매 가능 품목과 잔여 지원금 한도를 검증': 'check item eligibility and the customer’s remaining benefit allowance.',
    '하고, 급여 조건에 맞지 않으면 일반상품으로 전환할 수 있게 했습니다.': ' If a purchase didn’t qualify for coverage, customers could continue without using their benefits.',
    'IMS에서': 'In IMS, I integrated ',
    '고객 조회, 신청인 변경, 배송 메모와 필수 동의 확인': 'customer lookup, editing applicant details, delivery notes, and required consent checks',
    '을 소매 주문 입력 화면에 연결했습니다.': ' into the retail order form.',
    '요양기관 솔루션에서는 수급자 관리, 간호 기록, 급여제공계획과 문서 출력 화면을 개발했습니다.': 'For the care facility system, I built screens for resident management, nursing records, care plans, and document export.',
    'TanStack Query로 서버에서 상품 데이터를 사전 조회하고 클라이언트에서 캐시를 재사용했습니다.': 'I used TanStack Query to prefetch product data on the server and reuse the cache on the client.',
    '상품·카테고리 메타데이터, canonical URL, 상품 Product JSON-LD를 구성했습니다.': 'I configured product and category metadata, canonical URLs, and Product JSON-LD.',
    '기획자·디자이너·백엔드 개발자와 사용 흐름을 살피고, 요구사항에서 모호한 입력 조건과 예외를 구체화합니다.': 'I review workflows with product, design, and backend colleagues to clarify how forms should handle inputs and edge cases.',
    '요양기관 현장에서 간호 기능 파일럿 테스트에 참여하며 현장 직원이 기록을 남기는 흐름을 확인했습니다.': 'I took part in an on-site pilot at a care facility and observed how staff entered nursing records.',
    "새 화면을 구성할 때 참고할 수 있도록 공통 레이아웃과 입력 폼, 컴포넌트의 사용 예시를 함께 정리합니다.": "I document shared layouts, forms, and component examples so they can guide the implementation of new screens.",
    "개별 화면의 문제와 사용자가 다음 단계로 이동하는 흐름을 함께 살핍니다. 운영 중 발생한 조건을 확인하고 관련 화면과 기능을 수정합니다.": "I look at issues within individual screens as well as how people move between steps. I review the conditions behind production issues and update the affected interfaces and behavior.",
    "같은 상품도 사용자 조건에 따라 노출과 구매 방식이 달라지는 업무를 다룹니다. 수급자 정보와 구매 조건을 화면의 안내와 검증에 반영합니다.": "I build purchasing flows where product availability and purchase options depend on the customer’s eligibility. I reflect benefit information and purchase conditions in the interface and its validation.",
    "여러 정보를 함께 확인하며 진행하는 업무에서 입력 조건과 필수 확인 사항을 화면에 반영합니다. 기록 입력과 문서 출력까지 이어지는 업무 흐름을 구성합니다.": "For workflows that involve multiple records, I reflect input rules and required checks in the interface and connect record entry with document export.",
    "데이터를 언제 조회하고 화면에서 어떻게 재사용할지, 검색 엔진에 어떤 정보를 전달할지 구분해 구성합니다.": "I consider when to fetch data, how to reuse it in the interface, and which information to provide to search engines.",
    '프로젝트 미디어': 'Project media',
    '노트북을 든 김영근의 손그림 캐릭터': 'Hand-drawn character of Kim Young Geun holding a laptop',
    '맨 위로': 'Back to top',
    '닫기': 'Close',
    '슬라이드 페이지 선택': 'Choose a slide',
    '총 {total}개 중 {index}번째 슬라이드로 이동': 'Go to slide {index} of {total}',
    '프로젝트 순서': 'Project navigation',
    '이전 프로젝트': 'Previous project',
    '다음 프로젝트': 'Next project',
    'Engineering Notes 순서': 'Engineering Notes navigation',
    '이전 글': 'Previous note',
    '다음 글': 'Next note',
  }, portfolioProjectEnglish, portfolioResumeEnglish);

  var root = document.documentElement;
  var locale = /^\/en(?:\/|$)/.test(location.pathname) ? 'en' : 'ko';
  var updates = [];

  function translate(source) {
    return locale === 'en' && Object.hasOwn(english, source) ? english[source] : source;
  }

  function path(url) {
    var koreanPath = url.replace(/^\/en(?=\/|[?#]|$)/, '') || '/';
    if (koreanPath[0] !== '/') koreanPath = '/' + koreanPath;
    return locale === 'en' ? '/en' + koreanPath.replace(/^\/(?=$|[?#])/, '') : koreanPath;
  }

  function syncAddress() {
    var current = location.pathname + location.search + location.hash;
    var localized = path(current);
    if (current !== localized) updateHistory('replaceState', localized);
  }

  function onChange(update) {
    updates.push(update);
    update();
  }

  function localizeAttribute(element, attribute, source) {
    onChange(function () { element.setAttribute(attribute, translate(source)); });
  }

  function setLanguage(language) {
    if (language === locale) return;
    locale = language;
    root.lang = locale;
    root.classList.remove('is-intro-revealing');
    syncAddress();
    updates.forEach(function (update) { update(); });
  }

  function init() {
    root.lang = locale;

    var text = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (text.nextNode()) nodes.push(text.currentNode);
    nodes.forEach(function (node) {
      // 자체 언어 구독을 쓰는 React 조작 UI의 텍스트는 DOM에서 직접 교체하지 않는다.
      if (node.parentElement?.closest('[data-localized-skip]')) return;
      var original = node.data;
      var source = original.trim();
      if (!Object.hasOwn(english, source)) return;

      // 첫 화면에서 단어마다 애니메이션을 적용하므로 교체할 텍스트를 별도 요소에 둔다.
      var target = node;
      if (node.parentElement.closest('.hero-statement')) {
        target = document.createElement('span');
        node.replaceWith(target);
      }
      onChange(function () {
        var translated = translate(source);
        // 한글 조사 조각이 영문 마침표로 바뀌면 앞 공백을 남기지 않는다.
        target.textContent = locale === 'en' && /^[.,!?;:]$/.test(translated)
          ? translated
          : original.replace(source, function () { return translated; });
      });
    });

    var attributes = ['aria-label', 'alt', 'title', 'data-tip', 'data-media-description'];
    attributes.forEach(function (attribute) {
      document.querySelectorAll('[' + attribute + ']').forEach(function (element) {
        if (element.closest('[data-localized-skip]')) return;
        var original = element.getAttribute(attribute);
        if (Object.hasOwn(english, original)) localizeAttribute(element, attribute, original);
      });
    });
    var description = document.querySelector('meta[name="description"]');
    if (description) localizeAttribute(description, 'content', description.content);

    document.querySelectorAll('a[href^="/"]:not([href^="//"])').forEach(function (link) {
      if (link.closest('[data-localized-skip]')) return;
      var original = link.getAttribute('href');
      onChange(function () { link.setAttribute('href', path(original)); });
    });

    document.querySelectorAll('main, .sheet > .sheet-scroll, #resume-dialog .resume-scroll, #project-media-dialog .lightbox-inner').forEach(function (container) {
      var control = getLanguageControl(container);
      control.addEventListener('click', function (event) {
        var button = event.target.closest('button[data-language]');
        if (button) setLanguage(button.dataset.language);
      });
      onChange(function () {
        control.setAttribute('aria-label', locale === 'en' ? 'Language' : '언어 선택');
        control.querySelectorAll('button').forEach(function (button) {
          button.setAttribute('aria-pressed', String(button.dataset.language === locale));
        });
      });
    });
  }

  return {
    init: init,
    translate: translate,
    path: path,
    syncAddress: syncAddress,
    onChange: onChange,
    localizeAttribute: localizeAttribute,
  };
}
