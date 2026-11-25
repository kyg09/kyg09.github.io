import { PortfolioPage } from "@/components/PortfolioPage";
import { portfolioRoutes } from "@/lib/site-routes";
import { createPortfolioMetadata } from "@/lib/site-metadata";

export const dynamicParams = false;

// 페이지 생성과 사이트맵이 같은 전체 주소 목록을 사용한다.
export function generateStaticParams() {
  return portfolioRoutes.flatMap((route) => [
    { route },
    { route: ["en", ...route] },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ route?: string[] }>;
}) {
  const { route } = await params;
  return createPortfolioMetadata(route);
}

export default function Page() {
  return <PortfolioPage />;
}
