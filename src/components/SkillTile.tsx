'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import type { StackName } from '@/data/skills';

interface SkillTileProps {
  name: StackName;
  brandColor: string;
  children: ReactNode;
}

// 포커스나 호버로 기술명을 표시하며, Escape로 닫으면 다시 접근할 때 툴팁을 복구합니다.
export function SkillTile({ name, brandColor, children }: SkillTileProps) {
  const [isTooltipDismissed, setTooltipDismissed] = useState(false);

  return (
    <li
      className={`stack-tile relative grid size-[var(--stack-tile-size)] flex-[0_0_var(--stack-tile-size)] place-items-center rounded-[0.875rem]${isTooltipDismissed ? ' is-tooltip-dismissed' : ''}`}
      tabIndex={0}
      aria-label={name}
      style={{ '--stack-brand': brandColor } as CSSProperties}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setTooltipDismissed(true);
      }}
      onFocus={() => setTooltipDismissed(false)}
      onPointerEnter={() => setTooltipDismissed(false)}
    >
      {children}
      <span className="stack-tooltip" aria-hidden="true">
        {name}
      </span>
    </li>
  );
}
