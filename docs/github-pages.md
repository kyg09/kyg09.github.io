# GitHub Pages 자동 배포 준비

목표 주소는 `https://kyg09.github.io`다. 현재 소스 저장소 `kyg09/kyg-Code`의 프로젝트 Pages 주소(`/kyg-Code/`)로는 배포하지 않는다. 앱이 루트 기준 에셋·상세 주소를 사용하기 때문이다. 이 문서와 workflow를 추가하는 것만으로 배포되지는 않는다.

## 현재 동작

- main push·main 대상 PR·수동 실행은 설치, 자산·장바구니 검사, 정적 빌드, 산출물 검사, 의존성 보안 검사를 실행한다.
- 업로드와 배포는 **저장소 `kyg09/kyg09.github.io` + main 브랜치 + push/수동 실행 + 저장소 변수 `ENABLE_GITHUB_PAGES=true`**가 모두 맞을 때만 실행한다. 변수가 없거나 false이면 배포하지 않는다. PR은 배포할 수 없다.
- 2026-11-25 재검증에서 Next.js 16.4.6과 갱신된 잠금파일의 npm 보안 경고는 0건이었다. 이후 새 High/Critical 경고나 조회 오류가 발생하면 배포를 중단한다.
- 빌드 job은 `contents: read`만 사용하고 checkout 인증정보를 남기지 않는다. 배포 job에만 `pages: write`, `id-token: write`를 주며, 같은 실행의 검증된 `out/`만 OIDC로 게시한다. PAT·SSH 키가 필요 없다.
- Actions는 공식 저장소에서 확인한 커밋 SHA에 고정했다. Dependabot이 npm·Actions 업데이트 PR을 제안하며 자동 병합은 설정하지 않았다.

## 로컬 검증

Node.js 24에서 실행한다. Pages 전용 빌드가 공개 주소를 지정하므로 로컬 `.env`의 다른 주소로 OG가 생성되지 않는다.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run check:assets
npm run check:cart
npm run build:pages
npm run check:pages
npm audit --audit-level=high
```

`build:pages`는 `STATIC_EXPORT=true`, `SITE_URL=https://kyg09.github.io`로 `next build`를 실행해 `out/`을 만든다. `check:pages`는 필수 경로·OG·사이트맵·로컬 에셋, 링크 파일·개발 파일·소스맵·일부 비밀값 패턴을 검사한다. 개인정보나 모든 비밀값을 자동 판정하는 도구는 아니다. 일반 `npm run build`/`npm start`와 개발 서버 동작은 기존대로 유지한다. 정적 결과는 `next start`가 아니라 정적 파일 서버로 확인한다.

## 실제 배포를 결정한 후

1. [보안 검토 보고서](security-review-2026-11-25.md)의 공개 자산·라이선스 확인 항목을 검토하고 최신 보안 검사를 통과시킨다. 실제 회사 화면의 공개 허용 여부는 별도로 확인한다.
2. GitHub에서 `kyg09.github.io` 저장소를 준비하고 검토한 소스를 옮긴다. GitHub Free에서 Pages를 쓰려면 공개 저장소가 필요하므로 현재 파일과 Git 이력의 공개 범위도 확인한다. 이 작업은 아직 수행하지 않았다.
3. 저장소 **Settings → Pages → Source → GitHub Actions**를 선택하고 HTTPS를 확인한다.
4. **Settings → Environments → github-pages**에서 배포 브랜치를 main으로 제한한다. 필요한 경우 플랜에서 지원하는 required reviewers를 설정한다. workflow의 `environment` 이름만으로 이 정책이 생기는 것은 아니다. main의 PR/상태 검사 보호도 설정한다.
5. **Settings → Secrets and variables → Actions → Variables**에 저장소 변수 `ENABLE_GITHUB_PAGES`를 `true`로 추가한다. 공개 허용을 결정하기 전에는 설정하지 않는다. 이 값은 비밀키가 아니다.
6. main에 검토한 코드를 push하거나 Actions에서 workflow를 수동 실행한다. 이후 main push마다 검증 성공 시 자동 배포된다.
7. 첫 배포에서 `/`, `/en/`, 프로젝트·노트 상세 주소의 직접 진입·새로고침, 영상·공유 이미지와 실제 응답 헤더를 확인한다. Actions의 `github-pages` 환경 링크에서 배포 주소를 확인할 수 있다.

GitHub 저장소와 배포 설정·푸시는 이번 작업에서 변경하지 않았다. 되돌리려면 `ENABLE_GITHUB_PAGES`를 false로 바꿔 이후 배포를 중단한다. **이 설정만으로 이미 공개된 사이트가 내려가지는 않는다.** 게시 중단은 Pages 설정에서 별도로 수행하고, 콘텐츠 복구는 검토한 이전 커밋을 새 커밋으로 되돌린 후 재배포한다.

## 공개·검색 정책

GitHub Pages는 소유자만 보는 미리보기가 아니다. 게시한 HTML·영상·이미지는 URL을 아는 사람이 내려받을 수 있다. 현재의 noindex/robots 차단은 유지하며 이는 접근 제어가 아니다. 정적 사이트는 Next 서버/API/Server Actions를 제공하지 않는다. `public/` 전체가 산출물에 복사되므로 미사용 원본도 따로 검토해야 한다.

GitHub Pages는 앱이 임의 응답 헤더를 지정하는 Next 서버가 아니다. CSP 같은 방어 계층은 플랫폼 제약을 고려해 별도로 적용·검증해야 하며, YAML에 헤더를 적는 방식으로 해결되지 않는다. 현재 실행 화면을 깨뜨릴 수 있는 CSP를 임의로 추가하지 않았다.

## 근거

- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub Pages 사이트 생성과 저장소 조건](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Next.js static export](https://nextjs.org/docs/app/guides/static-exports)
