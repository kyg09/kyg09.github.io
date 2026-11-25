// 프로젝트 미디어를 확대하고 제목과 설명을 표시하는 팝업이다.
export function MediaDialog() {
  return (
    <dialog
      id="project-media-dialog"
      className="lightbox"
      aria-labelledby="project-media-title"
      aria-describedby="project-media-description"
    >
      <div className="lightbox-inner">
        <button
          className="lightbox-close"
          type="button"
          aria-label="닫기"
          autoFocus
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>
        <div className="lightbox-content">
          <div className="lightbox-media" />
          <div className="lightbox-caption">
            <h2 className="lightbox-title" id="project-media-title" lang="en" />
            <p
              className="lightbox-description"
              id="project-media-description"
            />
          </div>
        </div>
      </div>
    </dialog>
  );
}
