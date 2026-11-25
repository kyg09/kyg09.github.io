import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-metadata";
import { portfolioRoutes } from "@/lib/site-routes";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return portfolioRoutes.flatMap((route) => {
    const path = route.join("/");
    const ko = new URL(`/${path}`, siteOrigin).href;
    const en = new URL(`/en${path ? `/${path}` : ""}`, siteOrigin).href;
    const alternates = { languages: { ko, en } };

    return [
      { url: ko, alternates },
      { url: en, alternates },
    ];
  });
}
