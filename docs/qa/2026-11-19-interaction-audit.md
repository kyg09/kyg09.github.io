# 포트폴리오 모바일 데스크톱 동작 점검 보고서

검사일: 2026-11-19 · 기준 소스: `137e0e6` 및 검사 중 사용자가 요청한 두 수정. 대상은 실제 원본 `/Users/kimyounggeun/Desktop/kygcode-portfolio-next`, 로컬 검증 주소는 `http://127.0.0.1:4175`이다.

> 후속 수정: 모바일 Safari의 스크롤 직후 클릭 문제를 추가 재현해 수정했고, 터치 스크롤 닫기도 제거했다. [후속 수정과 검증](2026-11-19-safari-modal-fix.md)을 함께 확인한다. 아래는 최초 감사 시점의 재현 기록이다.

## 핵심 판단

사용자가 느낀 “눌렸는데 막히거나 모달이 열린 것 같은 느낌”에는 서로 다른 원인이 겹친다. 가장 먼저 고칠 것은 **동작 결과가 현재 화면 밖에 표시되는 문제**다. 장바구니의 경고와 데스크톱 확인 요약은 DOM과 포커스만 바뀌고 사용자가 보고 있는 위치에는 나타나지 않는다. 버튼을 다시 눌러도 이유를 알기 어렵다.

그다음은 **모달의 실제 입력 범위**다. Chrome에서는 모달 내부 Tab 순환이 유지됐지만 WebKit에서는 배경 SKILL 타일로 포커스가 빠졌다. 모바일의 헤더 이력서와 캐러셀 이웃 카드는 의도적으로 첫 입력에서 열리지 않는 구조이며, 짧은 노트는 스크롤하려는 터치가 닫기로 해석된다. 이 세 항목은 기존 설계가 동작하는 것이지만 현재 사용성 불편과 직접 연결된다.

반복 열기·닫기·Escape·브라우저 뒤로·본문 복귀 검사에서는 **영구적인 스크롤 잠금이 남는 현상은 재현되지 않았다.** 입력 무시, 결과 위치, 포커스 이탈을 모두 “스크롤 잠금 버그”로 묶어 고치면 원인을 놓친다.

## 이번에 반영한 변경

| 요청 | 반영 내용 | 회귀 결과 |
| --- | --- | --- |
| 마우스 휠로 모달 닫기 제거 | `portfolio.js`의 wheel 누적·임계치·자동 close 리스너 제거. 일반 본문 스크롤과 닫기 버튼·Escape는 유지 | Chrome·WebKit에서 짧은 노트와 긴 프로젝트의 끝에서 추가 휠 입력 후 열림 유지. Escape/닫기 후 본문 스크롤 복구 통과 |
| Projects 대표 카드 최대 크기 축소 | `.project-featured { inline-size: min(100%, 480px); margin-inline: auto; }` | 320·375·390·844·1440·2560px 폭 확인. 넓은 화면 최대 480px, 영상 가로세로비 1.6 유지, 문서 가로 오버플로우 없음 |

최초 패치에서는 터치로 끝을 위로 당겨 닫는 기능을 구분해 유지했으나, 후속 제보 확인 후 이 기능도 제거했다. 아래 M05는 수정 전 재현 기록이다. 분석 중 발견한 나머지 문제를 임의로 수정하지 않았다.

## 환경과 검증 범위

| 환경 | 실행 형태 | 범위와 한계 |
| --- | --- | --- |
| Chrome 157.0.8103.79 데스크톱 | 설치된 실제 Chrome의 독립 headless 세션, 1440×900 | 메뉴·카드·프로젝트 6개·노트 7개·이력서·언어·스크롤·키보드·데모·푸터. 최대 카드 폭은 2560×1440에서도 별도 확인 |
| Chrome 모바일 | 같은 Chrome에서 `isMobile`·`hasTouch`, 390×844 | 실제 CDP 터치 시작·이동·종료·취소 및 탭 사용. 320·375px, 가로 844×390 추가. 실물 Android/iPhone 검증은 아님 |
| 실제 macOS Safari 27.2 | Safari 앱 UI 조작 | 대표 프로젝트 클릭 열기 → 모달 EN → Right로 다음 → 브라우저 뒤로 닫기 네 동작 확인 |
| WebKit 26.5 | Playwright 1.62.1, 1440×900·390×844·375×667 | Safari 계열 엔진의 폭넓은 동작 검증. 실제 Safari 앱·실물 iOS와 동일하다고 간주하지 않음 |

Safari WebDriver는 원격 자동화가 비활성화돼 세션을 만들지 못했다. Safari 설정은 바꾸지 않았다. 앱 UI 보조 검사 도중 사용자 입력 변경이 감지돼 추가 네이티브 UI 조작을 중단했다. 따라서 **실제 Safari 전체 자동화와 실물 iOS Safari 검증을 완료했다고 주장하지 않는다.** 모바일 OS 키보드, 주소창 접힘, 엣지 뒤로가기, VoiceOver는 별도 확인 범위다.

## 실행 결과 해석

- Chrome Playground·Beyond Code의 상태/복구 검사: **169개 assertion 통과**, 오류 콘솔·페이지 오류 0개.
- Chrome 아코디언·SKILL·푸터·인트로 추가 검사: **177개 assertion 통과**, 오류 콘솔·페이지 오류 0개.
- 공통 Chrome 탐색·모달·화면 폭·추가 요청 회귀: **42개 유효 검사 통과**. 닫힘을 700ms에 관찰한 1개 조기 샘플은 900ms 종료 애니메이션 전이므로 판정에서 제외했고 종료 후 해제를 확인했다.
- Source 가설 교차 검증: Chrome 8개 시나리오, **32개 상태 기록**. 서로 다른 시나리오 수와 assertion 수를 합산한 성공률은 제시하지 않는다.
- WebKit 공통 48개: 43개 통과, 3개 실패는 동일한 모달 포커스 이탈 문제, 2개는 모바일 WebKit에서 휠 API를 지원하지 않는 검사 수단 제한. 후속 8개는 모두 통과했고 모바일 이력서 열기·닫기는 탭으로 재검증했다.

위 숫자는 **기능 상태가 바뀌었는지**에 관한 검사다. 기능 assertion이 통과해도 결과가 화면 밖에 있으면 사용자 경험은 실패다. 아래 결함은 별도 viewport 좌표·스크린샷으로 판정했다.

## 발견 사항과 우선순위

P1은 주요 조작 결과를 확인하기 어려워 다음 작업을 막는 문제, P2는 특정 입력·브라우저의 접근성 또는 조작성 문제, P3는 후속 정리와 정책 검토 항목이다.

| ID | 우선순위 | 문제 | 확인 환경 |
| --- | --- | --- | --- |
| M01 | P1 | 장바구니 주문 경고가 현재 화면 밖에 생성됨 | Chrome 데스크톱·모바일, B/C 네 조합 4/4 |
| M02 | P1 | 데스크톱 Cart·Options 완료 요약 제목이 화면 위로 사라짐 | Chrome 데스크톱 두 흐름 2/2 |
| M03 | P2 | WebKit 모달에서 Tab 포커스가 배경으로 이탈 | WebKit 데스크톱·두 모바일 크기 |
| M04 | P2 UX | 헤더 이력서가 첫 입력과 빠른 재입력을 무시 | Chrome·WebKit, 데스크톱·모바일 |
| M05 | P2 UX · 후속 수정 완료 | 짧은 노트를 위로 쓸면 바로 닫힘 | Chrome 터치 390×844 |
| M06 | P2 UX | 이웃 카드는 첫 탭에 이동, 두 번째에 모달 열림 | Chrome 데스크톱·모바일 |
| M07 | P2 | 요약에서 수정 복귀한 키보드 포커스가 화면 아래에 있음 | Chrome 데스크톱·모바일 네 조합 4/4 |
| M08 | P2 UX | 모바일 옵션 삭제 버튼의 가로 터치 영역이 좁음 | Chrome coarse pointer 375·390px |
| M09 | P3 | 닫기 타깃·하프틱 후 포커스 정리 | WebKit |
| M10 | 정책 검토 | 언어 변경 후 Back에서 이전 언어로 복원되지 않음 | Chrome 데스크톱·모바일 |

### M01 장바구니 경고가 보이지 않음

재현: UI Playground → 장바구니 → 예시 수급자 B → 하단으로 이동 → 주문 조건 확인. 경고는 나타나고 DOM focus도 옮겨지지만 사용자가 보는 화면에는 없다. C 프로필에서도 품목 구매 가능 수량 경고가 같은 방식으로 숨는다.

| 화면 | B 경고 top/bottom | C 경고 top/bottom |
| --- | --- | --- |
| 1440×900 | -753.70 / -582.53px | -777.70 / -586.14px |
| 390×844 | -1319.94 / -1120.38px | -1405.94 / -1145.20px |

원인: `CartPlayground.tsx:324`의 `focus({ preventScroll: true })`와 목록 위쪽에 배치된 경고(`:520`). 실제 body overflow는 visible이라 스크롤 잠금은 아니다.

개선: CTA 가까이에 경고를 표시하거나 경고가 화면 밖일 때만 최소 거리로 정렬한 뒤 포커스한다. 오류를 무조건 새 모달로 바꾸거나 body를 잠그는 방식은 피한다.

[클릭 직후 사용자가 보는 화면](../../output/playwright/2026-11-19-audit/playground/alert-mobile-budget-user-viewport.png) · [위쪽에 생성된 실제 경고](../../output/playwright/2026-11-19-audit/playground/alert-mobile-budget-revealed.png) · [좌표 원본](../../output/playwright/2026-11-19-audit/playground/alert-visibility.json)

### M02 완료 요약이 보이지 않음

재현: 정상 A 프로필 → Cart 주문 조건 확인, 또는 Options 두 조합 추가 → 선택 내용 확인. 데스크톱에서는 새 요약 제목이 각각 top -741.70px, -361.14px에 놓인다. 포커스와 상태는 전환되지만 사용자는 위쪽을 다시 찾아야 한다. 같은 모바일 검사에서는 제목이 화면 안에 있었으므로 모바일 전체로 일반화하지 않는다.

원인: Cart `:324`, Options `ProductOptionsDemo.tsx:79`의 preventScroll focus와 본문 교체 후 위치 보정 부재. 개선은 결과 제목의 가시성을 확인한 뒤 정렬·포커스하는 공통 전환 처리다.

[Cart 직후 화면](../../output/playwright/2026-11-19-audit/playground/transition-desktop-cart-preview.png) · [Options 직후 화면](../../output/playwright/2026-11-19-audit/playground/transition-desktop-options-review.png)

### M03 WebKit 모달 포커스 이탈

재현: 대표 프로젝트에 키보드 포커스 → Enter → Tab. 열린 모달 뒤의 SKILL 타일로 포커스가 간다. 다음 Tab은 모달 KO, 그다음은 다시 배경이다. 세 크기에서 재현됐고 별도 20회 반복에서 각각 10회 이탈했다.

Chrome의 18회 Tab/Shift+Tab은 모달 안에 유지됐다. 다만 배경 버튼이 실제 접근성 트리에 남는 점도 확인했다. 실제 VoiceOver 가상 탐색은 미실행이다.

원인 후보: `portfolio.js`의 모달 열기(`:855` 부근)에서 배경 inert를 설정하지 않고, Tab 처리(`:1266` 부근)는 계산한 첫/마지막 요소만 감싼다. 개선: 공통 모달 관리에서 배경 inert 적용·해제를 보장하고 WebKit의 제목/언어/닫기/화살표 Tab 순환을 검증한다.

[포커스 반복 원본](../../output/playwright/2026-11-19-audit/safari/webkit-focus.json) · [실패 화면](../../output/playwright/2026-11-19-audit/safari/webkit-desktop-project-keyboard-tab-trap-and-escape-FAIL.png)

### M04 상단 이력서 입력 게이트

재현: Open to work를 한 번 탭 → 미열림. 100~160ms 안에 다시 탭 → 여전히 미열림. 문구가 전환된 뒤 다시 누르면 열린다. 데스크톱도 hover 직후 빠른 클릭은 무시된다. 플로팅 Resume는 한 번에 열린다.

원인: `resume.js:23–31`의 첫 터치 return과 label opacity <0.99 return. 원래 “View Resume 상태에서만 클릭” 요청대로 구현된 동작이므로 기능 회귀로 단정하지 않는다. 다만 사용성은 일관되지 않다. 모바일에서는 첫 탭으로 열거나 항상 명확한 이력서 라벨을 제공하는 방향의 설계 판단이 필요하다. 헤더 실제 타깃 높이도 약 17.55px로 작다.

[빠른 재탭 후](../../output/playwright/2026-11-19-audit/source-runtime/s01-mobile-rapid.png) · [기다린 뒤 재탭](../../output/playwright/2026-11-19-audit/source-runtime/s01-mobile-delayed.png)

### M05 짧은 노트의 터치 닫기

재현: 첫 Engineering Note → scrollHeight=clientHeight=844px, scrollTop=0 → 위로 260px 쓸기. 한 번의 읽기 제스처로 닫히고 목록으로 돌아간다. 일반 스크롤과 닫기를 구별하기 어렵다.

원인: `portfolio.js:1002–1084`에서 처음부터 끝인 짧은 글도 pull 임계치에 도달하면 close한다. 마우스 휠 삭제와 별개인 touch 동작이다. 개선: 짧은 콘텐츠에서는 비활성화하거나 별도 핸들/명시적인 닫기 제스처로 제한한다.

[쓸기 전](../../output/playwright/2026-11-19-audit/source-runtime/s05-note-before-end-swipe.png) · [쓸기 후](../../output/playwright/2026-11-19-audit/source-runtime/s05-note-after-end-swipe.png)

### M06 캐러셀 첫 입력의 차이

재현: 중앙이 아닌 IMS 카드 첫 탭 → IMS가 중앙으로 이동, URL은 목록, 모달 없음. 두 번째 탭 → IMS 상세가 열린다. 대표·중앙 카드는 첫 입력에 열린다.

원인: `portfolio.js:1439–1452`에서 비활성 카드 click을 중앙 이동으로 소비한다. 의도된 캐러셀 설계다. 개선은 첫 탭을 열기로 통일하거나 “선택 후 열기” 상태를 더 명확히 드러내는 방식이며, 단순 클릭 실패로 분류하지 않는다.

### M07 수정 복귀 포커스 가시성

Cart “장바구니로 돌아가기”, Options “선택 수정하기” 후 복구된 CTA의 bottom은 데스크톱 989/944px(화면 높이 900), 모바일 1242/1289px(높이 844)로 화면 아래다. 4/4 재현. DOM 포커스 복원만으로 완료로 판단하면 놓치는 문제다. CTA가 보이지 않을 때만 최소 스크롤하거나 첫 수정 필드로 복귀하도록 보완한다.

### M08 작은 터치 영역

Options 삭제 버튼은 fresh 모바일 coarse pointer에서 약 20.77×44px이다. 수량 +/-는 44×44px로 정상이다. `ProductOptionsDemo.module.css:57`은 세로만 늘린다. 글자 크기를 바꾸지 않고 실제 가로 누름 영역도 확보하는 방식이 적절하다. 실제 삭제 실패로 측정한 것은 아니다.

### M09와 M10 후속 정리

- 닫기 애니메이션 중에는 약 900ms까지 페이지 잠금이 유지된다. 700ms 샘플에서는 닫힌 것처럼 보여도 정리 중이었으며, 종료 후에는 정상 해제됐다. 영구 잠금과 구분해야 한다.
- 닫기 버튼은 40×40px, 좌우 화살표는 44×44px이다. 모양은 유지하면서 닫기의 입력 영역을 확장할 수 있다.
- WebKit에서 포인터로 닫은 뒤 하프틱용 숨김 switch input에 포커스가 남는다. 다시 열기·스크롤은 정상이나 키보드로 전환할 때 정리할 수 있다.
- KO 프로젝트에서 EN으로 전환한 뒤 Back하면 `/en`과 영어를 유지한다. Forward는 EN 프로젝트로 열린다. 전역 언어 유지 정책으로 볼 수 있어 단독 오류 확정은 하지 않는다.

## 정상 확인한 범위

- 인트로 Escape·SKIP·새로고침 재생·모션 감소 즉시 종료와 페이지 잠금 해제.
- 프로젝트 6개·노트 7개 이전/다음 순환, 대표 카드 열기, 같은 카드 반복 재열기, 닫기·Escape·뒤로가기·직접 상세 주소.
- 모달 언어 전환, 플로팅 이력서 한 번 열기·닫기·재열기, 모달 내부 스크롤과 닫은 뒤 본문 스크롤 복구.
- Contact Scrollspy·Top 복귀·상단 비노출, 본문 KO/EN 왕복.
- 메인 소개의 네 색 Marker와 이름 효과의 hover·터치·손 뗌·취소 정리, Experience 링크의 영상 미리보기·모달 연결·복귀. 닫힌 뒤 커서가 원래 링크 위에 남으면 미리보기가 다시 뜨는 것은 정상 hover이며, 커서 이탈/Tab 후 사라짐을 추가 확인했다.
- Cart 수급자·재고·수량·지원금·일반가·선택금액, 삭제→되돌리기→재삭제→초기화 후 재조작.
- Options 상위/하위 종속·중복 합산·재고 상한·삭제/복구·확인/수정; Filter 적용/편집/취소/정렬; Form 검색·신청인·배송·주문 경로·동의·오류 교정·요약/수정/초기화.
- 네 Playground 탭의 방향키/Home/End, 비활성 패널 hidden/inert와 선택 상태 보존.
- What I Do 6개 열기·재닫기·빠른 교차 입력. 접힌 항목은 Chrome 실제 접근성 트리에서 제외됨.
- SKILL 툴팁의 키보드 Escape·재포커스, 터치 공통 상태의 누름·드래그·취소·손 뗌 정리.
- Beyond Code 선택·Enter·Space·한영 유지·터치 스크롤 취소 후 재조작.
- Footer 실제 KO/EN 3턴 완성, 질문/답변 동일 폰트 크기, 마지막 말풍선 가로·세로 잘림 없음, 위로 이탈 reset 후 재진입 replay.

## 검증 한계와 오탐 제외

- 실물 iOS의 소프트 키보드·입력 자동 확대는 미확인이다. 일부 입력/선택은 12~13px라 iPhone에서 확인할 필요가 있다. 에뮬레이션으로 자동 확대를 재현했다고 쓰지 않는다.
- 모바일 WebKit에서 휠 API 미지원은 제품 결함이 아니다. 해당 두 경우는 탭 기반 재검증과 데스크톱 wheel 회귀로 보완했다.
- Playwright 합성 ariaSnapshot은 닫힌 inert 문단을 출력했지만 Chrome 실제 AX에서는 제외됐다. 접힌 문단의 접근성 결함으로 오판하지 않았다.
- Experience 모달 종료 후 미리보기 재표시를 잔류로 판정한 초기 보강 검사의 1개 FAIL은 원래 링크 위 hover 복원이었다. 별도 실제 입력 재검사에서 커서 이탈/Tab 후 숨김과 모달·touch-active 정리를 확인해 제품 결함에서 제외했다. 최초 기록과 보강 근거를 함께 보존했다.
- 최초 Chrome 캡처가 hydration 이전에 caret 숨김 스타일을 잠시 삽입하면서 경고가 난 1건은 자동화 간섭이었다. 초기 캡처 없는 fresh context에서 오류 0개로 재확인했고 유효 콘솔 집계에서 제외했다.
- 처음부터 페이지가 아닌 버튼과 입력을 직접 조작했다. evaluate는 상태/좌표 측정과 일부 테스트 초기 조건 준비에 사용했다. 데모의 상태를 내부 함수로 직접 바꿔 통과 처리하지 않았다.
- 외부 운영 사이트의 실제 구매/로그인, 외부 메일 앱 실행, OS 클립보드 성공, 실물 VoiceOver는 이번 로컬 동작 점검 범위 밖이다.

## 권장 수정 순서

1. **결과 가시성 공통 처리:** 경고·완료·수정 복귀에서 화면 가시성을 측정하고 최소 정렬 후 focus한다. Cart와 Options를 먼저 고친다.
2. **모달 입력 범위 공통화:** 배경 inert, WebKit Tab/Shift+Tab, 모든 종료 경로의 복귀를 한 규칙으로 정리한다.
3. **터치 조작 규칙 결정:** 헤더 이력서·이웃 카드·짧은 노트의 첫 입력/닫기 의도를 일관되게 만든다.
4. **입력 영역과 실기기 확인:** 삭제·닫기·헤더 버튼의 실제 누름 영역을 넓히고, iPhone 키보드·확대·주소창 상태를 마지막으로 검증한다.

## 배포용 빌드와 공개 범위

프로덕션 정적 빌드와 TypeScript 검사가 통과했다. 56개 생성 항목 중 실제 페이지 경로 52개, 대표 6개 주소의 정적 리소스 참조 192개를 확인했다. 빌드 결과를 별도 로컬 정적 서버에서 열어 대표 카드 480px·노트 끝 추가 휠 후 열림 유지·Escape 닫기·영문 IMS 직접 주소를 다시 확인했다. 원본 개발 서버와 프로덕션 결과를 구분해 검사했다.

요청한 두 변경은 기존 [비공개 확인 사이트](https://kygcode-portfolio-preview.calmdulse2.chatgpt.site)에 반영했다. 접근 권한은 소유자 1명이고 외부 방문자·그룹은 없다. 배포 소스 커밋은 `2622478`이다. 로컬 원본의 변경은 별도 요청 없이 GitHub에 커밋·푸시하지 않았다.

## 상세 증거와 재실행 자료

- [검사 인벤토리](../../output/playwright/2026-11-19-audit/inventory.md)
- [Playground 상세 보고서](../../output/playwright/2026-11-19-audit/playground/findings.md) · [유효 결과](../../output/playwright/2026-11-19-audit/playground/validated-results.json)
- [추가 상호작용 보고서](../../output/playwright/2026-11-19-audit/playground/extra-coverage.md) · [유효 결과](../../output/playwright/2026-11-19-audit/playground/extra-coverage-validated.json)
- [Safari WebKit 보고서](../../output/playwright/2026-11-19-audit/safari/findings.md)
- [소스와 실제 동작 교차검증](../../output/playwright/2026-11-19-audit/source-runtime/source-runtime.md)
- [메인 소개와 Experience 보강](../../output/playwright/2026-11-19-audit/source-runtime/intro-marker.md)
- [Chrome 공통 회귀 원본](../../output/playwright/2026-11-19-audit/chrome/results.json)
- [검사 대상 파일 해시](../../output/playwright/2026-11-19-audit/source-hashes.json)

증거 PNG와 JSON은 `.gitignore`의 `output/playwright/` 아래에 보관했다. 앱 소스에서 이번에 바뀐 것은 위의 휠 닫기 제거와 대표 카드 폭 제한 두 가지다.
