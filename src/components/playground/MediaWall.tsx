// 프로젝트 카드 데이터로 구성하는 미디어 갤러리의 위치를 제공한다.
export function MediaWall() {
  return (
    <section
      id="playground"
      className="site-section section-wide"
      aria-label="프로젝트 미디어"
      hidden
    >
      <div className="play-wall project-media-grid" />
    </section>
  );
}
