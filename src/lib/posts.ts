import fs from 'fs';
import path from 'path';

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  coverImage?: string;
  category?: string;
  author?: string;
  content: string;
}

const postsDirectory = path.join(process.cwd(), 'src', 'content', 'posts');

// 매우 가볍고 빠른 커스텀 Frontmatter 파서
function parseFrontmatter(fileContent: string) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);
  
  if (!match) {
    return { data: {}, content: fileContent };
  }

  const frontmatterString = match[1];
  const content = fileContent.replace(frontmatterRegex, '').trim();
  
  const data: Record<string, string> = {};
  const lines = frontmatterString.split('\n');
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      let value = valueParts.join(':').trim();
      // 따옴표 제거
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      data[key.trim()] = value;
    }
  }

  return { data, content };
}

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.mdx'));
}

export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.mdx$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = parseFrontmatter(fileContents);

  return {
    slug: realSlug,
    title: data.title || realSlug,
    date: data.date || '',
    description: data.description || '',
    coverImage: data.coverImage,
    category: data.category,
    author: data.author || '정부정책 에디터',
    content,
  };
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // 날짜 최신순 정렬
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
