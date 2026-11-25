import { PushWallScene } from "./PushWallScene";

// 두 인트로 장면에 같은 다이얼로그를 사용한다.
export function LandingIntro() {
  return (
    <dialog
      id="landing-intro"
      className="landing-intro"
      lang="en"
      aria-label="kyg Code"
    >
      <PushWallScene />
      <img
        className="landing-wordmark"
        width="199"
        height="71"
        alt=""
        data-src="/assets/kyg-code-intro.svg"
      />
      <div className="landing-actions" inert>
        <button className="landing-skip" type="button">
          {"SKIP"}
          <svg
            className="landing-skip-accent"
            viewBox="0 0 36 32"
            aria-hidden="true"
            focusable="false"
          >
            <use href="#profile-accent-strokes" />
          </svg>
        </button>
        <button className="landing-hide" type="button" lang="ko" hidden>
          {"숨기기"}
        </button>
      </div>
    </dialog>
  );
}
