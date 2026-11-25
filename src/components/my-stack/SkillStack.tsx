import type { ComponentProps } from 'react';
import { projectSkills, stackGroups } from '@/data/skills';
import { SkillTile } from '@/components/SkillTile';
import { StackIcon } from '@/components/StackIcon';

type SkillGroup = (typeof stackGroups)[number];

// 분류마다 제목과 기술 목록을 연결하고, 타일은 좁은 너비에서 줄바꿈합니다.
function SkillGroup({ group, index }: { group: SkillGroup; index: number }) {
  const id = `stack-group-${index}`;

  return (
    <section className="stack-group" aria-labelledby={id}>
      <h3
        id={id}
        className="stack-group-title mb-3 text-[0.8125rem] font-semibold"
      >
        {group.name}
      </h3>
      <ul
        className="stack-list flex list-none flex-wrap gap-2.5 [--stack-tile-size:3.5rem] [@media(max-width:360px)]:gap-2 [@media(max-width:360px)]:[--stack-tile-size:3rem]"
        role="list"
      >
        {group.skills.map(({ name, brandColor }) => (
          <SkillTile key={name} name={name} brandColor={brandColor}>
            <StackIcon name={name} />
          </SkillTile>
        ))}
      </ul>
    </section>
  );
}

// 전체 기술 목록은 본문 폭에 맞추고, 640px부터 분류를 두 열로 배치합니다.
export function SkillStack() {
  return (
    <section
      id="my-stack"
      className="site-section content-width"
      aria-labelledby="stack-title"
    >
      <header className="section-header">
        <h2 id="stack-title" className="section-title" lang="en">
          SKILL
        </h2>
      </header>
      <div
        id="stack-groups"
        className="stack-groups grid gap-x-5 gap-y-6 min-[40rem]:grid-cols-2"
        lang="en"
      >
        {stackGroups.map((group, index) => (
          <SkillGroup key={group.name} group={group} index={index} />
        ))}
      </div>
    </section>
  );
}

// 프로젝트 상세에서 실제 사용 기술을 배지로 보여줍니다.
export function ProjectStack({ slug, className = 'mt-3.5' }: { slug: string; className?: string }) {
  if (!Object.hasOwn(projectSkills, slug)) return null;
  const skills = projectSkills[slug];
  if (!skills?.length) return null;

  return <StackBadges skills={skills} label="Technologies" className={className} branded />;
}

// 프로젝트 상세와 이력서에 같은 기술 배지와 아이콘을 표시합니다.
export function StackBadges({
  skills,
  label,
  className = '',
  branded = false,
}: {
  skills: readonly ComponentProps<typeof StackIcon>['name'][];
  label: string;
  className?: string;
  branded?: boolean;
}) {
  return (
    <ul
      className={`case-stack flex list-none flex-wrap gap-1.5 ${className}`}
      lang="en"
      role="list"
      aria-label={label}
    >
      {skills.map((name) => (
        <li
          key={name}
          className="case-stack-item inline-flex items-center gap-1.5 rounded-[0.45rem] px-2 py-1.5 text-[0.75rem]/[1.25]"
        >
          <StackIcon name={name} compact branded={branded} />
          {name}
        </li>
      ))}
    </ul>
  );
}
