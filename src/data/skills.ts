// 포트폴리오의 기술 분류와 아이콘 강조색을 관리합니다.
export const stackGroups = [
  {
    name: 'Core',
    skills: [
      { name: 'TypeScript', brandColor: '#3178C6' },
      { name: 'React', brandColor: '#087F9F' },
      { name: 'Next.js', brandColor: '#000000' },
    ],
  },
  {
    name: 'State & Data',
    skills: [
      { name: 'TanStack Query', brandColor: '#E44D48' },
      { name: 'Zustand', brandColor: '#97582E' },
      { name: 'React Hook Form', brandColor: '#CF3D76' },
    ],
  },
  {
    name: 'UI & Styling',
    skills: [
      { name: 'MUI', brandColor: '#007FFF' },
      { name: 'Tailwind CSS', brandColor: '#38BDF8' },
      { name: 'Storybook', brandColor: '#E33473' },
    ],
  },
  {
    name: 'Version Control & Collaboration',
    skills: [
      { name: 'Git', brandColor: '#E75237' },
      { name: 'GitLab', brandColor: '#D55219' },
      { name: 'Jira', brandColor: '#1868DB' },
      { name: 'Figma', brandColor: '#DB4A2B' },
    ],
  },
] as const;

export type StackName = (typeof stackGroups)[number]['skills'][number]['name'];

// 공통 기술 목록에 없는 프로젝트 기술은 역할을 나타내는 아이콘으로 표시합니다.
export const projectSymbols = {
  'OZ Report': 'M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7',
  ApexCharts: 'M4 4v16h16M8 16v-4m4 4V8m4 8v-5m4 5V5',
  Redux: 'M11 8l-4 7m6-7 4 7m-9 2h8M14 6a2 2 0 1 0-4 0 2 2 0 0 0 4 0zM8 17a2 2 0 1 0-4 0 2 2 0 0 0 4 0zM20 17a2 2 0 1 0-4 0 2 2 0 0 0 4 0z',
  'Shaka Player': 'M3 5h18v14H3zM10 9l5 3-5 3z',
  'PallyCon DRM': 'M12 3l7 3v5c0 4-3 7-7 10-4-3-7-6-7-10V6zM9 12l2 2 4-4',
};

export type ProjectSkillName = StackName | keyof typeof projectSymbols;

export const projectSkills: Readonly<Partial<Record<string, readonly ProjectSkillName[]>>> = {
  'ddoga-store': ['TypeScript', 'React', 'Next.js', 'TanStack Query', 'Zustand', 'React Hook Form', 'MUI', 'Tailwind CSS', 'Storybook'],
  'ddoga-platform': ['TypeScript', 'React', 'Next.js', 'TanStack Query', 'Zustand', 'React Hook Form', 'MUI', 'Tailwind CSS', 'Storybook'],
  ims: ['TypeScript', 'React', 'Next.js', 'TanStack Query', 'Zustand', 'React Hook Form', 'MUI'],
  'care-solution': ['TypeScript', 'React', 'Next.js', 'OZ Report'],
  'care-note': ['TypeScript', 'React', 'Next.js', 'Zustand', 'ApexCharts'],
  'uplus-baseball': ['React', 'Redux', 'Shaka Player', 'PallyCon DRM'],
};
