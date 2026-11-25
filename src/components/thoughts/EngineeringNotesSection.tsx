import { engineeringNotes, type EngineeringNote, type NoteParagraph } from "@/data/projects-notes";
import { DetailSheet, GalleryCard, GallerySectionLayout } from "@/components/projects/GalleryShared";
import { NoteGraphic } from "./NoteGraphic";

// 기존 상세 문단에서 지정한 형광펜 강조를 유지합니다.
function NoteText({ paragraph }: { paragraph: NoteParagraph }) {
  if (typeof paragraph === "string") return paragraph;
  return <>{paragraph.before}<mark className="marker-highlight">{paragraph.highlight}</mark>{paragraph.after}</>;
}

// 각 글의 핵심 구절만 강조하고 흑백 도식과 요약을 함께 보여 줍니다.
function NotePreview({ note }: { note: EngineeringNote }) {
  const highlightStart = note.title.indexOf(note.preview.highlight);
  return (
    <span className="card-doc" aria-hidden="true">
      <span className="card-doc-page">
        <span className="doc-meta">{note.category}</span>
        <span className="doc-title">
          {highlightStart < 0 ? note.title : (
            <>
              {note.title.slice(0, highlightStart)}
              <mark className="marker-highlight">{note.preview.highlight}</mark>
              {note.title.slice(highlightStart + note.preview.highlight.length)}
            </>
          )}
        </span>
        <NoteGraphic slug={note.slug} />
        <span className="doc-summary">{note.preview.summary}</span>
        <span className="doc-read-note" lang="en">
          <span>Read note</span><span className="doc-read-arrow">↗</span>
        </span>
      </span>
    </span>
  );
}

// 문제·선택·확인 내용을 구분해 읽고, 구조화하지 않은 기존 글은 문단으로 표시합니다.
export function EngineeringNoteSheets() {
  return (
    <div className="thought-list">
      {engineeringNotes.map((note) => (
        <DetailSheet key={note.slug} section="thoughts" item={note} metadata={note.category}>
          <div className="post-content note-content">
            {note.paragraphs.map((paragraph, index) => (
              <p key={index}><NoteText paragraph={paragraph} /></p>
            ))}
            {note.sections?.map((section) => (
              <section className="note-section" key={section.label}>
                <h4 lang="en">{section.label}</h4>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
        </DetailSheet>
      ))}
    </div>
  );
}

// 글 목록은 모두 살펴볼 수 있는 그리드로 바꾸고 상세 주소와 모달은 유지합니다.
export function EngineeringNotesSection() {
  const cards = engineeringNotes.map((note) => (
    <GalleryCard key={note.slug} section="thoughts" item={note} metadata={note.category} tip={note.category}>
      <NotePreview note={note} />
    </GalleryCard>
  ));

  return <GallerySectionLayout section="thoughts" layout="grid" cards={cards}><EngineeringNoteSheets /></GallerySectionLayout>;
}
