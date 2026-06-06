import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 실제 도메인 주소로 교체 (로컬에서는 localhost 우선)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';
  
  const postsDirectory = path.join(process.cwd(), 'src', 'content', 'posts');
  let fileNames: string[] = [];
  
  try {
    fileNames = fs.readdirSync(postsDirectory);
  } catch (e) {
    console.error('Failed to read posts for RSS');
  }

  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      // 간단한 정규식으로 Frontmatter 추출
      const titleMatch = fileContents.match(/title:\s*"([^"]+)"/);
      const descMatch = fileContents.match(/description:\s*"([^"]+)"/);
      const dateMatch = fileContents.match(/date:\s*"([^"]+)"/);
      
      return {
        slug,
        title: titleMatch ? titleMatch[1] : slug,
        description: descMatch ? descMatch[1] : '',
        date: dateMatch ? new Date(dateMatch[1]).toUTCString() : new Date().toUTCString(),
      };
    });

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>복지지원금24시</title>
    <link>${baseUrl}</link>
    <description>정부지원금, 숨은 보조금, 생활 복지 정책의 모든 것을 가장 빠르고 정확하게 안내해 드립니다.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/posts/${post.slug}</link>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${post.date}</pubDate>
      <guid>${baseUrl}/posts/${post.slug}</guid>
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  });
}
