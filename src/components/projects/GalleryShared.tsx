import { Children, type CSSProperties, type ReactNode } from "react";
import { CloseProgressRing } from "@/components/CloseProgressRing";

type GallerySection = "projects" | "thoughts";
const sectionLabels = { projects: "Projects", thoughts: "Engineering Notes" };
const baseFill = "var(--color-bg)";

export type GalleryItem = {
  slug: string;
  title: string;
  fill?: string;
};

// 카드, 상세 화면, 닫기 링크가 같은 주소와 패널 ID를 사용합니다.
function itemLocation(section: GallerySection, slug: string) {
  const id = section + "-" + slug;
  return { id, panelId: id + "-panel", href: "/" + section + "/" + slug };
}

type GalleryProps = {
  section: GallerySection;
  cards: ReactNode;
  children: ReactNode;
  lead?: ReactNode;
  layout?: "carousel" | "grid";
};

// 대표 작업은 별도로 보여 주고, 나머지 목록은 캐러셀 또는 글 그리드로 구성합니다.
export function GallerySectionLayout({ section, cards, children, lead, layout = "carousel" }: GalleryProps) {
  const label = sectionLabels[section];
  const collection = layout === "grid" ? (
    <div className="note-grid" role="region" aria-label={label}>
      {cards}
    </div>
  ) : (
    <div className="card-rail is-docs" data-loop role="region" aria-label={label}>
      <div className="card-track" style={{ "--card-count": Children.count(cards) } as CSSProperties}>
        {cards}
      </div>
    </div>
  );

  return (
    <section id={section} className="site-section content-width" data-path={"/" + section}>
      <header className="section-header">
        <h2 className="section-title">{label}</h2>
      </header>
      {lead && <div className="project-featured reveal">{lead}</div>}
      <div className="reveal">{collection}</div>
      {children}
    </section>
  );
}

type GalleryCardProps = {
  section: GallerySection;
  item: GalleryItem;
  metadata: string;
  tip: string;
  mediaDescription?: string;
  className?: string;
  children: ReactNode;
};

// 배치가 달라도 원본 카드의 주소·메타데이터·상세 연결을 그대로 유지합니다.
export function GalleryCard({ section, item, metadata, tip, mediaDescription, className, children }: GalleryCardProps) {
  const { id, href } = itemLocation(section, item.slug);
  return (
    <a
      className={["card", className].filter(Boolean).join(" ")}
      href={href}
      aria-expanded="false"
      data-controls={id}
      data-tip={tip}
      data-media-description={mediaDescription}
      style={{ "--fill": item.fill ?? baseFill } as CSSProperties}
    >
      {children}
      <span className="card-foot">
        <span className="card-title">{item.title}</span>
        <span className="card-meta">{metadata}</span>
      </span>
    </a>
  );
}

type DetailSheetProps = {
  section: GallerySection;
  item: GalleryItem;
  metadata?: string;
  children: ReactNode;
};

// 닫힌 상세 패널은 키보드 탐색에서 제외하고 기존 전환 효과에 필요한 구조를 유지합니다.
export function DetailSheet({ section, item, metadata, children }: DetailSheetProps) {
  const { id, panelId, href } = itemLocation(section, item.slug);
  const isProject = section === "projects";
  return (
    <article
      id={id}
      className={isProject ? "sheet project-case" : "sheet thought"}
      data-path={href}
      data-title={item.title}
      style={{ "--fill": item.fill ?? baseFill } as CSSProperties}
    >
      <div id={panelId} className="sheet-scroll" inert>
        <div className="sheet-inner content-width">
          <h3 className="sheet-title">{item.title}</h3>
          {metadata && <p className="sheet-meta">{metadata}</p>}
          {children}
        </div>
      </div>
      <div className="fog fog-top" aria-hidden="true" />
      <div className="fog fog-bottom" aria-hidden="true" />
      <a
        className={isProject ? "sheet-close project-toggle" : "sheet-close thought-toggle"}
        href={href}
        aria-expanded="false"
        aria-controls={panelId}
        aria-label={"Close " + item.title}
      >
        <CloseProgressRing />
        <span aria-hidden="true" />
      </a>
    </article>
  );
}
