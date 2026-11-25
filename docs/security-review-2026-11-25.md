# 공개 배포 전 보안 검토와 수정 결과

검토·수정일: 2026-11-25. 기준 소스는 `15fe3c7`과 이번 배포 준비 변경이다. 대상은 `kyg09.github.io` 정적 호스팅이다.

## 결론

최초 발견한 의존성 경고(Critical 1·High 2)는 **Next.js 16.4.6과 잠금파일 갱신 후 0건**으로 해결했다. 제작 원본·미사용 목업 24개를 공개 폴더 밖의 Git 제외 경로로 옮겼으며 최종 영상·포스터·상세 이미지와 화면 디자인은 유지했다. 실제 주문·고객 API와 연결되거나 외부 입력이 실행 코드에 삽입되는 경로는 확인되지 않았다.

기술적 배포 검증은 통과했다. 폰트·영상의 이용 조건과 회사 계약상 공개 허용 여부까지 보안 검사가 보증하는 것은 아니다. 폰트 유지에 관한 소유자의 선택과 남은 확인 범위는 PUB-002에 기록했다. GitHub의 인증·저장소·Pages 설정 상태는 실제 푸시 및 배포 단계에서 별도로 확인한다.

## 범위와 신뢰 경계

URL 경로·해시, 브라우저 저장소, Playground 입력, React와 공통 DOM 런타임, 정적 메타·자체 호스팅 vendor/SVG/미디어, npm 잠금파일과 Git 추적 이력을 확인했다. 개발·빌드 환경과 공개 브라우저, GitHub Actions build와 OIDC deploy를 별개 경계로 보았다. Pages에는 Next 서버·API·Server Actions가 없다.

## 수정·잔여 항목

### SEC-001 — 해결: 알려진 취약 의존성

- 최초 `package.json:20`의 Next 16.2.6, Next 내부 PostCSS 8.4.31, sharp 0.34.5에서 경고가 발생했다.
- Next 16.4.6, 내부 PostCSS 8.5.23, sharp 0.35.5로 갱신했다. `npm ci --ignore-scripts` 조건의 깨끗한 설치와 정적 build·TypeScript·산출물 검사를 통과했다. audit 결과는 0건이다.
- 서버 기능에 관한 advisory를 정적 사이트의 확인된 원격 공격으로 과장하지 않았다. 경고 예외·`--force`·audit 무시 옵션을 넣지 않았고 새 High/Critical 경고 또는 조회 오류가 나면 배포를 중단한다.
- 근거: [Next.js 릴리스](https://github.com/vercel/next.js/releases/tag/v16.4.6), [최초 Next advisory 예시](https://github.com/advisories/GHSA-2464-fhr4-w9xw), [PostCSS](https://github.com/advisories/GHSA-r28c-9q8g-f849), [sharp](https://github.com/advisories/GHSA-wq5f-xc86-pv6w).

### SEC-002 — 낮은 잔여 위험: CSP 방어 계층 미설정

- `src/app/layout.tsx:28`의 고정 가드와 Next bootstrap/RSC가 인라인 스크립트를 사용한다. 확인된 DOM 삽입은 고정 콘텐츠 또는 신뢰 가능한 버튼 복사로, 외부 입력 XSS 경로는 발견하지 못했다.
- 완전한 CSP는 페이지별 해시와 런타임·캐러셀 스타일 호환 검증이 필요하다. `'self'`만 넣어 hydration을 깨뜨리거나 `unsafe-inline`을 허용하고 해결됐다고 표시하지 않았다. 현재는 낮은 방어 계층 보강 항목으로 남긴다.
- GitHub Pages의 meta CSP로 `frame-ancestors`나 응답 헤더 정책을 대신할 수 없다. 인증·개인 데이터 처리 기능을 추가하면 재평가한다.

### PUB-001 — 현재 배포 결과에서 해결: 제작 원본 공개

- public의 재편집 입력·배경 20개와 미사용 옛 목업 4개를 `media-sources/portfolio-concepts/`로 이동했다. `.gitignore`에서 이 폴더와 `output/` 전체를 제외한다. SHA-256으로 이동 파일 보존을 확인했다.
- 공개 파일은 75개·33.05 MiB에서 51개·16.40 MiB로 줄었다. 최종 영상 6개·포스터 6개·상세 이미지 14개·폰트 5개는 유지했다.
- `scripts/check-pages-export.mjs`에서 `*-exact.*`, macOS-sources, macOS-wallpapers 및 옛 목업이 다시 산출물에 들어오면 게시를 차단한다. 렌더러는 비공개 입력 경로를 받도록 사용법을 갱신했다.
- 이동 커밋은 기존 Git 이력을 삭제하지 않는다. 새 공개 저장소를 만들 때는 현재 검토한 파일의 스냅샷만 옮기고, 기존 저장소를 공개로 전환하거나 과거 이력 전체를 옮기기 전에 별도 확인한다.

### PUB-002 — 사용 조건 확인 범위와 소유자 선택

- **ABC Areal:** 제작사가 무료로 공개한 사실을 확인했다. [공식 발표](https://abcdinamo.com/news/areal-a-refresh-of-arial-made-for-are-na), [무료 폰트·웹 이용 조건](https://abcdinamo.com/licenses). 무료 공개가 폰트 파일에 대한 임의의 오픈소스 재허가를 의미하지는 않는다.
- **KP Duo Sans Trial:** `src/styles/portfolio.css:33`·`:41`에서 사용한다. 소유자는 폰트를 유지하고 배포하도록 요청했다. 이 Trial 파일의 공개 배포 허용을 독립적으로 확정하지 않았으며, 비상업용이라는 이유만으로 허가됐다고 표시하지 않는다. [제작사](https://type.kontrapunkt.com/en/fonts/kp-duo-sans-serif), [이용 조건](https://type.kontrapunkt.com/en/end-user-license-agreement).
- Apple 배경이 포함된 기존 기기 시연 영상은 소유자의 기존 요청대로 유지하고 원본 배경은 공개/Git 경로에서 분리했다. 배경·폰트·방송/회사 이미지의 계약·구매 라이선스는 보안 검사 범위 밖이다. `THIRD_PARTY_NOTICES.md`에 출처와 확인 한계를 기록했다.

### PUB-003 — 현재 소스에서 해결: 내부 경로·레퍼런스 작성자 링크

- `docs/ui-playground-source-notes.md`의 회사 저장소 절대경로·내부 인터페이스·원본 함수 참조를 제거하고 현재 데모 모델과 상대경로 설명으로 정리했다. 가상 값과 실제 API 미연결 설명은 유지했다.
- `src/components/PortfolioFooter.tsx`의 숨겨진 레퍼런스 작성자 소셜 링크를 삭제했다. 보이는 이메일·로고·캐릭터·대화 UI는 유지했다.
- 과거 Git 이력에는 이전 문서·원본이 남는다. 이력 재작성이나 기존 저장소 공개 전환은 자동 수행하지 않는다.

## 확인한 안전한 동작

- URL 경로는 고정 ID 매칭과 `getElementById`로 처리하며 HTML에 직접 삽입하지 않는다. 잘못된 해시 인코딩도 처리한다.
- React 폼 출력은 JSX로 escape하고 공통 번역은 `textContent`를 사용한다. 실제 고객·결제·AI API를 호출하지 않는다.
- Copy Link는 사용자가 클릭하면 현재 origin의 `/` 또는 `/en/`만 복사한다. query/hash를 외부로 보내지 않는다.
- 활성 코드에서 인증 토큰 저장·외부 분석/원격 실행 스크립트·postMessage 수신·동적 코드 평가 경로를 발견하지 못했다. SVG의 스크립트/이벤트 실행 참조도 발견하지 못했다.
- 최초 추적 173파일, 로컬 refs에서 도달 가능한 27커밋·363 blob 버전의 고확도 비밀값 패턴 탐지 0. 이후 이력서 3개 파일의 변경에도 새 비밀값·외부 실행 경로가 없음을 추가 확인했다. 미추적 환경값·설치·빌드 결과는 Git에서 제외한다.
- 이미지 50개의 GPS·작성자·소유자·장비 일련번호 메타 탐지 0. 대표 IMS/솔루션/돌봄노트 이미지는 예시 대상자·식별값으로 구성돼 있었다. 공식 사이트 입력 PNG 4개에서도 고객정보·계정명을 발견하지 못했다. 동영상 전 프레임을 검사한 것은 아니다.

## 자동배포 보호

공식 Actions 커밋 SHA 고정, 읽기 전용 build, checkout 자격정보 미보존, lock 기반 설치와 lifecycle script 차단을 유지한다. deploy에만 Pages/OIDC 권한을 주고 검증된 `out/`만 전달한다. PAT·SSH 키·별도 저장소 push 토큰은 workflow에 없다.

`kyg09/kyg09.github.io` 저장소, main, push/수동 실행, `ENABLE_GITHUB_PAGES=true`가 모두 맞아야 업로드·배포한다. 현재 origin `kyg09/kyg-Code`와 PR/fork에서는 배포되지 않는다. workflow의 환경 이름만으로 GitHub의 승인자·브랜치 보호가 설정되는 것은 아니다. noindex/robots는 접근 제한이 아니며 Pages 게시물은 공개된다.

## 검증

- Node.js 24 clean install(`npm ci --ignore-scripts`) 및 보안 검사 0건.
- Next.js 16.4.6 정적 production build와 포함된 TypeScript 검사 통과. 한국어·영어 및 상세 주소 56개 생성 작업 완료.
- 자산 누락 0개, 장바구니 모델 검사 30개 통과. 제작 입력 12개의 새 경로 존재 확인.
- 산출물 검사와 원본 재유입 차단 검증. 기존 workflow YAML·권한·SHA·조건 검사에서 72조합 중 목표 main의 활성화된 push/수동 실행 2조합만 허용.
- 실제 GitHub Actions·Pages 실행 결과와 최종 푸시 정보는 배포 진행 결과로 별도 안내한다. 브라우저·서버 검증은 실행한 범위만 최종 결과에 포함한다.

패턴·정적 분석은 모든 비밀값/취약점이 없다는 보장이 아니다. 미추적 파일·dangling 객체·로컬에 없는 원격 refs·회사 계약·폰트 구매권·모든 영상 프레임은 보장 범위 밖이다. 공개 후 새로운 기능·의존성·콘텐츠를 추가하면 다시 검토한다.
