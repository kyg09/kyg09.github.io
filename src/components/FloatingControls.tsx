// 본문의 맨 위 이동과 이력서 열기 버튼을 모은다.
export function FloatingControls() {
  return (
    <div className="page-shortcuts">
      <button
        id="back-to-top"
        className="back-to-top"
        type="button"
        aria-label="맨 위로"
        hidden
      >
        <svg
          viewBox="0 0 20 20"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10 15.5v-11M4.75 9.75 10 4.5l5.25 5.25" />
        </svg>
      </button>
      <button
        id="resume-open"
        className="resume-open"
        type="button"
        aria-haspopup="dialog"
        aria-controls="resume-dialog"
        lang="en"
        hidden
      >
        <svg
          viewBox="0 0 20 20"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 2.5h6.5l3.5 3.7v11.3H5zM11.5 2.5v4h3.5M7.5 10h5M7.5 13.5h5" />
        </svg>
        <span className="resume-open-label">Resume</span>
        <span className="now-pill-dot" aria-hidden="true" />
      </button>
    </div>
  );
}
