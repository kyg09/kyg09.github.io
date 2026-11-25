import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PortfolioRuntime } from "@/components/PortfolioRuntime";
import { landingPaintGuard } from "@/lib/landing-paint-guard";
import { siteOrigin } from "@/lib/site-metadata";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: siteOrigin,
  title: "김영근 · Frontend Developer",
  description:
    "복지용구 스토어와 업무 시스템을 개발해 온 프론트엔드 개발자 김영근입니다.",
  robots: { index: false, follow: false },
  // 투명 아이콘을 명시해 브라우저의 기본 /favicon.ico 조회와 이전 아이콘 표시를 막는다.
  icons: {
    icon: {
      url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=",
      type: "image/png",
      sizes: "1x1",
    },
  },
};

// 포트폴리오 언어와 상세 프로젝트 주소의 공통 외곽 레이아웃을 구성한다.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: landingPaintGuard }} />
        <link
          rel="preload"
          href="/fonts/ABCAreal-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="/assets/vendor/blossom-carousel/blossom-carousel-web.css?v=5f842430"
        />
        <noscript>
          <style>
            {
              ".page { display: block; } .reveal, .content > *, .home-hero > *, .home-body > * { opacity: 1 !important; transform: none !important; } .hero-statement .word { opacity: 1; }"
            }
          </style>
        </noscript>
      </head>
      <body data-page="home">
        {children}
        <PortfolioRuntime />
      </body>
    </html>
  );
}
