import type { CSSProperties } from "react";
import { projects, type Project, type ProjectVideoData } from "@/data/projects";
import { ProjectStack } from "@/components/my-stack/SkillStack";
import { DetailSheet, GalleryCard, GallerySectionLayout } from "@/components/projects/GalleryShared";
import { ProjectFlow } from "@/components/projects/ProjectFlow";

type ProjectVideoProps = { video: ProjectVideoData };

// 표지와 상세에서 같은 원본 영상을 사용하고 기존 지연 재생 속성을 유지합니다.
function ProjectVideo({ video }: ProjectVideoProps) {
  const style = { "--r": video.aspectRatio, "--px": video.maxWidth ? video.maxWidth + "px" : undefined } as CSSProperties;

  return (
    <video
      data-src={video.src}
      poster={video.poster}
      preload="none"
      muted
      loop
      playsInline
      aria-label={video.label}
      style={style}
    />
  );
}

// 프로젝트 상세의 원본 영상은 설명보다 먼저 표시합니다.
function ProjectCover({ video }: { video: ProjectVideoData }) {
  return (
    <div className="case-wide case-cover is-bare">
      <ProjectVideo video={video} />
    </div>
  );
}

// 업무 범위와 핵심 흐름을 짧은 섹션으로 구분하고, 근거 문구는 데이터에서만 가져옵니다.
function ProjectCaseStudy({ project }: { project: Project }) {
  const study = project.caseStudy;
  if (!study) return null;

  return (
    <div className="case-study">
      <p className="case-project-period">{project.period}</p>
      <section className="case-study-block">
        <h4 lang="en">Overview</h4>
        <p>{study.overview}</p>
      </section>
      <section className="case-study-block">
        <h4 lang="en">My Role</h4>
        <ul className="case-role-list">
          {study.roles.map((role) => <li key={role}>{role}</li>)}
        </ul>
      </section>
      <section className="case-study-block">
        <h4 lang="en">Key Flow</h4>
        <ProjectFlow steps={study.flow.steps} caption={study.flow.caption} />
      </section>
      <section className="case-study-block">
        <h4 lang="en">Implementation</h4>
        <ul className="case-implementation-list">
          {study.implementation.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="case-study-block case-study-skills">
        <h4 lang="en">SKILL</h4>
        <ProjectStack slug={project.slug} className="mt-0" />
      </section>
    </div>
  );
}

// 구조화된 사례가 없는 기존 회사 상세 주소도 이전 문단 구성으로 계속 표시합니다.
function ProjectCase({ project }: { project: Project }) {
  return (
    <DetailSheet section="projects" item={project}>
      <div className="case">
        {project.video && <ProjectCover video={project.video} />}
        <div className="case-intro post-content">
          {project.caseStudy ? <ProjectCaseStudy project={project} /> : (
            <>
              <p><strong>{project.title}</strong>{" · " + project.period}</p>
              {project.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {project.preview && <ProjectStack slug={project.slug} />}
            </>
          )}
          {(project.website || project.credit) && (
            <div className="case-links">
              {project.website && (
                <p className="case-website"><a href={project.website.url} target="_blank" rel="noopener">{project.website.label}</a></p>
              )}
              {project.credit && <p className="case-media-credit"><small>{project.credit}</small></p>}
            </div>
          )}
        </div>
      </div>
    </DetailSheet>
  );
}

// カードと会社リンクが共有する詳細パネルを一度だけ生成します。
export function ProjectSheets() {
  return <div className="project-list">{projects.map((project) => <ProjectCase key={project.slug} project={project} />)}</div>;
}

// 動画の下にサービス名・概要・担当領域をまとめ、映像内には説明を追加しません。
function ProjectPreview({ project }: { project: Project }) {
  return (
    <span className="card-doc project-preview" aria-hidden="true">
      {project.video && (
        <span
          className="card-media project-preview-media"
          style={{ "--r": project.video.aspectRatio } as CSSProperties}
        >
          <ProjectVideo video={project.video} />
        </span>
      )}
      <span className="card-doc-page">
        <span className="doc-meta">{project.period}</span>
        <span className="doc-title">{project.preview?.title}</span>
        <span className="doc-summary">{project.preview?.summary}</span>
        {!!project.preview?.roles?.length && (
          <span className="project-role-list">
            {project.preview.roles.map((role) => <span className="project-role" key={role}>{role}</span>)}
          </span>
        )}
        <span className="doc-read-note" lang="en">
          <span>View project</span><span className="doc-read-arrow">↗</span>
        </span>
      </span>
    </span>
  );
}

// 代表 카드와 캐러셀 카드가 같은 상세 연결과 접근성 제목을 사용합니다.
function ProjectCard({ project, className }: { project: Project; className?: string }) {
  if (!project.preview || !project.video) return null;
  return (
    <GalleryCard
      section="projects"
      item={{ ...project, title: project.preview.title }}
      metadata={project.period}
      tip={project.preview.tip}
      mediaDescription={project.preview.description}
      className={className}
    >
      <ProjectPreview project={project} />
    </GalleryCard>
  );
}

// DDOGA 스토어를 먼저 크게 보여 주고, 나머지 다섯 작업은 기존 캐러셀을 유지합니다.
export function ProjectsSection() {
  const featured = projects.find((project) => project.slug === "ddoga-store" && project.preview && project.video);
  const cards = projects
    .filter((project) => project.preview && project.video && project !== featured)
    .map((project) => <ProjectCard key={project.slug} project={project} />);

  return (
    <GallerySectionLayout
      section="projects"
      cards={cards}
      lead={featured && <ProjectCard project={featured} className="is-featured is-current" />}
    >
      <ProjectSheets />
    </GallerySectionLayout>
  );
}
