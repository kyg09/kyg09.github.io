import { CopyPageLinkButton } from '@/components/CopyPageLinkButton';
import { AboutSection } from '@/components/about/AboutSection';
import { ExperienceSection } from '@/components/companies/ExperienceSection';
import { FloatingControls } from '@/components/FloatingControls';
import { LandingIntro } from '@/components/LandingIntro';
import { MediaDialog } from '@/components/playground/MediaDialog';
import { PlaygroundSection } from '@/components/playground/PlaygroundSection';
import { BeyondCode } from '@/components/about/BeyondCode';
// import { MediaWall } from '@/components/playground/MediaWall';
import { PortfolioFooter } from '@/components/PortfolioFooter';
import { ResumeDialog } from '@/components/about/ResumeDialog';
import { SkillStack } from '@/components/my-stack/SkillStack';
import { ArtworkDefinitions, Wordmark } from '@/components/Wordmark';
import { WorkSection } from '@/components/services/WorkSection';
import { ProjectsSection } from '@/components/projects';
import { EngineeringNotesSection } from '@/components/thoughts/EngineeringNotesSection';
import { SectionNavigation } from '@/components/SectionNavigation';

// 한 페이지에서 본문과 상세 패널을 조합한다. 각 패널은 기존 상세 주소로 직접 열 수 있다.
export function PortfolioPage() {
  return (
    <>
      <LandingIntro />
      <main>
        <Wordmark placement="page" />
        <CopyPageLinkButton />
        <SectionNavigation />
        <div id="home" className="page">
          <AboutSection />
          <ExperienceSection />
          <ProjectsSection />
          <SkillStack />
          <PlaygroundSection />
          <WorkSection />
          <EngineeringNotesSection />
          <BeyondCode />
          {/* 스크롤 미디어 갤러리는 잠시 숨깁니다. 복원 시 import와 아래 주석을 해제합니다.
          <MediaWall />
          */}
          <PortfolioFooter />
        </div>
        <FloatingControls />
        <ResumeDialog />
        <MediaDialog />
      </main>
      <div className="fog fog-top" aria-hidden="true" />
      <div className="fog fog-bottom" aria-hidden="true" />
      <ArtworkDefinitions />
      <div className="copy-toast" role="status" aria-atomic="true" />
    </>
  );
}
