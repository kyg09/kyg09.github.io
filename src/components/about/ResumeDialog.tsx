import { DateRange } from '@/components/DateRange';
import { StackBadges } from '@/components/my-stack/SkillStack';
import { CloseProgressRing } from '@/components/CloseProgressRing';

const resumeSkills = [
  'TypeScript', 'JavaScript', 'React', 'Next.js',
  'TanStack Query', 'Zustand', 'React Hook Form',
  'MUI', 'Tailwind CSS', 'Storybook',
  'Git', 'GitLab',
] as const;

// 프로필·경력·기술 스택을 표시하는 이력서 팝업이다.
export function ResumeDialog() {
  return (
    <dialog
      id="resume-dialog"
      className="lightbox resume-dialog"
      aria-labelledby="resume-dialog-title"
    >
      <span className="visually-hidden" id="resume-dialog-title" lang="en">
        {'Resume'}
      </span>
      <div
        className="sheet-scroll resume-scroll"
        role="region"
        aria-label="이력서 본문"
        tabIndex={0}
      >
        <article className="resume-paper" aria-labelledby="resume-name">
          <header className="resume-header">
            <h2 id="resume-name">{'김영근'}</h2>
            <p className="resume-role" lang="en">
              {'Frontend Developer'}
            </p>
            <address>
              <a href="mailto:kygcode09@gmail.com">{'kygcode09@gmail.com'}</a>
            </address>
          </header>
          <section className="resume-section">
            <h3 lang="en">{'Profile'}</h3>
            <p>
              {
                'React·Next.js·TypeScript를 기반으로 커머스와 업무 시스템의 프론트엔드를 개발합니다. 서비스 초기 구축, 복잡한 입력 폼과 업무 화면 개발, 공통 UI 구성 및 운영 개선을 맡아 왔습니다. 기획자·디자이너·백엔드 개발자와 실제 사용 흐름과 예외 조건을 정리하고, 사용자가 필요한 작업을 끝까지 마칠 수 있도록 화면을 구현합니다.'
              }
            </p>
          </section>
          <section className="resume-section resume-experience">
            <h3 lang="en">{'Experience'}</h3>
            <div className="resume-job">
              <ResumeEntry
                title="헥톤프로젝트"
                number="01."
                from="2022-05"
                to="2026-10"
              />
              <p className="resume-context">
                {'프리랜서(2022.05–2023.12) · 정규직 전환(2024.01)'}
              </p>
              <p className="resume-context">
                {'2026.11 사업 분사로 조아실버케어에 고용 승계'}
              </p>
              <section className="resume-project">
                <ResumeEntry
                  title="또하나의가족 DDOGA"
                  description="커머스·장기요양기관 탐색 서비스"
                  from="2025-03"
                  to="2026-10"
                  nested
                />
                <p>
                  {
                    '어르신과 가족이 돌봄 시설을 찾고 비교하거나, 보행기·휠체어 같은 복지용구를 구매·대여하는 서비스입니다. 복지용구 스토어는 초기 구축부터 마무리와 운영 개선까지 참여했습니다. 플랫폼 리뉴얼에는 초중반에 합류해 마무리까지 참여했습니다.'
                  }
                </p>
                <p>
                  <a href="https://ddoga.co.kr/" target="_blank" rel="noopener">
                    {'운영 서비스 ddoga.co.kr ↗'}
                  </a>
                </p>
                <ul>
                  <li>
                    <strong>{'수급자 맞춤 스토어'}</strong>
                    {
                      ' · 공단 조회를 통해 확인한 수급자 정보에 따라 상품 노출과 급여 적용 여부를 표시했습니다. 장바구니에서 구매 가능 품목과 잔여 지원금 한도를 검증하고, 급여 조건을 충족하지 않으면 일반 상품으로 전환해 구매를 이어갈 수 있도록 구현했습니다.'
                    }
                  </li>
                  <li>
                    <strong>{'렌더링·SEO'}</strong>
                    {
                      ' · TanStack Query 서버 사전 조회와 캐시 재사용, 상품·카테고리 메타데이터, canonical URL, Product JSON-LD를 구성했습니다.'
                    }
                  </li>
                  <li>
                    <strong>{'운영·UX 개선'}</strong>
                    {
                      ' · 또하나의가족 운영 전반의 이슈에 대응했습니다. 스토어에서는 옵션·재고·결제 문제를 수정하고, 뷰저블(Beusable)로 상품 탐색과 구매 흐름을 분석했습니다.'
                    }
                  </li>
                  <li>
                    <strong>{'공통 디자인 시스템'}</strong>
                    {
                      ' · 색상·타이포그래피 토큰과 공통 UI를 패키지로 구성하고 Storybook에 사용 예시를 정리했습니다.'
                    }
                  </li>
                  <li>
                    <strong>{'기관 탐색·본인확인'}</strong>
                    {
                      ' · 장기요양기관의 조건별 검색·비교와 PASS 인증 결과별 안내를 구현했습니다.'
                    }
                  </li>
                </ul>
              </section>
              <section className="resume-project">
                <ResumeEntry
                  title="IMS"
                  description="복지용구 도·소매 주문 관리 백오피스"
                  from="2024-01"
                  to="2025-02"
                  nested
                />
                <p>
                  {
                    '헥톤프로젝트가 조아실버케어를 인수한 뒤 복지용구 주문·물류 업무를 효율화하기 위해 개발한 비공개 사내 시스템입니다. 초기 프론트엔드 개발에 참여했으며, 프로젝트가 계속 진행되는 가운데 조직 개편으로 또하나의가족 팀으로 이동했습니다.'
                  }
                </p>
                <ul>
                  <li>
                    <strong>{'공통 화면 기반'}</strong>
                    {
                      ' · Next.js·MUI 기반의 공통 레이아웃과 입력 폼을 구성하고, TanStack Query로 운영 데이터 조회를 연동했습니다.'
                    }
                  </li>
                  <li>
                    <strong>{'소매 주문 입력'}</strong>
                    {
                      ' · 수급자·비수급자 검색과 정보 불러오기, 신청인 추가·변경, 주문 경로·배송 메모 입력과 필수 동의 검증을 구현했습니다.'
                    }
                  </li>
                  <li>
                    <strong>{'고객·운영 관리'}</strong>
                    {
                      ' · 고객 등록·수정, 장기요양정보와 구매·대여 가능 품목 조회, 회원 승인·반려와 권한 관리 화면을 개발했습니다.'
                    }
                  </li>
                  <li>
                    <strong>{'공지사항 에디터'}</strong>
                    {
                      ' · 등록·수정 화면에 공통 KendoReact Editor를 적용했습니다. 이미지 형식·용량을 검증하고 본문에 남은 이미지를 골라 업로드한 뒤 URL을 바꿨습니다.'
                    }
                  </li>
                </ul>
              </section>
              <section className="resume-project">
                <ResumeEntry
                  title="또하나의가족 솔루션"
                  description="요양기관 PC 업무 시스템"
                  from="2022-05"
                  to="2023-10"
                  nested
                />
                <p>
                  {
                    '요양시설 직원이 어르신의 입소부터 돌봄 계획, 간호 기록, 서류 출력까지 관리하는 PC 업무 시스템입니다. 사업 철수로 프로젝트가 종료됐습니다.'
                  }
                </p>
                <ul>
                  <li>
                    <strong>{'수급자 관리'}</strong>
                    {
                      ' · 입소대기·입퇴소·외출·외박 등 시설 운영 화면을 개발하고, 생활실·기간 필터와 Excel 일괄 등록 기능을 구현했습니다.'
                    }
                  </li>
                  <li>
                    <strong>{'기초평가·급여제공계획'}</strong>
                    {
                      ' · 욕구사정, 낙상·욕창 위험도, 인지선별검사 결과를 급여제공계획과 결과평가 화면에 연계했습니다.'
                    }
                  </li>
                  <li>
                    <strong>{'간호 업무·현장 파일럿'}</strong>
                    {
                      ' · 간호일지와 투약·바이탈 일괄 등록 화면을 개선하고, 요양기관 현장에서 간호 기능 파일럿 테스트에 참여했습니다.'
                    }
                  </li>
                  <li>
                    <strong>{'OZ Report 출력'}</strong>
                    {
                      ' · 수급자 목록·계약서·입퇴소 이력·급여제공계획서의 출력 데이터를 구성하고, 문서별 템플릿과 PDF·Excel·HML 저장 옵션을 공통 뷰어에 연동했습니다.'
                    }
                  </li>
                  <li>
                    <strong>{'돌봄노트(2023.11–2023.12)'}</strong>
                    {
                      ' · 보호자가 어르신의 건강·돌봄 기록과 청구서를 확인하고 시설에 상담을 요청하는 모바일 화면을 개발했습니다. ApexCharts로 건강 기록을 시각화했습니다.'
                    }
                  </li>
                </ul>
              </section>
            </div>
            <div className="resume-job">
              <ResumeEntry
                title="루니젠"
                number="02."
                from="2021-10"
                to="2022-03"
              />
              <p>
                {'프로야구 경기 영상을 시청하는 '}
                <strong>{'U+프로야구'}</strong>
                {
                  ' 웹·웹앱의 유지보수와 일부 기능 개발에 참여했습니다. Shaka Player에 PallyCon DRM을 연동하고 브라우저별 DASH·HLS 재생을 설정했습니다.'
                }
              </p>
            </div>
          </section>
          <section className="resume-section">
            <h3 lang="en">{'SKILL'}</h3>
            <StackBadges skills={resumeSkills} label="Skills" branded />
          </section>
          <section className="resume-section">
            <h3 lang="en">{'Education'}</h3>
            <p>
              {
                '동아대학교 국어국문학과 졸업 · 신문방송학과 부전공 · 2009.03–2016.02 · 3.63/4.5'
              }
            </p>
          </section>
          <section className="resume-section">
            <h3 lang="en">{'Military Service'}</h3>
            <p>{'육군 병장 전역 · 2011.06–2013.03'}</p>
          </section>
        </article>
      </div>
      <div className="fog fog-bottom" aria-hidden="true" />
      <button
        className="sheet-close"
        type="button"
        aria-label="이력서 닫기"
        autoFocus
      >
        <CloseProgressRing />
        <span aria-hidden="true" />
      </button>
    </dialog>
  );
}

// 회사와 하위 경력의 제목·기간을 한 영역에서 보여준다.
function ResumeEntry({
  title,
  number,
  description,
  from,
  to,
  nested,
}: {
  title: string;
  number?: string;
  description?: string;
  from: string;
  to: string;
  nested?: boolean;
}) {
  const Heading = nested ? 'h5' : 'h4';
  return (
    <div className="resume-entry">
      <Heading>
        {number && <span className="resume-company-number">{number}</span>}
        <strong>{title}</strong>
        {description && (
          <>
            {' · '}
            <span>{description}</span>
          </>
        )}
      </Heading>
      <p className="resume-dates">
        <DateRange from={from} to={to} />
      </p>
    </div>
  );
}
