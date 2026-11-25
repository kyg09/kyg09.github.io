# 김영근 프론트엔드 포트폴리오

프로젝트 영상과 업무 흐름, 경력, 기술 스택을 담은 한·영 포트폴리오입니다. Next.js App Router, React, TypeScript, Tailwind CSS로 구성했습니다.

## 로컬 실행

Node.js 20.9 이상과 npm이 필요합니다. 개발과 검증에는 Node.js 24를 사용했습니다.

```sh
npm ci
npm run dev
```

일반 개발은 [http://localhost:3000](http://localhost:3000)을 사용합니다. 포트폴리오 수정용 미리보기는 `npm run dev:preview`로 [http://127.0.0.1:4175](http://127.0.0.1:4175)를 실행합니다. 개발 서버는 파일 변경을 자동 반영하므로 문구·스타일 수정마다 전체 빌드하거나 서버를 재시작하지 않습니다. 배포용 빌드는 `npm run build`, 배포 결과의 로컬 확인은 `npm start`를 사용합니다.

프로젝트 내부 import는 `@/` 별칭을 사용합니다. `@/`는 `src/`를 가리키며 `tsconfig.json`의 `paths`에서 관리합니다.

## 수정할 위치

글자색은 이름·메인 소개를 제외하면 섹션 제목보다 진하지 않게 유지합니다. 본문·회사명·카드·모달은 `--color-content-text`로 섹션 제목 색상을 재사용하며, 손그림·로고·브랜드 아이콘의 잉크와 분리합니다. 흰 플로팅 버튼과 툴팁은 반전 배경에서도 읽을 수 있는 별도 텍스트 토큰을 사용합니다.

우측 섹션 목차는 `src/components/SectionNavigation.tsx`에서 관리합니다. 소개 항목은 `Frontend Developer`로 표시하고 나머지는 실제 주요 섹션 제목을 읽습니다. 1280px 이상 화면에서 기존 본문 오른쪽에 sticky로 표시합니다. 문서 스크롤 위치는 캐시한 제목 좌표를 기준으로 추적하고, 링크·표시선은 실제 크기를 측정합니다. 목차 클릭만 해시 방문 기록을 추가하며 수동 스크롤은 주소를 바꾸지 않습니다. 인트로·상세·이력서·미디어 모달에서는 목차를 숨깁니다. 비선택 목차 링크는 은은하게 표시하고 마우스 hover·키보드 focus-within에서는 선명해집니다. 선택 링크와 표시선은 Experience 제목과 같은 `--color-section-title`을 사용합니다. 실제 투명도와 간격 값은 CSS를 기준으로 관리합니다. 모션 줄이기 설정에서는 즉시 이동하며, 좁은 화면에서는 목차를 숨깁니다.

목차 검증은 정방향·역방향·빠른 스크롤, 최하단, 링크 이동 중 휠·키보드 중단, `/projects#services` 같은 직접 해시 진입, 리사이즈·한영 전환·두 줄 링크·낮은 창 높이에서 수행합니다. 목차 내부 스크롤은 해당 영역의 `scrollTop`만 바꿔 본문 위치를 유지합니다. 스타일은 `src/styles/portfolio.css`의 `.section-navigation` 범위를 사용합니다.

첫 방문과 새로고침에는 손그림 캐릭터가 왼쪽 끝에서 검은 벽을 오른쪽으로 밀고, 움직이는 벽의 가장자리를 따라 로고와 SKIP이 드러납니다. 벽이 버튼 영역을 지나면 SKIP을 누를 수 있습니다. 벽이 화면을 벗어난 뒤에는 로고를 5초 동안 표시합니다. 로고가 헤더로 이동하기 시작하면 SKIP은 즉시 사라지고, 이동은 1.05초 동안 이어집니다. 전체 애니메이션은 약 9초입니다. 로고 SVG는 로드 2초 뒤 기존 드로잉을 시작합니다. SKIP을 누르거나 어느 단계에서든 Escape를 누르면 바로 본문을 엽니다. 벽 프레임을 불러오지 못하면 로고 장면으로 이어지고, 모션 줄이기에서는 본문으로 바로 이동합니다.

처음 벽을 미는 0.32초에는 기존 그림에서 뒷발과 손끝을 기준으로 중간 자세 세 개를 보간합니다. 디딤발이 같은 자리에 있는 동안 몸이 앞으로 기울고 벽이 첫 보폭만큼 움직입니다.

Projects와 Engineering Notes는 화면 너비에 맞춰 여러 카드를 가로로 보여 줍니다. `.card-rail[data-loop]`에는 위 1.5rem·아래 3rem의 여유를 두고 음수 마진으로 섹션 간격을 유지합니다. Engineering Notes의 제목 영역은 최대 620px, 개별 카드는 최대 320px입니다. 페이지 점은 미리보기의 보이는 하단을 기준으로 두 섹션의 간격을 맞춥니다. 활성 캡슐은 중앙 카드의 실제 위치를 따릅니다. 관련 스타일은 `src/styles/portfolio.css`에서 관리합니다.

Experience는 선택한 2열 확장형을 사용합니다. 왼쪽에는 영문 회사명과 기간, 오른쪽에는 담당 범위와 프로젝트별 역할을 배치합니다. 프로젝트와 회사 사이에 여백을 두고 회사 사이에만 구분선을 둡니다. 좁은 화면에서는 회사 정보가 설명 위로 이동합니다. 세부 간격과 반응형 기준은 CSS에서 관리합니다. 내용과 공통 프로젝트 링크는 `src/components/companies/ExperienceSection.tsx`, 간격·타이포그래피는 `src/styles/portfolio.css`의 `.experience-list`에서 관리합니다. 손그림 밑줄·미리보기·기존 상세 모달 연결은 공통 런타임을 재사용합니다.

Engineering Notes 아래 미디어 갤러리의 상단 간격은 `src/styles/portfolio.css`의 `#playground`에서 관리합니다.

Engineering Notes 상세 모달은 짧은 글을 세로 중앙에 배치합니다. 화면보다 긴 글은 위에서부터 스크롤할 수 있습니다. 정렬은 `src/styles/portfolio.css`의 `.thought .sheet-scroll`과 `.thought .sheet-inner`에서 관리합니다.

Engineering Notes 카드는 흰 배경에 흑백 손그림 도식과 짧은 요약을 표시합니다. 도형의 선에는 기존 `hand-drawn` 필터와 밑줄 마스크를 사용하며 작은 글자는 선명하게 유지합니다. 제목의 핵심 구절은 노란 형광펜으로 강조합니다. 도식은 `src/components/thoughts/NoteGraphic.tsx`와 대응 CSS 모듈, 제목 강조와 요약은 `src/data/projects-notes.ts`에서 관리합니다.

Projects는 Engineering Notes와 같은 카드 형태 안에 기존 영상을 상단에 유지하고, 아래에 실제 서비스명·기간·역할 요약을 함께 표시합니다. 한국어 카드 제목은 `src/data/projects.ts`의 `preview.title`에서 관리하며 상세 모달 제목과 구분합니다. 영어 전환에서도 대응하는 서비스명을 표시합니다. 영상은 원본 비율을 유지하며 중앙 카드만 재생합니다. 카드를 클릭하면 기존 영상과 설명이 있는 상세 모달이 열립니다. 소개 영역의 호버 미리보기와 하단 갤러리는 카드의 같은 원본 영상을 재사용합니다.

Projects와 Engineering Notes는 마지막 다음에 첫 카드, 첫 카드 이전에 마지막 카드가 이어지는 무한 루프입니다. 페이지 점, 키보드 화살표, 모바일 스와이프, 마우스 드래그, 가로 휠로 이동할 수 있으며 상세 화면의 이전·다음도 순환합니다. 자동 이동은 기본으로 꺼져 있으며 `data-autoplay` 속성을 붙인 캐러셀에서 활성화합니다. 트랙 양끝의 시각용 사본은 키보드·스크린 리더 탐색에서 제외하며 영상은 포스터만 표시합니다. 상세 ID와 한·영 주소는 원본에 연결합니다. 트랙 구조는 `src/components/projects/GalleryShared.tsx`, 이동과 사본은 `src/lib/runtime/portfolio.js`, 페이지 점은 `src/lib/runtime/rail-pagination.js`, 간격과 클리핑은 `src/styles/portfolio.css`에서 관리합니다.

첫 진입 시 개발자 콘솔에 브랜드 ASCII 아트와 인사말, 연락처를 이스터에그로 표시합니다. 새 문서마다 한 번 출력하며 같은 문서 안의 언어·상세 화면 전환에서는 반복하지 않습니다. 아트와 콘솔 스타일은 `src/lib/runtime/console-welcome.js`, 인사말 번역은 `src/lib/runtime/language.js`에서 관리합니다.

What I Do는 첫 번째 항목을 기본으로 펼쳐 표시합니다. 열린 항목을 다시 누르면 접히고, 다른 항목을 열면 이전 항목은 닫힙니다. 초기 상태는 `src/components/services/WorkSection.tsx`, 전환 동작은 `src/lib/runtime/portfolio.js`에서 관리합니다.

푸터 마지막에는 모든 언어에서 `© 2026 Kim Young Geun. All rights reserved.`를 표시합니다. 제작 연도는 2026년으로 고정하며 이메일과 같은 글자 크기를 사용합니다. 문구의 아래쪽을 페이지 맨 아래에서 정확히 50px 위에 배치하고, 푸터 내부 여유 공간으로 이메일과 겹치지 않게 합니다. 문구는 `src/components/PortfolioFooter.tsx`, 위치·크기는 `src/styles/portfolio.css`의 `.site-footer`와 `.footer-copyright`에서 관리합니다.

Open to work와 플로팅 이력서 버튼으로 연 이력서를 마우스·터치로 닫으면 시작 버튼에 포커스 표시가 남지 않습니다. 키보드로 닫을 때는 시작 버튼으로 포커스를 돌려 Enter로 다시 열 수 있습니다. 이 동작은 `src/lib/runtime/resume.js`에서 관리합니다.

모바일에서는 이름 옆 캐릭터, 로고 그리기, 소개 장식, 밑줄, 기술 스택 색상·툴팁, 카드·영상과 버튼의 hover 효과가 누르는 동안 표시됩니다. 카드 제목과 경력 프로젝트 미리보기도 누르는 동안 나타납니다. 손을 떼거나 터치 취소·드래그·스크롤·화면 이탈 시 해제합니다. 공통 터치 처리는 `src/lib/runtime/portfolio.js`의 `initTouchFeedback`, 시각 효과는 `src/styles/portfolio.css`의 `.is-touch-active` 선택자로 관리합니다. 데스크톱 hover와 키보드 동작은 유지합니다.

기술 스택 아이콘은 모바일에서 누르는 동안 브랜드 색상으로 표시되며 손을 떼거나 스크롤로 터치가 취소되면 기본 색상으로 돌아옵니다. 데스크톱 hover와 키보드 포커스에서도 색상이 표시됩니다. 타일은 `src/components/SkillTile.tsx`, 공통 터치 상태는 `src/lib/runtime/portfolio.js`, 색상은 `src/styles/portfolio.css`에서 관리합니다.

손그림 밑줄은 데스크톱에서 마우스를 올리거나, 모바일에서 해당 문구·링크·이메일 버튼을 누르는 동안 강조됩니다. 손을 떼거나 터치가 취소되거나 스크롤하면 기본 밑줄로 돌아오며, 키보드로 링크와 버튼에 포커스해도 강조됩니다. 터치 입력 처리는 `src/lib/runtime/portfolio.js`, 스타일은 `src/styles/portfolio.css`에서 관리합니다.

본문 섹션은 처음 화면에 들어올 때 20px 위로 떠오르며 650ms 동안 나타납니다. 소개는 기존 첫 화면 효과를 사용하며, 이미 보이는 섹션과 직접 접속한 위치는 즉시 표시합니다. 모션 줄이기 설정에서는 섹션 등장 효과를 생략합니다. 동작은 `src/lib/runtime/portfolio.js`, 스타일은 `src/styles/portfolio.css`에서 관리합니다.

모바일(768px 이하)의 플로팅 이력서 버튼은 아이콘만 표시하며, TOP 버튼과 같은 2.75rem(기본 44px) 크기를 사용합니다. 버튼 문구는 스크린 리더용으로 유지합니다. 두 버튼은 `src/components/FloatingControls.tsx`와 `src/styles/portfolio.css`에서 관리합니다.

이력서 모달의 섹션 소제목은 상단 이름과 같은 글자색을 사용합니다. 경력에서는 회사명을 프로젝트명보다 크게 표시하고, 업무 제목도 볼드로 표시합니다. 조아실버케어는 헥톤프로젝트 하위 경력에 배치합니다. SKILL은 공통 `StackBadges`를 사용해 대표 색상의 아이콘을 한 목록으로 보여 줍니다. 이력서 내용과 기술 목록은 `src/components/about/ResumeDialog.tsx`에서 관리합니다.

| 수정할 부분 | 위치 |
| --- | --- |
| 전체 섹션 배치 | `src/components/PortfolioPage.tsx` |
| 소개, 회사별 경력, 이력서 | `src/components/about/`, `src/components/companies/` |
| 프로젝트와 Engineering Notes | `src/components/projects/`, `src/components/thoughts/`, `src/data/projects.ts`, `src/data/projects-notes.ts` |
| 기술 스택 섹션 | `src/components/my-stack/SkillStack.tsx` |
| Playground와 미디어 확대 | `src/components/playground/` |
| 기술 아이콘 및 프로젝트별 배지 | `src/data/skills.ts`, `src/components/StackIcon.tsx` |
| What I Do | `src/components/services/WorkSection.tsx` |
| 인트로, 모달, 갤러리, 언어 전환 | `src/lib/runtime/` |
| 색상, 폰트, 간격, 애니메이션 | `src/app/globals.css`, `src/styles/portfolio.css` |

한국어 상세 주소는 `/projects/uplus-baseball`, 영어 상세 주소는 `/en/projects/uplus-baseball`처럼 동작합니다. 영어 문구는 `src/lib/runtime/`의 `language.js`, `project-translations.js`, `resume-translations.js`에서 관리합니다. 강조 표시가 섞인 문장은 표시 앞뒤도 각각 번역 키이므로 JSX의 한국어 문구와 함께 수정합니다.

## 체험형 장바구니와 일상 소개

`src/components/playground/PlaygroundSection.tsx`는 장바구니·상품 옵션·시설 필터·주문 입력의 네 가지 예제를 탭으로 표시합니다. 숨긴 패널도 마운트를 유지해 체험 중 상태를 보존합니다. `CartPlayground.tsx`는 DDOGA에서 다룬 수급자별 장바구니 상태를 가상 상품·금액으로 재구성한 예제입니다. `src/lib/cart-playground.ts`가 상품 묶음·선택 건수·수량·재고·지원금·삭제 복구의 순수 상태와 계산을 관리합니다. 수급자별 가상 프로필을 전환해 품목별 급여 구매 가능 수량·지원금 잔액·본인부담 구분을 확인합니다. 프로필별 장바구니 상태는 독립 보관하며 복지용구 일반가 구매와 원래의 일반케어상품을 구분합니다. 주문 조건을 확인하면 실제 주문 대신 미리보기를 표시합니다. 실제 서비스 API는 연결하지 않습니다. 모델 검사는 `npm run check:cart`로 실행합니다. 원본 구매 조건과 예제의 차이는 [구현 근거](docs/ui-playground-source-notes.md)에 정리했습니다.

상품 옵션은 제품 유형·색상의 종속 선택, 여러 조합 추가, 동일 옵션 수량 병합, 기존 담긴 수량을 포함한 옵션별 재고 검증을 보여줍니다. 주문 입력은 가상 고객 정보 불러오기, 신청인·배송지 선택과 주문 경로에 따른 필드 변경, 필수 동의 확인을 하나의 흐름으로 구성합니다.

`src/components/about/BeyondCode.tsx`는 독서·이북리더기, 클래식 음악, 차, 웨이트 운동을 소개합니다. 네 손그림 오브제를 선반 형태로 배치하며, 선택하면 하단 소개가 바뀝니다. 호버·키보드 포커스·터치 누름은 각 오브제의 짧은 동작을 재생하고 모션 감소 설정에서는 정적인 그림으로 표시합니다. 두 새 섹션은 `src/lib/usePortfolioLocale.ts`로 기존 언어 버튼을 구독하며, 자체 한영 문구를 가진 React 영역은 `data-localized-skip`으로 DOM 번역에서 제외합니다. 언어를 바꿔도 장바구니 조작 상태는 유지됩니다.

하단 스크롤 미디어 갤러리는 현재 `PortfolioPage.tsx`에서 주석 처리되어 있습니다. 코드와 에셋은 보관하며, 복원할 때 import와 렌더링 주석을 함께 해제합니다.

## 에셋 위치

| 내용 | 위치 |
| --- | --- |
| 프로젝트 영상 6개와 대응 포스터 6개 | `public/assets/portfolio-concepts/` |
| 기능 확대 이미지 14개 | `public/assets/portfolio-concepts/details/` |
| 로컬 미디어 제작 원본·이전 목업 (Git·배포 제외) | `media-sources/portfolio-concepts/` |
| Push Wall 애니메이션 프레임 | `public/assets/intro/push-wall/`, `src/lib/runtime/push-wall-poses.ts` |
| 인트로·프로필 SVG | `public/assets/kyg-code-intro.svg`, `public/assets/profile-character.svg` |
| 파비콘과 웹폰트 | `public/favicon.ico`, `public/favicon.svg`, `public/fonts/` |
| 캐러셀 라이브러리 | `public/assets/vendor/blossom-carousel/` |
| 기술 아이콘과 본문 워드마크 | `src/components/StackIcon.tsx`, `src/components/Wordmark.tsx` |

Projects는 대표 DDOGA 스토어를 본문 폭으로 먼저 보여 주고, 나머지 작업은 캐러셀로 표시합니다. 서비스명·기간·요약·담당 영역과 영상을 한 카드에 담습니다. `src/data/projects.ts`의 `caseStudy`는 상세의 Overview·My Role·Key Flow·Implementation을 관리하고 `ProjectFlow`가 업무 흐름을 순서 목록으로 표시합니다. Engineering Notes는 두 열 그리드이며, `src/data/projects-notes.ts`의 짧은 소개와 `sections`가 상세 글을 구성합니다. 대표·그리드·캐러셀은 기존 상세 주소와 모달의 이전·다음 이동을 공유합니다.

하단 스크롤 갤러리는 기존 20개 배치를 유지하면서 원본 영상 6개와 기능 확대 이미지 14개를 섞습니다. 구성은 `src/lib/runtime/gallery-items.js`, 이미지는 `public/assets/portfolio-concepts/details/`에서 관리합니다. `scripts/extract-project-stills.swift`로 기존 영상에서 화면을 추출하며 실제 사용법은 스크립트 상단에 있습니다. 이미지와 영상 모두 선택·확대·닫기와 키보드 포커스 복구를 지원합니다. 미디어 교체 시 프로젝트 데이터의 영상·포스터와 갤러리 manifest의 이미지 경로를 함께 확인합니다.

PC 프로젝트 4개의 macOS 기본 바탕화면·메뉴 막대·Safari 창 영상과 모바일 프로젝트 2개의 iPhone 목업 영상은 `scripts/render-device-videos.swift`로 재생성합니다. macOS의 AVFoundation·CoreGraphics를 사용해 기존 시연 영상과 공식 PC 캡처에서 서비스 화면만 분리하고 기기 프레임을 합성합니다. 실제 재생 파일과 포스터는 `src/data/projects.ts`에서 선택하며 `public/`에는 사이트에서 제공할 최종 미디어만 둡니다.

재편집용 `*-exact.*`, 전체 PC 캡처 `macOS-sources/`, 배경 입력 `macOS-wallpapers/`와 이전 목업은 로컬 `media-sources/portfolio-concepts/`에 보관합니다. 이 폴더는 `.gitignore`로 제외하므로 새 체크아웃에는 포함되지 않습니다. 재생성할 때 별도로 보관한 원본을 같은 하위 폴더 구조로 준비한 뒤 아래 명령을 실행합니다. 원본 보관 위치를 바꾸더라도 두 번째 인자인 공개 출력 폴더는 유지합니다.

```sh
swift scripts/render-device-videos.swift media-sources/portfolio-concepts public/assets/portfolio-concepts
```

설명 문구는 영상에 넣지 않습니다. macOS 배경의 배정은 `scripts/media-wallpapers.json`에서 관리하며 `asset` 값은 원본 입력 폴더를 기준으로 한 상대경로입니다. 모바일 목업은 서비스 색상에 맞춘 밝은 배경을 사용합니다. 제작 원본을 다시 `public/`에 복사하면 화면에서 사용하지 않더라도 공개 다운로드 대상이 되므로 원본과 최종 파일을 분리합니다.

## 공유 미리보기

파비콘 표시는 투명 데이터 아이콘으로 비활성화했으며, 원본 `public/favicon.ico`와 `public/favicon.svg`는 보관합니다. 공유 카드 이미지는 `public/assets/branding/`에 한국어판과 영어판을 두고, 제목과 설명은 `src/lib/site-metadata.ts`에서 관리합니다.

배포할 공개 주소가 정해지면 배포 환경 변수 `SITE_URL`에 프로토콜을 포함한 주소를 넣고 다시 빌드합니다. 로컬에서 공개 주소 설정을 시험할 때는 `.env.example`을 복사해 `.env.local`에 값을 넣을 수 있습니다. 링크를 공유할 때는 외부에서 열 수 있는 배포 주소를 사용합니다.

## GitHub Pages 자동 배포 준비

목표 주소는 `https://kyg09.github.io`이며, **현재 배포는 비활성화**되어 있습니다. `npm run build:pages`로 정적 산출물을 만들고 `npm run check:pages`로 공개 주소·공유 이미지·배포 파일을 검사합니다. 기존 개발·Next 서버 실행 명령은 유지합니다.

[배포 설정과 활성화 절차](docs/github-pages.md), [배포 전 보안 검토](docs/security-review-2026-11-25.md)를 먼저 확인합니다. 현재 소스 저장소 `kyg09/kyg-Code`에서는 배포하지 않으며, 지정 저장소·main·활성화 변수와 보안 검사가 모두 통과해야 게시됩니다. GitHub Pages는 공개 호스팅이므로 이전 소유자 전용 미리보기와 접근 범위가 다릅니다.

## 사이트맵

[전체 사이트맵](docs/sitemap.md)에 한·영 전체 주소와 공개 배포 시 검색 설정을 정리했습니다. `/sitemap.xml`은 페이지와 같은 주소 목록에서 생성되며, `/robots.txt`는 제작 중 크롤링 차단 정책을 유지합니다.

## 검사

아래 명령을 매번 모두 실행하지 않습니다. 문구·스타일 변경은 개발 미리보기와 변경 부분만 확인하고, 타입·에셋·배포 영향이 있을 때 해당 명령을 선택합니다.

```sh
npm run check:assets
npm run typecheck
npm run build
```

`npm run check:assets -- --list-unused`로 경로가 연결되지 않은 공개 파일 후보를 확인할 수 있습니다. 이 검사는 소스에 적힌 `/assets/`, `/fonts/`, 파비콘 URL을 찾습니다. 조합해서 만드는 URL이나 외부에서 직접 쓰는 경로가 있으면 사용처를 별도로 확인합니다.

## 작업 기록과 에이전트 지침

명확한 소규모 수정은 관련 코드 편집 → 개발 서버 자동 반영 → 변경 부분 확인 → 짧은 결과 안내로 진행합니다. 이미 선택한 안이나 명확한 값은 다시 묻지 않고, 결과에 영향을 주는 정보가 부족할 때만 인터뷰합니다. 수정 화면을 먼저 보여주고 관련 검증을 이어가되, 미실행 검증을 완료로 보고하지 않습니다.

검증은 변경 영향에 맞춥니다. 문구·색상·간격은 해당 화면과 필요한 한영 문구만, 컴포넌트·상태 동작은 타입과 해당 조작·복구·키보드만 확인합니다. 라우팅·공통 런타임·빌드 설정·의존성을 바꾸거나 배포를 준비할 때는 관련 경로와 전체 빌드를 검사합니다. 에셋 검사는 파일 경로·미디어·아이콘을 바꾼 경우에만 실행합니다. 빌드를 실행했다면 그 안의 타입 검사를 같은 상태에서 반복하지 않습니다.

README는 사용법·실행 방법·구조가 바뀔 때, AGENTS와 스킬은 작업 규칙이 바뀔 때 갱신합니다. 매번 두 문서를 함께 수정하거나 단순 색상·간격 수치를 중복 기록하지 않습니다. 기능별 유지 조건은 스킬의 `references/component-invariants.md`에서 필요한 항목만 읽습니다. 커밋·푸시는 사용자의 요청이 있을 때 변경 검토와 관련 검증을 마친 뒤 진행합니다. 권한 거절은 우회하거나 반복 요청하지 않고 미확인 범위를 안내합니다.

- [개발·마이그레이션 기록](docs/development-notes.md)에 사용한 기술과 도구, 이전 작업 범위, 검증 항목을 정리했습니다.
- [AGENTS.md](AGENTS.md)에는 작업 범위 확인과 키보드 검증 지침이 있습니다.
- [포트폴리오 유지보수 스킬](.agents/skills/maintain-portfolio/SKILL.md)에는 화면과 미디어 수정 절차가 있습니다. 새 작업에서 `$maintain-portfolio`를 지정할 수 있습니다.

Git에 공유할 때는 소스, 공개 에셋, `package-lock.json`, 문서와 프로젝트 스킬을 포함합니다. 설치 파일, 빌드 결과, 로컬 환경값, 검사 출력, 검사 임시 파일는 `.gitignore`에 정리했습니다. Git을 사용하기 전에는 이 폴더에서 `git rev-parse --show-toplevel`로 작업 대상이 포트폴리오 저장소인지 확인합니다.

## 소개 마커와 푸터 대화

메인 소개는 공식 Kokonut UI 레지스트리의 `MarkerText`·`Mark`를 사용합니다. 원본을 `npx shadcn@latest add https://kokonutui.com/r/marker-text.json`으로 작업본에 설치한 뒤, 제품과 무관한 Replay 데모를 제외하고 `src/components/kokonutui/marker-text.tsx`에 통합했습니다. 펜의 압력·도형 생성·SVG 마스크·260–820ms 타이밍은 원본을 유지하며, 기존 이름 호버는 변경하지 않습니다. `HeroMarkerText.tsx`가 hover/공통 터치 상태로 원본의 `show`를 제어합니다. 언어·줄바꿈·폰트 변경 후 재측정하고 기존 첫 문장 단어 등장 동작을 유지합니다. 외부 아이콘 데모를 포함하지 않으므로 런타임 의존성을 추가하지 않았습니다. MIT 고지는 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)에 있습니다.

`FooterConversation.tsx`는 DesignBookmark의 [Streaming reply](https://designbookmark.com/motion#db-streaming-reply)를 React로 구성합니다. 원본 `stream.js`의 입장 300/22, 말풍선 크기 260/26, 단어 340/26, Thinking 300/30 스프링과 70ms 단어 간격·4회 서브스텝을 유지합니다. 캐릭터가 실제로 보인 뒤 축소·페이드하고, 프로필에 근거한 고정 Q&A 세 개를 누적합니다. 실제 AI 요청이나 외부 API는 사용하지 않습니다. 고정된 대화 영역 아래에 새 질문·답변이 나타나면 이전 대화를 위로 밀어 올립니다. 별도 스크롤 UI 없이 내용의 실측 폭·높이에 맞춰 말풍선을 키우고 질문·답변은 같은 글자 크기를 사용합니다. 로고·이메일은 재생 중 제자리를 유지하며, 위로 스크롤해 대화 영역을 벗어나면 캐릭터와 대화를 초기화하고, 다시 캐릭터가 보이면 처음부터 재생합니다. 탭을 숨긴 동안은 일시 중지하며, 모션 감소 설정에서는 완성된 대화를 즉시 표시합니다.

우측 목차의 `Contact`는 `#contact` 푸터로 이동하며 `/contact`와 `/en/contact`로 직접 접근할 수 있습니다. 숨김 표제로 목차 기준을 제공하고 화면에는 기존 로고·이메일만 유지합니다. 소개 마커는 채움 없이 주황·파랑·초록·빨강 선을 사용합니다. 대화의 생각 중 문구는 원본 1.4초 shimmer를 재사용하며 실제로 보이는 동안만 재생합니다.
