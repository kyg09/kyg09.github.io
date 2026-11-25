# 전체 사이트맵

한국어 22개와 영어 22개, 총 44개 주소를 제공합니다. 섹션과 상세 패널은 공통 포트폴리오 화면에서 열리며 각 주소로 직접 접속할 수 있습니다.

## 메인과 섹션

| 화면 | 한국어 | 영어 |
| --- | --- | --- |
| 홈 | `/` | `/en` |
| 소개 | `/about` | `/en/about` |
| 경력 | `/companies` | `/en/companies` |
| 프로젝트 | `/projects` | `/en/projects` |
| 기술 스택 | `/my-stack` | `/en/my-stack` |
| What I Do | `/services` | `/en/services` |
| Engineering Notes | `/thoughts` | `/en/thoughts` |
| Playground | `/playground` | `/en/playground` |

## 프로젝트 상세

| 내용 | 한국어 | 영어 |
| --- | --- | --- |
| JOA Silvercare | `/projects/joa-silvercare` | `/en/projects/joa-silvercare` |
| Hecton Project | `/projects/hecton-project` | `/en/projects/hecton-project` |
| DDOGA · Assistive Equipment Store | `/projects/ddoga-store` | `/en/projects/ddoga-store` |
| DDOGA · Platform Redesign | `/projects/ddoga-platform` | `/en/projects/ddoga-platform` |
| IMS · Order Management | `/projects/ims` | `/en/projects/ims` |
| DDOGA · Care Facility Management | `/projects/care-solution` | `/en/projects/care-solution` |
| Care Note · Family Mobile App | `/projects/care-note` | `/en/projects/care-note` |
| U+ Baseball · Web Video Playback | `/projects/uplus-baseball` | `/en/projects/uplus-baseball` |

## Engineering Notes 상세

| 내용 | 한국어 | 영어 |
| --- | --- | --- |
| Building a Shared UI Package | `/thoughts/on-taste` | `/en/thoughts/on-taste` |
| Improving DDOGA in Production | `/thoughts/operating-a-welfare-store` | `/en/thoughts/operating-a-welfare-store` |
| Handling Benefit Eligibility in Checkout | `/thoughts/prompting-naturally` | `/en/thoughts/prompting-naturally` |
| Server Prefetching & Product SEO | `/thoughts/rendering-and-product-seo` | `/en/thoughts/rendering-and-product-seo` |
| Building IMS Order Intake | `/thoughts/ims-order-intake` | `/en/thoughts/ims-order-intake` |
| Care Records & Document Export | `/thoughts/care-records-and-document-export` | `/en/thoughts/care-records-and-document-export` |

## 검색엔진용 파일과 유지보수

- `/sitemap.xml`: 모든 한·영 주소와 대응 언어 URL을 자동 생성합니다.
- `/robots.txt`: 사이트맵 위치를 안내합니다. 현재는 제작 중이므로 전체 크롤링을 차단합니다.
- `src/lib/site-routes.ts`: 페이지 사전 생성과 XML 사이트맵이 공유하는 주소 목록입니다. 프로젝트와 노트 상세는 각 데이터의 `slug`를 읽으므로 데이터 추가 시 자동 반영됩니다.
- 이 문서의 표는 현재 주소를 정리한 것이므로 섹션이나 데이터를 변경하면 함께 갱신합니다.

## 공개 배포 시

1. 배포 환경의 `SITE_URL`에 실제 공개 주소를 설정하고 다시 빌드합니다. 미설정 상태에서는 로컬 주소로 생성됩니다.
2. `src/app/layout.tsx`의 `robots` 메타데이터를 검색 허용으로 변경합니다.
3. `src/app/robots.ts`의 `disallow: "/"`를 `allow: "/"`로 변경합니다.
4. `/sitemap.xml`의 도메인과 상세 주소를 확인하고 검색엔진 관리 도구에 제출합니다.

현재 사이트맵을 추가한 것만으로 검색 노출이 활성화되지는 않습니다. 실제 배포 설정은 아직 변경하지 않았습니다.
