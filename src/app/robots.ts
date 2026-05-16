import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // 나중에 Vercel 배포 시, 본인의 실제 도메인 주소로 변경될 수 있도록 환경변수를 사용합니다.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

  return {
    rules: {
      userAgent: '*', // 모든 검색 엔진 로봇의 접근을 허용
      allow: '/',     // 모든 페이지 크롤링 허용
    },
    sitemap: `${baseUrl}/sitemap.xml`, // 사이트맵 위치 안내
  };
}
