# 모바일 Safari 모달 위치와 스크롤 닫기 수정

2026-11-19. 사용자가 제공한 iPhone 화면을 바탕으로, 정착 후 클릭만 검사했던 이전 QA에 스크롤 직후 클릭 조건을 추가했다.

## 재현한 원인

Engineering Notes의 `.thought-list`와 Projects의 `.project-list`는 고정 모달을 담는 래퍼다. 섹션 등장 효과의 `:not(.sheet)` 선택자는 패널만 제외하고 래퍼는 제외하지 않았다. 그 결과 래퍼에 650ms 동안 translateY 전환이 걸렸다.

WebKit 모바일에서 섹션으로 이동한 뒤 25ms 안에 실제 좌표로 탭하면, 이 transform이 모달의 fixed 기준 영역을 바꿨다. 375·390·414px 세 화면 모두 첫 20ms·다음 250ms 샘플에서 패널 높이가 0이고, 화면 아래 3148~3262px에 놓였다. 약 800ms 뒤에는 정상으로 돌아가므로 전환이 끝나기를 기다린 이전 검사는 이 문제를 놓쳤다. 실물 iPhone에서 같은 상태가 영구 지속하는지까지 단정하지 않는다.

## 반영한 수정

- 섹션 등장 선택자에서 `.sheet`뿐 아니라 `.thought-list`와 `.project-list`도 제외했다. 카드·제목의 등장 효과는 유지한다.
- 마우스 휠 닫기뿐 아니라 남아 있던 터치 pull-to-close도 제거했다. 본문 스크롤은 읽기 진행 링만 갱신하며 닫기를 호출하지 않는다.
- 사용하지 않는 pull/armed 스타일·CSS 변수도 정리했다. 닫기 버튼·Escape·브라우저 뒤로가기는 유지한다.
- 같은 회귀를 막도록 프로젝트 유지 조건에 빠른 탭과 스크롤 후 열림 유지 검사를 추가했다.

## 수정 후 검증

| 검사 | 결과 |
| --- | --- |
| WebKit 390×844·375×667·414×896, 빠른 탭/정착 후 탭 | 6/6 통과. 모든 시점 패널 rect가 (0,0,viewportWidth,viewportHeight) |
| WebKit 프로젝트 대표 카드 스크롤 직후 탭 | 정상. 언어·닫기 버튼이 화면 안에 위치 |
| WebKit 260/400px touch event 반복 | 열림 유지. 합성 DOM 이벤트이며 실제 iPhone 입력 검사는 아님 |
| Chrome 390×844 native CDP touch 260/400px 반복 | 짧은 노트·긴 프로젝트 끝에서도 열림 유지 |
| Chrome 휠 추가 입력·닫기·Escape·재열기·본문 스크롤 복구 | 모두 정상 |
| Chrome 추가 회귀 | 15/15 통과, 콘솔·페이지 오류 0개 |
| WebKit 수정 후 검사 | 콘솔·페이지 오류 0개 |

WebKit 열기·닫기는 native tap으로 검사했다. 실물 iPhone의 Safari, 브라우저 주소창·OS 키보드는 직접 연결되지 않아 검증하지 않았다. 데스크톱 WebKit/모바일 에뮬레이션과 실제 기기 검사를 구분한다.

## 증거

- [원인 실측](../../output/playwright/2026-11-19-safari-fix/cause/results.json)
- [패치 후 같은 조건 실측](../../output/playwright/2026-11-19-safari-fix/cause/post-fix-results.json)
- [수정 후 390px 화면](../../output/playwright/2026-11-19-safari-fix/cause/post-390-fast.png)
- [WebKit 프로젝트·스크롤·닫기 회귀](../../output/playwright/2026-11-19-safari-fix/cause/project-regression.json)
- [Chrome native touch 회귀](../../output/playwright/2026-11-19-safari-fix/regression/chrome-results.json)
- [배포 버전 감사](../../output/playwright/2026-11-19-safari-fix/sites-version-audit.json)

기존 배포 v2에는 휠 닫기는 없지만 터치 닫기가 남아 있었다. 이를 캐시 문제로 단정하지 않고 실제 코드에서 제거했다. 인증되지 않은 요청은 401/no-store였으며 새 인증 우회 토큰은 만들지 않았다.

## 배포 확인

비공개 확인 사이트의 v3로 재배포했다. 소스 커밋은 `95d7eb4`이며 빌드·TypeScript·정적 페이지 52개 검사가 통과했다. 실제 업로드 아카이브의 JS/CSS 15개를 빌드 출력과 SHA-256으로 대조해 모두 일치했다. 배포용 정적 서버에서도 모바일 WebKit의 스크롤 직후 빠른 탭 조건을 다시 검사했다.

[수정본 열기](https://kygcode-portfolio-preview.calmdulse2.chatgpt.site/?fix=safari3). 기존에 열어둔 탭에는 이전 실행 코드가 남을 수 있으므로 새 링크로 진입한다. 접근 범위는 기존과 같이 소유자 한 명만 유지했다.
