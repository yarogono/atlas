import fs from 'fs';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Metadata } from 'next';
import { InteractiveCalc } from '@/components/InteractiveCalc';
import { SubsidyHero } from '@/components/mdx/SubsidyHero';
import { SubsidyCta } from '@/components/mdx/SubsidyCta';
import { AppCta } from '@/components/mdx/AppCta';
import { ScheduleTable } from '@/components/mdx/ScheduleTable';
import { StepGuide } from '@/components/mdx/StepGuide';
import { NoticeBox } from '@/components/mdx/NoticeBox';
import { AdSense } from '@/components/mdx/AdSense';
import { SourceRef } from '@/components/mdx/SourceRef';
import { FaqAccordion } from '@/components/mdx/FaqAccordion';
import { RelatedLinks } from '@/components/mdx/RelatedLinks';
import { Toc } from '@/components/mdx/Toc';
import { Breadcrumb } from '@/components/mdx/Breadcrumb';
import { Pagination } from '@/components/mdx/Pagination';
import { MapCta } from '@/components/mdx/MapCta';

const generateId = (children: any) => {
  if (typeof children === 'string') {
    return children.replace(/\s+/g, '-').replace(/[^\wㄱ-ㅎ가-힣-]/g, '');
  }
  return '';
};

const components = {
  InteractiveCalc,
  SubsidyHero,
  SubsidyCta,
  AppCta,
  ScheduleTable,
  StepGuide,
  NoticeBox,
  AdSense,
  SourceRef,
  FaqAccordion,
  RelatedLinks,
  Toc,
  Breadcrumb,
  Pagination,
  MapCta,
  h2: ({ children, ...props }: any) => <h2 id={generateId(children)} className="scroll-mt-24" {...props}>{children}</h2>,
  h3: ({ children, ...props }: any) => <h3 id={generateId(children)} className="scroll-mt-24" {...props}>{children}</h3>,
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const filePath = path.join(process.cwd(), 'src', 'content', 'posts', `${params.slug}.mdx`);
  if (!fs.existsSync(filePath)) return {};
  
  const content = fs.readFileSync(filePath, 'utf8');
  const title = content.match(/title:\s*"([^"]+)"/)?.[1] || params.slug;
  const description = content.match(/description:\s*"([^"]+)"/)?.[1] || '';
  const date = content.match(/date:\s*"([^"]+)"/)?.[1] || '';
  const coverImage = content.match(/coverImage:\s*"([^"]+)"/)?.[1] || '';
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: date,
      url: `${baseUrl}/posts/${params.slug}`,
      images: coverImage ? [{ url: coverImage }] : [],
    },
    alternates: {
      canonical: `${baseUrl}/posts/${params.slug}`,
    }
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const postsDirectory = path.join(process.cwd(), 'src', 'content', 'posts');
  const filePath = path.join(postsDirectory, `${params.slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return <div className="p-10 text-center text-xl text-slate-500 font-bold">포스트를 찾을 수 없습니다 😢</div>;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');

  // 간단한 정규식으로 Frontmatter 추출
  const titleMatch = fileContents.match(/title:\s*"([^"]+)"/);
  const title = titleMatch ? titleMatch[1] : params.slug;
  const descMatch = fileContents.match(/description:\s*"([^"]+)"/);
  const description = descMatch ? descMatch[1] : '';
  const dateMatch = fileContents.match(/date:\s*"([^"]+)"/);
  const date = dateMatch ? dateMatch[1] : '';
  const coverImageMatch = fileContents.match(/coverImage:\s*"([^"]+)"/);
  const coverImage = coverImageMatch ? coverImageMatch[1] : '';

  // Pagination을 위한 전체 포스트 리스트 (날짜순 정렬)
  const allFiles = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.mdx'));
  const allPosts = allFiles.map(f => {
    const slug = f.replace(/\.mdx$/, '');
    const content = fs.readFileSync(path.join(postsDirectory, f), 'utf8');
    const tMatch = content.match(/title:\s*"([^"]+)"/);
    const dMatch = content.match(/date:\s*"([^"]+)"/);
    return {
      slug,
      title: tMatch ? tMatch[1] : slug,
      date: dMatch ? new Date(dMatch[1]).getTime() : 0,
    };
  }).sort((a, b) => b.date - a.date); // 최신순

  const currentIndex = allPosts.findIndex(p => p.slug === params.slug);
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null; // 더 최신 글
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null; // 더 이전 글

  // JSON-LD 구조화 데이터
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: coverImage ? [coverImage] : [],
    datePublished: date,
    author: [{
      '@type': 'Organization',
      name: '복지지원금24시',
      url: baseUrl,
    }]
  };

  const contentWithoutFrontmatter = fileContents.replace(/---[\s\S]*?---/, '');

  return (
    <article className="max-w-3xl mx-auto w-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <Breadcrumb title={title} />
      
      <div className="mb-10 mt-6">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight break-keep">{title}</h1>
        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{date}</span>
          <span>조회수 1.2만</span>
        </div>
      </div>
      
      {coverImage && (
        <img src={coverImage} alt={title} className="w-full h-[250px] md:h-[400px] object-cover rounded-2xl md:rounded-3xl mb-12 shadow-sm" />
      )}
      
      <div className="prose prose-slate prose-lg md:prose-xl max-w-none 
          prose-headings:text-slate-800 prose-headings:font-bold 
          prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-3 prose-h2:mt-16 prose-h2:mb-6
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[#0a3d7e] prose-strong:font-black">
        <MDXRemote source={contentWithoutFrontmatter} components={components} />
      </div>

      <Pagination prev={prevPost} next={nextPost} />
    </article>
  );
}
