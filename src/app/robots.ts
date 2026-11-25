import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    // 공개 배포 전까지 기존 layout.tsx의 noindex 정책을 유지한다.
    rules: { userAgent: "*", disallow: "/" },
    sitemap: new URL("/sitemap.xml", siteOrigin).href,
  };
}
