import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import welfareData from '../../data/regions-welfare.json';


export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';

  // 1. 기본 고정 페이지 (메인 홈 및 주요 서비스 페이지)
  const defaultPages = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/eligibility`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/regions`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/updates`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/usage`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5,
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
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        
        const lastModMatch = fileContents.match(/lastModified:\s*"([^"]+)"/);
        const dateMatch = fileContents.match(/date:\s*"([^"]+)"/);
        
        let lastModDate = new Date().toISOString();
        if (lastModMatch) {
          lastModDate = new Date(lastModMatch[1]).toISOString();
        } else if (dateMatch) {
          lastModDate = new Date(dateMatch[1]).toISOString();
        }
        
        return {
          url: `${baseUrl}/posts/${slug}`,
          lastModified: lastModDate,
          changeFrequency: 'weekly',
          priority: 0.8,
        };
      });
  } catch (e) {
    console.error('Failed to read posts directory for sitemap', e);
  }

  // 3. 지자체 동적 페이지 추가 (pSEO)
  const regionalUrls = Object.keys(welfareData).map((region) => ({
    url: `${baseUrl}/regions/${encodeURIComponent(region)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const allPages = [...defaultPages, ...postUrls, ...regionalUrls];

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
