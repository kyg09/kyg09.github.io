import { HeroMarkerText } from './HeroMarkerText';
import { Mark } from '@/components/kokonutui/marker-text';

// 소개와 현재 구직 상태를 표시한다. 이력서 열기는 공통 런타임에서 처리한다.
export function AboutSection() {
  return (
    <section id="about" className="site-section">
      <div className="home-hero content-width">
        <div className="hero-identity">
          <div>
            <h1 className="name" tabIndex={-1}>
              <span className="name-identity">
                {'김영근'}
                <img
                  className="name-face"
                  src="/assets/profile-character.svg?v=transparent"
                  alt=""
                  width="64"
                  height="64"
                  decoding="async"
                />
              </span>
            </h1>
            <span className="title" lang="en">
              {'Frontend Developer'}
            </span>
          </div>
          <AvailabilityBadge />
        </div>
        <HeroMarkerText>
          <p>
            {'복지용구 스토어와 업무 시스템을 개발해 온 '}
            <strong className="intro-emphasis">
              {'프론트엔드 개발자 김영근'}
              <svg
                className="intro-profile-accent"
                viewBox="0 0 36 32"
                aria-hidden="true"
                focusable="false"
              >
                <use href="#profile-accent-strokes" />
              </svg>
            </strong>
            {'입니다.'}
          </p>
          <p>
            <Mark type="underline" color="#f97316">기획자·디자이너·백엔드 개발자</Mark>
            {'와 '}
            <Mark type="circle" color="#2563eb">실제 사용 흐름</Mark>
            {'을 살피고, 불분명한 요구사항을 함께 '}
            <Mark type="box" color="#16a34a">구체화</Mark>
            {'합니다. 사용자가 다음에 해야 할 일을 쉽게 이해하고 작업을 '}
            <Mark type="underline" color="#dc2626">끝까지</Mark>
            {' 마칠 수 있도록 화면을 구현합니다.'}
          </p>
        </HeroMarkerText>
      </div>
      <div className="home-body content-width content" />
    </section>
  );
}

// 상태 문구와 이력서 열기 문구를 겹쳐 두고 상태 전환 애니메이션을 적용한다.
function AvailabilityBadge() {
  return (
    <button
      className="now-pill"
      type="button"
      aria-label="Open to work, View Resume"
      aria-haspopup="dialog"
      aria-controls="resume-dialog"
      lang="en"
      disabled
    >
      <span className="now-pill-dot" aria-hidden="true" />
      <span className="now-pill-label" aria-hidden="true">
        <span className="now-pill-status">{'Open to work'}</span>
        <span className="now-pill-action">{'View Resume'}</span>
      </span>
    </button>
  );
}
