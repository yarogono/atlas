import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

  // 1. 기본 고정 페이지 (메인 홈)
  const defaultPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];

  // 2. MDX 포스트들을 읽어서 동적으로 사이트맵 생성
  const postsDirectory = path.join(process.cwd(), 'src', 'content', 'posts');
  let postUrls: MetadataRoute.Sitemap = [];
  
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    postUrls = fileNames
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map((fileName) => {
        const slug = fileName.replace(/\.mdx$/, '');
        return {
          url: `${baseUrl}/posts/${slug}`,
          lastModified: new Date(), // 실제 운영에서는 fs.statSync를 이용해 파일 수정일을 가져올 수도 있습니다.
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });
  } catch (e) {
    console.error('Failed to read posts directory for sitemap');
  }

  // 홈 + 포스트 목록 리턴
  return [...defaultPages, ...postUrls];
}
