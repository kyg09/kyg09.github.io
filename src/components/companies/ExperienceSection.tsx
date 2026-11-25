import type { ReactNode } from 'react';
import { DateRange } from '@/components/DateRange';

// 기존 상세 주소와 패널 ID를 재사용해 경력에서도 같은 프로젝트를 엽니다.
function ExperienceProjectLink({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <a
      className="experience-project"
      href={`/projects/${slug}`}
      data-controls={`projects-${slug}`}
      aria-haspopup="dialog"
      aria-expanded="false"
    >
      {children}
    </a>
  );
}

// 왼쪽은 회사·기간, 오른쪽은 담당 범위와 프로젝트별 역할을 표시합니다.
export function ExperienceSection() {
  return (
    <section
      id="companies"
      className="site-section content-width"
      aria-labelledby="experience-title"
    >
      <header className="section-header">
        <h2 className="section-title" id="experience-title" lang="en">Experience</h2>
      </header>
      <dl className="experience-list">
        <div>
          <dt>
            <span lang="en">Hecton Project</span>
            <small className="experience-period">
              <DateRange from="2022-05" to="2026-10" />
            </small>
          </dt>
          <dd>
            <p className="experience-overview">
              {'복지용구 커머스와 요양기관 업무 서비스를 개발했습니다. 초기 구축부터 공통 UI 구성과 운영 이슈 대응까지 참여했습니다.'}
            </p>
            <ul className="experience-projects" role="list">
              <li>
                <div className="experience-project-heading">
                  <ExperienceProjectLink slug="ddoga-store">{'DDOGA 스토어'}</ExperienceProjectLink>
                  <span aria-hidden="true">·</span>
                  <ExperienceProjectLink slug="ddoga-platform">{'플랫폼 리뉴얼'}</ExperienceProjectLink>
                </div>
                <p className="experience-description">
                  {'스토어 초기 구축과 수급자별 구매 흐름 구현. 공통 UI·Storybook 문서화와 서비스 운영 개선.'}
                </p>
              </li>
              <li>
                <div className="experience-project-heading">
                  <ExperienceProjectLink slug="ims">{'IMS 주문 관리'}</ExperienceProjectLink>
                </div>
                <p className="experience-description">
                  {'공통 레이아웃과 폼 구성, 수급자 조회와 소매 주문·고객 관리 화면 개발.'}
                </p>
              </li>
              <li>
                <div className="experience-project-heading">
                  <ExperienceProjectLink slug="care-solution">{'요양기관 솔루션'}</ExperienceProjectLink>
                  <span aria-hidden="true">·</span>
                  <ExperienceProjectLink slug="care-note">{'돌봄노트'}</ExperienceProjectLink>
                </div>
                <p className="experience-description">
                  {'수급자·간호 기록·돌봄 계획·문서 출력 구현. 보호자용 모바일 화면과 건강 기록 시각화.'}
                </p>
              </li>
            </ul>
            <small className="experience-transfer">
              {'사업 분사에 따라 JOA Silvercare로 고용 승계 · '}
              <time dateTime="2026-11">2026.11</time>
            </small>
          </dd>
        </div>
        <div>
          <dt>
            <span lang="en">RunigenInc.</span>
            <small className="experience-period">
              <DateRange from="2021-10" to="2022-03" />
            </small>
          </dt>
          <dd>
            <div className="experience-project-heading">
              <ExperienceProjectLink slug="uplus-baseball">{'U+프로야구 Web · Web App'}</ExperienceProjectLink>
            </div>
            <p className="experience-description">
              {'경기 중계와 하이라이트 화면 개발·유지보수. Shaka Player·PallyCon DRM 연동과 브라우저별 영상 재생 설정.'}
            </p>
          </dd>
        </div>
      </dl>
    </section>
  );
}
