---
name: maintain-portfolio
description: 김영근 포트폴리오의 문구·스타일·컴포넌트·인터랙션·미디어를 기존 디자인과 한영 연결을 유지하며 변경 규모에 맞춰 수정하고 검증한다.
---

# 포트폴리오 유지보수

실제 저장소는 `/Users/kimyounggeun/Desktop/kygcode-portfolio-next`다. 먼저 요청이 소규모 수정인지, 기능 변경인지 구분하고 해당 코드만 연다. 이미 확인한 경로와 사용자의 선택은 재사용한다.

## 소규모 수정

문구·색상·간격·정렬·기존 에셋 교체처럼 범위가 명확하면 추가 질문 없이 적용한다. 문구는 대응 영어 사전까지, 에셋은 해당 경로까지 확인한다.

- `npm run dev:preview`의 기존 개발 서버를 재사용한다. 실행 중이 아니면 한 번 시작한다. 개발 미리보기 주소는 `http://127.0.0.1:4175`다.
- HMR로 변경을 먼저 반영하고 해당 화면만 확인한다. 전체 빌드, 프로덕션 서버 재시작, 전체 에셋 검사, 모든 모달·스크롤 시나리오를 매번 실행하지 않는다.
- 단순 CSS·문구 수정에 새 테스트를 만들지 않는다. 문서만 바꾼 경우 앱 빌드를 하지 않는다. 타입/API 변경은 필요한 타입 검사만 추가한다.
- README·AGENTS·작업 기록은 사용법·구조·작업 규칙이 달라질 때만 수정한다. 단순 표시 값과 문구를 중복 기록하지 않는다.

## 기능 변경

새 상호작용·라우팅·공통 컴포넌트를 바꾸면 [기능별 유지 조건](references/component-invariants.md)에서 해당 항목만 읽는다. 변경한 동작의 최초 조작·복구·재조작, 관련 키보드·콘솔을 확인하고 필요한 경로를 검사한다. 모션을 바꾼 경우 reduced-motion, 레이아웃을 바꾼 경우 관련 화면 크기와 한영 줄바꿈을 확인한다.

공통 런타임·라우팅·의존성·빌드 설정을 바꾸거나 배포를 준비할 때 전체 빌드를 실행한다. 빌드에 포함된 타입 검사를 같은 상태에서 중복 실행하지 않는다. 실패·새 변경·남은 우려가 있을 때만 검사를 넓히거나 반복한다. 검증이 불가능하면 그 범위를 정확히 보고한다.

## 필요한 파일만 찾기

| 대상 | 시작 파일 |
| --- | --- |
| 섹션 조합 | `src/components/PortfolioPage.tsx` |
| 소개·이력서·경력 | `src/components/about/`, `src/components/companies/` |
| 프로젝트 카드·모달 | `src/components/projects/`, `src/data/projects.ts` |
| Engineering Notes | `src/components/thoughts/`, `src/data/projects-notes.ts` |
| 기술 스택·아이콘 | `src/components/my-stack/`, `src/data/skills.ts`, `src/components/StackIcon.tsx` |
| 스크롤 목차 | `src/components/SectionNavigation.tsx` |
| 공통 색상·타이포·간격 | `src/styles/portfolio.css` |
| 한영 문구 | `src/lib/runtime/language.js`, `project-translations.js`, `resume-translations.js` |
| 라우팅·모달·인트로 | `src/lib/runtime/portfolio.js`, `routes.js`, `landing-intro.js` |

본문과 상세 패널은 한 문서에 있다. 기존 `id`, `data-controls`, 상세 주소와 미디어 소스를 유지한다. 문구에 강조 태그가 있으면 텍스트 노드 단위 번역 키를 확인한다. 에셋을 삭제하기 전에는 카드뿐 아니라 상세 주소·포스터·SVG 내부 참조도 확인한다.
