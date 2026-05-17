import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 1. 기본 고정 페이지 (메인 홈)
  const defaultPages = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 2. MDX 포스트들을 읽어서 동적으로 사이트맵 생성
  const postsDirectory = path.join(process.cwd(), 'src', 'content', 'posts');
  let postUrls: Array<{ url: string; lastModified: string; changeFrequency: string; priority: number }> = [];
  
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    postUrls = fileNames
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map((fileName) => {
        const slug = fileName.replace(/\.mdx$/, '');
        return {
          url: `${baseUrl}/posts/${slug}`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'weekly',
          priority: 0.8,
        };
      });
  } catch (e) {
    console.error('Failed to read posts directory for sitemap');
  }

  const allPages = [...defaultPages, ...postUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate',
    },
  });
}
