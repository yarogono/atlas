import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import ImageCompressorClient from '@/components/ImageCompressorClient';
import { pseoKeywords } from '@/data/pseo-keywords';

interface Props {
  params: {
    slug: string;
  };
}

// 1. generateStaticParams: 빌드 시점에 사전에 정적 HTML 페이지로 모두 생성 (SSG)
export async function generateStaticParams() {
  return pseoKeywords.map((keyword) => ({
    slug: keyword.slug,
  }));
}

// 2. generateMetadata: 각 슬러그에 대응하는 맞춤형 SEO 메타데이터 생성
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const keywordData = pseoKeywords.find((k) => k.slug === params.slug);
  if (!keywordData) return {};

  return {
    title: keywordData.title,
    description: keywordData.metaDescription,
    alternates: {
      canonical: `https://atlas.yaro.co.kr/compress/${keywordData.slug}`,
    },
    openGraph: {
      title: keywordData.title,
      description: keywordData.metaDescription,
      url: `https://atlas.yaro.co.kr/compress/${keywordData.slug}`,
      type: 'website',
      images: [
        {
          url: 'https://atlas-vercel-blog.s3.ap-northeast-2.amazonaws.com/blog-assets/image_compressor_thumbnail_1781215337629-1781215355336.webp',
          width: 1200,
          height: 630,
          alt: `${keywordData.heading} - 복지지원금24시`,
        },
      ],
    },
  };
}

export default function PseoCompressPage({ params }: Props) {
  const keywordData = pseoKeywords.find((k) => k.slug === params.slug);
  if (!keywordData) {
    notFound();
  }

  // AEO/SEO 스키마 동적 매핑
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': `${keywordData.heading} 프로그램`,
    'operatingSystem': 'All',
    'applicationCategory': 'UtilityApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'KRW',
    },
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': `${keywordData.heading} 방법`,
    'description': `${keywordData.heading}을 위한 간단하고 안전한 3단계 안내 가이드입니다.`,
    'step': [
      {
        '@type': 'HowToStep',
        'name': '이미지 업로드',
        'text': `${keywordData.heading}을 위해 대상 파일을 드래그 앤 드롭하거나 클릭하여 선택합니다.`,
        'url': `https://atlas.yaro.co.kr/compress/${keywordData.slug}#step-1`,
      },
      {
        '@type': 'HowToStep',
        'name': '압축 조건 설정 확인',
        'text': `해당 페이지는 ${keywordData.targetSizeLabel || '최적화'} 전용 모드로 셋업되어 있어, 기본 포맷(${keywordData.defaultFormat.split('/')[1]})이 자동으로 설정됩니다.`,
        'url': `https://atlas.yaro.co.kr/compress/${keywordData.slug}#step-2`,
      },
      {
        '@type': 'HowToStep',
        'name': '다운로드',
        'text': '압축 실행하기 버튼을 눌러 결과물의 용량을 확인한 후 로컬 디바이스에 무료로 다운로드합니다.',
        'url': `https://atlas.yaro.co.kr/compress/${keywordData.slug}#step-3`,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': `${keywordData.heading} 시 이미지 파일 유출 우려는 없나요?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `네, 완벽히 안전합니다. 본 ${keywordData.heading} 도구는 사용자의 PC/모바일 브라우저 내부 메모리에서 직접 Canvas API로 변환을 연산합니다. 사진 데이터가 외부 서버로 절대 전송되지 않아 보안이 완전하게 보장됩니다.`,
        },
      },
      {
        '@type': 'Question',
        'name': `용량 목표 수치인 ${keywordData.targetSizeLabel || '최적 용량'} 이하로 제대로 줄어드나요?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `네. ${keywordData.heading} 페이지는 접속 시 자동으로 최적의 크기(가로 ${keywordData.defaultMaxWidth === 'original' ? '원본' : keywordData.defaultMaxWidth + 'px'})와 압축률로 세팅되므로, 대부분의 원본 이미지를 목표 용량 이하로 신속하게 줄여줍니다.`,
        },
      },
    ],
  };

  return (
    <div className="w-full">
      {/* Schema Markup JSON-LD */}
      <Script
        id={`software-schema-${keywordData.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <Script
        id={`howto-schema-${keywordData.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id={`faq-schema-${keywordData.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 이미지 압축기 본체 호출 (동적 셋팅 Props 주입) */}
      <ImageCompressorClient
        defaultFormat={keywordData.defaultFormat}
        defaultQuality={keywordData.defaultQuality}
        defaultMaxWidth={keywordData.defaultMaxWidth}
        targetSizeLabel={keywordData.targetSizeLabel}
        customHeading={keywordData.heading}
        customGuide={keywordData.guideText}
      />

      {/* pSEO / AEO 특화 FAQ 아코디언 컴포넌트 */}
      <section className="max-w-4xl mx-auto mt-16 px-4 py-8 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span>💬 자주 묻는 질문 (FAQ) - {keywordData.heading} 편</span>
        </h2>

        <div className="space-y-4">
          <details className="group border-b border-slate-100 dark:border-slate-700 pb-4" open>
            <summary className="flex justify-between items-center font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 cursor-pointer list-none">
              <span>Q. {keywordData.heading} 시 사진 파일이 서버에 저장되거나 전송되나요?</span>
              <span className="transition group-open:rotate-180">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-2 border-l-2 border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 py-1">
              <strong>아니요. 본 {keywordData.heading} 도구는 100% 브라우저 연산 기반으로 동작합니다.</strong> 업로드하신 원본 이미지와 압축된 결과물 파일은 사용자의 디바이스 내부(메모리)에서만 생성 및 다운로드되며, 서버로 전혀 전송되지 않으므로 안심하고 안전하게 사용하실 수 있습니다. (회사나 관공서 내부 보안 문서 및 개인 사진 누출 걱정이 전혀 없습니다.)
            </p>
          </details>

          <details className="group border-b border-slate-100 dark:border-slate-700 pb-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 cursor-pointer list-none">
              <span>Q. 페이지에 접속하면 어떤 압축 및 사이즈 제한 설정이 자동으로 맞춰지나요?</span>
              <span className="transition group-open:rotate-180">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-2 border-l-2 border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 py-1">
              본 페이지는 <strong>{keywordData.heading}에 최적화된 초기 조건</strong>으로 자동 셋업됩니다. 
              기본 포맷은 <strong>{keywordData.defaultFormat === 'image/webp' ? 'WebP (추천)' : keywordData.defaultFormat === 'image/jpeg' ? 'JPEG' : 'PNG'}</strong>로 맞춰지며, 가로 너비 해상도 제한 역시 <strong>{keywordData.defaultMaxWidth === 'original' ? '원본 유지' : keywordData.defaultMaxWidth + 'px'}</strong>로 사전 바인딩되어 있습니다. 사용자는 파일을 올리고 &apos;압축 실행하기&apos;만 누르면 완료됩니다.
            </p>
          </details>

          <details className="group border-b border-slate-100 dark:border-slate-700 pb-4">
            <summary className="flex justify-between items-center font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 cursor-pointer list-none">
              <span>Q. 원본 사진 화질이 심하게 뭉개지거나 흐려지진 않나요?</span>
              <span className="transition group-open:rotate-180">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-2 border-l-2 border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 py-1">
              <strong>디테일을 정밀하게 살리는 Canvas 이미지 복원 알고리즘을 사용합니다.</strong> 압축 후 `🔍 비교` 버튼을 누르시면, 원본과 압축된 이미지를 좌우 슬라이더로 한 픽셀씩 비교하여 눈으로 직접 확인해 보실 수 있습니다. 용량은 줄이면서 육안으로 구별하기 어려운 최고 수준의 화질 균형을 유지해 드립니다.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
