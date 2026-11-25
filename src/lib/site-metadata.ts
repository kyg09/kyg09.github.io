import type { Metadata } from "next";
import { engineeringNotes } from "@/data/projects-notes";
import { projects } from "@/data/projects";
import { portfolioProjectEnglish } from "@/lib/runtime/project-translations";

export const siteOrigin = new URL(
  process.env.SITE_URL?.trim() ||
    `http://localhost:${process.env.PORT || 3000}`,
);

const identity = {
  ko: {
    name: "김영근",
    title: "김영근 · Frontend Developer",
    description:
      "복지용구 스토어와 업무 시스템을 개발해 온 프론트엔드 개발자 김영근입니다.",
    locale: "ko_KR",
    image: "/assets/branding/social-preview-ko.png",
    imageAlt: "손그림 캐릭터가 담긴 김영근 프론트엔드 포트폴리오",
  },
  en: {
    name: "Kim Young Geun",
    title: "Kim Young Geun · Frontend Developer",
    description:
      "Kim Young Geun is a Frontend Developer with experience in assistive equipment e-commerce and software for care teams.",
    locale: "en_US",
    image: "/assets/branding/social-preview-en.png",
    imageAlt: "Kim Young Geun’s frontend portfolio with a hand-drawn character",
  },
};

const projectEnglish: Readonly<Record<string, string>> =
  portfolioProjectEnglish;

// 공유 서비스가 자바스크립트를 실행하지 않아도 요청 주소의 언어와 제목을 읽을 수 있다.
export function createPortfolioMetadata(route: string[] = []): Metadata {
  const isEnglish = route[0] === "en";
  const site = identity[isEnglish ? "en" : "ko"];
  const [section, slug] = isEnglish ? route.slice(1) : route;
  const project =
    section === "projects" && slug
      ? projects.find((item) => item.slug === slug)
      : undefined;
  const note =
    section === "thoughts" && slug
      ? engineeringNotes.find((item) => item.slug === slug)
      : undefined;
  const detailTitle = project?.title ?? note?.title;
  const detailDescription = project?.preview?.description;
  const title = detailTitle ? `${detailTitle} · ${site.name}` : site.title;
  const description = detailDescription
    ? isEnglish
      ? (projectEnglish[detailDescription] ?? site.description)
      : detailDescription
    : site.description;
  const image = {
    url: site.image,
    width: 1200,
    height: 630,
    alt: site.imageAlt,
  };

  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: site.title,
      locale: site.locale,
      title,
      description,
      url: "/" + route.join("/"),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}
