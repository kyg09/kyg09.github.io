import type { NextConfig } from 'next';

// Pages 빌드에서만 정적 파일을 내보내고, 기존 개발·Next 서버 실행은 유지한다.
const isStaticExport = process.env.STATIC_EXPORT === 'true';

// 개발 중에도 포트폴리오의 플로팅 버튼 주변에 개발 표시를 띄우지 않는다.
const nextConfig: NextConfig = {
  devIndicators: false,
  ...(isStaticExport && {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
    productionBrowserSourceMaps: false,
  }),
};

export default nextConfig;
