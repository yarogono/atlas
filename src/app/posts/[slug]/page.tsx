import fs from 'fs';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Metadata } from 'next';
import Image from 'next/image';
import { InteractiveCalc } from '@/components/InteractiveCalc';
import { SubsidyHero } from '@/components/mdx/SubsidyHero';
import { SubsidyCta } from '@/components/mdx/SubsidyCta';
import { AppCta } from '@/components/mdx/AppCta';
import { ScheduleTable } from '@/components/mdx/ScheduleTable';
import { StepGuide } from '@/components/mdx/StepGuide';
import { NoticeBox } from '@/components/mdx/NoticeBox';
import { SourceRef } from '@/components/mdx/SourceRef';
import { FaqAccordion } from '@/components/mdx/FaqAccordion';
import { RelatedLinks } from '@/components/mdx/RelatedLinks';
import { Toc } from '@/components/mdx/Toc';
import { Breadcrumb } from '@/components/mdx/Breadcrumb';
import { Pagination } from '@/components/mdx/Pagination';
import { MapCta } from '@/components/mdx/MapCta';
import { EligibilityCalc } from '@/components/mdx/EligibilityCalc';

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
  SourceRef,
  FaqAccordion,
  RelatedLinks,
  Toc,
  Breadcrumb,
  Pagination,
  MapCta,
  EligibilityCalc,
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
  const keywords = content.match(/keywords:\s*"([^"]+)"/)?.[1] || '';
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';

  const seoTitle = title;
  const seoDescription = description || `${title} 대상 여부를 확인하고 예상 금액까지 즉시 계산해보세요. 정부지원금 핵심 정보 총정리.`;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: keywords || undefined,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'article',
      publishedTime: date,
      url: `${baseUrl}/posts/${params.slug}`,
      images: coverImage ? [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: `${seoTitle} - 복지지원금24시`,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: coverImage ? [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: `${seoTitle} - 복지지원금24시`,
        }
      ] : [],
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
  const lastModMatch = fileContents.match(/lastModified:\s*"([^"]+)"/);
  const lastModified = lastModMatch ? lastModMatch[1] : '';
  const coverImageMatch = fileContents.match(/coverImage:\s*"([^"]+)"/);

  const coverImage = coverImageMatch ? coverImageMatch[1] : '';
  const hideCoverImageMatch = fileContents.match(/hideCoverImage:\s*(true|false)/);
  const hideCoverImage = hideCoverImageMatch ? hideCoverImageMatch[1] === 'true' : false;
  const keywordsMatch = fileContents.match(/keywords:\s*"([^"]+)"/);
  const keywords = keywordsMatch ? keywordsMatch[1] : '';
  const categoryMatch = fileContents.match(/category:\s*"([^"]+)"/);
  const category = categoryMatch ? categoryMatch[1] : '정부지원금';

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

  // 본문 텍스트 기반 wordCount 계산 (Frontmatter 제외)
  const bodyText = fileContents.replace(/---[\s\S]*?---/, '').replace(/<[^>]+>/g, '').replace(/[\[\]{}'"]/g, ' ');
  const wordCount = bodyText.trim().split(/\s+/).filter(Boolean).length;

  // 1. BlogPosting 구조화 데이터 고도화
  const articleJsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: coverImage ? [coverImage] : [],
    datePublished: date,
    dateModified: lastModified || date, // 수정일이 있을 경우 최종 수정일을 매핑

    inLanguage: 'ko-KR',
    wordCount,
    articleSection: category || '정부지원금',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/posts/${params.slug}`
    },
    author: [{
      '@type': 'Organization',
      name: '복지지원금24시',
      url: baseUrl,
    }],
    publisher: {
      '@type': 'Organization',
      name: '복지지원금24시',
      logo: {
        '@type': 'ImageObject',
        url: 'https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/favicon.png'
      }
    }
  };
  // keywords 필드 선택적 추가
  if (keywords) {
    articleJsonLd.keywords = keywords.split(',').map((k: string) => k.trim());
  }

  // 2. FAQPage 구조화 데이터 자동 추출 (FaqAccordion 컴포넌트 홑/쌍따옴표 모두 지원)
  const faqMatch =
    fileContents.match(/<FaqAccordion\s+items='([^']+)'/) ||
    fileContents.match(/<FaqAccordion\s+items="([^"]+)"/);
  let faqJsonLd: any = null;
  if (faqMatch) {
    try {
      const faqItems = JSON.parse(faqMatch[1]);
      faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item: any) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a
          }
        }))
      };
    } catch (e) {
      console.error('Failed to parse FAQ items for JSON-LD');
    }
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '정부지원금 가이드',
        item: `${baseUrl}/guide`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `${baseUrl}/posts/${params.slug}`
      }
    ]
  };

  const contentWithoutFrontmatter = fileContents.replace(/---[\s\S]*?---/, '');

  return (
    <article className="max-w-3xl mx-auto w-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      
      <Breadcrumb title={title} />
      
      <div className="mb-10 mt-6">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight break-keep">
          {title} <span className="text-blue-600 dark:text-blue-400 text-2xl md:text-4xl block mt-2">지원대상 및 신청방법 총정리</span>
        </h1>
        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-slate-500 font-medium">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">발행일: {date}</span>
          {lastModified && lastModified !== date && (
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">최근수정일: {lastModified}</span>
          )}
          <span>조회수 1.2만</span>
        </div>
      </div>
      
      {!hideCoverImage && coverImage && (
        <div className="relative w-full h-[250px] md:h-[400px] mb-12 overflow-hidden rounded-2xl md:rounded-3xl shadow-sm">
          <Image 
            src={coverImage} 
            alt={title} 
            fill
            sizes="(max-w-768px) 100vw, 768px"
            className="object-cover" 
            priority
          />
        </div>
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
